const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Cliente = sequelize.define('Cliente', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    telefono: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    nombres: { type: DataTypes.STRING(100), allowNull: false },
    apellidos: { type: DataTypes.STRING(100), allowNull: false },
    password_hash: { type: DataTypes.STRING(255), allowNull: true },
    telefono_verificado: { type: DataTypes.BOOLEAN, defaultValue: false },
    ultimo_acceso: { type: DataTypes.DATE, allowNull: true },
    direccion: { type: DataTypes.TEXT, allowNull: true },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    creado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    actualizado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'clientes',
    timestamps: false,
    hooks: {
        beforeCreate: async (c) => { if (c.password_hash) c.password_hash = await bcrypt.hash(c.password_hash, 10); },
        beforeUpdate: async (c) => { if (c.changed('password_hash')) c.password_hash = await bcrypt.hash(c.password_hash, 10); }
    }
});

Cliente.prototype.validarPassword = async function (password) {
    if (!this.password_hash) return false;
    return await bcrypt.compare(password, this.password_hash);
};

module.exports = Cliente;