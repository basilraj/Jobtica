
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAdmin);

// --- Preparation Books ---
router.post('/books', async (req, res, next) => {
    try {
        const newItemData = req.body;
        const id = uuidv4();
        await req.db.query(`INSERT INTO PreparationBook (id, title, author, url, imageUrl) VALUES ($1, $2, $3, $4, $5)`,
            [id, newItemData.title, newItemData.author, newItemData.url, newItemData.imageUrl]
        );
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Prep Book Added', `Book added: ${newItemData.title}`]);
        res.status(201).json({ id, ...newItemData });
    } catch (error) {
        next(error);
    }
});

router.put('/books', async (req, res, next) => {
    try {
        const { id: bookId, ...updateData } = req.body;
        const updateResult = await req.db.query(`UPDATE PreparationBook SET title = $1, author = $2, url = $3, imageUrl = $4 WHERE id = $5`,
            [updateData.title, updateData.author, updateData.url, updateData.imageUrl, bookId]
        );
        if (updateResult.rowCount === 0) return res.status(404).json({ message: `Book with ID ${bookId} not found.` });
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Prep Book Updated', `Book updated: ${updateData.title}`]);
        res.status(200).json({ id: bookId, ...updateData });
    } catch (error) {
        next(error);
    }
});

router.delete('/books', async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        const deleteResult = await req.db.query(`DELETE FROM PreparationBook WHERE id = $1`, [deleteId]);
        if (deleteResult.rowCount === 0) return res.status(404).json({ message: `Book with ID ${deleteId} not found.` });
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Prep Book Deleted', `Book with id ${deleteId} deleted.`]);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

// --- Preparation Courses ---
router.post('/courses', async (req, res, next) => {
    try {
        const newItemData = req.body;
        const id = uuidv4();
        await req.db.query(`INSERT INTO PreparationCourse (id, platform, title, url) VALUES ($1, $2, $3, $4)`,
            [id, newItemData.platform, newItemData.title, newItemData.url]
        );
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Prep Course Added', `Course added: ${newItemData.title}`]);
        res.status(201).json({ id, ...newItemData });
    } catch (error) {
        next(error);
    }
});

router.put('/courses', async (req, res, next) => {
    try {
        const { id: courseId, ...updateData } = req.body;
        const updateResult = await req.db.query(`UPDATE PreparationCourse SET platform = $1, title = $2, url = $3 WHERE id = $4`,
            [updateData.platform, updateData.title, updateData.url, courseId]
        );
        if (updateResult.rowCount === 0) return res.status(404).json({ message: `Course with ID ${courseId} not found.` });
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Prep Course Updated', `Course updated: ${updateData.title}`]);
        res.status(200).json({ id: courseId, ...updateData });
    } catch (error) {
        next(error);
    }
});

router.delete('/courses', async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        const deleteResult = await req.db.query(`DELETE FROM PreparationCourse WHERE id = $1`, [deleteId]);
        if (deleteResult.rowCount === 0) return res.status(404).json({ message: `Course with ID ${deleteId} not found.` });
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Prep Course Deleted', `Course with id ${deleteId} deleted.`]);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;