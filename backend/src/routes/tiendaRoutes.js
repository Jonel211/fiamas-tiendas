const express = require('express');
const router = express.Router();
const tiendaController = require('../controllers/tiendaController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// ═══════════════════════════════════════════════════════════════════════════
// RUTAS DE TIENDA
// ══════════════════════════════════════════════════════════════════════════

// 0. OBTENER TODAS LAS TIENDAS (PANEL ADMIN)
// GET /api/tiendas
router.get(
    '/',
    verificarToken,
    verificarRol(['admin']), // Solo admin puede ver todas las tiendas
    tiendaController.getTiendasAdmin
);

// 1. OBTENER DATOS DE LA TIENDA PROPIA (TENDERO LOGUEADO)
// GET /api/tiendas/mi-tienda
router.get(
    '/mi-tienda',
    verificarToken,
    verificarRol(['tendero']), // Solo tendero puede ver su tienda
    tiendaController.getTienda
);

// 2. CREAR TIENDA (ADMIN O TENDERO)
// POST /api/tiendas
//  MODIFICADO: Ahora permite admin y tendero (para crear tiendas desde app móvil)
router.post(
    '/',
    verificarToken,
    verificarRol(['admin', 'tendero']), //  CAMBIO: Permite ambos roles
    tiendaController.crearTiendaAdmin
);

// 3. GENERAR/REGENERAR CÓDIGO QR (ADMIN O TENDERO)
// POST /api/tiendas/generar-qr/:id?
router.post(
    '/generar-qr/:id?',
    verificarToken,
    verificarRol(['admin', 'tendero']), // Ambos pueden generar QR
    tiendaController.generarQR
);

// 4. ACTIVAR/DESACTIVAR CÓDIGO QR (ADMIN O TENDERO)
// PUT /api/tiendas/toggle-qr/:id?
router.put(
    '/toggle-qr/:id?',
    verificarToken,
    verificarRol(['admin', 'tendero']), // Ambos pueden toggle QR
    tiendaController.toggleQR
);

// 5. ACTIVAR/DESACTIVAR TIENDA (PANEL ADMIN)
// PUT /api/tiendas/toggle-activo/:id
router.put(
    '/toggle-activo/:id',
    verificarToken,
    verificarRol(['admin']), // Solo admin puede activar/desactivar tiendas
    tiendaController.toggleActivoTienda
);

// 6. ACTUALIZAR DATOS DE LA TIENDA (ADMIN O TENDERO)
// PUT /api/tiendas/:id?
router.put(
    '/:id?',
    verificarToken,
    verificarRol(['admin', 'tendero']), // Ambos pueden actualizar
    tiendaController.actualizarTienda
);

// 7. OBTENER RESUMEN/DASHBOARD DE LA TIENDA (TENDERO LOGUEADO)
// GET /api/tiendas/resumen
router.get(
    '/resumen',
    verificarToken,
    verificarRol(['tendero']), // Solo tendero puede ver su resumen
    tiendaController.getResumenTienda
);

// 8. ELIMINAR TIENDA (ADMIN O TENDERO)
// DELETE /api/tiendas/:id
//  MODIFICADO: Ahora permite admin y tendero (para eliminar desde app móvil)
router.delete(
    '/:id',
    verificarToken,
    verificarRol(['admin', 'tendero']), //  CAMBIO: Permite ambos roles
    tiendaController.eliminarTiendaAdmin
);

module.exports = router;