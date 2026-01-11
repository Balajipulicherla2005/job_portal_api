# MySQL Setup Guide for Job Portal

## Prerequisites
- MySQL 8.0 is installed ✓
- MySQL is running ✓

## Quick Setup Steps

### Step 1: Configure MySQL Password

You need to set your MySQL root password in the `.env` file.

**Option A: If you know your MySQL password**
```bash
# Edit .env file
nano .env

# Update this line with your actual password:
DB_PASSWORD=your_mysql_password_here
```

**Option B: If you don't know your MySQL password**

Try connecting to MySQL without a password:
```bash
mysql -u root
```

If it works, your password is empty (leave `DB_PASSWORD=` in .env).

If it doesn't work, you'll need to reset your MySQL password:

1. Stop MySQL:
```bash
brew services stop mysql@8.0
```

2. Start MySQL in safe mode:
```bash
sudo mysqld_safe --skip-grant-tables &
```

3. Connect without password:
```bash
mysql -u root
```

4. Reset password:
```sql
USE mysql;
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
EXIT;
```

5. Kill safe mode and restart:
```bash
# Find process
ps aux | grep mysqld

# Kill it (replace PID)
sudo kill -9 <PID>

# Restart normally
brew services start mysql@8.0
```

6. Update .env:
```env
DB_PASSWORD=newpassword
```

### Step 2: Create Database and Tables

Run the setup script:
```bash
cd /Users/hemanthreddy/Desktop/personal/job_portal_api
node setup_mysql.js
```

You should see:
```
============================================================
MySQL Database Setup for Job Portal
============================================================
✓ Database 'job_portal' created successfully
✓ Database connection established successfully
✓ All tables created successfully
✓ Found 5 tables:
  - users
  - job_seeker_profiles
  - employer_profiles
  - jobs
  - applications
============================================================
✅ DATABASE SETUP COMPLETED SUCCESSFULLY
============================================================
```

### Step 3: Start the Server

```bash
npm start
```

You should see:
```
Server is running on port 5002
Environment: development
✓ MySQL database connection established successfully
✓ Database models synchronized successfully
✓ Database initialized successfully
```

### Step 4: Test the API

Run the authentication tests:
```bash
node test_auth_feature.js
```

All tests should pass! ✅

## Current Configuration

Your `.env` file should have:
```env
PORT=5002
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=job_portal
DB_USER=root
DB_PASSWORD=          # <-- SET THIS TO YOUR MYSQL PASSWORD

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

## Troubleshooting

### Error: Access denied for user 'root'@'localhost'
**Solution:** Your MySQL password is incorrect. Follow Step 1 to set/reset it.

### Error: ECONNREFUSED
**Solution:** MySQL is not running.
```bash
brew services start mysql@8.0
```

### Error: ER_BAD_DB_ERROR: Unknown database
**Solution:** Run the setup script to create the database:
```bash
node setup_mysql.js
```

### Check MySQL Status
```bash
brew services list | grep mysql
```

### Test MySQL Connection
```bash
mysql -u root -p
# Enter your password when prompted
# If successful, you should see: mysql>
```

## What Changed from MongoDB to MySQL

✅ Database: MongoDB → MySQL 8.0
✅ ORM: Mongoose → Sequelize
✅ Models: Updated to Sequelize models
✅ Controllers: Updated to use Sequelize queries
✅ Relationships: Defined using Sequelize associations
✅ All Features: Fully functional with MySQL

## Database Schema

### Tables Created:
1. **users** - Stores user authentication data
2. **job_seeker_profiles** - Job seeker profile information
3. **employer_profiles** - Employer profile information
4. **jobs** - Job listings
5. **applications** - Job applications

### Relationships:
- User → JobSeekerProfile (1:1)
- User → EmployerProfile (1:1)
- User (Employer) → Jobs (1:N)
- Job → Applications (1:N)
- User (JobSeeker) → Applications (1:N)

## Next Steps

Once MySQL is set up and the server is running:

1. ✅ Test authentication feature
2. ✅ Access frontend at http://localhost:3000
3. ✅ Start implementing remaining features

Need help? Check the error messages and follow the troubleshooting steps above!
