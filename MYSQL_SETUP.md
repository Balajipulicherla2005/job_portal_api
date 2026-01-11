# MySQL Setup and Password Reset Guide

## Issue
The application cannot connect to MySQL database with the current credentials.

## Solution Options

### Option 1: Find Your Current MySQL Password

Your MySQL password might be one of these:
- Empty (no password)
- root
- password
- mysql
- Root@123 (currently in .env)

Try to connect manually:
```bash
mysql -u root -p
```

If successful, note down the password and update it in the `.env` file.

### Option 2: Reset MySQL Root Password (macOS)

#### Step 1: Stop MySQL
```bash
brew services stop mysql@8.0
```

#### Step 2: Start MySQL in Safe Mode
```bash
sudo mysqld_safe --skip-grant-tables &
```

#### Step 3: Connect to MySQL Without Password
```bash
mysql -u root
```

#### Step 4: Reset Password (MySQL 8.0)
```sql
USE mysql;
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
EXIT;
```

#### Step 5: Stop Safe Mode and Restart MySQL
```bash
# Find the mysqld_safe process
ps aux | grep mysqld

# Kill it (replace PID with actual process ID)
sudo kill -9 <PID>

# Restart MySQL normally
brew services start mysql@8.0
```

#### Step 6: Update .env File
Update the `DB_PASSWORD` in your `.env` file:
```env
DB_PASSWORD=newpassword
```

### Option 3: Create a New MySQL User for Development

If you don't want to change root password:

```bash
# Login as root (with current password if you know it)
mysql -u root -p

# Create new user
CREATE USER 'jobportal'@'localhost' IDENTIFIED BY 'jobportal123';
GRANT ALL PRIVILEGES ON job_portal.* TO 'jobportal'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Then update `.env`:
```env
DB_USER=jobportal
DB_PASSWORD=jobportal123
```

### Option 4: Use SQLite for Development (Quick Setup)

If you want to quickly test the application without MySQL setup:

1. Install SQLite support:
```bash
npm install sqlite3
```

2. Update `config/database.js` to use SQLite:
```javascript
// Add at the top
const path = require('path');

// Replace sequelize initialization with:
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: console.log
});
```

3. The application will work with SQLite (though some advanced features might differ)

## Verification

After fixing the password, test the connection:

```bash
# Test MySQL connection
mysql -u root -p'your_password' -e "SELECT VERSION();"

# Start the backend
cd /Users/hemanthreddy/Desktop/personal/job_portal_api
npm start
```

Expected output:
```
✓ Database connection has been established successfully.
✓ Database models synchronized
✓ Server is running on port 5002
```

## Quick Test Script

After fixing MySQL, run:

```bash
cd /Users/hemanthreddy/Desktop/personal/job_portal_api

# Test database connection
node -e "
const { testConnection } = require('./config/database');
testConnection().then(() => {
  console.log('✓ Database connection successful!');
  process.exit(0);
}).catch(err => {
  console.error('✗ Database connection failed:', err.message);
  process.exit(1);
});
"
```

## Need Help?

If none of these options work, you can:
1. Check MySQL error logs: `brew services info mysql@8.0`
2. Restart MySQL: `brew services restart mysql@8.0`
3. Check MySQL status: `brew services list | grep mysql`

## Current Configuration

Your current `.env` settings:
- DB_HOST: localhost
- DB_USER: root  
- DB_NAME: job_portal
- DB_PORT: 3306
