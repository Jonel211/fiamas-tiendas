require('dotenv').config(); // Configurar variables de entorno
const app = require('./src/app'); // Importar la aplicación Express
const { testConnection, sequelize } = require('./src/config/database');

// Importar los modelos para registrar las asociaciones
require('./src/models');

// Iniciar servidor
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // 1. Probar conexión a la base de datos
        await testConnection();

        // 2. Sincronizar modelos automáticamente
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