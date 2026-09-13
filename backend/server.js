const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection, sequelize } = require('./src/config/database');

// Importar los modelos para registrar las asociaciones
require('./src/models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // 1. Probar conexión a la base de datos
        await testConnection();

        // 2. Sincronizar modelos automáticamente (Ideal para desarrollo)
        console.log('Sincronizando base de datos...');
        await sequelize.sync({
            alter: true, // Actualiza las tablas si cambias los modelos
            logging: false // Oculta los logs de SQL para que la consola esté limpia
        });
        console.log('Base de datos sincronizada correctamente.');

        // 3. Iniciar el servidor
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
            console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();