#!/usr/bin/env node

/**
 * Interactive MySQL Setup for Job Portal
 * Creates a dedicated MySQL user and updates .env
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const readline = require('readline');
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function hiddenQuestion(query) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.resume();
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');
    
    process.stdout.write(query);
    let password = '';
    
    stdin.on('data', function onData(ch) {
      ch = ch.toString('utf8');
      
      switch (ch) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // Backspace
          password = password.slice(0, -1);
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(query + '*'.repeat(password.length));
          break;
        default:
          password += ch;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function setupMySQL() {
  log.header('Interactive MySQL Setup for Job Portal');

  console.log('\nThis script will:');
  console.log('1. Create a MySQL user "jobportal" with password "jobportal123"');
  console.log('2. Create the "job_portal" database');
  console.log('3. Update your .env file with the new credentials\n');

  const proceed = await question('Do you want to continue? (yes/no): ');
  if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
    console.log('Setup cancelled.');
    rl.close();
    return;
  }

  console.log('\n');
  const rootPassword = await hiddenQuestion('Enter your MySQL root password (press Enter if no password): ');

  try {
    log.info('Connecting to MySQL as root...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: rootPassword,
      multipleStatements: true
    });

    log.success('Connected to MySQL');

    log.info('Creating user "jobportal"...');
    
    // Create user, database, and grant privileges
    await connection.query(`
      CREATE USER IF NOT EXISTS 'jobportal'@'localhost' IDENTIFIED BY 'jobportal123';
    `);
    log.success('User created');

    log.info('Creating database "job_portal"...');
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS job_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    log.success('Database created');

    log.info('Granting privileges...');
    await connection.query(`
      GRANT ALL PRIVILEGES ON job_portal.* TO 'jobportal'@'localhost';
      FLUSH PRIVILEGES;
    `);
    log.success('Privileges granted');

    await connection.end();

    // Update .env file
    log.info('Updating .env file...');
    
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Backup
    fs.writeFileSync(envPath + '.backup', envContent);
    
    // Update DB_USER and DB_PASSWORD
    envContent = envContent.replace(/^DB_USER=.*/m, 'DB_USER=jobportal');
    envContent = envContent.replace(/^DB_PASSWORD=.*/m, 'DB_PASSWORD=jobportal123');
    
    fs.writeFileSync(envPath, envContent);
    
    log.success('.env file updated');

    log.header('✅ SETUP COMPLETED SUCCESSFULLY');
    
    console.log('\n📝 New MySQL Credentials:');
    console.log('   Database: job_portal');
    console.log('   User: jobportal');
    console.log('   Password: jobportal123');
    console.log('   Host: localhost');
    console.log('   Port: 3306');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Run: node setup_mysql.js');
    console.log('   2. Run: npm start');
    console.log('   3. Test: node test_auth_feature.js\n');

  } catch (error) {
    log.error('Setup failed!');
    console.error('\nError:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solutions:');
      console.log('   1. Check your root password is correct');
      console.log('   2. Try running: mysql -u root -p');
      console.log('   3. If you forgot your password, see MYSQL_SETUP.md for reset instructions');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solutions:');
      console.log('   1. Make sure MySQL is running');
      console.log('   2. Start MySQL: brew services start mysql@8.0');
      console.log('   3. Check status: brew services list | grep mysql');
    } else {
      console.log('\n💡 Alternative: Manual Setup');
      console.log('   1. Connect to MySQL: mysql -u root -p');
      console.log('   2. Run these commands:');
      console.log('      CREATE USER \'jobportal\'@\'localhost\' IDENTIFIED BY \'jobportal123\';');
      console.log('      CREATE DATABASE job_portal;');
      console.log('      GRANT ALL PRIVILEGES ON job_portal.* TO \'jobportal\'@\'localhost\';');
      console.log('      FLUSH PRIVILEGES;');
      console.log('   3. Update .env manually:');
      console.log('      DB_USER=jobportal');
      console.log('      DB_PASSWORD=jobportal123');
    }
  } finally {
    rl.close();
  }
}

setupMySQL();
