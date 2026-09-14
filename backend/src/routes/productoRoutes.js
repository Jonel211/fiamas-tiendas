// src/routes/productoRoutes.js
const express = require('express');
const router = express.Router();

// Importar controlador y middlewares de autenticación
const productoController = require('../controllers/productoController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticación y autorización a todas las rutas de este archivo
router.use(verificarToken);
router.use(verificarRol(['tendero', 'admin']));

// Rutas CRUD de Productos
router.post('/', productoController.crearProducto);
router.get('/tienda/:tienda_id', productoController.obtenerProductosPorTienda);
router.put('/:id', productoController.actualizarProducto);
router.delete('/:id', productoController.eliminarProducto);

// Ruta específica para manejo de inventario (entradas/salidas)
router.post('/:id/stock', productoController.actualizarStock);

module.exports = router;