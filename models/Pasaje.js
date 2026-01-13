const { DataTypes } = require('sequelize');
const sequelize = require('../config/Database');
const Ruta = require('./Ruta');
const Unidad = require('./Unidad');
const TipoPasaje = require('./TipoPasaje');

const Pasaje = sequelize.define('pasajes', {
    id_pasaje: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    id_ruta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'rutas',
            key: 'id_ruta',
        },
    },
    id_unidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'unidades',
            key: 'id_unidad',
        },
    },
    id_tipo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tipos_pasaje',
            key: 'id_tipo',
        },
    },
    valor: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
        validate: {
            min: 0.01,
        },
    },
    fecha_viaje: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'pasajes',
    timestamps: false,
});

// Asociaciones
Pasaje.belongsTo(Ruta, { foreignKey: 'id_ruta', as: 'ruta' });
Pasaje.belongsTo(Unidad, { foreignKey: 'id_unidad', as: 'unidad' });
Pasaje.belongsTo(TipoPasaje, { foreignKey: 'id_tipo', as: 'tipo_pasaje' });

Ruta.hasMany(Pasaje, { foreignKey: 'id_ruta' });
Unidad.hasMany(Pasaje, { foreignKey: 'id_unidad' });
TipoPasaje.hasMany(Pasaje, { foreignKey: 'id_tipo' });

module.exports = Pasaje;
