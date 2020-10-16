class Storage {
    constructor(models) {
        this.models = models;
    }
    
    async onFinalizedBlock(event) {
        await this.models.Block.create({
            protoBlockHash: event.proto_block.hash,
            blockHash: null,
            timestamp: event.timestamp,
            eraId: event.era_id,
            height: event.height,
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

    async onDeployProcessed(event) {
        let deploy = await this.findDeployByHash(event.deploy_hash);
        deploy.cost = event.execution_result.cost;
        deploy.errorMessage = event.execution_result.error_message;
        deploy.state = 'processed';
        await deploy.save();
    }

    async onBlockAdded(event) {
        let block = await this.findBlockByHeight(event.block_header.height);
        block.state = 'added';
        block.parentHash = event.block_header.parent_hash;
        block.blockHash = event.block_hash;
        await block.save();
    }

    async findBlockByProtoHash(blockProtoHash) {
        return this.models.Block.findByPk(blockProtoHash, {
            include: this.models.Deploy
        });
    }

    async findBlockByHeight(height) {
        return this.models.Block.findOne({
            where: { 
                height: height 
            } 
        }, {
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

    async findDeployByHash(deployHash) {
        return this.models.Deploy.findByPk(deployHash);
    }
}

module.exports = Storage