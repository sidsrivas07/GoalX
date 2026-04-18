import { Router } from 'express';
import { getTasksByDate, createTask, toggleTaskStatus, deleteTask } from '../controllers/task.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all task endpoints
router.use(protect);

router.get('/', getTasksByDate);
router.post('/', createTask);
router.patch('/:id/status', toggleTaskStatus);
router.delete('/:id', deleteTask);

export default router;
