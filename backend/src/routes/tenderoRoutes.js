const express = require('express');
const router = express.Router();
const tenderoController = require('../controllers/tenderoController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// ==========================================
// Rutas de Tendero (Protegidas)
// ==========================================

// 1. Obtener perfil del tendero
// GET /api/tendero/perfil
router.get(
    '/perfil',
    verificarToken,
    verificarRol(['tendero']),
    tenderoController.getPerfil
);

// 2. Actualizar perfil del tendero
// PUT /api/tendero/perfil
router.put(
    '/perfil',
    verificarToken,
    verificarRol(['tendero']),
    tenderoController.actualizarPerfil
);

// 3. Cambiar contraseña
// PUT /api/tendero/cambiar-password
router.put(
    '/cambiar-password',
    verificarToken,
    verificarRol(['tendero']),
    tenderoController.cambiarPassword
);

// 4. Obtener estadísticas
// GET /api/tendero/estadisticas
router.get(
    '/estadisticas',
    verificarToken,
    verificarRol(['tendero']),
    tenderoController.getEstadisticas
);

module.exports = router;