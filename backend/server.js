require('dotenv').config();
const os = require('os');

const app = require('./src/app');
const { testConnection, sequelize } = require('./src/config/database');

// Registrar modelos y asociaciones
require('./src/models');

const PORT = process.env.PORT || 3000;

// Obtener automáticamente la IP local de la PC
const getLocalIP = () => {
    const interfaces = os.networkInterfaces();

    for (const interfaceName of Object.keys(interfaces)) {
        for (const network of interfaces[interfaceName]) {
            if (
                network.family === 'IPv4' &&
                !network.internal
            ) {
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

        // 3. Obtener IP automáticamente
        const localIP = getLocalIP();

        // 4. Iniciar servidor
        app.listen(PORT, '0.0.0.0', () => {
            console.log('');
            console.log('FIAMAS - API BACKEND');
            console.log(`Local:    http://localhost:${PORT}`);
            console.log(`Red:      http://${localIP}:${PORT}`);
            console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log('');
        });

    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();