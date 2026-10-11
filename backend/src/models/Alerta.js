const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alerta = sequelize.define('Alerta', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    emisor_tipo: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'sistema',
        comment: 'sistema | admin | tendero | cliente'
    },
    emisor_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'ID del usuario emisor (admin, tendero o cliente)'
    },
    destinatario_tipo: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'tendero',
        comment: 'admin | tendero | cliente | todos'
    },
    destinatario_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'ID del destinatario específico o NULL si es difusión'
    },
    tienda_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'Tienda en contexto (NULL si es solicitud global al admin)'
    },
    cliente_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'Cliente asociado si aplica'
    },
    producto_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'Producto asociado si es alerta de stock'
    },
    tipo_alerta: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'ayuda_soporte | aviso_admin | recordatorio_pago | limite_credito | stock_bajo | consulta_cliente'
    },
    prioridad: {
        type: DataTypes.STRING(20),
        defaultValue: 'media',
        comment: 'baja | media | alta | urgente'
    },
    titulo: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    mensaje: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    canal: {
        type: DataTypes.STRING(20),
        defaultValue: 'interno',
        comment: 'interno | whatsapp | sms | push'
    },
    estado: {
        type: DataTypes.STRING(20),
        defaultValue: 'pendiente',
        comment: 'pendiente | en_proceso | atendida | leida | cerrada'
    },
    respuesta: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Respuesta dada por el soporte/admin o tendero'
    },
    fecha_respuesta: {
        type: DataTypes.DATE,
        allowNull: true
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'alertas',
    timestamps: false
});

module.exports = Alerta;