/**
 * Central Router
 *
 * All API route modules are registered here under the /api prefix.
 * This keeps app.js clean and makes it easy to add new route groups.
 */
import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import categoryRoutes from './category.routes.js';
import taskRoutes from './task.routes.js';
import plannerRoutes from './planner.routes.js';

const router = Router();

// ── Route Groups ────────────────────────────────────────────
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/tasks', taskRoutes);
router.use('/planner', plannerRoutes);

export default router;
