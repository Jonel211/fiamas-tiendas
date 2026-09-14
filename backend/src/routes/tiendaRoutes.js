// src/routes/tiendaRoutes.js
const express = require('express');
const router = express.Router();

// Importar controlador y middlewares de autenticación
const tiendaController = require('../controllers/tiendaController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticación y autorización a todas las rutas de este archivo
router.use(verificarToken);
router.use(verificarRol(['tendero', 'admin']));

// Rutas CRUD de Tiendas
router.post('/', tiendaController.crearTienda);
router.get('/mis-tiendas', tiendaController.obtenerMisTiendas);
router.get('/:id', tiendaController.obtenerTiendaPorId);
router.put('/:id', tiendaController.actualizarTienda);
router.delete('/:id', tiendaController.eliminarTienda);

module.exports = router;