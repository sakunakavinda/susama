"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryByIdOrSlug = exports.getCategories = void 0;
const db_1 = require("../config/db");
const crypto_1 = require("crypto");
// GET /api/categories - Get all active categories
const getCategories = async (req, res) => {
    try {
        const [rows] = await db_1.pool.query('SELECT id, name, slug, description, image_url, sort_order FROM categories WHERE is_active = TRUE ORDER BY sort_order ASC, created_at DESC');
        res.json({
            success: true,
            data: rows
        });
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};
exports.getCategories = getCategories;
// GET /api/categories/:id - Get a single category by ID or slug
const getCategoryByIdOrSlug = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db_1.pool.query('SELECT id, name, slug, description, image_url, sort_order FROM categories WHERE (id = ? OR slug = ?) AND is_active = TRUE LIMIT 1', [id, id]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        res.json({
            success: true,
            data: rows[0]
        });
    }
    catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category',
            error: error.message
        });
    }
};
exports.getCategoryByIdOrSlug = getCategoryByIdOrSlug;
// POST /api/categories - Create a new category
const createCategory = async (req, res) => {
    try {
        const { name, slug, description, image_url, sort_order } = req.body;
        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: 'Name and slug are required fields'
            });
        }
        const id = (0, crypto_1.randomUUID)();
        const order = sort_order || 0;
        await db_1.pool.execute('INSERT INTO categories (id, name, slug, description, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)', [id, name, slug, description || null, image_url || null, order]);
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: { id, name, slug, description, image_url, sort_order: order }
        });
    }
    catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: error.message
        });
    }
};
exports.createCategory = createCategory;
// PUT /api/categories/:id - Update an existing category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, image_url, sort_order, is_active } = req.body;
        const [existing] = await db_1.pool.query('SELECT id FROM categories WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        await db_1.pool.execute(`UPDATE categories 
       SET name = COALESCE(?, name), 
           slug = COALESCE(?, slug), 
           description = COALESCE(?, description), 
           image_url = COALESCE(?, image_url), 
           sort_order = COALESCE(?, sort_order),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`, [name, slug, description, image_url, sort_order, is_active, id]);
        res.json({
            success: true,
            message: 'Category updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update category',
            error: error.message
        });
    }
};
exports.updateCategory = updateCategory;
// DELETE /api/categories/:id - Soft delete category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.pool.execute('UPDATE categories SET is_active = FALSE WHERE id = ?', [id]);
        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete category',
            error: error.message
        });
    }
};
exports.deleteCategory = deleteCategory;
