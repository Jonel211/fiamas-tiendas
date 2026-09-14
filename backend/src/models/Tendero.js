// src/models/Tendero.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Tendero = sequelize.define('Tendero', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    dni: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    nombres: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    apellidos: {
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
        allowNull: false
    },
    fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    direccion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    foto_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    verificado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    ultimo_acceso: {
        type: DataTypes.DATE,
        allowNull: true
    },
    preferencias: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    configuracion_notificaciones: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    tableName: 'tenderos',
    hooks: {
        beforeCreate: async (tendero) => {
            if (tendero.password_hash) {
                const salt = await bcrypt.genSalt(10);
                tendero.password_hash = await bcrypt.hash(tendero.password_hash, salt);
            }
        },
        beforeUpdate: async (tendero) => {
            if (tendero.changed('password_hash')) {
                const salt = await bcrypt.genSalt(10);
                tendero.password_hash = await bcrypt.hash(tendero.password_hash, salt);
            }
        }
    }
});

Tendero.prototype.validarPassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};

module.exports = Tendero;