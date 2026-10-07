const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LogSistema = sequelize.define('LogSistema', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tienda_id: { type: DataTypes.UUID, allowNull: true },
    usuario_id: { type: DataTypes.UUID, allowNull: true },
    tipo_usuario: { type: DataTypes.STRING(20), allowNull: true },
    accion: { type: DataTypes.STRING(100), allowNull: false },
    tabla_afectada: { type: DataTypes.STRING(50), allowNull: true },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'logs_sistema',
    timestamps: false
});

module.exports = LogSistema;