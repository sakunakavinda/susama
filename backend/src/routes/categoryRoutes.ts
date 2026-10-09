import { Router } from 'express';
import { 
  getCategories, 
  getCategoryByIdOrSlug, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController';

const router = Router();

// Category Routes
router.get('/', getCategories);
router.get('/:id', getCategoryByIdOrSlug);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
