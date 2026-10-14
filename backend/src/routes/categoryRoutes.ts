import { Router } from 'express';
import { 
  getCategories, 
  getCategoryByIdOrSlug, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController';
import { verifyAdminToken } from '../middleware/authMiddleware';

const router = Router();

// Category Routes
router.get('/', getCategories);
router.get('/:id', getCategoryByIdOrSlug);
router.post('/', verifyAdminToken, createCategory);
router.put('/:id', verifyAdminToken, updateCategory);
router.delete('/:id', verifyAdminToken, deleteCategory);

export default router;
