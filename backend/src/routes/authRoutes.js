const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


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

// 4. Registro de Cliente
// POST /api/auth/register/cliente
router.post('/register/cliente', authController.registerCliente);

module.exports = router;