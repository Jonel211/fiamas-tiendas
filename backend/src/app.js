const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database'); // Importamos sequelize para el health check

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Health Check (Mejorado para verificar la BD)
// ==========================================
app.get('/health', async (req, res) => {
    try {
        // Intenta hacer una consulta simple a la base de datos
        await sequelize.authenticate();

        res.status(200).json({
            status: 'OK',
            message: 'Servidor y base de datos funcionando correctamente',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        // Si la BD falla, devolvemos 503 (Service Unavailable)
        res.status(503).json({
            status: 'ERROR',
            message: 'Fallo en la conexión a la base de datos',
            timestamp: new Date().toISOString()
        });
    }
});

// ==========================================
// Rutas de la API
// ==========================================
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const tiendaRoutes = require('./routes/tiendaRoutes');
const tenderoRoutes = require('./routes/tenderoRoutes');
const productoRoutes = require('./routes/productoRoutes');
const backupRoutes = require('./routes/backupRoutes');
const avisoRoutes = require('./routes/avisoRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const clienteAppRoutes = require('./routes/clienteAppRoutes');
const fiadoRoutes = require('./routes/fiadoRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');

// ==========================================
// Manejo de rutas no encontradas (404)
// ==========================================
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;