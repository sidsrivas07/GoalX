import { Router } from 'express';
import { createCategory, getCategories } from '../controllers/category.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Run all routes through auth protection
router.use(protect);

router.post('/', createCategory);
router.get('/', getCategories);

export default router;
