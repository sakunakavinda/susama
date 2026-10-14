import { Request, Response } from 'express';
import { pool } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// 1. Executive Dashboard KPIs & Analytics
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Total Revenue (excluding cancelled orders)
    const [revRows]: any = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_revenue 
       FROM orders 
       WHERE order_status != 'cancelled'`
    );

    // Total Orders count
    const [orderCountRows]: any = await pool.query(
      `SELECT COUNT(*) AS total_orders FROM orders`
    );

    // Pending Orders count (needing review/dispatch or bank slip verification)
    const [pendingRows]: any = await pool.query(
      `SELECT COUNT(*) AS pending_orders 
       FROM orders 
       WHERE order_status IN ('pending', 'confirmed') OR payment_status = 'pending_verification'`
    );

    // Pending Bank Transfers awaiting slip verification
    const [pendingBankRows]: any = await pool.query(
      `SELECT COUNT(*) AS pending_bank_transfers 
       FROM orders 
       WHERE payment_method = 'bank_transfer' AND payment_status = 'pending_verification'`
    );

    // Total Active Products
    const [prodRows]: any = await pool.query(
      `SELECT COUNT(*) AS total_products FROM products WHERE is_active = TRUE`
    );

    // Low stock items (stock <= 5)
    const [lowStockRows]: any = await pool.query(
      `SELECT COUNT(*) AS low_stock_count FROM products WHERE stock_quantity <= 5 AND is_active = TRUE`
    );

    // Total Registered Customers
    const [custRows]: any = await pool.query(
      `SELECT COUNT(*) AS total_customers FROM customers`
    );

    // Total Newsletter Subscribers
    const [subRows]: any = await pool.query(
      `SELECT COUNT(*) AS total_subscribers FROM newsletter_subscribers WHERE is_active = TRUE`
    );

    // Recent 6 Orders
    const [recentOrders]: any = await pool.query(
      `SELECT o.id, o.order_number, o.total_amount, o.order_status, o.payment_status, 
              o.payment_method, o.bank_transfer_ref, o.created_at,
              c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       ORDER BY o.created_at DESC
       LIMIT 6`
    );

    return res.json({
      success: true,
      data: {
        total_revenue: Number(revRows[0]?.total_revenue || 0),
        total_orders: Number(orderCountRows[0]?.total_orders || 0),
        pending_orders: Number(pendingRows[0]?.pending_orders || 0),
        pending_bank_transfers: Number(pendingBankRows[0]?.pending_bank_transfers || 0),
        total_products: Number(prodRows[0]?.total_products || 0),
        low_stock_count: Number(lowStockRows[0]?.low_stock_count || 0),
        total_customers: Number(custRows[0]?.total_customers || 0),
        total_subscribers: Number(subRows[0]?.total_subscribers || 0),
        recent_orders: recentOrders
      }
    });
  } catch (error: any) {
    console.error('Error fetching admin dashboard stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics', error: error.message });
  }
};

// 2. Orders Management - List with Filtering, Search & Pagination
export const getAdminOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, payment_status, payment_method, search, limit = '50', offset = '0' } = req.query;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      whereClause += ` AND o.order_status = ?`;
      params.push(status);
    }

    if (payment_status && payment_status !== 'all') {
      whereClause += ` AND o.payment_status = ?`;
      params.push(payment_status);
    }

    if (payment_method && payment_method !== 'all') {
      whereClause += ` AND o.payment_method = ?`;
      params.push(payment_method);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      whereClause += ` AND (o.order_number LIKE ? OR c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ? OR o.bank_transfer_ref LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    // Count total matching
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ${whereClause}
    `;
    const [countRows]: any = await pool.query(countQuery, params);
    const total = countRows[0]?.total || 0;

    // Fetch orders
    const query = `
      SELECT o.*, 
             c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
             c.address_line1, c.address_line2, c.city, c.district, c.postal_code
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const queryParams = [...params, Number(limit) || 50, Number(offset) || 0];
    const [orders]: any = await pool.query(query, queryParams);

    // Fetch items for each order
    const enrichedOrders = await Promise.all(
      orders.map(async (order: any) => {
        const [items]: any = await pool.query(
          `SELECT oi.*, 
                  COALESCE(
                    (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = TRUE LIMIT 1),
                    (SELECT image_url FROM product_images WHERE product_id = oi.product_id LIMIT 1),
                    ''
                  ) AS product_image
           FROM order_items oi
           WHERE oi.order_id = ?`,
          [order.id]
        );
        return {
          ...order,
          items
        };
      })
    );

    return res.json({
      success: true,
      total,
      data: enrichedOrders
    });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
};

// 3. Single Order Details
export const getAdminOrderById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [rows]: any = await pool.query(
      `SELECT o.*, 
              c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
              c.address_line1, c.address_line2, c.city, c.district, c.postal_code
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.id = ? OR o.order_number = ?
       LIMIT 1`,
      [id, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = rows[0];

    const [items]: any = await pool.query(
      `SELECT oi.*, 
              COALESCE(
                (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = TRUE LIMIT 1),
                (SELECT image_url FROM product_images WHERE product_id = oi.product_id LIMIT 1),
                ''
              ) AS product_image
       FROM order_items oi
       WHERE oi.order_id = ?`,
      [order.id]
    );

    order.items = items;

    return res.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    console.error('Error fetching single admin order:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 4. Update Order Status & Payment Status
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status, admin_notes } = req.body;

    const [existing]: any = await pool.query(
      `SELECT id, order_status, payment_status FROM orders WHERE id = ? OR order_number = ? LIMIT 1`,
      [id, id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const orderId = existing[0].id;

    await pool.query(
      `UPDATE orders SET 
        order_status = COALESCE(?, order_status),
        payment_status = COALESCE(?, payment_status),
        admin_notes = COALESCE(?, admin_notes),
        updated_at = NOW()
       WHERE id = ?`,
      [order_status || null, payment_status || null, admin_notes || null, orderId]
    );

    return res.json({
      success: true,
      message: 'Order updated successfully!',
      data: {
        order_id: orderId,
        order_status,
        payment_status,
        admin_notes
      }
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order', error: error.message });
  }
};

// 5. Admin Products List (Includes inactive, stock counts, full details)
export const getAdminProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, category, active_status } = req.query;

    let query = `
      SELECT 
        p.*,
        c.name AS category_name,
        c.slug AS category_slug,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1),
          (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1),
          ''
        ) AS primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && typeof search === 'string' && search.trim() !== '') {
      query += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.slug LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (category && category !== 'all') {
      query += ` AND (p.category_id = ? OR c.slug = ?)`;
      params.push(category, category);
    }

    if (active_status === 'active') {
      query += ` AND p.is_active = TRUE`;
    } else if (active_status === 'inactive') {
      query += ` AND p.is_active = FALSE`;
    }

    query += ` ORDER BY p.created_at DESC`;

    const [products]: any = await pool.query(query, params);

    // Fetch images array for each
    const enriched = await Promise.all(
      products.map(async (prod: any) => {
        const [images]: any = await pool.query(
          `SELECT id, image_url, sort_order, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC`,
          [prod.id]
        );
        return {
          ...prod,
          images
        };
      })
    );

    return res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (error: any) {
    console.error('Error fetching admin products:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
};

// 6. Admin Reviews Moderation
export const getAdminReviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [reviews]: any = await pool.query(
      `SELECT r.*, p.name AS product_name, p.slug AS product_slug
       FROM reviews r
       LEFT JOIN products p ON r.product_id = p.id
       ORDER BY r.created_at DESC`
    );

    return res.json({
      success: true,
      data: reviews
    });
  } catch (error: any) {
    console.error('Error fetching admin reviews:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: error.message });
  }
};

// 7. Toggle or Update Review Approval
export const updateReviewApproval = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_approved } = req.body;

    await pool.query(
      `UPDATE reviews SET is_approved = ?, updated_at = NOW() WHERE id = ?`,
      [is_approved ? 1 : 0, id]
    );

    return res.json({
      success: true,
      message: `Review approval status updated to ${is_approved ? 'Approved' : 'Pending'}.`
    });
  } catch (error: any) {
    console.error('Error updating review approval:', error);
    return res.status(500).json({ success: false, message: 'Failed to update review', error: error.message });
  }
};

// 8. Delete Review
export const deleteReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM reviews WHERE id = ?`, [id]);

    return res.json({
      success: true,
      message: 'Review deleted successfully.'
    });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete review', error: error.message });
  }
};

// 9. Admin Newsletter Subscribers
export const getAdminSubscribers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC`
    );

    return res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch subscribers', error: error.message });
  }
};
