// src/routes/healthRoutes.js
const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');

router.get('/', async (req, res) => {
    try {
        // Verificamos que la base de datos responda
        await sequelize.authenticate();

        res.status(200).json({
            status: 'OK',
            message: 'Servidor y base de datos funcionando correctamente',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            version: 'v6'
        });
    } catch (error) {
        // Si la DB falla, devolvemos 503 (Service Unavailable) para que Render lo detecte
        res.status(503).json({
            status: 'ERROR',
            message: 'Fallo en la conexión a la base de datos',
            error: process.env.NODE_ENV === 'production' ? 'Error interno' : error.message
        });
    }
});

module.exports = router;