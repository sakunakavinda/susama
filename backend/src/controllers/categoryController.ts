import { Request, Response } from 'express';
import { pool } from '../config/db';
import { randomUUID } from 'crypto';

// GET /api/categories - Get all active categories with product counts
export const getCategories = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.description, 
        c.image_url, 
        c.sort_order,
        CAST(COALESCE(SUM(CASE WHEN p.is_active = TRUE THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS active_products_count,
        CAST(COALESCE(COUNT(p.id), 0) AS UNSIGNED) AS total_products_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       WHERE c.is_active = TRUE 
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.created_at DESC`
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// GET /api/categories/:id - Get a single category by ID or slug
export const getCategoryByIdOrSlug = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query(
      'SELECT id, name, slug, description, image_url, sort_order FROM categories WHERE (id = ? OR slug = ?) AND is_active = TRUE LIMIT 1',
      [id, id]
    );

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
  } catch (error: any) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

// POST /api/categories - Create a new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, image_url, sort_order } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required fields'
      });
    }

    const id = randomUUID();
    const order = sort_order || 0;

    await pool.execute(
      'INSERT INTO categories (id, name, slug, description, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, slug, description || null, image_url || null, order]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { id, name, slug, description, image_url, sort_order: order }
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// PUT /api/categories/:id - Update an existing category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image_url, sort_order, is_active } = req.body;

    const [existing]: any = await pool.query('SELECT id FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await pool.execute(
      `UPDATE categories 
       SET name = COALESCE(?, name), 
           slug = COALESCE(?, slug), 
           description = COALESCE(?, description), 
           image_url = COALESCE(?, image_url), 
           sort_order = COALESCE(?, sort_order),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name, slug, description, image_url, sort_order, is_active, id]
    );

    res.json({
      success: true,
      message: 'Category updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

// DELETE /api/categories/:id - Delete category (blocked if active products exist)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Check if category exists
    const [categoryRows]: any = await pool.query(
      'SELECT id, name FROM categories WHERE id = ?',
      [id]
    );

    if (categoryRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    const categoryName = categoryRows[0].name;

    // 2. Check for active products belonging to this category
    const [productCountRows]: any = await pool.query(
      'SELECT COUNT(*) AS active_count FROM products WHERE category_id = ? AND is_active = TRUE',
      [id]
    );

    const activeCount = Number(productCountRows[0]?.active_count || 0);

    if (activeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Deleting category "${categoryName}" is not allowed because it contains ${activeCount} active product(s). Please reassign or delete these products first.`,
        active_products_count: activeCount
      });
    }

    // 3. If zero active products, check total products (including archived)
    const [totalCountRows]: any = await pool.query(
      'SELECT COUNT(*) AS total_count FROM products WHERE category_id = ?',
      [id]
    );
    const totalCount = Number(totalCountRows[0]?.total_count || 0);

    if (totalCount === 0) {
      // Safe to permanently delete from database
      await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    } else {
      // Soft-delete if legacy inactive products still reference it
      await pool.execute('UPDATE categories SET is_active = FALSE WHERE id = ?', [id]);
    }

    res.json({
      success: true,
      message: `Category "${categoryName}" deleted successfully.`
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};
