const { DataTypes } = require('sequelize');
const sequelize = require('../config/Database');

const TipoPasaje = sequelize.define('tipos_pasaje', {
    id_tipo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    descuento: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
}, {
    tableName: 'tipos_pasaje',
    timestamps: false,
});

module.exports = TipoPasaje;
