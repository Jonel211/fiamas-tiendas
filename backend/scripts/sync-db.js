
const { sequelize } = require('../src/config/database');
require('../src/models');

async function syncDatabase() {
    try {
        const alter = process.env.DB_SYNC_ALTER === 'true';

        console.log('🔄 Sincronizando base de datos...');
        console.log(`Modo ALTER: ${alter}`);

        await sequelize.authenticate();

        await sequelize.sync({ alter });

        console.log('✅ Base de datos sincronizada correctamente.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error al sincronizar:', error);
        process.exit(1);
    }
}

syncDatabase();
