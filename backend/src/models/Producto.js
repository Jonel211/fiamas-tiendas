const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const Producto = sequelize.define('Producto', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tienda_id: { type: DataTypes.UUID, allowNull: false },
    categoria_id: { type: DataTypes.UUID, allowNull: false },
    nombre: { type: DataTypes.STRING(200), allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    imagen_url: { type: DataTypes.STRING(500), allowNull: true },
    codigo_barras: { type: DataTypes.STRING(50), allowNull: true },
    tipo_venta: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'unidad' },
    unidad_medida: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'unidad' },
    precio_venta: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock_actual: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: null },
    stock_minimo: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: null },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    creado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    actualizado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'productos',
    timestamps: false,
    indexes: [
        {
            name: 'productos_tienda_codigo_barras_uq',
            unique: true,
            fields: ['tienda_id', 'codigo_barras'],
            where: { codigo_barras: { [Op.ne]: null } }
        },
        {
            // Evita que se creen dos productos con el mismo nombre en la misma tienda
            name: 'productos_tienda_nombre_uq',
            unique: true,
            fields: ['tienda_id', 'nombre']
        }
    ]
});

module.exports = Producto;