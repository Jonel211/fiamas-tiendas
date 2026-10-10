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
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    creado_en: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    actualizado_en: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'tenderos',
    timestamps: false,
    hooks: {
        beforeCreate: async (tendero) => {
            if (tendero.password_hash) {
                tendero.password_hash = await bcrypt.hash(tendero.password_hash, 10);
            }
        },
        beforeUpdate: async (tendero) => {
            if (tendero.changed('password_hash')) {
                tendero.password_hash = await bcrypt.hash(tendero.password_hash, 10);
            }
        }
    }
});

Tendero.prototype.validarPassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};

module.exports = Tendero;