
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// --- Subscribers ---

// POST /api/audience/subscribers - Public endpoint for new subscriptions
router.post('/subscribers', async (req, res, next) => {
    try {
        const { email } = req.body;
        const existing = await req.db.query('SELECT id FROM Subscriber WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'This email is already subscribed.' });
        }
        const id = uuidv4();
        await req.db.query(`INSERT INTO Subscriber (id, email, status, subscriptionDate) VALUES ($1, $2, $3, $4)`,
            [id, email, 'active', new Date()]
        );
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['New Subscriber', `New subscriber: ${email}`]);
        res.status(201).json({ id, email, status: 'active', subscriptionDate: new Date() });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/audience/subscribers - Admin-only endpoint for deleting a subscriber
router.delete('/subscribers', requireAdmin, async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        const deleteResult = await req.db.query(`DELETE FROM Subscriber WHERE id = $1`, [deleteId]);
        if (deleteResult.rowCount === 0) return res.status(404).json({ message: `Subscriber with ID ${deleteId} not found.` });
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Subscriber Deleted', `Subscriber with id ${deleteId} deleted.`]);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});


// --- Contacts ---

// POST /api/audience/contacts - Public endpoint for new submissions
router.post('/contacts', async (req, res, next) => {
    try {
        const submissionData = req.body;
        const id = uuidv4();
        const result = await req.db.query(
            `INSERT INTO ContactSubmission (id, name, email, subject, message, submittedAt) VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, submissionData.name, submissionData.email, submissionData.subject, submissionData.message, new Date()]
        );
        if (result.rowCount === 0) throw new Error('Failed to create contact submission.');
        res.status(201).json({ id, submittedAt: new Date(), ...submissionData });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/audience/contacts - Admin-only endpoint for deleting submissions
router.delete('/contacts', requireAdmin, async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        const deleteResult = await req.db.query(`DELETE FROM ContactSubmission WHERE id = $1`, [deleteId]);
        if (deleteResult.rowCount === 0) return res.status(404).json({ message: `Contact Submission with ID ${deleteId} not found.` });
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Contact Deleted', `Contact message with id ${deleteId} deleted.`]);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});


export default router;
