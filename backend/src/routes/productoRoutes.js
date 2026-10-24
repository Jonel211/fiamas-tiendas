const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verificarToken } = require('../middleware/authMiddleware'); // ✅ Ruta corregida

// ═════════════════════════════════════════════════════════════════════════
// RUTAS DE PRODUCTOS
// Todas requieren autenticación
// ══════════════════════════════════════════════════════════════════════════

// Crear producto
router.post('/', verificarToken, productoController.crearProducto);

// Listar productos de una tienda específica
router.get('/tienda/:tiendaId', verificarToken, productoController.listarProductosPorTienda);

// Obtener un producto por ID
router.get('/:id', verificarToken, productoController.obtenerProductoPorId);

// Actualizar producto
router.put('/:id', verificarToken, productoController.actualizarProducto);

// Eliminar producto
router.delete('/:id', verificarToken, productoController.eliminarProducto);

module.exports = router;