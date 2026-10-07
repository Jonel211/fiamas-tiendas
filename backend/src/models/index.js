const { sequelize } = require('../config/database');

// 1. Importar todos los modelos
const Administrador = require('./Administrador');
const Tendero = require('./Tendero');
const Tienda = require('./Tienda');
const Categoria = require('./Categoria');
const Producto = require('./Producto');
const Cliente = require('./Cliente');
const ClienteTienda = require('./ClienteTienda');
const Fiado = require('./Fiado');
const FiadoDetalle = require('./FiadoDetalle');
const Pago = require('./Pago');
const Alerta = require('./Alerta');
const ScoringHistorial = require('./ScoringHistorial');
const VerificacionSms = require('./VerificacionSms');
const LogSistema = require('./LogSistema');

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

// Categoria <-> Producto
Categoria.hasMany(Producto, { foreignKey: 'categoria_id', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });

// Cliente <-> Tienda (Many-to-Many a través de ClienteTienda)
Cliente.belongsToMany(Tienda, { through: ClienteTienda, foreignKey: 'cliente_id', as: 'tiendas' });
Tienda.belongsToMany(Cliente, { through: ClienteTienda, foreignKey: 'tienda_id', as: 'clientes' });
ClienteTienda.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
ClienteTienda.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

// Tienda <-> Fiado
Tienda.hasMany(Fiado, { foreignKey: 'tienda_id', as: 'fiados' });
Fiado.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

// Cliente <-> Fiado
Cliente.hasMany(Fiado, { foreignKey: 'cliente_id', as: 'fiados' });
Fiado.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// Tendero <-> Fiado (Creador)
Tendero.hasMany(Fiado, { foreignKey: 'tendero_id', as: 'fiadosCreados' });
Fiado.belongsTo(Tendero, { foreignKey: 'tendero_id', as: 'tenderoCreador' });

// Fiado <-> FiadoDetalle
Fiado.hasMany(FiadoDetalle, { foreignKey: 'fiado_id', as: 'detalles' });
FiadoDetalle.belongsTo(Fiado, { foreignKey: 'fiado_id', as: 'fiado' });

// FiadoDetalle <-> Producto
FiadoDetalle.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

// Fiado <-> Pago
Fiado.hasMany(Pago, { foreignKey: 'fiado_id', as: 'pagos' });
Pago.belongsTo(Fiado, { foreignKey: 'fiado_id', as: 'fiado' });

// Tendero <-> Pago (Registrado por)
Tendero.hasMany(Pago, { foreignKey: 'registrado_por', as: 'pagosRegistrados' });
Pago.belongsTo(Tendero, { foreignKey: 'registrado_por', as: 'registrador' });

// Tienda <-> Alerta
Tienda.hasMany(Alerta, { foreignKey: 'tienda_id', as: 'alertas' });
Alerta.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

// Cliente <-> Alerta
Alerta.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// Producto <-> Alerta
Alerta.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

// Cliente <-> ScoringHistorial
Cliente.hasMany(ScoringHistorial, { foreignKey: 'cliente_id', as: 'scoringHistorial' });
ScoringHistorial.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// Tienda <-> ScoringHistorial
ScoringHistorial.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

// Tienda <-> LogSistema
Tienda.hasMany(LogSistema, { foreignKey: 'tienda_id', as: 'logs' });
LogSistema.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

// 3. Exportar todo
module.exports = {
    sequelize,
    Administrador,
    Tendero,
    Tienda,
    Categoria,
    Producto,
    Cliente,
    ClienteTienda,
    Fiado,
    FiadoDetalle,
    Pago,
    Alerta,
    ScoringHistorial,
    VerificacionSms,
    LogSistema
};