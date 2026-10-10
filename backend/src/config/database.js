const { Sequelize } = require('sequelize');
require('dotenv').config();

// 1. Si existe DATABASE_URL (Recomendado para Render/Clever Cloud), úsalo
if (process.env.DATABASE_URL) {
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false,
        define: { timestamps: false },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });

    const testConnection = async () => {
        try {
            await sequelize.authenticate();
            console.log(' Conexión a PostgreSQL (DATABASE_URL) establecida correctamente');
            return true;
        } catch (error) {
            console.error(' Error de conexión a PostgreSQL:', error.message);
            return false;
        }
    };

    module.exports = { sequelize, testConnection };
}
// 2. Si NO existe DATABASE_URL, usa las variables individuales (Para tu desarrollo local)
else {
    const sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS, // <--- Asegúrate de que en tu .env local sea DB_PASS
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            logging: process.env.NODE_ENV === 'development' ? console.log : false,
            dialectOptions: (process.env.DB_SSL === 'true') ? {
                ssl: { require: true, rejectUnauthorized: false }
            } : {},
            define: { timestamps: false }
        }
    );

    const testConnection = async () => {
        try {
            await sequelize.authenticate();
            console.log('✅ Conexión a PostgreSQL (Variables locales) establecida correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error de conexión a PostgreSQL:', error.message);
            return false;
        }
    };

    module.exports = { sequelize, testConnection };
}