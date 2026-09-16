const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// === NUEVAS RUTAS AGREGADAS ===
const tiendaRoutes = require('./routes/tiendaRoutes');
app.use('/api/tiendas', tiendaRoutes);

const tenderoRoutes = require('./routes/tenderoRoutes');
app.use('/api/tenderos', tenderoRoutes);

const productoRoutes = require('./routes/productoRoutes');
app.use('/api/productos', productoRoutes);


module.exports = app;