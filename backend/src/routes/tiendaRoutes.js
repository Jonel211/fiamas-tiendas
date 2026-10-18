const express = require('express');
const router = express.Router();
const tiendaController = require('../controllers/tiendaController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// Rutas de Tienda

// 1. Obtener todas las tiendas (Panel Admin)
// GET /api/tiendas
router.get(
    '/',
    verificarToken,
    verificarRol(['admin']),
    tiendaController.getTiendasAdmin
);

// 2. Obtener datos de la tienda propia (Tendero)
// GET /api/tiendas/mi-tienda
router.get(
    '/mi-tienda',
    verificarToken,
    verificarRol(['tendero']),
    tiendaController.getTienda
);

// 3. Crear tienda (Admin)
// POST /api/tiendas
router.post(
    '/',
    verificarToken,
    verificarRol(['admin']),
    tiendaController.crearTiendaAdmin
);

// 4. Generar/Regenerar código QR (Admin o Tendero)
// POST /api/tiendas/generar-qr/:id?
router.post(
    '/generar-qr/:id?',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    tiendaController.generarQR
);

// 5. Activar/Desactivar código QR (Admin o Tendero)
// PUT /api/tiendas/toggle-qr/:id?
router.put(
    '/toggle-qr/:id?',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    tiendaController.toggleQR
);

// 6. Activar/Desactivar Tienda (Admin)
// PUT /api/tiendas/toggle-activo/:id
router.put(
    '/toggle-activo/:id',
    verificarToken,
    verificarRol(['admin']),
    tiendaController.toggleActivoTienda
);

// 7. Actualizar datos de la tienda (Admin o Tendero)
// PUT /api/tiendas/:id?
router.put(
    '/:id?',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    tiendaController.actualizarTienda
);

// 8. Obtener resumen/dashboard de la tienda
// GET /api/tiendas/resumen
router.get(
    '/resumen',
    verificarToken,
    verificarRol(['tendero']),
    tiendaController.getResumenTienda
);

// 9. Eliminar tienda (Admin)
// DELETE /api/tiendas/:id
router.delete(
    '/:id',
    verificarToken,
    verificarRol(['admin']),
    tiendaController.eliminarTiendaAdmin
);

module.exports = router;