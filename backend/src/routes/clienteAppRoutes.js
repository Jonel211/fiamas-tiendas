const express = require('express');
const router = express.Router();
const clienteAppController = require('../controllers/clienteAppController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// RUTAS PARA LA APP DEL CLIENTE
// Todas requieren rol 'cliente'

// 1. PERFIL
router.get('/mi-perfil', verificarToken, verificarRol(['cliente']), clienteAppController.miPerfil);
router.put('/mi-perfil', verificarToken, verificarRol(['cliente']), clienteAppController.actualizarMiPerfil);

// Ruta para subir/actualizar la foto de perfil (Campo 'foto', máx 5MB)
router.patch('/mi-perfil/foto', verificarToken, verificarRol(['cliente']), upload.imagen('foto'), clienteAppController.actualizarFotoPerfil);

// 2. TIENDAS
router.get('/mis-tiendas', verificarToken, verificarRol(['cliente']), clienteAppController.misTiendas);

// 3. FIADOS
router.get('/mis-fiados', verificarToken, verificarRol(['cliente']), clienteAppController.misFiados);

// 4. RESUMEN
router.get('/mi-resumen', verificarToken, verificarRol(['cliente']), clienteAppController.miResumen);

// 5. PAGOS
router.get('/mis-pagos', verificarToken, verificarRol(['cliente']), clienteAppController.misPagos);

module.exports = router;