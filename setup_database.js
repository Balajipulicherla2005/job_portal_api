#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');

const execPromise = util.promisify(exec);

// Common MySQL passwords to try
const COMMON_PASSWORDS = [
  '',
  'root',
  'password',
  'mysql',
  'admin',
  'Root@123',
  '123456'
];

async function testMySQLConnection(password) {
  const cmd = password
    ? `mysql -u root -p'${password}' -e "SELECT VERSION();" 2>&1`
    : `mysql -u root -e "SELECT VERSION();" 2>&1`;

  try {
    const { stdout, stderr } = await execPromise(cmd);
    if (stdout.includes('ERROR') || stderr.includes('ERROR')) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

async function findMySQLPassword() {
  console.log('🔍 Searching for working MySQL password...\n');

  for (const password of COMMON_PASSWORDS) {
    const displayPwd = password || '(no password)';
    process.stdout.write(`   Trying: ${displayPwd}... `);

    const works = await testMySQLConnection(password);
    if (works) {
      console.log('✓ SUCCESS!');
      return password;
    } else {
      console.log('✗');
    }
  }

  return null;
}

async function updateEnvFile(password) {
  const envPath = path.join(__dirname, '.env');
  let envContent = await fs.readFile(envPath, 'utf8');

  // Update DB_PASSWORD line
  const passwordLine = `DB_PASSWORD="${password}"`;
  envContent = envContent.replace(/DB_PASSWORD=.*/, passwordLine);

  await fs.writeFile(envPath, envContent);
  console.log('\n✓ Updated .env file with working password');
}

async function createDatabase(password) {
  const cmd = password
    ? `mysql -u root -p'${password}' -e "CREATE DATABASE IF NOT EXISTS job_portal;" 2>&1`
    : `mysql -u root -e "CREATE DATABASE IF NOT EXISTS job_portal;" 2>&1`;

  try {
    await execPromise(cmd);
    console.log('✓ Database "job_portal" created/verified');
    return true;
  } catch (error) {
    console.error('✗ Failed to create database:', error.message);
    return false;
  }
}

async function testBackendConnection() {
  console.log('\n🧪 Testing backend database connection...\n');

  try {
    const { testConnection } = require('./config/database');
    await testConnection();
    console.log('✓ Backend can connect to database!\n');
    return true;
  } catch (error) {
    console.error('✗ Backend connection failed:', error.message);
    return false;
  }
}

async function setupSQLiteFallback() {
  console.log('\n📦 Setting up SQLite fallback...\n');

  try {
    // Check if sqlite3 is installed
    try {
      require('sqlite3');
      console.log('✓ sqlite3 is already installed');
    } catch {
      console.log('   Installing sqlite3...');
      await execPromise('npm install sqlite3');
      console.log('✓ sqlite3 installed');
    }

    // Backup original database config
    const dbConfigPath = path.join(__dirname, 'config', 'database.js');
    const backupPath = path.join(__dirname, 'config', 'database.mysql.backup.js');

    const originalConfig = await fs.readFile(dbConfigPath, 'utf8');
    await fs.writeFile(backupPath, originalConfig);
    console.log('✓ Original MySQL config backed up');

    // Create SQLite config
    const sqliteConfig = `const { Sequelize } = require('sequelize');
const path = require('path');

// SQLite Configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ SQLite database connection has been established successfully.');
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error.message);
    throw error;
  }
};

module.exports = { sequelize, testConnection };
`;

    await fs.writeFile(dbConfigPath, sqliteConfig);
    console.log('✓ SQLite configuration installed');
    console.log('   Note: MySQL config backed up to config/database.mysql.backup.js');

    return true;
  } catch (error) {
    console.error('✗ Failed to setup SQLite:', error.message);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('         Job Portal API - Database Setup Wizard');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Step 1: Try to find working MySQL password
  const workingPassword = await findMySQLPassword();

  if (workingPassword !== null) {
    console.log('\n✓ Found working MySQL password!\n');

    // Step 2: Update .env file
    await updateEnvFile(workingPassword);

    // Step 3: Create database
    await createDatabase(workingPassword);

    // Step 4: Test backend connection
    const backendWorks = await testBackendConnection();

    if (backendWorks) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('                   ✓ SETUP SUCCESSFUL!');
      console.log('═══════════════════════════════════════════════════════════\n');
      console.log('You can now start the server:');
      console.log('   npm start\n');
      process.exit(0);
    }
  }

  // If MySQL didn't work, offer SQLite alternative
  console.log('\n❌ Could not connect to MySQL with common passwords.\n');
  console.log('Options:');
  console.log('   1. See MYSQL_SETUP.md for password reset instructions');
  console.log('   2. Use SQLite as fallback (recommended for quick testing)\n');

  console.log('Setting up SQLite fallback for quick testing...\n');
  const sqliteOk = await setupSQLiteFallback();

  if (sqliteOk) {
    const backendWorks = await testBackendConnection();

    if (backendWorks) {
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('              ✓ SQLite SETUP SUCCESSFUL!');
      console.log('═══════════════════════════════════════════════════════════\n');
      console.log('You can now start the server:');
      console.log('   npm start\n');
      console.log('Note: Using SQLite instead of MySQL for quick testing.');
      console.log('To restore MySQL, see MYSQL_SETUP.md\n');
      process.exit(0);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                   ✗ SETUP FAILED');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Please manually:');
  console.log('   1. Read MYSQL_SETUP.md for MySQL password reset');
  console.log('   2. Or check MySQL service: brew services list | grep mysql');
  console.log('   3. Contact support if issues persist\n');
  process.exit(1);
}

main().catch(error => {
  console.error('\n✗ Setup script error:', error);
  process.exit(1);
});
