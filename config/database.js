const { Sequelize } = require('sequelize');
const fs = require('fs');
require('dotenv').config();

// Build SSL configuration for Aiven Cloud
let dialectOptions = {};

if (process.env.DB_SSL === 'true') {
  const certPath = './aiven-certs/ca.pem';
  if (fs.existsSync(certPath)) {
    dialectOptions = {
      ssl: {
        ca: fs.readFileSync(certPath),
        rejectUnauthorized: true
      }
    };
    console.log('✓ SSL certificate loaded for database connection');
  } else {
    console.warn('⚠ SSL enabled but certificate not found at', certPath);
  }
}

// MySQL Configuration with Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'job_portal',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '+00:00',
    define: {
      timestamps: true,
      underscored: false
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to MySQL database:', error.message);
    console.error('Please ensure MySQL is running and credentials are correct in .env file');
    throw error;
  }
};

module.exports = { sequelize, testConnection };
