#!/bin/bash

# MySQL User Creation Script for Job Portal
# This creates a dedicated user for the project

echo "=================================="
echo "MySQL User Setup for Job Portal"
echo "=================================="
echo ""
echo "This script will create a MySQL user 'jobportal' with password 'jobportal123'"
echo ""
echo "You'll need your MySQL root password to continue."
echo ""
read -sp "Enter MySQL root password (press Enter if no password): " ROOT_PASSWORD
echo ""
echo ""

# Create SQL commands
SQL_COMMANDS="
CREATE USER IF NOT EXISTS 'jobportal'@'localhost' IDENTIFIED BY 'jobportal123';
GRANT ALL PRIVILEGES ON job_portal.* TO 'jobportal'@'localhost';
CREATE DATABASE IF NOT EXISTS job_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
FLUSH PRIVILEGES;
SELECT 'MySQL user created successfully!' as Status;
"

# Execute SQL commands
if [ -z "$ROOT_PASSWORD" ]; then
    # No password
    echo "$SQL_COMMANDS" | mysql -u root
else
    # With password
    echo "$SQL_COMMANDS" | mysql -u root -p"$ROOT_PASSWORD"
fi

# Check if successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! MySQL user 'jobportal' created."
    echo ""
    echo "Now updating .env file..."
    
    # Update .env file
    cd "$(dirname "$0")"
    
    # Backup original .env
    cp .env .env.backup
    
    # Update DB_USER and DB_PASSWORD
    sed -i.bak 's/^DB_USER=.*/DB_USER=jobportal/' .env
    sed -i.bak 's/^DB_PASSWORD=.*/DB_PASSWORD=jobportal123/' .env
    
    echo "✅ .env file updated!"
    echo ""
    echo "📝 Credentials:"
    echo "   DB_USER=jobportal"
    echo "   DB_PASSWORD=jobportal123"
    echo ""
    echo "🚀 Now run: node setup_mysql.js"
    echo ""
else
    echo ""
    echo "❌ Failed to create MySQL user."
    echo ""
    echo "💡 Try these alternatives:"
    echo ""
    echo "1. Connect to MySQL manually:"
    echo "   mysql -u root -p"
    echo ""
    echo "2. Run these commands:"
    echo "   CREATE USER 'jobportal'@'localhost' IDENTIFIED BY 'jobportal123';"
    echo "   GRANT ALL PRIVILEGES ON job_portal.* TO 'jobportal'@'localhost';"
    echo "   CREATE DATABASE IF NOT EXISTS job_portal;"
    echo "   FLUSH PRIVILEGES;"
    echo ""
    echo "3. Then manually update .env:"
    echo "   DB_USER=jobportal"
    echo "   DB_PASSWORD=jobportal123"
    echo ""
fi
