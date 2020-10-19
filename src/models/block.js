const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Block extends Model {
        static associate(models) {
            models.Block.Deploys = models.Block.hasMany(models.Deploy, {
                foreignKey: 'blockHeight'
            });
        }

        static jsonSchema() {
            return {
                // include all own properties and the associated `User` instance
                include: ['@all'],
                // let's exclude from the above the primary key and all foreign keys
                exclude: [],
            }
        }
    };

    Block.init({
        blockHeight: {
            type: DataTypes.INTEGER,
            primaryKey: true
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