#!/usr/bin/env node

/**
 * Database Setup Script for Job Portal
 * This script creates the MySQL database and tables
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { sequelize } = require('./config/database');
const { syncDatabase } = require('./models');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.yellow}ℹ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.blue}\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`)
};

async function setupDatabase() {
  log.header('MySQL Database Setup for Job Portal');

  try {
    // Step 1: Create database
    log.info('Step 1: Creating database...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'job_portal'} 
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    log.success(`Database '${process.env.DB_NAME || 'job_portal'}' created successfully`);
    await connection.end();

    // Step 2: Test connection to database
    log.info('\nStep 2: Testing database connection...');
    await sequelize.authenticate();
    log.success('Database connection established successfully');

    // Step 3: Create tables
    log.info('\nStep 3: Creating tables...');
    await syncDatabase({ force: false, alter: true });
    log.success('All tables created successfully');

    // Step 4: Verify tables
    log.info('\nStep 4: Verifying tables...');
    const [tables] = await sequelize.query('SHOW TABLES');
    log.success(`Found ${tables.length} tables:`);
    tables.forEach((table) => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });

    log.header('✅ DATABASE SETUP COMPLETED SUCCESSFULLY');
    console.log('\n📝 Database Details:');
    console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`  Port: ${process.env.DB_PORT || '3306'}`);
    console.log(`  Database: ${process.env.DB_NAME || 'job_portal'}`);
    console.log(`  User: ${process.env.DB_USER || 'root'}`);
    console.log('\n🚀 You can now start the server with: npm start\n');

    process.exit(0);
  } catch (error) {
    log.error('Database setup failed!');
    console.error('\nError details:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solution:');
      console.log('  1. Check your MySQL credentials in .env file');
      console.log('  2. Make sure DB_USER and DB_PASSWORD are correct');
      console.log('  3. Try connecting manually: mysql -u root -p');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution:');
      console.log('  1. Make sure MySQL is running');
      console.log('  2. Start MySQL: brew services start mysql@8.0');
      console.log('  3. Check status: brew services list | grep mysql');
    }
    
    process.exit(1);
  }
}

// Run setup
setupDatabase();
