const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Deploy extends Model {
        static associate(models) {
            models.Deploy.Block = models.Deploy.belongsTo(models.Block, {
                foreignKey: 'protoBlockHash'
            });
        }
    };

    Deploy.init({
        deployHash: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        state: DataTypes.STRING,
        cost: DataTypes.INTEGER,
        errorMessage: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Deploy'
    });
    
    return Deploy;
};