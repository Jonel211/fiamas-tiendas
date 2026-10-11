const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pago = sequelize.define('Pago', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tienda_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Tienda donde se realiza el pago'
    },
    cliente_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Cliente que realiza el pago'
    },
    fiado_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'Fiado específico o NULL si es abono a saldo global'
    },
    registrado_por: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Tendero que registró el cobro'
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
        allowNull: false,
        comment: 'efectivo | transferencia | yape | plin | tarjeta | deposito'
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
    }
}, {
    tableName: 'pagos',
    timestamps: false,
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