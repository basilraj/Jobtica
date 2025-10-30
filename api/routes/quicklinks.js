import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAdmin);

const validateLink = (link) => {
    if (!link.title) return 'Missing required field: title';
    if (!link.url) return 'Missing required field: url';
    if (!link.status || !['active', 'inactive'].includes(link.status)) return 'Invalid or missing field: status';
    return null;
};

router.post('/', async (req, res, next) => {
    try {
        const linkData = req.body;
        const validationError = validateLink(linkData);
        if (validationError) {
            const err = new Error(`Validation Error: ${validationError}`);
            err.statusCode = 400;
            throw err;
        }
        const id = uuidv4();
        await req.db.query(`INSERT INTO QuickLink (id, title, category, url, description, status) VALUES ($1, $2, $3, $4, $5, $6)`, [id, linkData.title, linkData.category, linkData.url, linkData.description, linkData.status]);
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Quick Link Created', `Link added: ${linkData.title}`]);
        res.status(201).json({ id, ...linkData });
    } catch (error) {
        next(error);
    }
});

router.put('/', async (req, res, next) => {
    try {
        const { id: linkId, ...updateData } = req.body;
        if (!linkId) {
            const err = new Error('Link ID is required for updates.');
            err.statusCode = 400;
            throw err;
        }
        const validationError = validateLink(updateData);
        if (validationError) {
            const err = new Error(`Validation Error: ${validationError}`);
            err.statusCode = 400;
            throw err;
        }
        const updateResult = await req.db.query(`UPDATE QuickLink SET title = $1, category = $2, url = $3, description = $4, status = $5 WHERE id = $6`, [updateData.title, updateData.category, updateData.url, updateData.description, updateData.status, linkId]);
        if (updateResult.rowCount === 0) return res.status(404).json({ message: `Quick Link with ID ${linkId} not found.` });
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Quick Link Updated', `Link updated: ${updateData.title}`]);
        res.status(200).json({ id: linkId, ...updateData });
    } catch (error) {
        next(error);
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        if (!deleteId) {
            const err = new Error('Link ID is required for deletion.');
            err.statusCode = 400;
            throw err;
        }
        const deleteResult = await req.db.query(`DELETE FROM QuickLink WHERE id = $1`, [deleteId]);
        if (deleteResult.rowCount === 0) return res.status(404).json({ message: `Quick Link with ID ${deleteId} not found.` });
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Quick Link Deleted', `Link with id ${deleteId} deleted.`]);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;
