const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { verificarToken } = require('../middleware/authMiddleware');

// GET /api/reportes/estadisticas - Estadísticas generales
router.get('/estadisticas', verificarToken, reporteController.getEstadisticas);

module.exports = router;
