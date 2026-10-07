const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Categoria = sequelize.define('Categoria', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tienda_id: { type: DataTypes.UUID, allowNull: false },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    imagen_url: { type: DataTypes.STRING(500), allowNull: true },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    tableName: 'categorias',
    timestamps: false
});

module.exports = Categoria;