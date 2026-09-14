// src/models/index.js
const { sequelize } = require('../config/database');

// 1. Importar todos los modelos
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

// 2. Definir las relaciones (ASOCIACIONES)

// Tendero <-> Tienda
Tendero.hasMany(Tienda, { foreignKey: 'tendero_id', as: 'tiendas' });
Tienda.belongsTo(Tendero, { foreignKey: 'tendero_id', as: 'tendero' });

// Tienda <-> Categoria
Tienda.hasMany(Categoria, { foreignKey: 'tienda_id', as: 'categorias' });
Categoria.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

// Tienda <-> Producto
Tienda.hasMany(Producto, { foreignKey: 'tienda_id', as: 'productos' });
Producto.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

// Categoria <-> 
Categoria.hasMany(Producto, { foreignKey: 'categoria_id', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });

// Tienda <-> Cliente
Tienda.hasMany(Cliente, { foreignKey: 'tienda_id', as: 'clientes' });
Cliente.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

// Tienda <-> Fiado
Tienda.hasMany(Fiado, { foreignKey: 'tienda_id', as: 'fiados' });
Fiado.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

// Cliente <-> Fiado
Cliente.hasMany(Fiado, { foreignKey: 'cliente_id', as: 'fiados' });
Fiado.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// Tendero <-> Fiado (Creador)
Tendero.hasMany(Fiado, { foreignKey: 'tendero_id', as: 'fiadosCreados' });
Fiado.belongsTo(Tendero, { foreignKey: 'tendero_id', as: 'tenderoCreador' });

// Fiado <-> Pago
Fiado.hasMany(Pago, { foreignKey: 'fiado_id', as: 'pagos' });
Pago.belongsTo(Fiado, { foreignKey: 'fiado_id', as: 'fiado' });

// Tienda <-> Alerta
Tienda.hasMany(Alerta, { foreignKey: 'tienda_id', as: 'alertas' });
Alerta.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

// Cliente <-> ScoringHistorial
Cliente.hasMany(ScoringHistorial, { foreignKey: 'cliente_id', as: 'scoringHistorial' });
ScoringHistorial.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// 3. Exportar todo
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