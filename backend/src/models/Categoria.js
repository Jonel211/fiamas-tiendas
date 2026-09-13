// src/models/Categoria.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Categoria = sequelize.define('Categoria', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tienda_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    icono: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    color: {
        type: DataTypes.STRING(7),
        allowNull: true
    },
    orden: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'categorias'
});

module.exports = Categoria;