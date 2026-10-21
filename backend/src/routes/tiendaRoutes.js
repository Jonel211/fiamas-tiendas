const express = require('express');
const router = express.Router();
const tiendaController = require('../controllers/tiendaController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// ═══════════════════════════════════════════════════════════════════════════
// RUTAS DE TIENDA
// ═══════════════════════════════════════════════════════════════════════════

// 0. OBTENER TODAS LAS TIENDAS (PANEL ADMIN)
// GET /api/tiendas
router.get(
    '/',
    verificarToken,
    verificarRol(['admin']),
    tiendaController.getTiendasAdmin // ✅ Coincide con el controller
);

// 1. OBTENER DATOS DE LA TIENDA PROPIA (TENDERO LOGUEADO)
// GET /api/tiendas/mi-tienda
router.get(
    '/mi-tienda',
    verificarToken,
    verificarRol(['tendero']),
    tiendaController.getTienda // ✅ CORREGIDO: Era getMiTienda, ahora es getTienda
);

// 2. CREAR TIENDA (ADMIN O TENDERO)
// POST /api/tiendas
router.post(
    '/',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    tiendaController.crearTiendaAdmin // ✅ Coincide con el controller
);

// 3. GENERAR/REGENERAR CÓDIGO QR (ADMIN O TENDERO)
// POST /api/tiendas/generar-qr/:id?
router.post(
    '/generar-qr/:id?',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    tiendaController.generarQR // ✅ Coincide con el controller
);

// 4. ACTIVAR/DESACTIVAR CÓDIGO QR (ADMIN O TENDERO)
// PUT /api/tiendas/toggle-qr/:id?
router.put(
    '/toggle-qr/:id?',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    tiendaController.toggleQR 
);

// 5. ACTIVAR/DESACTIVAR TIENDA (PANEL ADMIN)
// PUT /api/tiendas/toggle-activo/:id
router.put(
    '/toggle-activo/:id',
    verificarToken,
    verificarRol(['admin']),
    tiendaController.toggleActivoTienda 
);

// 6. ACTUALIZAR DATOS DE LA TIENDA (ADMIN O TENDERO)
// PUT /api/tiendas/:id?
router.put(
    '/:id?',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    tiendaController.actualizarTienda 
);

// 7. OBTENER RESUMEN/DASHBOARD DE LA TIENDA (TENDERO LOGUEADO)
// GET /api/tiendas/resumen
router.get(
    '/resumen',
    verificarToken,
    verificarRol(['tendero']),
    tiendaController.getResumenTienda 
);

// 8. ELIMINAR TIENDA (ADMIN O TENDERO)
// DELETE /api/tiendas/:id
router.delete(
    '/:id',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    tiendaController.eliminarTiendaAdmin 
);

module.exports = router;