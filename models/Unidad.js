const { DataTypes } = require('sequelize');
const sequelize = require('../config/Database');

const Unidad = sequelize.define('unidades', {
    id_unidad: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    placa: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
    },
    modelo: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    estado: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'A',
        validate: {
            isIn: [['A', 'I']],
        },
    },
}, {
    tableName: 'unidades',
    timestamps: false,
});

module.exports = Unidad;
