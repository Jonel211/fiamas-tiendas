// src/models/Cliente.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Cliente = sequelize.define('Cliente', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tienda_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    nombres: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    apellidos: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    dni: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    direccion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    foto_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    limite_credito: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 500.00
    },
    credito_disponible: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 500.00
    },
    saldo_actual: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    score_pagador: {
        type: DataTypes.INTEGER,
        defaultValue: 100
    },
    categoria_pagador: {
        type: DataTypes.STRING(20),
        defaultValue: 'nuevo'
    },
    total_fiados: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_pagos: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_mora: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    dias_promedio_pago: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
    },
    ultimo_fiado: {
        type: DataTypes.DATE,
        allowNull: true
    },
    ultimo_pago: {
        type: DataTypes.DATE,
        allowNull: true
    },
    dias_gracia: {
        type: DataTypes.INTEGER,
        defaultValue: 7
    },
    acepta_notificaciones: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    canal_preferido: {
        type: DataTypes.STRING(20),
        defaultValue: 'whatsapp'
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    bloqueado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    motivo_bloqueo: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'clientes',
    hooks: {
        beforeCreate: async (cliente) => {
            if (cliente.password_hash) {
                const salt = await bcrypt.genSalt(10);
                cliente.password_hash = await bcrypt.hash(cliente.password_hash, salt);
            }
        },
        beforeUpdate: async (cliente) => {
            if (cliente.changed('password_hash') && cliente.password_hash) {
                const salt = await bcrypt.genSalt(10);
                cliente.password_hash = await bcrypt.hash(cliente.password_hash, salt);
            }
        }
    }
});

Cliente.prototype.validarPassword = async function (password) {
    if (!this.password_hash) return false;
    return await bcrypt.compare(password, this.password_hash);
};

module.exports = Cliente;