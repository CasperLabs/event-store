const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Block extends Model {
        static associate(models) {
            models.Block.Deploys = models.Block.hasMany(models.Deploy, {
                foreignKey: 'blockHeight'
            });
        }

        async toJSON(skipDeploys = false) {
            let result = {
                "blockHash": this.blockHash,
                "parentHash": this.parentHash,
                "timestamp": this.timestamp,
                "eraId": this.eraId,
                "proposer": this.proposer,
                "state": this.state,
                "height": this.blockHeight,
            };
            if (!skipDeploys) {
                let deploys = await this.getDeploys();
                result["deploys"] = deploys.map(deploy => {
                    return deploy.deployHash;
                });
            }
            return result; 
        }
    };

    // I can't use the validator.js fns as it reads strings as valid numbers.
    // We also can't use the in-built constraints like isDate because if false
    // it throws error which breaks the stream instead of just logging a warning
    Block.init({
        blockHeight: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            validate: {
                isHeightValid() {
                    if ( typeof(this.blockHeight) !== 'number' ) {
                        console.warn("\n\tWARN: invalid blockHeight for block at height: " + this.blockHeight + "\n");
                    }
                }
            }
        },
        blockHash: {
            type: DataTypes.STRING,
            validate: {
                isHashValid() {
                    if ( typeof(this.blockHash) !== 'string' ) {
                        console.warn("\n\tWARN: invalid blockHash for block at height: " + this.blockHeight + "\n");
                    }
                }
            }
        },
        parentHash: {
            type: DataTypes.STRING,
            validate: {
                isParentHashValid() {
                    if ( typeof(this.parentHash) !== 'string' ) {
                        console.warn("\n\tWARN: invalid parentHash for block at height: " + this.blockHeight + "\n");
                    }
                }
            }
        },
        timestamp: {
            type: DataTypes.DATE,       // George TODO: Check the date format
            validate: {
                isTimestampValid() {
                    //console.log(typeof(this.timestamp));
                    // if ( this.timestamp.prototype.toString.call(date) === '[object Date]') {
                        // console.warn("\n\tWARN: invalid timestamp for block at height: " + this.blockHeight + "\n");                        
                    // }
                }
            }
        },
        eraId: {
            type: DataTypes.INTEGER,
            validate: {
                isEraIdValid() {
                    if ( typeof(this.eraId) !== 'number' ) {
                        console.warn("\n\tWARN: invalid eraId for block at height: " + this.blockHeight + "\n");
                    }
                }
            }
        },
        proposer: {
            type: DataTypes.STRING,
            validate: {
                isProposerValid() {
                    if ( typeof(this.proposer) !== 'string' ) {
                        console.warn("\n\tWARN: invalid proposer for block at height: " + this.blockHeight + "\n");
                    }
                }
            }
        },
        state: {                            //Specify what the state variants are
            type: DataTypes.STRING,
            validate: {
                isStateValid() {
                    if ( typeof(this.state) !== 'string' ) {
                        console.warn("\n\tWARN: invalid state for block at height: " + this.blockHeight + "\n");
                    }
                }
            }
        },
    }, {
        sequelize,
        modelName: 'Block'
    });

    return Block;
};