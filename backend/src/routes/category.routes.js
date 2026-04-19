import { Router } from 'express';
import { createCategory, getCategories, deleteCategory } from '../controllers/category.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Run all routes through auth protection
router.use(protect);

router.post('/', createCategory);
router.get('/', getCategories);
router.delete('/:id', deleteCategory);

export default router;
