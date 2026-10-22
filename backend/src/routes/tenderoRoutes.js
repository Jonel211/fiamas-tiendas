const express = require('express');
const router = express.Router();
const tenderoController = require('../controllers/tenderoController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// ═══════════════════════════════════════════════════════════════════════════
// RUTAS DE TENDERO
// ═══════════════════════════════════════════════════════════════════════════

// 0. OBTENER TODOS LOS TENDEROS (PANEL ADMIN)
// GET /api/tenderos
router.get(
    '/',
    verificarToken,
    verificarRol(['admin']), // Solo admin puede ver todos los tenderos
    tenderoController.getTenderosAdmin
);

// 0.1 CREAR TENDERO (ADMIN O REGISTRO MÓVIL)
// POST /api/tenderos
// ✅ MODIFICADO: Ahora permite admin y tendero (para registro desde app móvil)
router.post(
    '/',
    verificarToken,
    verificarRol(['admin', 'tendero']), // ✅ CAMBIO: Permite ambos roles
    tenderoController.crearTenderoAdmin
);

// 0.2 ACTUALIZAR TENDERO POR ID (PANEL ADMIN)
// PUT /api/tenderos/:id
router.put(
    '/:id',
    verificarToken,
    verificarRol(['admin']), // Solo admin puede actualizar otros tenderos
    tenderoController.actualizarTenderoAdmin
);

// 0.3 ALTERNAR ESTADO ACTIVO TENDERO (PANEL ADMIN)
// PUT /api/tenderos/toggle-activo/:id
router.put(
    '/toggle-activo/:id',
    verificarToken,
    verificarRol(['admin']), // Solo admin puede activar/desactivar
    tenderoController.toggleActivoTenderoAdmin
);

// 0.4 ELIMINAR TENDERO (PANEL ADMIN)
// DELETE /api/tenderos/:id
router.delete(
    '/:id',
    verificarToken,
    verificarRol(['admin']), // Solo admin puede eliminar tenderos
    tenderoController.eliminarTenderoAdmin
);

// 1. OBTENER PERFIL DEL TENDERO (TENDERO LOGUEADO)
// GET /api/tenderos/perfil
router.get(
    '/perfil',
    verificarToken,
    verificarRol(['tendero']), // Solo tendero puede ver su perfil
    tenderoController.getPerfil
);

// 2. ACTUALIZAR PERFIL DEL TENDERO (TENDERO LOGUEADO)
// PUT /api/tenderos/perfil
router.put(
    '/perfil',
    verificarToken,
    verificarRol(['tendero']), // Solo tendero puede actualizar su perfil
    tenderoController.actualizarPerfil
);

// 3. CAMBIAR CONTRASEÑA (TENDERO LOGUEADO)
// PUT /api/tenderos/cambiar-password
router.put(
    '/cambiar-password',
    verificarToken,
    verificarRol(['tendero']), // Solo tendero puede cambiar su password
    tenderoController.cambiarPassword
);

// 4. OBTENER ESTADÍSTICAS (TENDERO LOGUEADO)
// GET /api/tenderos/estadisticas
router.get(
    '/estadisticas',
    verificarToken,
    verificarRol(['tendero']), // Solo tendero puede ver sus estadísticas
    tenderoController.getEstadisticas
);

module.exports = router;