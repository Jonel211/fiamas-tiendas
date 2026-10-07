const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ScoringHistorial = sequelize.define('ScoringHistorial', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    cliente_id: { type: DataTypes.UUID, allowNull: false },
    tienda_id: { type: DataTypes.UUID, allowNull: false },
    score_anterior: { type: DataTypes.INTEGER, allowNull: true },
    score_nuevo: { type: DataTypes.INTEGER, allowNull: false },
    cambio_score: { type: DataTypes.INTEGER, allowNull: true },
    categoria_anterior: { type: DataTypes.STRING(20), allowNull: true },
    categoria_nueva: { type: DataTypes.STRING(20), allowNull: false },
    motivo: { type: DataTypes.STRING(100), allowNull: false },
    fecha_calculo: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'scoring_historial',
    timestamps: false
});

module.exports = ScoringHistorial;