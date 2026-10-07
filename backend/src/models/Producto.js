const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Producto = sequelize.define('Producto', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tienda_id: { type: DataTypes.UUID, allowNull: false },
    categoria_id: { type: DataTypes.UUID, allowNull: false },
    nombre: { type: DataTypes.STRING(200), allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    codigo_barras: { type: DataTypes.STRING(50), allowNull: true, unique: true },
    imagen_url: { type: DataTypes.STRING(500), allowNull: true },
    tipo_venta: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'unidad' },
    unidad_medida: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'unidad' },
    precio_venta: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock_actual: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
    stock_minimo: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    creado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    actualizado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'productos',
    timestamps: false
});

module.exports = Producto;