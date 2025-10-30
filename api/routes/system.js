import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';
import { getConnection } from '../../lib/postgresql.js';

const router = Router();
router.use(requireAdmin);

// GET /api/system/db-status - Check database connection
router.get('/db-status', async (req, res, next) => {
    try {
        const connection = await getConnection();
        // A simple query to ensure the connection is live and not just a pooled object.
        await connection.query('SELECT 1'); 
        res.status(200).json({ status: 'connected' });
    } catch (error) {
        // We catch the error here to provide a structured response,
        // rather than letting it fall through to the global error handler.
        res.status(500).json({ status: 'error', message: error instanceof Error ? error.message : 'An unknown database error occurred.' });
    }
});

// --- Settings ---
router.post('/settings', async (req, res, next) => {
    try {
        const { key, value } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({ message: 'Bad Request: key and value are required.' });
        }
        await req.db.query(
            `INSERT INTO KeyValueStore (key_name, value) VALUES ($1, $2) ON CONFLICT (key_name) DO UPDATE SET value = $3`,
            [key, JSON.stringify(value), JSON.stringify(value)]
        );
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Settings Updated', `${key} settings updated.`]);
        res.status(200).json({ message: 'Settings updated' });
    } catch (error) {
        next(error);
    }
});

// --- Activity Logs ---
router.post('/activity-logs', async (req, res, next) => {
    try {
        const { action, details } = req.body;
        const id = uuidv4();
        await req.db.query(`INSERT INTO ActivityLog (id, action, details, timestamp) VALUES ($1, $2, $3, $4)`, [id, action, details, new Date()]);
        res.status(201).json({ id, action, details, timestamp: new Date() });
    } catch (error) {
        next(error);
    }
});

router.delete('/activity-logs', async (req, res, next) => {
    try {
        if (req.body.clearAll) {
            await req.db.query('DELETE FROM ActivityLog');
            await req.db.query('INSERT INTO ActivityLog (id, action, details, timestamp) VALUES ($1, $2, $3, $4)', [uuidv4(), 'Logs Cleared', 'All activity logs were cleared.', new Date()]);
        }
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

// --- Email Notifications History ---
router.delete('/email-notifications', async (req, res, next) => {
    try {
        if (req.body.clearAll) {
            await req.db.query('DELETE FROM EmailNotification');
            await req.db.query('INSERT INTO ActivityLog (id, action, details, timestamp) VALUES ($1, $2, $3, $4)', [uuidv4(), 'Email Notifications Cleared', 'All email notification records were cleared.', new Date()]);
        } else if (req.body.id) {
            const { id } = req.body;
            const deleteResult = await req.db.query(`DELETE FROM EmailNotification WHERE id = $1`, [id]);
            if (deleteResult.rowCount === 0) return res.status(404).json({ message: `Email Notification with ID ${id} not found.` });
            await req.db.query('INSERT INTO ActivityLog (id, action, details, timestamp) VALUES ($1, $2, $3, $4)', [uuidv4(), 'Email Notification Deleted', `Email notification record with id ${id} deleted.`, new Date()]);
        }
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});


export default router;