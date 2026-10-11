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

        // 2. Sincronizar modelos
        const shouldAlter = process.env.DB_SYNC_ALTER ? process.env.DB_SYNC_ALTER === 'true' : process.env.NODE_ENV !== 'production';
        if (shouldAlter) {
            console.log('Sincronizando modelos con la base de datos (alter: true)...');
            await sequelize.sync({
                alter: true,
                logging: false
            });
            console.log('Base de datos sincronizada correctamente.');
        } else {
            console.log('Modo producción o DB_SYNC_ALTER deshabilitado: omitiendo alter automático.');
        }

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