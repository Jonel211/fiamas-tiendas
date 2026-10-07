const express = require('express');
const router = express.Router();
const tiendaController = require('../controllers/tiendaController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// ==========================================
// Rutas de Tienda (Protegidas)
// ==========================================

// 1. Obtener datos de la tienda
// GET /api/tienda
router.get(
    '/',
    verificarToken,
    verificarRol(['tendero']),
    tiendaController.getTienda
);

// 2. Actualizar datos de la tienda
// PUT /api/tienda
router.put(
    '/',
    verificarToken,
    verificarRol(['tendero']),
    tiendaController.actualizarTienda
);

// 3. Generar/Regenerar código QR
// POST /api/tienda/generar-qr
router.post(
    '/generar-qr',
    verificarToken,
    verificarRol(['tendero']),
    tiendaController.generarQR
);

// 4. Activar/Desactivar código QR
// PUT /api/tienda/toggle-qr
router.put(
    '/toggle-qr',
    verificarToken,
    verificarRol(['tendero']),
    tiendaController.toggleQR
);

// 5. Obtener resumen/dashboard de la tienda
// GET /api/tienda/resumen
router.get(
    '/resumen',
    verificarToken,
    verificarRol(['tendero']),
    tiendaController.getResumenTienda
);

module.exports = router;