import { Router } from 'express';
import {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController';
import { verifyAdminToken } from '../middleware/authMiddleware';

const router = Router();

// GET /api/products - Get all products with optional filters
router.get('/', getProducts);

// GET /api/products/:id - Get a single product by ID or slug
router.get('/:id', getProductByIdOrSlug);

// POST /api/products - Create a new product (Admin Only)
router.post('/', verifyAdminToken, createProduct);

// PUT /api/products/:id - Update an existing product (Admin Only)
router.put('/:id', verifyAdminToken, updateProduct);

// DELETE /api/products/:id - Delete product (Admin Only)
router.delete('/:id', verifyAdminToken, deleteProduct);

export default router;
