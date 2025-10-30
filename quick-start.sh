#!/bin/bash

# Quick Start Script for Jobtica Portal
# This script helps you get the application running quickly

set -e

echo "🚀 Jobtica Portal - Quick Start"
echo "================================="
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    echo "   Ubuntu/Debian: sudo apt install mysql-server"
    echo "   macOS: brew install mysql"
    exit 1
fi

echo "✅ MySQL detected"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Check if .env file exists and has database configuration
if [ ! -f ".env" ] || ! grep -q "DATABASE_URL\|DB_HOST" .env; then
    echo
    echo "⚙️ Database configuration needed..."
    echo "Would you like to run the database setup now? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        if [ -f "setup-database.sh" ]; then
            bash setup-database.sh
        else
            echo "❌ setup-database.sh not found. Please configure .env manually."
            echo "   See DEBUG_FIX_REPORT.md for instructions."
            exit 1
        fi
    else
        echo
        echo "⚠️  Please configure your .env file before starting the server."
        echo "   See DEBUG_FIX_REPORT.md for configuration instructions."
        exit 1
    fi
else
    echo "✅ Database configuration detected"
fi

echo
echo "🎉 Setup complete! Starting development server..."
echo
echo "The application will start on:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo
echo "Press Ctrl+C to stop the server"
echo

# Start the development server
npm run dev