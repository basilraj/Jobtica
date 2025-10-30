
import { getConnection } from '../../lib/postgres.js';

export const attachDb = async (req, res, next) => {
    try {
        // Attach the connection pool to the request object
        req.db = await getConnection();
        next();
    } catch (error) {
        // Pass database connection errors to the central error handler
        next(error);
    }
};
