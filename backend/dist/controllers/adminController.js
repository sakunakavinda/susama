"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminSubscribers = exports.deleteReview = exports.updateReviewApproval = exports.getAdminReviews = exports.getAdminProducts = exports.updateOrderStatus = exports.getAdminOrderById = exports.getAdminOrders = exports.getDashboardStats = void 0;
const db_1 = require("../config/db");
// 1. Executive Dashboard KPIs & Analytics
const getDashboardStats = async (req, res) => {
    try {
        // Total Revenue (excluding cancelled orders)
        const [revRows] = await db_1.pool.query(`SELECT COALESCE(SUM(total_amount), 0) AS total_revenue 
       FROM orders 
       WHERE order_status != 'cancelled'`);
        // Total Orders count
        const [orderCountRows] = await db_1.pool.query(`SELECT COUNT(*) AS total_orders FROM orders`);
        // Pending Orders count (needing review/dispatch or bank slip verification)
        const [pendingRows] = await db_1.pool.query(`SELECT COUNT(*) AS pending_orders 
       FROM orders 
       WHERE order_status IN ('pending', 'confirmed') OR payment_status = 'pending_verification'`);
        // Pending Bank Transfers awaiting slip verification
        const [pendingBankRows] = await db_1.pool.query(`SELECT COUNT(*) AS pending_bank_transfers 
       FROM orders 
       WHERE payment_method = 'bank_transfer' AND payment_status = 'pending_verification'`);
        // Total Active Products
        const [prodRows] = await db_1.pool.query(`SELECT COUNT(*) AS total_products FROM products WHERE is_active = TRUE`);
        // Low stock items (stock <= 5)
        const [lowStockRows] = await db_1.pool.query(`SELECT COUNT(*) AS low_stock_count FROM products WHERE stock_quantity <= 5 AND is_active = TRUE`);
        // Total Registered Customers
        const [custRows] = await db_1.pool.query(`SELECT COUNT(*) AS total_customers FROM customers`);
        // Total Newsletter Subscribers
        const [subRows] = await db_1.pool.query(`SELECT COUNT(*) AS total_subscribers FROM newsletter_subscribers WHERE is_active = TRUE`);
        // Recent 6 Orders
        const [recentOrders] = await db_1.pool.query(`SELECT o.id, o.order_number, o.total_amount, o.order_status, o.payment_status, 
              o.payment_method, o.bank_transfer_ref, o.created_at,
              c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       ORDER BY o.created_at DESC
       LIMIT 6`);
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
    }
    catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics', error: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
// 2. Orders Management - List with Filtering, Search & Pagination
const getAdminOrders = async (req, res) => {
    try {
        const { status, payment_status, payment_method, search, limit = '50', offset = '0' } = req.query;
        let whereClause = 'WHERE 1=1';
        const params = [];
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
        const [countRows] = await db_1.pool.query(countQuery, params);
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
        const [orders] = await db_1.pool.query(query, queryParams);
        // Fetch items for each order
        const enrichedOrders = await Promise.all(orders.map(async (order) => {
            const [items] = await db_1.pool.query(`SELECT oi.*, 
                  COALESCE(
                    (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = TRUE LIMIT 1),
                    (SELECT image_url FROM product_images WHERE product_id = oi.product_id LIMIT 1),
                    ''
                  ) AS product_image
           FROM order_items oi
           WHERE oi.order_id = ?`, [order.id]);
            return {
                ...order,
                items
            };
        }));
        return res.json({
            success: true,
            total,
            data: enrichedOrders
        });
    }
    catch (error) {
        console.error('Error fetching admin orders:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
    }
};
exports.getAdminOrders = getAdminOrders;
// 3. Single Order Details
const getAdminOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db_1.pool.query(`SELECT o.*, 
              c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
              c.address_line1, c.address_line2, c.city, c.district, c.postal_code
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.id = ? OR o.order_number = ?
       LIMIT 1`, [id, id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        const order = rows[0];
        const [items] = await db_1.pool.query(`SELECT oi.*, 
              COALESCE(
                (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = TRUE LIMIT 1),
                (SELECT image_url FROM product_images WHERE product_id = oi.product_id LIMIT 1),
                ''
              ) AS product_image
       FROM order_items oi
       WHERE oi.order_id = ?`, [order.id]);
        order.items = items;
        return res.json({
            success: true,
            data: order
        });
    }
    catch (error) {
        console.error('Error fetching single admin order:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.getAdminOrderById = getAdminOrderById;
// 4. Update Order Status & Payment Status
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { order_status, payment_status, admin_notes } = req.body;
        const [existing] = await db_1.pool.query(`SELECT id, order_status, payment_status FROM orders WHERE id = ? OR order_number = ? LIMIT 1`, [id, id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        const orderId = existing[0].id;
        await db_1.pool.query(`UPDATE orders SET 
        order_status = COALESCE(?, order_status),
        payment_status = COALESCE(?, payment_status),
        admin_notes = COALESCE(?, admin_notes),
        updated_at = NOW()
       WHERE id = ?`, [order_status || null, payment_status || null, admin_notes || null, orderId]);
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
    }
    catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ success: false, message: 'Failed to update order', error: error.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
// 5. Admin Products List (Includes inactive, stock counts, full details)
const getAdminProducts = async (req, res) => {
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
        const params = [];
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
        }
        else if (active_status === 'inactive') {
            query += ` AND p.is_active = FALSE`;
        }
        query += ` ORDER BY p.created_at DESC`;
        const [products] = await db_1.pool.query(query, params);
        // Fetch images array for each
        const enriched = await Promise.all(products.map(async (prod) => {
            const [images] = await db_1.pool.query(`SELECT id, image_url, sort_order, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC`, [prod.id]);
            return {
                ...prod,
                images
            };
        }));
        return res.json({
            success: true,
            count: enriched.length,
            data: enriched
        });
    }
    catch (error) {
        console.error('Error fetching admin products:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
    }
};
exports.getAdminProducts = getAdminProducts;
// 6. Admin Reviews Moderation
const getAdminReviews = async (req, res) => {
    try {
        const [reviews] = await db_1.pool.query(`SELECT r.*, p.name AS product_name, p.slug AS product_slug
       FROM reviews r
       LEFT JOIN products p ON r.product_id = p.id
       ORDER BY r.created_at DESC`);
        return res.json({
            success: true,
            data: reviews
        });
    }
    catch (error) {
        console.error('Error fetching admin reviews:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: error.message });
    }
};
exports.getAdminReviews = getAdminReviews;
// 7. Toggle or Update Review Approval
const updateReviewApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_approved } = req.body;
        await db_1.pool.query(`UPDATE reviews SET is_approved = ?, updated_at = NOW() WHERE id = ?`, [is_approved ? 1 : 0, id]);
        return res.json({
            success: true,
            message: `Review approval status updated to ${is_approved ? 'Approved' : 'Pending'}.`
        });
    }
    catch (error) {
        console.error('Error updating review approval:', error);
        return res.status(500).json({ success: false, message: 'Failed to update review', error: error.message });
    }
};
exports.updateReviewApproval = updateReviewApproval;
// 8. Delete Review
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.pool.query(`DELETE FROM reviews WHERE id = ?`, [id]);
        return res.json({
            success: true,
            message: 'Review deleted successfully.'
        });
    }
    catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete review', error: error.message });
    }
};
exports.deleteReview = deleteReview;
// 9. Admin Newsletter Subscribers
const getAdminSubscribers = async (req, res) => {
    try {
        const [rows] = await db_1.pool.query(`SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC`);
        return res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    }
    catch (error) {
        console.error('Error fetching subscribers:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch subscribers', error: error.message });
    }
};
exports.getAdminSubscribers = getAdminSubscribers;
