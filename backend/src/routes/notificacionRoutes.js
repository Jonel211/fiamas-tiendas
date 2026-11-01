const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificacionController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

const soloTendero = [verificarToken, verificarRol(['tendero'])];

router.get('/', soloTendero, ctrl.listar);
router.get('/no-leidas/count', soloTendero, ctrl.contarNoLeidas);
router.patch('/leer-todas', soloTendero, ctrl.marcarTodas);   // antes de /:id
router.delete('/limpiar', soloTendero, ctrl.limpiarTodas);    // limpiar/cerrar todas
router.patch('/:id/leer', soloTendero, ctrl.marcarLeida);
router.delete('/:id', soloTendero, ctrl.eliminarUna);

module.exports = router;