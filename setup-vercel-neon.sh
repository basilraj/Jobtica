#!/bin/bash

# Complete Vercel + Neon Setup Script
# This script prepares your Jobtica app for Vercel deployment with Neon PostgreSQL

set -e

echo "🚀 Jobtica - Vercel + Neon PostgreSQL Setup"
echo "============================================"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_info "Step 1: Updating dependencies for PostgreSQL..."

# Remove MySQL dependencies and add PostgreSQL
npm uninstall mysql2 2>/dev/null || true
npm install pg @vercel/postgres

print_status "Dependencies updated"

print_info "Step 2: Checking database configuration..."

# Check if DATABASE_URL is set in environment or .env
if [ -z "$DATABASE_URL" ]; then
    if [ -f ".env" ]; then
        print_info "Found .env file, checking DATABASE_URL..."
        if grep -q "DATABASE_URL.*postgresql" .env; then
            print_status "PostgreSQL DATABASE_URL found in .env"
        else
            print_warning "DATABASE_URL in .env might not be PostgreSQL format"
        fi
    else
        print_warning "No DATABASE_URL environment variable or .env file found"
        print_info "You'll need to set DATABASE_URL in Vercel dashboard"
    fi
else
    if [[ $DATABASE_URL == postgresql* ]]; then
        print_status "PostgreSQL DATABASE_URL detected"
    else
        print_error "DATABASE_URL is not in PostgreSQL format"
        print_info "Should be: postgresql://username:password@host:port/database?sslmode=require"
    fi
fi

print_info "Step 3: Verifying PostgreSQL schema..."

if [ -f "database/schema.sql" ]; then
    if grep -q "gen_random_uuid" database/schema.sql; then
        print_status "PostgreSQL schema detected"
    else
        print_error "Schema file doesn't appear to be PostgreSQL format"
    fi
else
    print_error "database/schema.sql not found"
fi

print_info "Step 4: Creating database connection test..."

cat > test-db-connection.js << 'EOF'
const { Pool } = require('pg');

async function testConnection() {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
        console.error('❌ DATABASE_URL not set');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString,
        ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false
    });

    try {
        const client = await pool.connect();
        console.log('✅ Database connection successful');
        
        // Test a simple query
        const result = await client.query('SELECT current_database(), current_user, version()');
        console.log('📊 Database:', result.rows[0].current_database);
        console.log('👤 User:', result.rows[0].current_user);
        console.log('🔧 Version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
        
        client.release();
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        await pool.end();
        process.exit(1);
    }
}

testConnection();
EOF

print_status "Database test script created"

print_info "Step 5: Creating deployment checklist..."

cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# Vercel + Neon Deployment Checklist

## ✅ Pre-Deployment

- [ ] 1. Create Neon database project
- [ ] 2. Copy Neon connection string
- [ ] 3. Import schema to Neon database
- [ ] 4. Update all API routes to PostgreSQL syntax
- [ ] 5. Test database connection locally
- [ ] 6. Set environment variables in Vercel

## 🔧 Database Setup (Neon)

1. **Create Project:**
   - Go to https://neon.tech
   - Create new project
   - Note connection string

2. **Import Schema:**
   ```sql
   -- Copy contents of database/schema.sql
   -- Paste into Neon SQL Editor
   -- Run the script
   ```

3. **Verify Tables:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

## 🚀 Deployment Steps

1. **Set Vercel Environment Variables:**
   ```
   DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
   SESSION_SECRET=your-secure-secret
   GEMINI_API_KEY=your-api-key
   NODE_ENV=production
   ```

2. **Deploy:**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

3. **Test Deployment:**
   - Visit your Vercel URL
   - Check /api/health endpoint
   - Test authentication flow

## 🔍 API Route Updates Needed

Convert all API routes from MySQL to PostgreSQL:

### Parameter Binding:
```javascript
// MySQL: req.db.execute('SELECT * FROM User WHERE id = ?', [id])
// PostgreSQL: req.db.query('SELECT * FROM "User" WHERE id = $1', [id])
```

### Table Names:
```javascript
// MySQL: FROM User
// PostgreSQL: FROM "User"
```

### Column Names:
```javascript
// MySQL: passwordHash, createdAt
// PostgreSQL: password_hash, created_at
```

### Result Processing:
```javascript
// MySQL: const [rows] = await db.execute(query)
// PostgreSQL: const result = await db.query(query)
//             const rows = result.rows
```

## 🧪 Testing

Test database connection:
```bash
node test-db-connection.js
```

Test API endpoints:
```bash
# After deployment
curl https://your-app.vercel.app/api/health
curl https://your-app.vercel.app/api/auth/status
```

## 🐛 Troubleshooting

### Common Issues:

1. **"relation does not exist"**
   - Schema not imported
   - Check table names are quoted

2. **"invalid input syntax for type uuid"**
   - Use PostgreSQL UUID functions
   - Don't generate UUIDs manually

3. **"connection refused"**
   - DATABASE_URL incorrect
   - SSL mode not set for Neon

### Get Help:
- Check application logs in Vercel
- Test database connection first
- Verify environment variables
EOF

print_status "Deployment checklist created"

print_info "Step 6: Creating migration helper..."

cat > migrate-api-routes.js << 'EOF'
// Simple helper to migrate API routes to PostgreSQL
// Run this after updating all routes manually

const fs = require('fs');
const path = require('path');

function migrateRoute(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace execute with query
    content = content.replace(/\.execute\(/g, '.query(');
    
    // Update result destructuring
    content = content.replace(/const \[(\w+)\] = await/g, 'const $1 = await');
    content = content.replace(/const (\w+) = await\.query/g, 'const $1 = await');
    
    // Update parameter binding
    content = content.replace(/\?/g, (match, offset) => {
        // Count previous $ signs to determine parameter number
        const before = content.substring(0, offset);
        const dollarCount = (before.match(/\$/g) || []).length;
        return `$${dollarCount + 1}`;
    });
    
    // Quote table names
    const tables = ['User', 'Job', 'ContentPost', 'QuickLink', 'Subscriber', 'BreakingNews', 
                   'SponsoredAd', 'ActivityLog', 'ContactSubmission', 'EmailNotification',
                   'CustomEmail', 'EmailTemplate', 'PreparationCourse', 'PreparationBook',
                   'UpcomingExam', 'KeyValueStore'];
    
    tables.forEach(table => {
        const regex = new RegExp(`\\b${table}\\b`, 'g');
        content = content.replace(regex, `"${table}"`);
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Migrated: ${filePath}`);
}

// Migrate all route files
const routesDir = 'api/routes';
if (fs.existsSync(routesDir)) {
    fs.readdirSync(routesDir).forEach(file => {
        if (file.endsWith('.js')) {
            migrateRoute(path.join(routesDir, file));
        }
    });
}
EOF

print_status "Migration helper created"

echo
print_status "Setup completed!"
echo
echo "📋 Next Steps:"
echo "1. Set up your Neon database and import schema"
echo "2. Update DATABASE_URL in environment"
echo "3. Run: node test-db-connection.js"
echo "4. Manually update API routes (see examples/)"
echo "5. Deploy with: vercel --prod"
echo
print_info "Check DEPLOYMENT_CHECKLIST.md for detailed instructions"
echo
echo "🎉 Your app is ready for Vercel + Neon PostgreSQL!"