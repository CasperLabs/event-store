const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Block extends Model {
        static associate(models) {
            models.Block.Deploys = models.Block.hasMany(models.Deploy, {
                foreignKey: 'blockHeight'
            });
        }

        async toJSON() {
            let deploys = await this.getDeploys();
            return {
                "blockHash": this.blockHash,
                "parentHash": this.parentHash,
                "timestamp": this.timestamp,
                "eraId": this.eraId,
                "proposer": this.proposer,
                "state": this.state,
                "height": this.blockHeight,
                "deploys": deploys.map(deploy => {
                    return deploy.deployHash;
                })
            }
        }
    };

    Block.init({
        blockHeight: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            validate: {
                // Can't use the validator.js fn as it reads strings as valid numbers.
                isInteger() {
                    if ( typeof(this.blockHeight) !== 'number' ) {
                        // TODO: Doesn't break the stream - should note this duplicated block somewhere in the storage
                        console.warn("\n\tWARN: blockHeight not a number for block at height: " + this.blockHeight + "\n");
                    }
                }
            }
        },
        blockHash: DataTypes.STRING,
        parentHash: DataTypes.STRING,
        timestamp: DataTypes.DATE,
        eraId: DataTypes.INTEGER,
        proposer: DataTypes.STRING,
        state: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Block'
    });

    return Block;
};