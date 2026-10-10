const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        // SSL solo si estamos en producción o DB_SSL=true
        dialectOptions: (process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production') ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {},
        define: {
            timestamps: false
        }
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error de conexión a PostgreSQL:', error.message);
        return false;
    }
};

module.exports = { sequelize, testConnection };