const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Tendero = sequelize.define('Tendero', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    dni: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    nombres: { type: DataTypes.STRING(100), allowNull: false },
    apellidos: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    telefono: { type: DataTypes.STRING(20), allowNull: false },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    creado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    actualizado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'tenderos',
    timestamps: false,
    hooks: {
        beforeCreate: async (t) => { if (t.password_hash) t.password_hash = await bcrypt.hash(t.password_hash, 10); },
        beforeUpdate: async (t) => { if (t.changed('password_hash')) t.password_hash = await bcrypt.hash(t.password_hash, 10); }
    }
});

Tendero.prototype.validarPassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};

module.exports = Tendero;