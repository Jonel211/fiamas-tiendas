require('dotenv').config();
const os = require('os');

const app = require('./src/app');
const { testConnection, sequelize } = require('./src/config/database');

// Registrar modelos y asociaciones (IMPORTANTE: debe ir antes del sync)
require('./src/models');

// El puerto lo determina Render en producción, o 3000 en desarrollo local
const PORT = process.env.PORT || 3000;

// Función para obtener la IP local de la PC y mostrarla en consola
const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (const interfaceName of Object.keys(interfaces)) {
        for (const network of interfaces[interfaceName]) {
            if (network.family === 'IPv4' && !network.internal) {
                return network.address;
            }
        }
    }
    return 'localhost';
};

const startServer = async () => {
    try {
        // 1. Probar conexión a la base de datos
        await testConnection();

        // 2. Sincronizar modelos de forma SEGURA
        console.log('Sincronizando base de datos...');

        // En producción NO usamos 'alter: true' para evitar que Sequelize 
        // modifique o borre columnas accidentalmente. Solo crea tablas si no existen.
        const isProduction = process.env.NODE_ENV === 'production';
        const syncOptions = isProduction
            ? { logging: false }
            : { alter: true, logging: false };

        await sequelize.sync(syncOptions);
        console.log(' Base de datos sincronizada correctamente.');

        // 3. Obtener IP local (solo informativo para desarrollo)
        const localIP = getLocalIP();

        // 4. Iniciar servidor
        // '0.0.0.0' es CRÍTICO: permite que Docker y Render enruten el tráfico al contenedor
        app.listen(PORT, '0.0.0.0', () => {
            console.log('');
            console.log('======================================');
            console.log('       FIAMAS - API BACKEND');
            console.log('======================================');
            console.log(`Local:    http://localhost:${PORT}`);
            console.log(`Red:      http://${localIP}:${PORT}`);
            console.log('======================================');
            console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log('');
        });

    } catch (error) {
        console.error(' Error fatal al iniciar el servidor:', error);
        // Salir con código 1 para que Docker/Render sepa que el inicio falló y lo reintente
        process.exit(1);
    }
};

startServer();