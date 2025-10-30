// FIX: Created new file for shared validation logic.
import { Job } from '../types';

export const validateJob = (job: Partial<Job>): string | null => {
    const requiredFields: Array<keyof Job> = ['title', 'department', 'category', 'description', 'qualification', 'vacancies', 'postedDate', 'lastDate', 'applyLink'];
    for (const field of requiredFields) {
        if (!job[field] || (typeof job[field] === 'string' && (job[field] as string).trim() === '')) {
            return `Missing or empty required field: ${field}`;
        }
    }

    // Date format validation for frontend to provide more specific feedback
    if (job.postedDate && (isNaN(new Date(job.postedDate).getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(job.postedDate))) {
        return 'Invalid date format for postedDate. Please use YYYY-MM-DD.';
    }
    if (job.lastDate && (isNaN(new Date(job.lastDate).getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(job.lastDate))) {
        return 'Invalid date format for lastDate. Please use YYYY-MM-DD.';
    }
    
    // Assuming vacancies should be a number-like string
    if (job.vacancies && typeof job.vacancies === 'string' && !/^\d+$/.test(job.vacancies.trim())) {
        return 'Vacancies must be a number.';
    }

    return null;
};
