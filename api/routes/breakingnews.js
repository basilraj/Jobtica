import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAdmin);

const validateNews = (news) => {
    if (!news.text) return 'Missing required field: text';
    if (!news.status || !['active', 'inactive'].includes(news.status)) return 'Invalid or missing field: status';
    return null;
};

router.post('/', async (req, res, next) => {
    try {
        const newItemData = req.body;
        const validationError = validateNews(newItemData);
        if (validationError) {
            const err = new Error(`Validation Error: ${validationError}`);
            err.statusCode = 400;
            throw err;
        }
        const id = uuidv4();
        const result = await req.db.query(`INSERT INTO BreakingNews (id, text, link, status) VALUES ($1, $2, $3, $4)`, [id, newItemData.text, newItemData.link, newItemData.status]);
        if (result.rowCount === 0) throw new Error('Failed to create breaking news item.');
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Breaking News Added', `News added: ${newItemData.text}`]);
        res.status(201).json({ id, ...newItemData });
    } catch (error) {
        next(error);
    }
});

router.put('/', async (req, res, next) => {
    try {
        const { id: itemId, ...updateData } = req.body;
        if (!itemId) {
            const err = new Error('Item ID is required for updates.');
            err.statusCode = 400;
            throw err;
        }
        const validationError = validateNews(updateData);
        if (validationError) {
            const err = new Error(`Validation Error: ${validationError}`);
            err.statusCode = 400;
            throw err;
        }
        const updateResult = await req.db.query(`UPDATE BreakingNews SET text = $1, link = $2, status = $3 WHERE id = $4`, [updateData.text, updateData.link, updateData.status, itemId]);
        if (updateResult.rowCount === 0) return res.status(404).json({ message: `Breaking News item with ID ${itemId} not found.` });
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Breaking News Updated', `News updated: ${updateData.text}`]);
        res.status(200).json({ id: itemId, ...updateData });
    } catch (error) {
        next(error);
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        if (!deleteId) {
            const err = new Error('Item ID is required for deletion.');
            err.statusCode = 400;
            throw err;
        }
        const deleteResult = await req.db.query(`DELETE FROM BreakingNews WHERE id = $1`, [deleteId]);
        if (deleteResult.rowCount === 0) return res.status(404).json({ message: `Breaking News item with ID ${deleteId} not found.` });
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Breaking News Deleted', `News item with id ${deleteId} deleted.`]);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;
