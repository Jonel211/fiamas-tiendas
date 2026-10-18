const express = require('express');
const router = express.Router();
const avisoController = require('../controllers/avisoController');
const { verificarToken } = require('../middleware/authMiddleware');

// GET /api/avisos - Listar avisos
router.get('/', verificarToken, avisoController.getAvisos);

// POST /api/avisos - Crear aviso
router.post('/', verificarToken, avisoController.crearAviso);

// DELETE /api/avisos/:id - Eliminar aviso
router.delete('/:id', verificarToken, avisoController.eliminarAviso);

module.exports = router;
