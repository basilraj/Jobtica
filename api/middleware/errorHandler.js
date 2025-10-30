/**
 * Centralized error handler for the Express app.
 * This middleware should be the LAST one added with app.use().
 * It catches any errors passed via next(error) from other routes.
 */
export const errorHandler = (err, req, res, next) => {
    // Log the full error for debugging purposes on the server.
    console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    console.error(err);

    // Use a pre-defined status code on the error, otherwise default to 500.
    const statusCode = err.statusCode || 500;
    
    // For client errors (4xx), we can expose the message.
    // For server errors (5xx), we send a generic message to avoid leaking implementation details.
    const message = statusCode < 500 ? (err.message || 'An error occurred.') : 'Internal Server Error';

    res.status(statusCode).json({ message });
};
