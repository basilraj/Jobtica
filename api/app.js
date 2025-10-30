import 'dotenv/config';
import express from 'express';
import { sessionMiddleware } from '../lib/session.js';
import { attachDb } from './middleware/database.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import the master API router
import apiRouter from './routes/index.js';

const app = express();

// --- Global Middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(sessionMiddleware);
app.use(attachDb);

// --- Mount Master API Router ---
// All API routes are now handled by this single router.
app.use('/api', apiRouter);

// --- Centralized Error Handler ---
app.use(errorHandler);

export default app;
