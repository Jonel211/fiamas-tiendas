const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FiadoDetalle = sequelize.define('FiadoDetalle', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    fiado_id: { type: DataTypes.UUID, allowNull: false },
    producto_id: { type: DataTypes.UUID, allowNull: false },
    cantidad: { type: DataTypes.DECIMAL(10, 3), allowNull: false },
    precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, {
    tableName: 'fiado_detalle',
    timestamps: false
});

module.exports = FiadoDetalle;