const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
const backupRoutes = require('./routes/backupRoutes');
const avisoRoutes = require('./routes/avisoRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const clienteAppRoutes = require('./routes/clienteAppRoutes');
const fiadoRoutes = require('./routes/fiadoRoutes');
const pagoRoutes = require('./routes/pagoRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tiendas', tiendaRoutes);
app.use('/api/tenderos', tenderoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/backups', backupRoutes);
app.use('/api/avisos', avisoRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/app-cliente', clienteAppRoutes);
app.use('/api/fiados', fiadoRoutes);
app.use('/api/pagos', pagoRoutes);
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