import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAdmin);

const validateExam = (exam) => {
    if (!exam.name) return 'Missing required field: name';
    if (!exam.deadline || isNaN(new Date(exam.deadline).getTime())) return 'Invalid or missing field: deadline';
    if (!exam.notificationLink) return 'Missing required field: notificationLink';
    return null;
};

router.post('/', async (req, res, next) => {
    try {
        const newItemData = req.body;
        const validationError = validateExam(newItemData);
        if (validationError) {
            const err = new Error(`Validation Error: ${validationError}`);
            err.statusCode = 400;
            throw err;
        }
        const id = uuidv4();
        await req.db.query(`INSERT INTO UpcomingExam (id, name, deadline, notificationLink) VALUES ($1, $2, $3, $4)`, [id, newItemData.name, new Date(newItemData.deadline), newItemData.notificationLink]);
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Upcoming Exam Added', `Exam added: ${newItemData.name}`]);
        res.status(201).json({ id, ...newItemData });
    } catch (error) {
        next(error);
    }
});

router.put('/', async (req, res, next) => {
    try {
        const { id: examId, ...updateData } = req.body;
        if (!examId) {
            const err = new Error('Exam ID is required for updates.');
            err.statusCode = 400;
            throw err;
        }
        const validationError = validateExam(updateData);
        if (validationError) {
            const err = new Error(`Validation Error: ${validationError}`);
            err.statusCode = 400;
            throw err;
        }
        const updateResult = await req.db.query(`UPDATE UpcomingExam SET name = $1, deadline = $2, notificationLink = $3 WHERE id = $4`, [updateData.name, new Date(updateData.deadline), updateData.notificationLink, examId]);
        if (updateResult.rowCount === 0) return res.status(404).json({ message: `Upcoming Exam with ID ${examId} not found.` });
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Upcoming Exam Updated', `Exam updated: ${updateData.name}`]);
        res.status(200).json({ id: examId, ...updateData });
    } catch (error) {
        next(error);
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const { id: deleteId } = req.body;
        if (!deleteId) {
            const err = new Error('Exam ID is required for deletion.');
            err.statusCode = 400;
            throw err;
        }
        const deleteResult = await req.db.query(`DELETE FROM UpcomingExam WHERE id = $1`, [deleteId]);
        if (deleteResult.rowCount === 0) return res.status(404).json({ message: `Upcoming Exam with ID ${deleteId} not found.` });
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Upcoming Exam Deleted', `Exam with id ${deleteId} deleted.`]);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;