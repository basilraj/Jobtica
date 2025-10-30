#!/bin/bash

echo "🚀 Jobtica Vercel Deployment Script"
echo "===================================="
echo ""

# Check if user has provided Neon connection string
if [ -z "$NEON_CONNECTION_STRING" ]; then
    echo "❌ Please set your Neon connection string:"
    echo "   export NEON_CONNECTION_STRING='postgresql://username:password@host:5432/database?sslmode=require'"
    echo ""
    echo "   Or provide it now:"
    read -p "Neon Connection String: " NEON_CONNECTION_STRING
fi

# Validate connection string format
if [[ ! $NEON_CONNECTION_STRING =~ ^postgresql:// ]]; then
    echo "❌ Invalid connection string format. Must start with 'postgresql://'"
    exit 1
fi

echo "✅ Connection string format validated"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""

# Test database connection
echo "🗄️  Testing database connection..."
node -e "
const { getConnection } = require('./lib/postgres.js');
getConnection().then(() => {
    console.log('✅ Database connection successful!');
    process.exit(0);
}).catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please check your connection string and ensure the database is accessible.');
    process.exit(1);
});
" || exit 1

echo ""

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo ""

# Ask for confirmation to deploy
read -p "Ready to deploy to Vercel. Continue? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Deploying to Vercel..."
    echo "   (You'll be prompted for deployment options)"
    echo ""
    
    # Deploy to Vercel
    vercel --prod
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📋 Don't forget to set these environment variables in your Vercel dashboard:"
    echo "   DATABASE_URL=$NEON_CONNECTION_STRING"
    echo "   SESSION_SECRET=$(openssl rand -base64 32)"
    echo "   NODE_ENV=production"
    echo ""
else
    echo "Deployment cancelled."
fi