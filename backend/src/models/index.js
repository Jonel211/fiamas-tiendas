// src/models/index.js
const { sequelize } = require('../config/database');

// Importar todos los modelos
const Administrador = require('./Administrador');
const Tendero = require('./Tendero');
const Tienda = require('./Tienda');
const Cliente = require('./Cliente');
const Producto = require('./Producto');
const Categoria = require('./Categoria');
const Fiado = require('./Fiado');
const Pago = require('./Pago');
const Alerta = require('./Alerta');
const ScoringHistorial = require('./ScoringHistorial');

// Definir relaciones
Tendero.hasMany(Tienda, { foreignKey: 'tendero_id', as: 'tiendas' });
Tienda.belongsTo(Tendero, { foreignKey: 'tendero_id', as: 'tendero' });

Tienda.hasMany(Producto, { foreignKey: 'tienda_id', as: 'productos' });
Producto.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

Tienda.hasMany(Categoria, { foreignKey: 'tienda_id', as: 'categorias' });
Categoria.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

Tienda.hasMany(Cliente, { foreignKey: 'tienda_id', as: 'clientes' });
Cliente.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

Tienda.hasMany(Fiado, { foreignKey: 'tienda_id', as: 'fiados' });
Fiado.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

Cliente.hasMany(Fiado, { foreignKey: 'cliente_id', as: 'fiados' });
Fiado.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

Tendero.hasMany(Fiado, { foreignKey: 'tendero_id', as: 'fiadosCreados' });
Fiado.belongsTo(Tendero, { foreignKey: 'tendero_id', as: 'tendero' });

Fiado.hasMany(Pago, { foreignKey: 'fiado_id', as: 'pagos' });
Pago.belongsTo(Fiado, { foreignKey: 'fiado_id', as: 'fiado' });

Tienda.hasMany(Alerta, { foreignKey: 'tienda_id', as: 'alertas' });
Alerta.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

Cliente.hasMany(ScoringHistorial, { foreignKey: 'cliente_id', as: 'scoringHistorial' });
ScoringHistorial.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// Exportar todo
module.exports = {
    sequelize,
    Administrador,
    Tendero,
    Tienda,
    Cliente,
    Producto,
    Categoria,
    Fiado,
    Pago,
    Alerta,
    ScoringHistorial
};