
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const SALT_ROUNDS = 10;

// GET /api/auth/status - Check authentication status
router.get('/status', async (req, res, next) => {
    try {
        if (req.session.isAdmin && req.session.userId) {
            const userRows = await req.db.query('SELECT id, username, email FROM User WHERE id = $1', [req.session.userId]);
            if (userRows.rows.length > 0) {
                const user = userRows.rows[0];
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
        const adminCountRows = await req.db.query('SELECT COUNT(*) AS count FROM User');
        const adminCount = adminCountRows.rows[0].count;
        res.status(200).json({ isLoggedIn: false, adminExists: adminCount > 0 });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth - Handle signup, login, logout, and password reset requests
router.post('/', async (req, res, next) => {
    try {
        const { action, username, password, email, isDemo } = req.body;

        switch (action) {
            case 'signup': {
                const adminCountRows = await req.db.query('SELECT COUNT(*) AS count FROM User');
                if (adminCountRows.rows[0].count > 0) {
                    return res.status(403).json({ message: 'Admin account already exists.' });
                }
                const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
                const id = uuidv4();
                await req.db.query('INSERT INTO User (id, username, email, passwordHash) VALUES ($1, $2, $3, $4)', [id, username, email, passwordHash]);
                return res.status(201).json({ message: 'Admin created.' });
            }
            case 'login': {
                if (isDemo) {
                    req.session.isAdmin = true;
                    req.session.isDemo = true;
                    req.session.userId = 'demo-user';
                    await req.session.save();
                    await req.db.query('INSERT INTO ActivityLog (id, action, details, timestamp) VALUES ($1, $2, $3, $4)', [uuidv4(), 'Demo Login', `Demo user logged in.`, new Date()]);
                    return res.status(200).json({ user: { username: 'Demo User', email: 'demo@example.com', isDemo: true } });
                }
                const userRows = await req.db.query('SELECT * FROM User WHERE username = $1', [username]);
                const user = userRows.rows[0];
                if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
                    return res.status(401).json({ message: 'Invalid credentials.' });
                }
                req.session.userId = user.id;
                req.session.isAdmin = true;
                req.session.isDemo = false;
                await req.session.save();
                await req.db.query('INSERT INTO ActivityLog (id, action, details, timestamp) VALUES ($1, $2, $3, $4)', [uuidv4(), 'Admin Login', `User ${user.username} logged in.`, new Date()]);
                return res.status(200).json({ user: { username: user.username, email: user.email, isDemo: false } });
            }
            case 'logout': {
                await req.db.query('INSERT INTO ActivityLog (id, action, details, timestamp) VALUES ($1, $2, $3, $4)', [uuidv4(), 'Admin Logout', `User logged out.`, new Date()]);
                req.session.destroy();
                return res.status(200).json({ message: 'Logged out.' });
            }
            case 'request_password_reset': {
                const userRows = await req.db.query('SELECT id FROM User WHERE email = $1', [email]);
                if (userRows.rows.length > 0) {
                    req.session.resetUserId = userRows.rows[0].id;
                    await req.session.save();
                    return res.status(200).json({ message: 'Proceed to reset.' });
                }
                return res.status(404).json({ message: 'Email not found.' });
            }
            default:
                return res.status(400).json({ message: 'Invalid action.' });
        }
    } catch (error) {
        next(error);
    }
});

// PUT /api/auth - Handle credential updates and password resets
router.put('/', async (req, res, next) => {
    try {
        const { action, currentPassword, newUsername, newPassword } = req.body;

        switch (action) {
            case 'update_credentials': {
                if (!req.session.isAdmin || !req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

                const userRows = await req.db.query('SELECT * FROM User WHERE id = $1', [req.session.userId]);
                const user = userRows.rows[0];
                if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
                    return res.status(401).json({ message: 'Incorrect current password.' });
                }
                const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
                await req.db.query('UPDATE User SET username = $1, passwordHash = $2 WHERE id = $3', [newUsername, newPasswordHash, req.session.userId]);
                const updatedUserRows = await req.db.query('SELECT id, username, email FROM User WHERE id = $1', [req.session.userId]);
                const updatedUser = updatedUserRows.rows[0];
                await req.db.query('INSERT INTO ActivityLog (id, action, details, timestamp) VALUES ($1, $2, $3, $4)', [uuidv4(), 'Credentials Updated', `Admin credentials updated for ${updatedUser.username}.`, new Date()]);
                return res.status(200).json({ user: { username: updatedUser.username, email: updatedUser.email } });
            }
            case 'reset_password': {
                if (!req.session.resetUserId) {
                    return res.status(401).json({ message: 'Invalid reset request.' });
                }
                const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
                await req.db.query('UPDATE User SET passwordHash = $1 WHERE id = $2', [newPasswordHash, req.session.resetUserId]);
                req.session.destroy();
                return res.status(200).json({ message: 'Password has been reset. Please log in again.' });
            }
            default:
                return res.status(400).json({ message: 'Invalid action.' });
        }
    } catch (error) {
        next(error);
    }
});

export default router;
