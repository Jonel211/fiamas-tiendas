const { sequelize } = require('../src/config/database');

async function verificar() {
    try {
        const [results] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);

        console.log('\n📊 Tablas en tu base de datos:\n');
        results.forEach((row, i) => {
            console.log(`${i + 1}. ${row.table_name}`);
        });
        console.log(`\n✅ Total: ${results.length} tablas`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

verificar();