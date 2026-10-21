const express = require('express');
const router = express.Router();
const avisoController = require('../controllers/avisoController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

const soloAdmin = [verificarToken, verificarRol(['admin'])];

// GET /api/avisos - Listar avisos
router.get('/', soloAdmin, avisoController.getAvisos);

// POST /api/avisos - Crear aviso
router.post('/', soloAdmin, avisoController.crearAviso);

// DELETE /api/avisos/:id - Eliminar aviso
router.delete('/:id', soloAdmin, avisoController.eliminarAviso);

module.exports = router;
