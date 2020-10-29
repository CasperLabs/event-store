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
                isInteger(value) {
                    if ( typeof(value) !== 'number' ) {
                        throw new Error("blockHeight was not a number");
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