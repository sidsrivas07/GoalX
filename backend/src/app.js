/**
 * Express Application Configuration
 *
 * Sets up all middleware, routes, and error handling.
 * Exported as a configured Express app instance for server.js to listen on.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import apiRouter from './routes/index.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// ── Security & Parsing ──────────────────────────────────────
app.use(helmet());                              // Security headers
app.use(cors({                                  // Cross-origin requests (frontend)
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-key'],
}));
app.use(express.json({ limit: '16kb' }));       // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ── Logging ─────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));                        // Colorful request logs in dev
}

// ── API Routes ──────────────────────────────────────────────
app.use('/api', apiRouter);

// ── Error Handling ──────────────────────────────────────────
app.use(notFound);       // Catch 404s
app.use(errorHandler);   // Handle all errors

export default app;
