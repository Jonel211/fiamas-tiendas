const express = require('express');
const router = express.Router();
const tenderoController = require('../controllers/tenderoController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.use(verificarToken);
router.use(verificarRol(['tendero', 'admin']));

router.get('/perfil', tenderoController.obtenerPerfil);
router.put('/perfil', tenderoController.actualizarPerfil);
router.delete('/cuenta', tenderoController.eliminarCuenta);

module.exports = router;