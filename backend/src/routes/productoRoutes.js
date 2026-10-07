const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verificarToken, verificarRol, verificarPropiedadTienda } = require('../middleware/authMiddleware');

// ==========================================
// Rutas de Productos (Protegidas)
// ==========================================

// 1. Crear un producto — Solo tenderos y admins
// POST /api/productos
router.post(
    '/',
    verificarToken,
    verificarRol(['tendero', 'admin']),
    verificarPropiedadTienda,
    productoController.crearProducto
);

// 2. Obtener todos los productos de una tienda — Tenderos y admins
// GET /api/productos/tienda/:tienda_id
router.get(
    '/tienda/:tienda_id',
    verificarToken,
    verificarRol(['tendero', 'admin']),
    verificarPropiedadTienda,
    productoController.getProductosPorTienda
);

// 3. Obtener productos con stock bajo — Tenderos y admins
// GET /api/productos/stock-bajo/:tienda_id
router.get(
    '/stock-bajo/:tienda_id',
    verificarToken,
    verificarRol(['tendero', 'admin']),
    verificarPropiedadTienda,
    productoController.getProductosStockBajo
);

// 4. Buscar productos por nombre o código de barras
// GET /api/productos/buscar?q=arroz&tienda_id=uuid
router.get(
    '/buscar',
    verificarToken,
    verificarRol(['tendero', 'admin', 'cliente']),
    productoController.buscarProductos
);

// 5. Obtener un producto por ID — Todos los roles autenticados
// GET /api/productos/:id
router.get(
    '/:id',
    verificarToken,
    verificarRol(['tendero', 'admin', 'cliente']),
    productoController.getProductoPorId
);

// 6. Actualizar un producto — Solo tenderos y admins
// PUT /api/productos/:id
router.put(
    '/:id',
    verificarToken,
    verificarRol(['tendero', 'admin']),
    productoController.actualizarProducto
);

// 7. Eliminar un producto (soft delete) — Solo tenderos y admins
// DELETE /api/productos/:id
router.delete(
    '/:id',
    verificarToken,
    verificarRol(['tendero', 'admin']),
    productoController.eliminarProducto
);

module.exports = router;