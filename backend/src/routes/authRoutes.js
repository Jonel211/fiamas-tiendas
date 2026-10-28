const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/authMiddleware');

// Límite para endpoints públicos de cliente (evita consultas masivas de teléfonos)
const clientePublicoLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Demasiados intentos, espera un momento.' }
});

// Rutas Públicas de Autenticación

// 1. Inicio de sesión general
// POST /api/auth/login
router.post('/login', authController.login);

// 2. Registro de Administrador
// POST /api/auth/register/admin
router.post('/register/admin', authController.registerAdmin);

// 3. Registro de Tendero
// POST /api/auth/register/tendero
router.post('/register/tendero', authController.registerTendero);

// 4. Pre-registro de Cliente (autocompleta nombres según el teléfono)
// GET /api/auth/register/cliente/consulta?telefono=999999999
router.get('/register/cliente/consulta', clientePublicoLimiter, authController.consultarPreRegistro);

// 5. Registro de Cliente (activa la cuenta creada por el tendero)
// POST /api/auth/register/cliente
router.post('/register/cliente', clientePublicoLimiter, authController.registerCliente);

// 6. Perfil de Administrador (Mi Cuenta / Configuración)
// GET /api/auth/perfil
router.get('/perfil', verificarToken, authController.getPerfilAdmin);

// PUT /api/auth/perfil
router.put('/perfil', verificarToken, authController.actualizarPerfilAdmin);

module.exports = router;