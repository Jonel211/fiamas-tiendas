// src/models/Tienda.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tienda = sequelize.define('Tienda', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tendero_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    direccion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ruc: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    logo_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    horario_apertura: {
        type: DataTypes.TIME,
        allowNull: true
    },
    horario_cierre: {
        type: DataTypes.TIME,
        allowNull: true
    },
    dias_operacion: {
        type: DataTypes.JSONB,
        defaultValue: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    },
    moneda: {
        type: DataTypes.STRING(3),
        defaultValue: 'PEN'
    },
    zona_horaria: {
        type: DataTypes.STRING(50),
        defaultValue: 'America/Lima'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    configuracion: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    tableName: 'tiendas'
});

module.exports = Tienda;