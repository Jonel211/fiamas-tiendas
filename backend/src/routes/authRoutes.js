const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas Públicas

// Inicio de sesión general
// POST /api/auth/login
router.post('/login', authController.login);

// Registro de usuarios
// POST /api/auth/register/admin
router.post('/register/admin', authController.registerAdmin);

// POST /api/auth/register/tendero
router.post('/register/tendero', authController.registerTendero);

// POST /api/auth/register/cliente
router.post('/register/cliente', authController.registerCliente);

module.exports = router;
