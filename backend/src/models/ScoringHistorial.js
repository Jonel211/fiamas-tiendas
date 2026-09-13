// src/models/ScoringHistorial.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ScoringHistorial = sequelize.define('ScoringHistorial', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    cliente_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    tienda_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    score_anterior: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    score_nuevo: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cambio_score: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    categoria_anterior: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    categoria_nueva: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    motivo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dias_promedio_pago_anterior: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    dias_promedio_pago_nuevo: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    total_fiados_anterior: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    total_fiados_nuevo: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    total_mora_anterior: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    total_mora_nuevo: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'scoring_historial'
});

module.exports = ScoringHistorial;