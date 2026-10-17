const express = require('express');
const router = express.Router();
const tenderoController = require('../controllers/tenderoController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// Rutas de Tendero


// 0. Rutas Administrativas (Admin)
// GET /api/tenderos -> Listado de todos los tenderos
router.get(
    '/',
    verificarToken,
    verificarRol(['admin']),
    tenderoController.getTenderosAdmin
);

// POST /api/tenderos -> Crear un tendero desde panel admin
router.post(
    '/',
    verificarToken,
    verificarRol(['admin']),
    tenderoController.crearTenderoAdmin
);

// PUT /api/tenderos/toggle-activo/:id -> Activar o desactivar tendero
router.put(
    '/toggle-activo/:id',
    verificarToken,
    verificarRol(['admin']),
    tenderoController.toggleActivoTenderoAdmin
);

// DELETE /api/tenderos/:id -> Eliminar tendero (Admin)
router.delete(
    '/:id',
    verificarToken,
    verificarRol(['admin']),
    tenderoController.eliminarTenderoAdmin
);

// 1. Obtener perfil del tendero (Tendero)
// GET /api/tenderos/perfil
router.get(
    '/perfil',
    verificarToken,
    verificarRol(['tendero']),
    tenderoController.getPerfil
);

// 2. Actualizar perfil del tendero (Tendero)
// PUT /api/tenderos/perfil
router.put(
    '/perfil',
    verificarToken,
    verificarRol(['tendero']),
    tenderoController.actualizarPerfil
);

// 3. Cambiar contraseña (Tendero)
// PUT /api/tenderos/cambiar-password
router.put(
    '/cambiar-password',
    verificarToken,
    verificarRol(['tendero']),
    tenderoController.cambiarPassword
);

// 4. Actualizar tendero por id (Admin)
// PUT /api/tenderos/:id -> Actualizar tendero por id
router.put(
    '/:id',
    verificarToken,
    verificarRol(['admin']),
    tenderoController.actualizarTenderoAdmin
);

// 4. Obtener estadísticas (Tendero)
// GET /api/tenderos/estadisticas
router.get(
    '/estadisticas',
    verificarToken,
    verificarRol(['tendero']),
    tenderoController.getEstadisticas
);

module.exports = router;