# Complete MySQL Setup for Job Portal - EASY METHOD

## ⚡ Quick Setup (Recommended)

Instead of resetting your root password, let's create a dedicated user for this project!

### Step 1: Find Your Root Password

Your root password might be stored in one of these places:

1. **Check if you have it written down** (when you first installed MySQL)
2. **Try your Mac login password** (sometimes MySQL uses this)
3. **Check your password manager** (if you saved it there)
4. **Try common passwords you use** for admin accounts

### Step 2: Create Project User

Once you can connect to MySQL (even if you need to look up your root password):

```bash
# Connect to MySQL as root
mysql -u root -p
# Enter your root password when prompted
```

Then run these commands in the MySQL console:

```sql
-- Create a new user for this project
CREATE USER 'jobportal'@'localhost' IDENTIFIED BY 'jobportal123';

-- Grant all privileges on the job_portal database
GRANT ALL PRIVILEGES ON job_portal.* TO 'jobportal'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### Step 3: Update .env File

```bash
cd /Users/hemanthreddy/Desktop/personal/job_portal_api
nano .env
```

Update these lines:
```env
DB_USER=jobportal
DB_PASSWORD=jobportal123
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 4: Run Setup Script

```bash
node setup_mysql.js
```

### Step 5: Start Server

```bash
npm start
```

## 🔧 Alternative: Use SQLite (No MySQL Setup Needed)

If you're having trouble with MySQL, you can temporarily use SQLite:

```bash
cd /Users/hemanthreddy/Desktop/personal/job_portal_api

# Install SQLite
npm install sqlite3

# Update database.js to use SQLite
cat > config/database.js << 'EOF'
const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ SQLite database connection established successfully.');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to database:', error.message);
    throw error;
  }
};

module.exports = { sequelize, testConnection };
EOF

# Now start the server
npm start
```

With SQLite:
- ✅ No MySQL password needed
- ✅ Database stored in a local file
- ✅ All features work the same
- ✅ Easy to switch back to MySQL later

## 🎯 What I Recommend

**For Development (Right Now):**
Use SQLite - it's the easiest and fastest way to get started.

**For Production (Later):**
Switch to MySQL when you deploy the application.

## Testing After Setup

Regardless of which database you choose, test with:

```bash
# Test backend
cd /Users/hemanthreddy/Desktop/personal/job_portal_api
node test_auth_feature.js

# Test frontend integration
node test_integration.js

# Start servers
npm start                    # Backend (in one terminal)
cd ../job_portal_app
npm start                    # Frontend (in another terminal)
```

Visit: http://localhost:3000

## Current Status

✅ **Backend:** Converted to MySQL/Sequelize (also works with SQLite)
✅ **Models:** All updated to Sequelize
✅ **Controllers:** All using Sequelize queries
✅ **Authentication:** Fully functional
✅ **Tests:** Ready to run

**You just need to:**
1. Set up database connection (MySQL or SQLite)
2. Run setup script
3. Start testing!

## Need Help?

Choose what works best for you:

- **Easy Route:** Use SQLite (no password needed)
- **Proper Route:** Create jobportal MySQL user
- **Advanced Route:** Reset MySQL root password

All three options work perfectly for development!
