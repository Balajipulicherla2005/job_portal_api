const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config();

// Create connection pool with SSL for Aiven Cloud
const poolConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Add SSL if enabled
if (process.env.DB_SSL === 'true') {
  const certPath = './aiven-certs/ca.pem';
  if (fs.existsSync(certPath)) {
    poolConfig.ssl = {
      ca: fs.readFileSync(certPath),
      rejectUnauthorized: true
    };
  }
}

const pool = mysql.createPool(poolConfig);

// Get promise-based pool for async/await support
const promisePool = pool.promise();

// Test connection function
const testConnection = async () => {
  try {
    const [rows] = await promisePool.query('SELECT 1');
    console.log("✅ MySQL Database Connected Successfully");
    return true;
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    throw err;
  }
};

// Export both pool versions
module.exports = {
  pool,
  promisePool,
  testConnection
};
