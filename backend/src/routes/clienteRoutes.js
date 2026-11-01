const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// ═══════════════════════════════════════════════════════════════════════════
// RUTAS DE CLIENTES
// ══════════════════════════════════════════════════════════════════════════

// ️ IMPORTANTE: Las rutas específicas deben ir ANTES de las rutas con parámetros

// 5. BUSCAR CLIENTE POR TELÉFONO
// GET /api/clientes/buscar?telefono=999&tienda_id=xxx
router.get(
    '/buscar',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    clienteController.buscarCliente
);

// CLIENTES RECIENTES
// GET /api/clientes/recientes?tienda_id=xxx&limit=4
router.get(
    '/recientes',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    clienteController.clientesRecientes
);

// 2. LISTAR CLIENTES DE UNA TIENDA
// GET /api/clientes?tienda_id=xxx
router.get(
    '/',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    clienteController.listarClientes
);

// 1. CREAR CLIENTE (con vinculación automática)
// POST /api/clientes
router.post(
    '/',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    clienteController.crearCliente
);

// 3. OBTENER DETALLE DE UN CLIENTE
// GET /api/clientes/:id
router.get(
    '/:id',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    clienteController.obtenerCliente
);

// 4. ACTUALIZAR CLIENTE
// PUT /api/clientes/:id
router.put(
    '/:id',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    clienteController.actualizarCliente
);

// 6. VINCULAR CLIENTE A TIENDA
router.post(
    '/:clienteId/vincular',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    clienteController.vincularCliente
);

// 7. VER TIENDAS VINCULADAS
router.get(
    '/:clienteId/tiendas',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    clienteController.verTiendasVinculadas
);

// 8. EDITAR VÍNCULO
router.put(
    '/:clienteId/tiendas/:tiendaId',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    clienteController.editarVinculo
);

// 9. DESVINCULAR
router.delete(
    '/:clienteId/tiendas/:tiendaId',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    clienteController.desvincularCliente
);


// 10. LISTAR FIADOS DEL CLIENTE
router.get(
    '/:clienteId/fiados',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    clienteController.listarFiadosCliente
);

// 11. RESUMEN COMPLETO DEL CLIENTE
router.get(
    '/:clienteId/resumen',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    clienteController.resumenCliente
);

// 12. HISTORIAL DE PAGOS DEL CLIENTE
router.get(
    '/:clienteId/historial-pagos',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    clienteController.historialPagosCliente
);

module.exports = router;