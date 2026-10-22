const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// Todas las rutas de categorías requieren autenticación y rol de admin o tendero
router.use(verificarToken);
router.use(verificarRol(['admin', 'tendero']));

// 1. CREAR CATEGORÍA
router.post('/', categoriaController.crearCategoria);

// 2. LISTAR CATEGORÍAS
router.get('/', categoriaController.listarCategorias);

// 3. OBTENER DETALLE DE CATEGORÍA
router.get('/:id', categoriaController.obtenerCategoria);

// 4. ACTUALIZAR CATEGORÍA
router.put('/:id', categoriaController.actualizarCategoria);

// 5. ELIMINAR CATEGORÍA (Soft Delete)
router.delete('/:id', categoriaController.eliminarCategoria);

module.exports = router;