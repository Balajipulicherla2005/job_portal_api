#!/usr/bin/env node

/**
 * Automated MySQL Setup - Tries common passwords
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

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

const commonPasswords = ['', 'root', 'password', 'mysql', '123456'];

async function tryConnection(password) {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: password,
      connectTimeout: 3000
    });
    await connection.end();
    return true;
  } catch (error) {
    return false;
  }
}

async function setupWithPassword(password) {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: password,
    multipleStatements: true
  });

  // Create user, database, and grant privileges
  await connection.query(`
    CREATE USER IF NOT EXISTS 'jobportal'@'localhost' IDENTIFIED BY 'jobportal123';
  `);
  
  await connection.query(`
    CREATE DATABASE IF NOT EXISTS job_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);
  
  await connection.query(`
    GRANT ALL PRIVILEGES ON job_portal.* TO 'jobportal'@'localhost';
    FLUSH PRIVILEGES;
  `);

  await connection.end();
}

async function updateEnvFile() {
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Backup
  fs.writeFileSync(envPath + '.backup', envContent);
  
  // Update DB_USER and DB_PASSWORD
  envContent = envContent.replace(/^DB_USER=.*/m, 'DB_USER=jobportal');
  envContent = envContent.replace(/^DB_PASSWORD=.*/m, 'DB_PASSWORD=jobportal123');
  
  fs.writeFileSync(envPath, envContent);
}

async function autoSetup() {
  log.header('Automated MySQL Setup for Job Portal');

  log.info('Attempting to find MySQL root password...');

  let foundPassword = null;

  for (const password of commonPasswords) {
    const displayPassword = password === '' ? '(no password)' : password;
    process.stdout.write(`  Trying ${displayPassword}... `);
    
    if (await tryConnection(password)) {
      console.log(colors.green + '✓' + colors.reset);
      foundPassword = password;
      break;
    } else {
      console.log(colors.red + '✗' + colors.reset);
    }
  }

  if (foundPassword === null) {
    log.error('Could not find MySQL root password automatically');
    console.log('\n💡 Manual Setup Required:\n');
    console.log('1. Find your MySQL root password');
    console.log('2. Run: node setup_mysql_user.js');
    console.log('   OR');
    console.log('3. Connect manually:');
    console.log('   mysql -u root -p');
    console.log('   Then run:');
    console.log('   CREATE USER \'jobportal\'@\'localhost\' IDENTIFIED BY \'jobportal123\';');
    console.log('   CREATE DATABASE IF NOT EXISTS job_portal;');
    console.log('   GRANT ALL PRIVILEGES ON job_portal.* TO \'jobportal\'@\'localhost\';');
    console.log('   FLUSH PRIVILEGES;');
    console.log('\n4. Update .env:');
    console.log('   DB_USER=jobportal');
    console.log('   DB_PASSWORD=jobportal123\n');
    process.exit(1);
  }

  const displayPassword = foundPassword === '' ? 'no password' : `'${foundPassword}'`;
  log.success(`Found root password: ${displayPassword}`);

  try {
    log.info('Creating user "jobportal"...');
    await setupWithPassword(foundPassword);
    log.success('MySQL user and database created');

    log.info('Updating .env file...');
    await updateEnvFile();
    log.success('.env file updated');

    log.header('✅ SETUP COMPLETED SUCCESSFULLY');
    
    console.log('\n📝 New MySQL Credentials:');
    console.log('   Database: job_portal');
    console.log('   User: jobportal');
    console.log('   Password: jobportal123');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Run: node setup_mysql.js');
    console.log('   2. Run: npm start\n');

  } catch (error) {
    log.error('Setup failed: ' + error.message);
    process.exit(1);
  }
}

autoSetup();
