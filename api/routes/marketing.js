
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// --- Sponsored Ads ---

// Handles both public click tracking and admin updates
router.put('/sponsored-ads', async (req, res, next) => {
    try {
        if (req.body.trackClick) {
            // Public action: track a click
            const { id } = req.body;
            const updateResult = await req.db.query(`UPDATE SponsoredAd SET clicks = clicks + 1 WHERE id = $1`, [id]);
            if (updateResult.rowCount === 0) return res.status(404).json({ message: `Ad with ID ${id} not found.` });
            return res.status(200).json({ message: 'Click tracked' });
        } else {
            // Admin action: update an ad. Manually check for admin session.
            if (!req.session.isAdmin) return res.status(401).json({ message: 'Unauthorized' });
            
            const { id: adId, clicks, ...updateData } = req.body;
            const updateResult = await req.db.query(`UPDATE SponsoredAd SET imageUrl = $1, destinationUrl = $2, placement = $3, status = $4 WHERE id = $5`,
                [updateData.imageUrl, updateData.destinationUrl, updateData.placement, updateData.status, adId]
            );
            if (updateResult.rowCount === 0) return res.status(404).json({ message: `Ad with ID ${adId} not found.` });
            
            const updatedAdRows = await req.db.query(`SELECT * FROM SponsoredAd WHERE id = $1`, [adId]);
            await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Sponsored Ad Updated', `Ad updated for ${updatedAdRows.rows[0].destinationUrl}`]);
            return res.status(200).json(updatedAdRows[0]);
        }
    } catch (error) {
        next(error);
    }
});

router.post('/sponsored-ads', requireAdmin, async (req, res, next) => {
    try {
        const newItemData = req.body;
        const id = uuidv4();
        await req.db.query(`INSERT INTO SponsoredAd (id, imageUrl, destinationUrl, placement, status, clicks) VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, newItemData.imageUrl, newItemData.destinationUrl, newItemData.placement, newItemData.status, 0]
        );
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Sponsored Ad Added', `Ad added for ${newItemData.destinationUrl}`]);
        res.status(201).json({ id, clicks: 0, ...newItemData });
    } catch (error) {
        next(error);
    }
});

router.delete('/sponsored-ads', requireAdmin, async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        const deleteResult = await req.db.query(`DELETE FROM SponsoredAd WHERE id = $1`, [deleteId]);
        if (deleteResult.rowCount === 0) return res.status(404).json({ message: `Ad with ID ${deleteId} not found.` });
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Sponsored Ad Deleted', `Ad with id ${deleteId} deleted.`]);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});


// --- Custom Emails & Templates (all admin) ---
router.post('/custom-emails', requireAdmin, async (req, res, next) => {
    try {
        if (req.session.isDemo) return res.status(403).json({ message: 'Action not allowed in demo mode.' });
        
        const { subject, body } = req.body;
        const id = uuidv4();
        const result = await req.db.query(`INSERT INTO CustomEmail (id, subject, body, sentAt) VALUES ($1, $2, $3, $4)`, [id, subject, body, new Date()]);
        if (result.rowCount === 0) throw new Error('Failed to create custom email.');
        
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Email Campaign Sent', `Campaign sent: ${subject}`]);
        res.status(201).json({ id, subject, body, sentAt: new Date() });
    } catch (error) {
        next(error);
    }
});

router.delete('/custom-emails', requireAdmin, async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        const deleteResult = await req.db.query(`DELETE FROM CustomEmail WHERE id = $1`, [deleteId]);
        if (deleteResult.rowCount === 0) return res.status(404).json({ message: `Custom Email with ID ${deleteId} not found.` });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.post('/email-templates', requireAdmin, async (req, res, next) => {
    try {
        if (req.session.isDemo) return res.status(403).json({ message: 'Action not allowed in demo mode.' });
        
        const newItemData = req.body;
        const id = uuidv4();
        const result = await req.db.query(`INSERT INTO EmailTemplate (id, name, subject, body) VALUES ($1, $2, $3, $4)`, [id, newItemData.name, newItemData.subject, newItemData.body]);
        if (result.rowCount === 0) throw new Error('Failed to create email template.');
        
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Email Template Created', `Template created: ${newItemData.name}`]);
        res.status(201).json({ id, ...newItemData });
    } catch (error) {
        next(error);
    }
});

router.put('/email-templates', requireAdmin, async (req, res, next) => {
    try {
        if (req.session.isDemo) return res.status(403).json({ message: 'Action not allowed in demo mode.' });

        const { id: templateId, ...updateData } = req.body;
        const updateResult = await req.db.query(`UPDATE EmailTemplate SET name = $1, subject = $2, body = $3 WHERE id = $4`, [updateData.name, updateData.subject, updateData.body, templateId]);
        if (updateResult.rowCount === 0) return res.status(404).json({ message: `Email Template with ID ${templateId} not found.` });

        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Email Template Updated', `Template updated: ${updateData.name}`]);
        res.status(200).json({ id: templateId, ...updateData });
    } catch (error) {
        next(error);
    }
});

router.delete('/email-templates', requireAdmin, async (req, res, next) => {
    try {
        if (req.session.isDemo) return res.status(403).json({ message: 'Action not allowed in demo mode.' });

        const { id: deleteId } = req.body;
        const deleteResult = await req.db.query(`DELETE FROM EmailTemplate WHERE id = $1`, [deleteId]);
        if (deleteResult.rowCount === 0) return res.status(404).json({ message: `Email Template with ID ${deleteId} not found.` });

        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Email Template Deleted', `Template with id ${deleteId} deleted.`]);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;
