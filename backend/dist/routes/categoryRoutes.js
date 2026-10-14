"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Category Routes
router.get('/', categoryController_1.getCategories);
router.get('/:id', categoryController_1.getCategoryByIdOrSlug);
router.post('/', authMiddleware_1.verifyAdminToken, categoryController_1.createCategory);
router.put('/:id', authMiddleware_1.verifyAdminToken, categoryController_1.updateCategory);
router.delete('/:id', authMiddleware_1.verifyAdminToken, categoryController_1.deleteCategory);
exports.default = router;
