const { Sequelize } = require('sequelize');
require('dotenv').config();

// MySQL Configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'job_portal',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ MySQL database connection established successfully.');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to MySQL database:', error.message);
    console.error('Please ensure MySQL is running and credentials are correct in .env file');
    throw error;
  }
};

module.exports = { sequelize, testConnection };
