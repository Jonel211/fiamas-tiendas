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
app.use('/api/tiendas', tiendaRoutes);

const tenderoRoutes = require('./routes/tenderoRoutes');
app.use('/api/tenderos', tenderoRoutes);

const productoRoutes = require('./routes/productoRoutes');
app.use('/api/productos', productoRoutes);

// ==========================================
// Manejo de rutas no encontradas (404)
// ==========================================
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;