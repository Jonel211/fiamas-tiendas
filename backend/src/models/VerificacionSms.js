const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VerificacionSms = sequelize.define('VerificacionSms', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    telefono: { type: DataTypes.STRING(20), allowNull: false },
    codigo: { type: DataTypes.STRING(6), allowNull: false },
    proposito: { type: DataTypes.STRING(30), allowNull: false },
    usado: { type: DataTypes.BOOLEAN, defaultValue: false },
    fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    fecha_expiracion: { type: DataTypes.DATE, allowNull: false }
}, {
    tableName: 'verificaciones_sms',
    timestamps: false,
    indexes: [{ fields: ['telefono', 'usado'] }]
});

module.exports = VerificacionSms;