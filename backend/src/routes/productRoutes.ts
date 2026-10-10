import { Router } from 'express';
import {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController';

const router = Router();

// GET /api/products - Get all products with optional filters
router.get('/', getProducts);

// GET /api/products/:id - Get a single product by ID or slug
router.get('/:id', getProductByIdOrSlug);

// POST /api/products - Create a new product
router.post('/', createProduct);

// PUT /api/products/:id - Update an existing product
router.put('/:id', updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', deleteProduct);

export default router;
