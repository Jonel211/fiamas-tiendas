const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClienteTienda = sequelize.define('ClienteTienda', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    cliente_id: { type: DataTypes.UUID, allowNull: false },
    tienda_id: { type: DataTypes.UUID, allowNull: false },
    metodo_vinculacion: { type: DataTypes.STRING(20), defaultValue: 'manual' },
    limite_credito: { type: DataTypes.DECIMAL(10, 2), defaultValue: 500.00 },
    saldo_actual: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    score_pagador: { type: DataTypes.INTEGER, defaultValue: 100 },
    categoria_pagador: { type: DataTypes.STRING(20), defaultValue: 'nuevo' },
    total_fiados: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_pagos: { type: DataTypes.INTEGER, defaultValue: 0 },
    cantidad_fiados_mora: { type: DataTypes.INTEGER, defaultValue: 0 },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    creado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    actualizado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'cliente_tienda',
    timestamps: false,
    indexes: [{ unique: true, fields: ['cliente_id', 'tienda_id'] }]
});

module.exports = ClienteTienda;