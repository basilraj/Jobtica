# Vercel + Neon Setup Guide

## 🎯 **Updated for Vercel + Neon PostgreSQL**

Since you're using **Vercel** with **Neon database** (PostgreSQL), here's the updated configuration:

## 🔧 **Database Configuration**

### 1. **Neon Database Setup**

1. Go to [Neon.tech](https://neon.tech)
2. Create a new project
3. Copy your connection string (it looks like):
   ```
   postgresql://username:password@host:5432/database?sslmode=require
   ```

### 2. **Vercel Environment Variables**

In your Vercel dashboard, add these environment variables:

```
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
SESSION_SECRET=your-secure-session-secret
# GEMINI_API_KEY - No longer required, AI features disabled
NODE_ENV=production
```

### 3. **Database Schema**

Import the PostgreSQL schema into your Neon database:

```bash
# Using psql with your Neon connection string
psql "postgresql://username:password@host:5432/database?sslmode=require" -f database/schema.sql
```

Or using Neon Dashboard:
1. Go to your project in Neon
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/schema.sql`

## 🚀 **Deployment to Vercel**

### 1. **Update vercel.json**

Your existing `vercel.json` should work, but ensure it points to the correct entry point:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
```

### 2. **Deploy**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## 📁 **Key Files Updated**

| File | Changes |
|------|---------|
| `lib/postgres.js` | PostgreSQL connection (renamed from mysql.js) |
| `package.json` | Added `pg` dependency, removed `mysql2` |
| `database/schema.sql` | PostgreSQL syntax with UUIDs |
| `.env` | PostgreSQL connection string format |
| `api/middleware/database.js` | Updated import path |

## 🔧 **API Routes Conversion**

The main changes needed for PostgreSQL:

### MySQL → PostgreSQL Syntax

```sql
-- MySQL
SELECT * FROM User WHERE id = ?

-- PostgreSQL  
SELECT * FROM "User" WHERE id = $1
```

```sql
-- MySQL
INSERT INTO User (id, username, email) VALUES (?, ?, ?)

-- PostgreSQL
INSERT INTO "User" (id, username, email) VALUES ($1, $2, $3)
```

## 📝 **Current Status**

✅ **Completed:**
- Database connection updated for PostgreSQL
- Schema converted to PostgreSQL syntax
- Dependencies updated in package.json
- Environment variables configured

⚠️ **Manual Steps Required:**
- Run database schema in Neon
- Deploy to Vercel

## 🎯 **Next Steps**

1. **Setup Neon Database:**
   ```bash
   # Run schema in Neon SQL Editor
   # Copy contents of database/schema.sql
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

## 🐛 **Troubleshooting**

### Common Issues:

1. **"relation does not exist"**
   - Database schema not imported
   - Check table names are quoted

2. **"invalid input syntax for type uuid"**
   - UUID format issues
   - Use `gen_random_uuid()` for new records

3. **"connection refused"**
   - DATABASE_URL format incorrect
   - Check SSL mode parameter

### Quick Test:

```bash
# Test database connection
node -e "
const { getConnection } = require('./lib/postgres.js');
getConnection().then(db => {
  console.log('✅ Database connected!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});
"
```

The core issue ("File not found" errors) was due to missing database configuration. With the PostgreSQL setup for Vercel + Neon, these errors should be resolved!