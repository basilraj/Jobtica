import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAdmin);

const parseJsonField = (jsonString) => {
    if (!jsonString) return [];
    try { return JSON.parse(jsonString); } catch (e) { return []; }
};

const validateJob = (job) => {
    const requiredFields = ['title', 'department', 'category', 'description', 'qualification', 'vacancies', 'postedDate', 'lastDate', 'applyLink'];
    for (const field of requiredFields) {
        if (!job.hasOwnProperty(field) || !job[field]) {
            return `Missing required field: ${field}`;
        }
    }
    if (isNaN(new Date(job.postedDate).getTime()) || isNaN(new Date(job.lastDate).getTime())) {
        return 'Invalid date format for postedDate or lastDate. Use YYYY-MM-DD.';
    }
    return null;
};

router.post('/', async (req, res, next) => {
    try {
        const connection = req.db;
        if (Array.isArray(req.body)) {
            for (const [index, job] of req.body.entries()) {
                const validationError = validateJob(job);
                if (validationError) {
                    const err = new Error(`Validation Error on item ${index + 1}: ${validationError}`);
                    err.statusCode = 400;
                    throw err;
                }
            }
            const jobsData = req.body.map(job => [
                uuidv4(), job.title, job.department, job.category, job.description, job.qualification,
                job.vacancies, new Date(job.postedDate), new Date(job.lastDate), job.applyLink,
                'active', new Date(), JSON.stringify(job.affiliateCourses || []), JSON.stringify(job.affiliateBooks || [])
            ]);
            if (jobsData.length === 0) return res.status(201).json([]);

            // Build PostgreSQL bulk insert with parameterized queries
            const values = [];
            const params = [];
            const placeholderGroups = [];

            jobsData.forEach((row, index) => {
                const startParam = index * 14 + 1; // 14 columns per row
                params.push(...row);
                placeholderGroups.push(`($${startParam}, $${startParam + 1}, $${startParam + 2}, $${startParam + 3}, $${startParam + 4}, $${startParam + 5}, $${startParam + 6}, $${startParam + 7}, $${startParam + 8}, $${startParam + 9}, $${startParam + 10}, $${startParam + 11}, $${startParam + 12}, $${startParam + 13})`);
            });

            const bulkInsertQuery = `INSERT INTO Job (id, title, department, category, description, qualification, vacancies, postedDate, lastDate, applyLink, status, createdAt, affiliateCoursesJson, affiliateBooksJson) VALUES ${placeholderGroups.join(', ')}`;
            const [result] = await connection.query(bulkInsertQuery, params);

            await connection.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Bulk Job Upload', `${result.rowCount} jobs added.`]);
            const newJobIds = jobsData.map(data => data[0]);
            const [newJobs] = await connection.query(`SELECT *, CAST(affiliateCoursesJson AS CHAR) AS affiliateCoursesJson, CAST(affiliateBooksJson AS CHAR) AS affiliateBooksJson FROM Job WHERE id = ANY($1)`, [newJobIds]);
            const parsedNewJobs = newJobs.rows.map(job => ({ ...job, affiliateCourses: parseJsonField(job.affiliateCoursesJson), affiliateBooks: parseJsonField(job.affiliateBooksJson) }));
            return res.status(201).json(parsedNewJobs);
        } else {
            const { affiliateCourses, affiliateBooks, ...jobData } = req.body;
            const validationError = validateJob(jobData);
            if (validationError) {
                const err = new Error(`Validation Error: ${validationError}`);
                err.statusCode = 400;
                throw err;
            }
            const id = uuidv4();
            await connection.query(`INSERT INTO Job (id, title, department, category, description, qualification, vacancies, postedDate, lastDate, applyLink, status, createdAt, affiliateCoursesJson, affiliateBooksJson) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                [id, jobData.title, jobData.department, jobData.category, jobData.description, jobData.qualification, jobData.vacancies, new Date(jobData.postedDate), new Date(jobData.lastDate), jobData.applyLink, jobData.status, new Date(), JSON.stringify(affiliateCourses || []), JSON.stringify(affiliateBooks || [])]
            );
            const [newJobRows] = await connection.query(`SELECT *, CAST(affiliateCoursesJson AS CHAR) AS affiliateCoursesJson, CAST(affiliateBooksJson AS CHAR) AS affiliateBooksJson FROM Job WHERE id = $1`, [id]);
            const newJob = { ...newJobRows.rows[0], affiliateCourses: parseJsonField(newJobRows.rows[0].affiliateCoursesJson), affiliateBooks: parseJsonField(newJobRows.rows[0].affiliateBooksJson) };
            await connection.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Job Created', `New job added: ${newJob.title}`]);
            return res.status(201).json(newJob);
        }
    } catch (error) {
        next(error);
    }
});

router.put('/', async (req, res, next) => {
    try {
        const { id, affiliateCourses, affiliateBooks, createdAt, ...updateData } = req.body;
        if (!id) {
            const err = new Error('Job ID is required for updates.');
            err.statusCode = 400;
            throw err;
        }
        const validationError = validateJob(updateData);
        if (validationError) {
            const err = new Error(`Validation Error: ${validationError}`);
            err.statusCode = 400;
            throw err;
        }
        const [updateResult] = await req.db.query(`UPDATE Job SET title = $1, department = $2, category = $3, description = $4, qualification = $5, vacancies = $6, postedDate = $7, lastDate = $8, applyLink = $9, status = $10, affiliateCoursesJson = $11, affiliateBooksJson = $12 WHERE id = $13`,
            [updateData.title, updateData.department, updateData.category, updateData.description, updateData.qualification, updateData.vacancies, new Date(updateData.postedDate), new Date(updateData.lastDate), updateData.applyLink, updateData.status, JSON.stringify(affiliateCourses || []), JSON.stringify(affiliateBooks || []), id]
        );
        if (updateResult.rowCount === 0) return res.status(404).json({ message: `Job with ID ${id} not found.` });
        
        const [updatedJobRows] = await req.db.query(`SELECT *, CAST(affiliateCoursesJson AS CHAR) AS affiliateCoursesJson, CAST(affiliateBooksJson AS CHAR) AS affiliateBooksJson FROM Job WHERE id = $1`, [id]);
        const updatedJob = { ...updatedJobRows.rows[0], affiliateCourses: parseJsonField(updatedJobRows.rows[0].affiliateCoursesJson), affiliateBooks: parseJsonField(updatedJobRows.rows[0].affiliateBooksJson) };
        await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Job Updated', `Job updated: ${updatedJob.title}`]);
        res.status(200).json(updatedJob);
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
            const [deleteResult] = await req.db.query(`DELETE FROM Job WHERE id = ANY($1)`, [ids]);
            await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Bulk Job Deletion', `${deleteResult.rowCount} jobs deleted.`]);
        } else {
            const [deleteResult] = await req.db.query(`DELETE FROM Job WHERE id = $1`, [id]);
            if (deleteResult.rowCount === 0) return res.status(404).json({ message: `Job with ID ${id} not found.` });
            await req.db.query('INSERT INTO ActivityLog (action, details) VALUES ($1, $2)', ['Job Deleted', `Job with id ${id} deleted.`]);
        }
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;