const { sequelize } = require('../src/config/database');
require('../src/models');

async function syncDatabase() {
    try {
        console.log('🔄 Sincronizando base de datos (modo seguro)...');
        await sequelize.sync();
        console.log('✅ Base de datos sincronizada correctamente.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al sincronizar:', error);
        process.exit(1);
    }
}

syncDatabase();