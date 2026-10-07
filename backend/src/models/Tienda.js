const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tienda = sequelize.define('Tienda', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tendero_id: { type: DataTypes.UUID, allowNull: false },
    nombre: { type: DataTypes.STRING(150), allowNull: false },
    imagen_url: { type: DataTypes.STRING(500), allowNull: true },
    direccion: { type: DataTypes.TEXT, allowNull: true },
    ruc: { type: DataTypes.STRING(20), allowNull: true },
    telefono: { type: DataTypes.STRING(20), allowNull: true },
    qr_token: { type: DataTypes.STRING(100), allowNull: true, unique: true },
    qr_fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    qr_activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    creado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    actualizado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'tiendas',
    timestamps: false
});

module.exports = Tienda;