const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación y rol de tendero o admin
router.use(verificarToken);
router.use(verificarRol(['admin', 'tendero']));

// 1. REGISTRAR PAGO
router.post('/', pagoController.registrarPago);

// 2. LISTAR PAGOS
router.get('/', pagoController.listarPagos);

// 3. OBTENER DETALLE DE PAGO
router.get('/:id', pagoController.obtenerPago);

module.exports = router;