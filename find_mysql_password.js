#!/usr/bin/env node

/**
 * MySQL Password Finder
 * Tests common passwords to help you connect to MySQL
 */

const mysql = require('mysql2/promise');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.yellow}ℹ ${msg}${colors.reset}`)
};

// Common passwords to try
const commonPasswords = [
  '',           // No password
  'root',       // Default root
  'password',   // Common
  'mysql',      // Common
  '123456',     // Common
  'admin',      // Common
];

async function testPassword(password) {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: password,
      connectTimeout: 5000
    });
    await connection.end();
    return true;
  } catch (error) {
    return false;
  }
}

async function findPassword() {
  console.log('\n🔍 Testing common MySQL passwords...\n');

  for (const password of commonPasswords) {
    const displayPassword = password === '' ? '(empty/no password)' : password;
    process.stdout.write(`Testing ${displayPassword}... `);
    
    const success = await testPassword(password);
    
    if (success) {
      console.log('');
      log.success(`Found it! Your MySQL password is: ${displayPassword}`);
      console.log('\n📝 Update your .env file:');
      console.log(`DB_PASSWORD=${password}`);
      console.log('\nThen run: node setup_mysql.js\n');
      return password;
    } else {
      log.error('failed');
    }
  }

  console.log('\n');
  log.error('Could not find your MySQL password automatically.');
  console.log('\n💡 Solutions:\n');
  console.log('1. Try connecting manually:');
  console.log('   mysql -u root -p');
  console.log('   (Enter password when prompted)\n');
  console.log('2. Reset your MySQL password:');
  console.log('   See MYSQL_QUICK_START.md for detailed instructions\n');
  console.log('3. Create a new MySQL user for this project:');
  console.log('   mysql -u root -p');
  console.log('   CREATE USER \'jobportal\'@\'localhost\' IDENTIFIED BY \'jobportal123\';');
  console.log('   GRANT ALL PRIVILEGES ON job_portal.* TO \'jobportal\'@\'localhost\';');
  console.log('   FLUSH PRIVILEGES;');
  console.log('   \n   Then update .env:');
  console.log('   DB_USER=jobportal');
  console.log('   DB_PASSWORD=jobportal123\n');
}

findPassword();
