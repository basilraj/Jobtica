// Example: PostgreSQL-compatible auth route
// This shows the correct syntax for PostgreSQL with Vercel + Neon

import { Router } from 'express';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';

const router = Router();
const SALT_ROUNDS = 10;

// This would be called from the database middleware
// req.db would be a PostgreSQL pool

// GET /api/auth/status - Check authentication status
router.get('/status', async (req, res, next) => {
    try {
        if (req.session.isAdmin && req.session.userId) {
            // PostgreSQL syntax with $1 parameter binding
            const result = await req.db.query(
                'SELECT id, username, email FROM "User" WHERE id = $1',
                [req.session.userId]
            );
            
            if (result.rows.length > 0) {
                const user = result.rows[0];
                return res.status(200).json({
                    isLoggedIn: true,
                    user: {
                        username: user.username,
                        email: user.email,
                        isDemo: !!req.session.isDemo
                    }
                });
            }
        }
        
        // PostgreSQL syntax
        const adminCountResult = await req.db.query('SELECT COUNT(*) FROM "User"');
        const adminCount = parseInt(adminCountResult.rows[0].count);
        res.status(200).json({ isLoggedIn: false, adminExists: adminCount > 0 });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth - Handle signup, login, logout
router.post('/', async (req, res, next) => {
    try {
        const { action, username, password, email, isDemo } = req.body;

        switch (action) {
            case 'signup': {
                // Check if admin exists
                const adminCountResult = await req.db.query('SELECT COUNT(*) FROM "User"');
                if (parseInt(adminCountResult.rows[0].count) > 0) {
                    return res.status(403).json({ message: 'Admin account already exists.' });
                }
                
                const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
                
                // PostgreSQL: Use gen_random_uuid() or pass UUID
                await req.db.query(
                    'INSERT INTO "User" (username, email, password_hash) VALUES ($1, $2, $3)',
                    [username, email, passwordHash]
                );
                
                return res.status(201).json({ message: 'Admin created.' });
            }
            
            case 'login': {
                if (isDemo) {
                    req.session.isAdmin = true;
                    req.session.isDemo = true;
                    req.session.userId = 'demo-user';
                    await req.session.save();
                    
                    await req.db.query(
                        'INSERT INTO "ActivityLog" (action, details) VALUES ($1, $2)',
                        ['Demo Login', 'Demo user logged in.']
                    );
                    
                    return res.status(200).json({ 
                        user: { username: 'Demo User', email: 'demo@example.com', isDemo: true } 
                    });
                }
                
                const userResult = await req.db.query(
                    'SELECT * FROM "User" WHERE username = $1',
                    [username]
                );
                
                const user = userResult.rows[0];
                if (!user || !(await bcrypt.compare(password, user.password_hash))) {
                    return res.status(401).json({ message: 'Invalid credentials.' });
                }
                
                req.session.userId = user.id;
                req.session.isAdmin = true;
                req.session.isDemo = false;
                await req.session.save();
                
                await req.db.query(
                    'INSERT INTO "ActivityLog" (action, details) VALUES ($1, $2)',
                    ['Admin Login', `User ${user.username} logged in.`]
                );
                
                return res.status(200).json({ 
                    user: { username: user.username, email: user.email, isDemo: false } 
                });
            }
            
            case 'logout': {
                await req.db.query(
                    'INSERT INTO "ActivityLog" (action, details) VALUES ($1, $2)',
                    ['Admin Logout', 'User logged out.']
                );
                req.session.destroy();
                return res.status(200).json({ message: 'Logged out.' });
            }
            
            default:
                return res.status(400).json({ message: 'Invalid action.' });
        }
    } catch (error) {
        next(error);
    }
});

export default router;

/*
KEY DIFFERENCES FROM MySQL:

1. Parameter Binding:
   MySQL:  'WHERE id = ?'
   Postgres: 'WHERE id = $1'

2. Table Names:
   MySQL:  FROM User
   Postgres: FROM "User" (quoted for case sensitivity)

3. Column Names:
   MySQL:  passwordHash, createdAt
   Postgres: password_hash, created_at (snake_case)

4. UUID Handling:
   MySQL:  id VARCHAR(36) with uuidv4()
   Postgres: id UUID DEFAULT gen_random_uuid()

5. Result Processing:
   MySQL:  const [rows] = await db.execute(query)
   Postgres: const result = await db.query(query)
            const rows = result.rows

6. JSON Fields:
   MySQL:  JSON type
   Postgres: JSONB type (more efficient)

7. Timestamps:
   MySQL:  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   Postgres: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   (Update triggers handled separately)
*/