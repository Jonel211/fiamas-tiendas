const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alerta = sequelize.define('Alerta', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tienda_id: { type: DataTypes.UUID, allowNull: false },
    cliente_id: { type: DataTypes.UUID, allowNull: true },
    producto_id: { type: DataTypes.UUID, allowNull: true },
    tipo_alerta: { type: DataTypes.STRING(50), allowNull: false },
    prioridad: { type: DataTypes.STRING(20), defaultValue: 'media' },
    titulo: { type: DataTypes.STRING(200), allowNull: false },
    mensaje: { type: DataTypes.TEXT, allowNull: false },
    canal: { type: DataTypes.STRING(20), defaultValue: 'interno' },
    estado: { type: DataTypes.STRING(20), defaultValue: 'pendiente' },
    fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'alertas',
    timestamps: false
});

module.exports = Alerta;