// src/models/Producto.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Producto = sequelize.define('Producto', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tienda_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    categoria_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    nombre: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sku: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    codigo_barras: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    tipo_codigo: {
        type: DataTypes.STRING(20),
        defaultValue: 'EAN13'
    },
    precio_compra: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    precio_venta: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    precio_mayorista: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    cantidad_mayorista: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    stock_actual: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    stock_minimo: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    stock_maximo: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    unidad_medida: {
        type: DataTypes.STRING(20),
        defaultValue: 'unidad'
    },
    permite_fiado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    requiere_stock: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    es_perecible: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    fecha_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    imagen_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'productos',
    // Esto hace que Sequelize cree automáticamente 'createdAt' y 'updatedAt'
    timestamps: true
});


module.exports = Producto;