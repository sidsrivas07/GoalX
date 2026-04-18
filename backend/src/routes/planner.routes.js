import { Router } from 'express';
import { generatePlan } from '../controllers/planner.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/generate', generatePlan);

export default router;
