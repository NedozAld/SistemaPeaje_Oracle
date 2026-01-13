const { DataTypes } = require('sequelize');
const sequelize = require('../config/Database');

const Ruta = sequelize.define('rutas', {
    id_ruta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    nombre_ruta: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    origen: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    destino: {
        type: DataTypes.STRING(100),
        allowNull: false,
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
    tableName: 'rutas',
    timestamps: false,
});

module.exports = Ruta;
