class Storage {
    constructor(models) {
        this.models = models;
    }

    arraysMatch(a, b) {
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((val, index) => val === b[index]);
    }


    /**
     * This logic needs work 
     */
    async deploysExist(event) {
        let eventDeploys = event.proto_block.deploys;
        
        if (eventDeploys.length !== 0) {
        // event has deploys
            for (let i=0, numDeploys = eventDeploys.length; i <= numDeploys; i++) {
                // Look for a deploy in the db with the hash
                let check = await this.findDeployByHash(eventDeploys[i]);
                if (!check) {
                    // event has deploy not present in db return it for logging
                    return eventDeploys[i];
                }
            }
            // all deploys in event are present in db
            return true;
        } else {
        // event has no deploys
            return null;
        }
       
    }

    async checkFinalizedBlockEvent(event) {
        let existingBlock = await this.models.Block.findOne({where: {blockHeight: event.height}});
        if ( existingBlock !== null) {
            // There is already a block at the current height
            console.warn("\n\tWARN: blockHeight not unique: \n\tThere is already a block at height: " + event.height + "\n");
            
            // Setup data
            let existingBlockData = existingBlock.dataValues;
            

            // Check data for matches
            let timeMatches, eraMatches, proposerMatches, deploysMatch;
            timeMatches = existingBlockData.timestamp.toISOString() === event.timestamp;
            eraMatches = existingBlockData.eraId === event.era_id;
            proposerMatches = existingBlockData.proposer === event.proposer;

            deploysMatch = await this.deploysExist(event);
            
            // Log findings
            console.log("\nComparing events...");

            console.log("\ntimestamp: \t" + (timeMatches ? "Matches" : ("Does not match:\t" + 
            existingBlockData.timestamp.toISOString() + " !== " + event.timestamp)));

            console.log("eraId: \t\t" + (eraMatches ? "Matches" : ("Does not match:\t" + 
            existingBlockData.eraId + " !== " + event.era_id)));

            console.log("proposer: \t" + (proposerMatches ? "Matches" : ("Does not match:\t" + 
            existingBlockData.proposer + " !== " + event.proposer)));

            // Handle Deploys
            process.stdout.write("Deploys: \t");
            if (deploysMatch === true) {
                console.log("Matches");
            } else if ( deploysMatch === null) {
                console.log("No deploys in event to check");
            } else {
                console.log("No exisiting deploy with hash: " + deploysMatch)
            }
            
            console.log("\n\t--End of Comparison--\n\n");

            if (timeMatches &&
                eraMatches &&
                proposerMatches && 
                deploysMatch) {
                    // Incoming event is an exact duplicate of an existing entry
                    return true;
            } else {
                // Incoming event shares height but is not a exact duplicate
                // NEED TO DECIDE WHAT TO DO IN THIS SITUATION
                return true;
            }
        }
    }

    async onFinalizedBlock(event) {
        if ( !(await this.checkFinalizedBlockEvent(event)) ) {
            // There is no block at the current height
            await this.models.Block.create({
                blockHeight: event.height,
                blockHash: null,
                timestamp: event.timestamp,
                eraId: event.era_id,
                proposer: event.proposer,
                state: 'finalized',
                Deploys: event.proto_block.deploys.map(deployHash => {
                    return {
                        deployHash: deployHash,
                        state: 'finalized'
                    }
                })
            }, {
                include: [ this.models.Block.Deploys ]
            });
        }       
    }

    async onDeployProcessed(event) {
        let deploy = await this.findDeployByHash(event.deploy_hash);
        deploy.account = event.account;
        deploy.cost = event.execution_result.cost;
        deploy.errorMessage = event.execution_result.error_message;
        deploy.state = 'processed';
        await deploy.save();
    }

    async onBlockAdded(event) {
        let block = await this.findBlockByHeight(event.block_header.height);
        if (block === null) {
            console.warn("\n\tWARN: block missing at height: " + event.block_header.height);
            console.warn("\tThis might be due to a problem in the corresponding blockFinalized event\n");
        } else {
            block.state = 'added';
            block.parentHash = event.block_header.parent_hash;
            block.blockHash = event.block_hash;
            await block.save();
        }    
    }

    async findBlockByHeight(height) {
        return this.models.Block.findByPk(height, {
            include: this.models.Deploy
        });
    }

    async findBlockByHash(blockHash) {
        return this.models.Block.findOne({
            where: { 
                blockHash: blockHash 
            } 
        }, {
            include: this.models.Deploy
        });
    }

    async findBlocks(limit, offset) {
        return this.models.Block.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['blockHeight', 'DESC']]
        });
    }

    async findDeployByHash(deployHash) {
        return this.models.Deploy.findByPk(deployHash, {
            include: this.models.Block
        });
    }

    async findDeploysByAccount(account, limit, offset) {
        return this.models.Deploy.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['blockHeight', 'DESC']],
            where: {
                account: account
            }
        });
    }
}

module.exports = Storage