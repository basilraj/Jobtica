import { sessionMiddleware as createSessionMiddleware } from 'iron-session/express';

// Ensure SESSION_SECRET is set, especially for production.
// For development, provide a default to prevent crashes.
const sessionPassword = process.env.SESSION_SECRET;
if (!sessionPassword && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET environment variable is not set for production. It must be at least 32 characters long.');
}

export const sessionOptions = {
  // Use a default non-secret password only for development
  password: sessionPassword || 'a-very-long-secret-for-dev-at-least-32-chars',
  cookieName: 'jobtica-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
};

// Create and export the configured middleware instance for use in Express
export const sessionMiddleware = createSessionMiddleware(sessionOptions);
