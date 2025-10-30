#!/bin/bash

# Jobtica Database Setup Script
# This script sets up the MySQL database for the Jobtica application

echo "=== Jobtica Database Setup ==="
echo

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

# Check if database exists
echo "📋 Please enter your MySQL credentials:"
read -p "MySQL Host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "MySQL Port (default: 3306): " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "MySQL Username: " DB_USER
read -s -p "MySQL Password: " DB_PASSWORD
echo

read -p "Database Name (default: jobtica_db): " DB_NAME
DB_NAME=${DB_NAME:-jobtica_db}

# Test database connection
echo "🔗 Testing database connection..."
if ! mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" >/dev/null 2>&1; then
    echo "❌ Failed to connect to MySQL. Please check your credentials."
    exit 1
fi

echo "✅ Database connection successful!"

# Create database if it doesn't exist
echo "🗄️ Creating database '$DB_NAME'..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema
echo "📊 Importing database schema..."
if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/schema.sql; then
    echo "✅ Database schema imported successfully!"
else
    echo "❌ Failed to import database schema."
    exit 1
fi

# Update .env file with database credentials
echo "⚙️ Updating environment configuration..."
cat > .env << EOF
# Database Configuration
DATABASE_URL=mysql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME

# Session Configuration
SESSION_SECRET=$(openssl rand -base64 32)

# API Keys
GEMINI_API_KEY=PLACEHOLDER_API_KEY

# Server Configuration
PORT=3001
NODE_ENV=development

# MySQL Configuration (Alternative to DATABASE_URL)
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_PORT=$DB_PORT
EOF

echo "✅ Environment configuration updated!"
echo
echo "🎉 Database setup completed successfully!"
echo
echo "Next steps:"
echo "1. Run 'npm install' to install dependencies"
echo "2. Run 'npm run dev' to start the development server"
echo
echo "The application will be available at:"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:3001/api"