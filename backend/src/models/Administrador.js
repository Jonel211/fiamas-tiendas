// src/models/Administrador.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Administrador = sequelize.define('Administrador', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    rol: {
        type: DataTypes.STRING(50),
        defaultValue: 'admin'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    ultimo_acceso: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'administradores',
    hooks: {
        beforeCreate: async (admin) => {
            if (admin.password_hash) {
                const salt = await bcrypt.genSalt(10);
                admin.password_hash = await bcrypt.hash(admin.password_hash, salt);
            }
        },
        beforeUpdate: async (admin) => {
            if (admin.changed('password_hash')) {
                const salt = await bcrypt.genSalt(10);
                admin.password_hash = await bcrypt.hash(admin.password_hash, salt);
            }
        }
    }
});

Administrador.prototype.validarPassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};

module.exports = Administrador;