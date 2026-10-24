const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const reporteController = require('../controllers/reporteController');

// ═════════════════════════════════════════════════════════════════════════
// RUTAS DE REPORTES
// ═════════════════════════════════════════════════════════════════════════

// Asegúrate de que los nombres de las funciones (ej: obtenerReporteVentas) 
// coincidan EXACTAMENTE con los que exportas en reporteController.js

router.get('/ventas', verificarToken, reporteController.obtenerReporteVentas);
router.get('/productos', verificarToken, reporteController.obtenerReporteProductos);

module.exports = router;