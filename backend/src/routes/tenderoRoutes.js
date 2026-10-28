const express = require('express');
const router = express.Router();
const tenderoController = require('../controllers/tenderoController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// RUTAS DE TENDERO

// 0. OBTENER TODOS LOS TENDEROS (PANEL ADMIN)
// GET /api/tenderos
router.get(
    '/',
    verificarToken,
    verificarRol(['admin']),
    tenderoController.getTenderosAdmin
);

// 0.1 CREAR TENDERO (ADMIN O REGISTRO MÓVIL)
// POST /api/tenderos
router.post(
    '/',
    verificarToken,
    verificarRol(['admin', 'tendero']),
    tenderoController.crearTenderoAdmin
);

// 1. OBTENER PERFIL DEL TENDERO (TENDERO LOGUEADO)
// GET /api/tenderos/perfil
router.get(
    '/perfil',
    verificarToken,
    verificarRol(['tendero']),
    tenderoController.getPerfil
);

// 2. ACTUALIZAR PERFIL DEL TENDERO (TENDERO LOGUEADO)
// PUT /api/tenderos/perfil
router.put(
    '/perfil',
    verificarToken,
    verificarRol(['tendero']),
    tenderoController.actualizarPerfil
);

// 2.1 SUBIR FOTO DE PERFIL (TENDERO LOGUEADO)
// PATCH /api/tenderos/perfil/foto  (campo multipart: "foto")
router.patch(
    '/perfil/foto',
    verificarToken,
    verificarRol(['tendero']),
    upload.single('foto'),
    tenderoController.subirFotoPerfil
);

// 3. CAMBIAR CONTRASEÑA (TENDERO LOGUEADO)
// PUT /api/tenderos/cambiar-password
router.put(
    '/cambiar-password',
    verificarToken,
    verificarRol(['tendero']),
    tenderoController.cambiarPassword
);

// 4. OBTENER ESTADÍSTICAS (TENDERO LOGUEADO)
// GET /api/tenderos/estadisticas
router.get(
    '/estadisticas',
    verificarToken,
    verificarRol(['tendero']),
    tenderoController.getEstadisticas
);

// 5. ALTERNAR ESTADO ACTIVO TENDERO (PANEL ADMIN)
// PUT /api/tenderos/toggle-activo/:id
router.put(
    '/toggle-activo/:id',
    verificarToken,
    verificarRol(['admin']),
    tenderoController.toggleActivoTenderoAdmin
);

// 6. ACTUALIZAR TENDERO POR ID (PANEL ADMIN) - Al final por ser comodín :id
// PUT /api/tenderos/:id
router.put(
    '/:id',
    verificarToken,
    verificarRol(['admin']),
    tenderoController.actualizarTenderoAdmin
);

// 7. ELIMINAR TENDERO (PANEL ADMIN)
// DELETE /api/tenderos/:id
router.delete(
    '/:id',
    verificarToken,
    verificarRol(['admin']),
    tenderoController.eliminarTenderoAdmin
);

module.exports = router;