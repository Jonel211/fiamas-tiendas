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

// --- TENDERO Y TIENDA ---
Tendero.hasMany(Tienda, { foreignKey: 'tendero_id', as: 'tiendas' });
Tienda.belongsTo(Tendero, { foreignKey: 'tendero_id', as: 'tendero' });

// --- TIENDA, CATEGORÍA Y PRODUCTO ---
Tienda.hasMany(Categoria, { foreignKey: 'tienda_id', as: 'categorias' });
Categoria.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

Tienda.hasMany(Producto, { foreignKey: 'tienda_id', as: 'productos' });
Producto.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

Categoria.hasMany(Producto, { foreignKey: 'categoria_id', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });

// --- CLIENTE Y TIENDA (Many-to-Many a través de ClienteTienda) ---
Cliente.belongsToMany(Tienda, { through: ClienteTienda, foreignKey: 'cliente_id', as: 'tiendas' });
Tienda.belongsToMany(Cliente, { through: ClienteTienda, foreignKey: 'tienda_id', as: 'clientes' });
ClienteTienda.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
ClienteTienda.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });
Cliente.hasMany(ClienteTienda, { foreignKey: 'cliente_id', as: 'tiendasVinculadas' });
Tienda.hasMany(ClienteTienda, { foreignKey: 'tienda_id', as: 'clientesVinculados' });

// --- FIADO Y SUS RELACIONES CRÍTICAS (Blindadas para la App del Cliente) ---
// 1. Fiado <-> Tienda
Tienda.hasMany(Fiado, { foreignKey: 'tienda_id', as: 'fiados' });
Fiado.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

// 2. Fiado <-> Cliente
Cliente.hasMany(Fiado, { foreignKey: 'cliente_id', as: 'fiados' });
Fiado.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// 3. Fiado <-> Tendero (Creador)
Tendero.hasMany(Fiado, { foreignKey: 'tendero_id', as: 'fiadosCreados' });
Fiado.belongsTo(Tendero, { foreignKey: 'tendero_id', as: 'tenderoCreador' });

// 4. Fiado <-> FiadoDetalle (Alias 'detalles' coincide con el controller)
Fiado.hasMany(FiadoDetalle, { foreignKey: 'fiado_id', as: 'detalles' });
FiadoDetalle.belongsTo(Fiado, { foreignKey: 'fiado_id', as: 'fiado' });

// 5. FiadoDetalle <-> Producto (Alias 'producto' coincide con el controller)
Producto.hasMany(FiadoDetalle, { foreignKey: 'producto_id', as: 'detallesEnProducto' }); // Alias único para evitar conflictos
FiadoDetalle.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

// 6. Fiado <-> Pago (Alias 'pagos' coincide con el controller)
Fiado.hasMany(Pago, { foreignKey: 'fiado_id', as: 'pagos' });
Pago.belongsTo(Fiado, { foreignKey: 'fiado_id', as: 'fiado' });

// --- RELACIONES ADICIONALES DE PAGO ---
Tienda.hasMany(Pago, { foreignKey: 'tienda_id', as: 'pagos' });
Pago.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

Cliente.hasMany(Pago, { foreignKey: 'cliente_id', as: 'pagos' });
Pago.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

Tendero.hasMany(Pago, { foreignKey: 'registrado_por', as: 'pagosRegistrados' });
Pago.belongsTo(Tendero, { foreignKey: 'registrado_por', as: 'registrador' });

// --- RELACIONES DE ALERTAS ---
Tienda.hasMany(Alerta, { foreignKey: 'tienda_id', as: 'alertas' });
Alerta.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });

Cliente.hasMany(Alerta, { foreignKey: 'cliente_id', as: 'alertas' });
Alerta.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

Producto.hasMany(Alerta, { foreignKey: 'producto_id', as: 'alertas' });
Alerta.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

Tendero.hasMany(Alerta, { foreignKey: 'destinatario_id', as: 'alertasRecibidas', constraints: false });
Alerta.belongsTo(Tendero, { foreignKey: 'destinatario_id', as: 'destinatarioTendero', constraints: false });

Tendero.hasMany(Alerta, { foreignKey: 'emisor_id', as: 'alertasEmitidas', constraints: false });
Alerta.belongsTo(Tendero, { foreignKey: 'emisor_id', as: 'emisorTendero', constraints: false });

// --- RELACIONES DE SCORING Y LOGS ---
Cliente.hasMany(ScoringHistorial, { foreignKey: 'cliente_id', as: 'scoringHistorial' });
ScoringHistorial.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
ScoringHistorial.belongsTo(Tienda, { foreignKey: 'tienda_id', as: 'tienda' });
Tienda.hasMany(ScoringHistorial, { foreignKey: 'tienda_id', as: 'scoringHistoriales' });

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