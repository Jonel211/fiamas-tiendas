const express = require('express');
const router = express.Router();
const fiadoController = require('../controllers/fiadoController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación y rol de tendero o admin
router.use(verificarToken);
router.use(verificarRol(['admin', 'tendero']));

// 1. CREAR FIADO
router.post('/', fiadoController.crearFiado);

// 2. LISTAR FIADOS
router.get('/', fiadoController.listarFiados);

// 3. OBTENER DETALLE DE FIADO
router.get('/:id', fiadoController.obtenerFiado);

// 4. ACTUALIZAR FIADO
router.put('/:id', fiadoController.actualizarFiado);

// 5. ELIMINAR FIADO
router.delete('/:id', fiadoController.eliminarFiado);

module.exports = router;