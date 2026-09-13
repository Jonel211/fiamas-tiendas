// src/models/Fiado.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Fiado = sequelize.define('Fiado', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tienda_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    cliente_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    tendero_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    numero_fiado: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    fecha_fiado: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    fecha_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    monto_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    monto_pagado: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    saldo_pendiente: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    estado: {
        type: DataTypes.STRING(20),
        defaultValue: 'pendiente'
    },
    dias_mora: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    productos: {
        type: DataTypes.JSONB,
        defaultValue: [],
        allowNull: false
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    firma_digital_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    foto_ticket_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    creado_por: {
        type: DataTypes.UUID,
        allowNull: true
    },
    modificado_por: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    tableName: 'fiados',
    hooks: {
        beforeCreate: (fiado) => {
            if (!fiado.numero_fiado) {
                const fecha = new Date();
                const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                fiado.numero_fiado = `F-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${fecha.getDate().toString().padStart(2, '0')}-${random}`;
            }
        }
    }
});

module.exports = Fiado;