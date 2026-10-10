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
        allowNull: true,
        comment: 'Nombre de un ícono predefinido: milk, bread, broom, etc.'
    },
    color: {
        type: DataTypes.STRING(7),
        allowNull: true,
        comment: 'Código hex para el chip de la categoría: #1D9492'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'categorias',
    timestamps: false
});

module.exports = Categoria;