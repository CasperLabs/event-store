const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Block extends Model {
        static associate(models) {
            models.Block.Deploys = models.Block.hasMany(models.Deploy, {
                foreignKey: 'protoBlockHash'
            });
        }
    };

    Block.init({
        protoBlockHash: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        blockHash: DataTypes.STRING,
        parentHash: DataTypes.STRING,
        timestamp: DataTypes.DATE,
        eraId: DataTypes.INTEGER,
        height: DataTypes.INTEGER,
        proposer: DataTypes.STRING,
        parentHash: DataTypes.STRING,
        state: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Block'
    });
    
    return Block;
};