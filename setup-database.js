#!/usr/bin/env node
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  console.log('🔧 Setting up MySQL database for Job Portal...\n');

  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
  };

  // Add password if provided
  if (process.env.DB_PASSWORD) {
    connectionConfig.password = process.env.DB_PASSWORD;
  }

  try {
    // Test MySQL connection
    console.log(`📡 Connecting to MySQL at ${connectionConfig.host}:${connectionConfig.port}...`);
    const connection = await mysql.createConnection(connectionConfig);
    console.log('✓ MySQL connection successful!\n');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'job_portal';
    console.log(`📦 Creating database '${dbName}' if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✓ Database '${dbName}' is ready!\n`);

    // Check database
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('📋 Available databases:');
    databases.forEach(db => {
      const name = db.Database || db.database;
      if (name === dbName) {
        console.log(`   ✓ ${name} (Job Portal)`);
      }
    });

    await connection.end();
    
    console.log('\n✅ Database setup complete!');
    console.log('\n🚀 You can now start the server with: node server.js\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Database setup failed!\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('MySQL is not running. Please start MySQL first:');
      console.error('  - Mac: brew services start mysql');
      console.error('  - Or: mysql.server start\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('MySQL credentials are incorrect.');
      console.error('\nPlease update your .env file with correct MySQL password:');
      console.error('  DB_USER=root');
      console.error('  DB_PASSWORD=your_mysql_password\n');
      console.error('If you need to reset your MySQL password, run:');
      console.error('  mysql -u root\n');
    } else {
      console.error('Error:', error.message);
    }
    
    process.exit(1);
  }
}

setupDatabase();
