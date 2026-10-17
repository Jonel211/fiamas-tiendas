const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Rutas de la API
const authRoutes = require('./routes/authRoutes');
const tiendaRoutes = require('./routes/tiendaRoutes');
const tenderoRoutes = require('./routes/tenderoRoutes');
const productoRoutes = require('./routes/productoRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tiendas', tiendaRoutes);
app.use('/api/tenderos', tenderoRoutes);
app.use('/api/productos', productoRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({
        error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
});

// Manejo centralizado de errores (Global Error Handler)
app.use((err, req, res, next) => {
    console.error('Error no controlado en la aplicación:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;