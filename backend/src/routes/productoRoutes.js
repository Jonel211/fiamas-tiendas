const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verificarToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Crear producto (ahora acepta un archivo llamado 'imagen')
router.post('/', verificarToken, upload.single('imagen'), productoController.crearProducto);

// Listar productos de una tienda específica
router.get('/tienda/:tiendaId', verificarToken, productoController.listarProductosPorTienda);

// Obtener un producto por ID
router.get('/:id', verificarToken, productoController.obtenerProductoPorId);

// Actualizar producto (también acepta archivo 'imagen')
router.put('/:id', verificarToken, upload.single('imagen'), productoController.actualizarProducto);

// Eliminar producto
router.delete('/:id', verificarToken, productoController.eliminarProducto);

module.exports = router;