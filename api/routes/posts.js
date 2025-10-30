import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAdmin);

const validatePost = (post) => {
    const requiredFields = ['title', 'category', 'status', 'type', 'publishedDate'];
    for (const field of requiredFields) {
        if (!post.hasOwnProperty(field) || !post[field]) {
            return `Missing required field: ${field}`;
        }
    }
    if (!['posts', 'exam-notices', 'results'].includes(post.type)) return `Invalid post type: ${post.type}`;
    if (!['published', 'draft'].includes(post.status)) return `Invalid post status: ${post.status}`;
    if (isNaN(new Date(post.publishedDate).getTime())) return 'Invalid date format for publishedDate. Use YYYY-MM-DD.';
    return null;
};

router.post('/', async (req, res, next) => {
    try {
        const postData = req.body;
        const validationError = validatePost(postData);
        if (validationError) {
            const err = new Error(`Validation Error: ${validationError}`);
            err.statusCode = 400;
            throw err;
        }
        const id = uuidv4();
        await req.db.query(`INSERT INTO ContentPost (id, title, category, content, status, type, publishedDate, createdAt, examDate, detailsUrl, imageUrl, seoTitle, seoDescription) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [id, postData.title, postData.category, postData.content, postData.status, postData.type, new Date(postData.publishedDate), new Date(), postData.examDate ? new Date(postData.examDate) : null, postData.detailsUrl, postData.imageUrl, postData.seoTitle, postData.seoDescription]
        );
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Post Created', `Post created: ${postData.title}`]);
        res.status(201).json({ id, createdAt: new Date(), ...postData });
    } catch (error) {
        next(error);
    }
});

router.put('/', async (req, res, next) => {
    try {
        const { id: postId, createdAt, ...updateData } = req.body;
        if (!postId) {
            const err = new Error('Post ID is required for updates.');
            err.statusCode = 400;
            throw err;
        }
        const validationError = validatePost(updateData);
        if (validationError) {
            const err = new Error(`Validation Error: ${validationError}`);
            err.statusCode = 400;
            throw err;
        }
        const updateResult = await req.db.query(`UPDATE ContentPost SET title = $1, category = $2, content = $3, status = $4, type = $5, publishedDate = $6, examDate = $7, detailsUrl = $8, imageUrl = $9, seoTitle = $10, seoDescription = $11 WHERE id = $12`,
            [updateData.title, updateData.category, updateData.content, updateData.status, updateData.type, new Date(updateData.publishedDate), updateData.examDate ? new Date(updateData.examDate) : null, updateData.detailsUrl, updateData.imageUrl, updateData.seoTitle, updateData.seoDescription, postId]
        );
        if (updateResult.rowCount === 0) return res.status(404).json({ message: `Post with ID ${postId} not found.` });
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Post Updated', `Post updated: ${updateData.title}`]);
        res.status(200).json({ id: postId, ...updateData });
    } catch (error) {
        next(error);
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const { ids, id } = req.body;
        if (!ids && !id) {
            const err = new Error('An ID or an array of IDs is required for deletion.');
            err.statusCode = 400;
            throw err;
        }
        if (ids) {
            const deleteResult = await req.db.query(`DELETE FROM ContentPost WHERE id IN ($1)`, [ids]);
            await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Bulk Post Deletion', `${deleteResult.rowCount} posts deleted.`]);
        } else {
            const deleteResult = await req.db.query(`DELETE FROM ContentPost WHERE id = $1`, [id]);
            if (deleteResult.rowCount === 0) return res.status(404).json({ message: `Post with ID ${id} not found.` });
            await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Post Deleted', `Post with id ${id} deleted.`]);
        }
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;
