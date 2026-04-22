import { Router } from 'express';
import { getStreak } from '../controllers/stats.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/streak', protect, getStreak);

export default router;
