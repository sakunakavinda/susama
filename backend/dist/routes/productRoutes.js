"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
// GET /api/products - Get all products with optional filters
router.get('/', productController_1.getProducts);
// GET /api/products/:id - Get a single product by ID or slug
router.get('/:id', productController_1.getProductByIdOrSlug);
// POST /api/products - Create a new product
router.post('/', productController_1.createProduct);
// PUT /api/products/:id - Update an existing product
router.put('/:id', productController_1.updateProduct);
// DELETE /api/products/:id - Delete product
router.delete('/:id', productController_1.deleteProduct);
exports.default = router;
