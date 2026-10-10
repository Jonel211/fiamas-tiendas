// scripts/create-admin.js
const { sequelize } = require('../src/config/database');
const { Administrador } = require('../src/models');

async function crearAdmin() {
    try {
        console.log('🔄 Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos exitosa.');

        // DATOS DEL ADMINISTRADOR (¡Cámbialos por los tuyos!)
        const datosAdmin = {
            nombre: 'Super Administrador Fiamas',
            email: 'admin@fiamas.com',
            password_hash: 'fiamas2026', // El modelo lo encriptará automáticamente
            telefono: '999999999'
        };

        console.log('🔄 Buscando o creando administrador...');

        // findOrCreate evita errores si el script se ejecuta dos veces
        const [admin, creado] = await Administrador.findOrCreate({
            where: { email: datosAdmin.email },
            defaults: datosAdmin
        });

        if (creado) {
            console.log('\n🎉 ¡ADMINISTRADOR CREADO EXITOSAMENTE! 🎉');
            console.log('----------------------------------------');
            console.log(`   ID: ${admin.id}`);
            console.log(`   Nombre: ${admin.nombre}`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   Contraseña: ${datosAdmin.password_hash}`);
            console.log('----------------------------------------\n');
        } else {
            console.log('\nℹ️  El administrador con ese email ya existe en la base de datos.\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error fatal al crear el administrador:', error);
        process.exit(1);
    }
}

crearAdmin();