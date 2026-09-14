// src/models/Pago.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pago = sequelize.define('Pago', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    fiado_id: {
        type: DataTypes.UUID,
        allowNull: false
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
    numero_pago: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    fecha_pago: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    tipo_pago: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    referencia: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    estado: {
        type: DataTypes.STRING(20),
        defaultValue: 'completado'
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    recibo_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    creado_por: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    tableName: 'pagos',
    hooks: {
        beforeCreate: (pago) => {
            if (!pago.numero_pago) {
                const fecha = new Date();
                const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                pago.numero_pago = `P-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${fecha.getDate().toString().padStart(2, '0')}-${random}`;
            }
        }
    }
});

module.exports = Pago;