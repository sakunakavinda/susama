"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductByIdOrSlug = exports.getProducts = void 0;
const db_1 = require("../config/db");
const crypto_1 = require("crypto");
// GET /api/products - Get products with optional category, search, and featured filters
const getProducts = async (req, res) => {
    try {
        const { category, featured, new_arrival, search, sort, limit = '50', offset = '0' } = req.query;
        let query = `
      SELECT 
        p.id,
        p.category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        p.name,
        p.slug,
        p.sku,
        p.short_description,
        p.full_description,
        p.ingredients,
        p.how_to_use,
        p.base_price,
        p.sale_price,
        p.stock_quantity,
        p.is_in_stock,
        p.is_featured,
        p.is_new_arrival,
        p.is_active,
        p.created_at,
        p.updated_at,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1),
          (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1),
          ''
        ) AS primary_image
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE AND c.is_active = TRUE
    `;
        const queryParams = [];
        if (category) {
            query += ` AND (c.id = ? OR c.slug = ?)`;
            queryParams.push(category, category);
        }
        if (featured === 'true' || featured === '1') {
            query += ` AND p.is_featured = TRUE`;
        }
        if (new_arrival === 'true' || new_arrival === '1') {
            query += ` AND p.is_new_arrival = TRUE`;
        }
        if (search && typeof search === 'string' && search.trim() !== '') {
            query += ` AND (p.name LIKE ? OR p.short_description LIKE ? OR p.full_description LIKE ?)`;
            const term = `%${search.trim()}%`;
            queryParams.push(term, term, term);
        }
        // Sort options
        switch (sort) {
            case 'price_asc':
                query += ` ORDER BY COALESCE(p.sale_price, p.base_price) ASC`;
                break;
            case 'price_desc':
                query += ` ORDER BY COALESCE(p.sale_price, p.base_price) DESC`;
                break;
            case 'name_asc':
                query += ` ORDER BY p.name ASC`;
                break;
            case 'newest':
                query += ` ORDER BY p.created_at DESC`;
                break;
            default:
                query += ` ORDER BY p.is_featured DESC, p.created_at DESC`;
                break;
        }
        query += ` LIMIT ? OFFSET ?`;
        queryParams.push(Number(limit) || 50, Number(offset) || 0);
        const [rows] = await db_1.pool.query(query, queryParams);
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};
exports.getProducts = getProducts;
// GET /api/products/:id - Get a single product by ID or slug
const getProductByIdOrSlug = async (req, res) => {
    try {
        const { id } = req.params;
        const [productRows] = await db_1.pool.query(`SELECT 
        p.*,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE (p.id = ? OR p.slug = ?) AND p.is_active = TRUE
      LIMIT 1`, [id, id]);
        if (productRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        const product = productRows[0];
        // Fetch product images
        const [images] = await db_1.pool.query(`SELECT id, image_url, sort_order, is_primary 
       FROM product_images 
       WHERE product_id = ? 
       ORDER BY is_primary DESC, sort_order ASC`, [product.id]);
        product.images = images;
        product.primary_image = images.length > 0 ? images[0].image_url : null;
        res.json({
            success: true,
            data: product
        });
    }
    catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
};
exports.getProductByIdOrSlug = getProductByIdOrSlug;
// POST /api/products - Create a new product
const createProduct = async (req, res) => {
    const connection = await db_1.pool.getConnection();
    try {
        const { category_id, name, slug, sku, short_description, full_description, ingredients, how_to_use, base_price, sale_price, stock_quantity, is_in_stock = true, is_featured = false, is_new_arrival = false, images = [] } = req.body;
        if (!category_id || !name || !slug || base_price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'category_id, name, slug, and base_price are required fields'
            });
        }
        const productId = (0, crypto_1.randomUUID)();
        await connection.beginTransaction();
        await connection.execute(`INSERT INTO products (
        id, category_id, name, slug, sku, short_description, full_description, 
        ingredients, how_to_use, base_price, sale_price, stock_quantity, 
        is_in_stock, is_featured, is_new_arrival, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`, [
            productId,
            category_id,
            name,
            slug,
            sku || null,
            short_description || null,
            full_description || null,
            ingredients || null,
            how_to_use || null,
            base_price,
            sale_price || null,
            stock_quantity || 0,
            is_in_stock,
            is_featured,
            is_new_arrival
        ]);
        // Insert images if provided
        if (Array.isArray(images) && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                const imgUrl = typeof img === 'string' ? img : img.image_url;
                const isPrimary = i === 0 || (typeof img === 'object' && img.is_primary);
                await connection.execute(`INSERT INTO product_images (id, product_id, image_url, sort_order, is_primary)
           VALUES (?, ?, ?, ?, ?)`, [(0, crypto_1.randomUUID)(), productId, imgUrl, i, isPrimary]);
            }
        }
        await connection.commit();
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { id: productId, name, slug }
        });
    }
    catch (error) {
        await connection.rollback();
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
    finally {
        connection.release();
    }
};
exports.createProduct = createProduct;
// PUT /api/products/:id - Update product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, name, slug, sku, short_description, full_description, ingredients, how_to_use, base_price, sale_price, stock_quantity, is_in_stock, is_featured, is_new_arrival, is_active } = req.body;
        const [existing] = await db_1.pool.query('SELECT id FROM products WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        await db_1.pool.execute(`UPDATE products
       SET category_id = COALESCE(?, category_id),
           name = COALESCE(?, name),
           slug = COALESCE(?, slug),
           sku = COALESCE(?, sku),
           short_description = COALESCE(?, short_description),
           full_description = COALESCE(?, full_description),
           ingredients = COALESCE(?, ingredients),
           how_to_use = COALESCE(?, how_to_use),
           base_price = COALESCE(?, base_price),
           sale_price = COALESCE(?, sale_price),
           stock_quantity = COALESCE(?, stock_quantity),
           is_in_stock = COALESCE(?, is_in_stock),
           is_featured = COALESCE(?, is_featured),
           is_new_arrival = COALESCE(?, is_new_arrival),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`, [
            category_id,
            name,
            slug,
            sku,
            short_description,
            full_description,
            ingredients,
            how_to_use,
            base_price,
            sale_price,
            stock_quantity,
            is_in_stock,
            is_featured,
            is_new_arrival,
            is_active,
            id
        ]);
        res.json({
            success: true,
            message: 'Product updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
};
exports.updateProduct = updateProduct;
// DELETE /api/products/:id - Soft delete product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.pool.execute('UPDATE products SET is_active = FALSE WHERE id = ?', [id]);
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
};
exports.deleteProduct = deleteProduct;
