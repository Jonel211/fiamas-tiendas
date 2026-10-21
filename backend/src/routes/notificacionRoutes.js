const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificacionController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

const soloTendero = [verificarToken, verificarRol(['tendero'])];

router.get('/', soloTendero, ctrl.listar);
router.get('/no-leidas/count', soloTendero, ctrl.contarNoLeidas);
router.patch('/leer-todas', soloTendero, ctrl.marcarTodas);   // antes de /:id
router.patch('/:id/leer', soloTendero, ctrl.marcarLeida);

module.exports = router;