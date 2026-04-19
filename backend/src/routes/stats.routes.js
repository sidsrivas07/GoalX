import { Router } from 'express';
import { getStreak } from '../controllers/stats.controller.js';

const router = Router();

router.get('/streak', getStreak);

export default router;
