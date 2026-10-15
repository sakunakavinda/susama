import { Request, Response } from 'express';
import { pool } from '../config/db';
import { randomUUID } from 'crypto';

// GET /api/products - Get products with optional category, search, and featured filters
export const getProducts = async (req: Request, res: Response) => {
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
        p.display_on_home,
        p.tag,
        p.rating,
        p.reviews,
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

    const queryParams: any[] = [];

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

    const [rows]: any = await pool.query(query, queryParams);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// GET /api/products/:id - Get a single product by ID or slug
export const getProductByIdOrSlug = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [productRows]: any = await pool.query(
      `SELECT 
        p.*,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE (p.id = ? OR p.slug = ?) AND p.is_active = TRUE
      LIMIT 1`,
      [id, id]
    );

    if (productRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = productRows[0];

    // Fetch product images
    const [images]: any = await pool.query(
      `SELECT id, image_url, sort_order, is_primary 
       FROM product_images 
       WHERE product_id = ? 
       ORDER BY is_primary DESC, sort_order ASC`,
      [product.id]
    );

    product.images = images;
    product.primary_image = images.length > 0 ? images[0].image_url : null;

    res.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// POST /api/products - Create a new product
export const createProduct = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const {
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
      is_in_stock = true,
      is_featured = false,
      is_new_arrival = false,
      display_on_home = true,
      tag = null,
      rating = 5.0,
      reviews = 0,
      images = []
    } = req.body;

    if (!category_id || !name || !slug || base_price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Category, Product Name, URL Slug, and Base Price are required.'
      });
    }

    const basePriceNum = Number(base_price);
    if (isNaN(basePriceNum) || basePriceNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Base Price greater than 0.'
      });
    }

    // 1. Validation: Sale price cannot be higher than base price
    let cleanSalePrice: number | null = null;
    if (sale_price !== null && sale_price !== undefined && String(sale_price).trim() !== '') {
      cleanSalePrice = Number(sale_price);
      if (isNaN(cleanSalePrice) || cleanSalePrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Sale price must be a valid number.'
        });
      }
      if (cleanSalePrice > basePriceNum) {
        return res.status(400).json({
          success: false,
          message: `Sale price (LKR ${cleanSalePrice}) cannot be set higher than the base price (LKR ${basePriceNum}).`
        });
      }
    }

    // 2. Validation: Short description, Full description, and Ingredients are compulsory
    if (!short_description || typeof short_description !== 'string' || !short_description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Short description is compulsory.'
      });
    }

    if (!full_description || typeof full_description !== 'string' || !full_description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full description is compulsory.'
      });
    }

    if (!ingredients || typeof ingredients !== 'string' || !ingredients.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Ingredients list is compulsory.'
      });
    }

    const productId = randomUUID();

    await connection.beginTransaction();

    await connection.execute(
      `INSERT INTO products (
        id, category_id, name, slug, sku, short_description, full_description, 
        ingredients, how_to_use, base_price, sale_price, stock_quantity, 
        is_in_stock, is_featured, is_new_arrival, display_on_home, tag, rating, reviews, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        productId,
        category_id,
        name.trim(),
        slug.trim(),
        sku ? sku.trim() : null,
        short_description.trim(),
        full_description.trim(),
        ingredients.trim(),
        how_to_use ? how_to_use.trim() : null,
        basePriceNum,
        cleanSalePrice,
        Number(stock_quantity) || 0,
        Boolean(is_in_stock),
        Boolean(is_featured),
        Boolean(is_new_arrival),
        Boolean(display_on_home),
        tag ? tag.trim() : null,
        Number(rating) || 5.0,
        Number(reviews) || 0
      ]
    );

    // Insert images if provided
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgUrl = typeof img === 'string' ? img : img.image_url;
        const isPrimary = i === 0 || (typeof img === 'object' && img.is_primary);
        await connection.execute(
          `INSERT INTO product_images (id, product_id, image_url, sort_order, is_primary)
           VALUES (?, ?, ?, ?, ?)`,
          [randomUUID(), productId, imgUrl, i, isPrimary]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { id: productId, name, slug }
    });
  } catch (error: any) {
    await connection.rollback();
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// PUT /api/products/:id - Update product
export const updateProduct = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const {
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
      display_on_home,
      tag,
      rating,
      reviews,
      is_active,
      images
    } = req.body;

    const [existing]: any = await connection.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const currentProd = existing[0];

    // Determine effective prices and validate sale_price <= base_price
    const effectiveBase = base_price !== undefined ? Number(base_price) : Number(currentProd.base_price);
    let effectiveSale = currentProd.sale_price !== null ? Number(currentProd.sale_price) : null;

    if (sale_price !== undefined) {
      if (sale_price === null || sale_price === '' || sale_price === 0) {
        effectiveSale = null;
      } else {
        effectiveSale = Number(sale_price);
      }
    }

    if (effectiveSale !== null && effectiveSale > effectiveBase) {
      return res.status(400).json({
        success: false,
        message: `Sale price (LKR ${effectiveSale}) cannot be set higher than the base price (LKR ${effectiveBase}).`
      });
    }

    // Compulsory field validations if updating them
    if (short_description !== undefined && (!short_description || !String(short_description).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Short description is compulsory.'
      });
    }

    if (full_description !== undefined && (!full_description || !String(full_description).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Full description is compulsory.'
      });
    }

    if (ingredients !== undefined && (!ingredients || !String(ingredients).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Ingredients list is compulsory.'
      });
    }

    await connection.beginTransaction();

    await connection.execute(
      `UPDATE products
       SET category_id = COALESCE(?, category_id),
           name = COALESCE(?, name),
           slug = COALESCE(?, slug),
           sku = COALESCE(?, sku),
           short_description = COALESCE(?, short_description),
           full_description = COALESCE(?, full_description),
           ingredients = COALESCE(?, ingredients),
           how_to_use = COALESCE(?, how_to_use),
           base_price = COALESCE(?, base_price),
           sale_price = ?,
           stock_quantity = COALESCE(?, stock_quantity),
           is_in_stock = COALESCE(?, is_in_stock),
           is_featured = COALESCE(?, is_featured),
           is_new_arrival = COALESCE(?, is_new_arrival),
           display_on_home = COALESCE(?, display_on_home),
           tag = COALESCE(?, tag),
           rating = COALESCE(?, rating),
           reviews = COALESCE(?, reviews),
           is_active = COALESCE(?, is_active),
           updated_at = NOW()
       WHERE id = ?`,
      [
        category_id,
        name ? String(name).trim() : null,
        slug ? String(slug).trim() : null,
        sku !== undefined ? (sku ? String(sku).trim() : null) : null,
        short_description ? String(short_description).trim() : null,
        full_description ? String(full_description).trim() : null,
        ingredients ? String(ingredients).trim() : null,
        how_to_use !== undefined ? (how_to_use ? String(how_to_use).trim() : null) : null,
        base_price !== undefined ? Number(base_price) : null,
        effectiveSale,
        stock_quantity !== undefined ? Number(stock_quantity) : null,
        is_in_stock !== undefined ? Boolean(is_in_stock) : null,
        is_featured !== undefined ? Boolean(is_featured) : null,
        is_new_arrival !== undefined ? Boolean(is_new_arrival) : null,
        display_on_home !== undefined ? Boolean(display_on_home) : null,
        tag !== undefined ? (tag ? String(tag).trim() : null) : null,
        rating !== undefined ? Number(rating) : null,
        reviews !== undefined ? Number(reviews) : null,
        is_active !== undefined ? Boolean(is_active) : null,
        id
      ]
    );

    // Update product_images if images array provided
    if (images !== undefined && Array.isArray(images)) {
      await connection.execute(`DELETE FROM product_images WHERE product_id = ?`, [id]);

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgUrl = typeof img === 'string' ? img : img.image_url;
        if (imgUrl && imgUrl.trim()) {
          const isPrimary = i === 0 || (typeof img === 'object' && img.is_primary);
          await connection.execute(
            `INSERT INTO product_images (id, product_id, image_url, sort_order, is_primary)
             VALUES (?, ?, ?, ?, ?)`,
            [randomUUID(), id, imgUrl.trim(), i, isPrimary ? 1 : 0]
          );
        }
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error: any) {
    await connection.rollback();
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// DELETE /api/products/:id - Soft delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('UPDATE products SET is_active = FALSE WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};
