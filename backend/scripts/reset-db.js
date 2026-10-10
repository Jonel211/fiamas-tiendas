// scripts/reset-db.js
const { sequelize } = require('../src/config/database');
require('../src/models'); // Carga todos los modelos actualizados

async function resetDatabase() {
    try {
        console.log('🔄 Recreando base de datos con la estructura v6 actualizada...\n');

        // Esto borra todas las tablas existentes y las vuelve a crear con la nueva estructura
        await sequelize.sync({ force: true });

        console.log('✅ Base de datos actualizada exitosamente.\n');
        console.log('📊 Tablas creadas:');
        console.log('   - administradores');
        console.log('   - tenderos (SIN email, login por teléfono)');
        console.log('   - clientes (SIN email, login por teléfono)');
        console.log('   - tiendas (con qr_token)');
        console.log('   - categorias (con icono y color)');
        console.log('   - productos (stock como decimal)');
        console.log('   - cliente_tienda (relación many-to-many)');
        console.log('   - fiados');
        console.log('   - fiado_detalle (productos del fiado)');
        console.log('   - pagos');
        console.log('   - alertas');
        console.log('   - scoring_historial');
        console.log('   - verificaciones_sms');
        console.log('   - logs_sistema');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al recrear la base de datos:', error);
        process.exit(1);
    }
}

resetDatabase();