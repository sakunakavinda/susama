"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyOrders = exports.getOrderByNumber = exports.createOrder = void 0;
const db_1 = require("../config/db");
// 1. Create a new Order
const createOrder = async (req, res) => {
    const connection = await db_1.pool.getConnection();
    try {
        const { customer_name, customer_email, customer_phone, address_line1, address_line2, city, district, postal_code, items, payment_method, bank_transfer_ref, customer_notes } = req.body;
        // Validation
        if (!customer_name || !customer_phone || !address_line1 || !city) {
            return res.status(400).json({
                success: false,
                message: 'Please provide full name, contact phone number, and delivery address.'
            });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Your cart is empty. Please add items before checking out.'
            });
        }
        const validPaymentMethods = ['cod', 'bank_transfer'];
        if (!payment_method || !validPaymentMethods.includes(payment_method)) {
            return res.status(400).json({
                success: false,
                message: 'Please select a valid payment method: Cash on Delivery or Bank Transfer.'
            });
        }
        await connection.beginTransaction();
        // Determine customer ID (Logged in vs Guest)
        let customerId = req.customer?.id;
        if (!customerId) {
            // Check if customer with this email or phone exists
            const cleanEmail = customer_email ? customer_email.trim().toLowerCase() : null;
            const cleanPhone = customer_phone.trim();
            let existingCust = [];
            if (cleanEmail) {
                const [byEmail] = await connection.query(`SELECT id FROM customers WHERE LOWER(email) = ? LIMIT 1`, [cleanEmail]);
                existingCust = byEmail;
            }
            if (existingCust.length === 0 && cleanPhone) {
                const [byPhone] = await connection.query(`SELECT id FROM customers WHERE phone = ? LIMIT 1`, [cleanPhone]);
                existingCust = byPhone;
            }
            if (existingCust.length > 0) {
                customerId = existingCust[0].id;
                // Update customer details if they provided updated address/phone
                await connection.query(`UPDATE customers SET 
            phone = COALESCE(?, phone),
            address_line1 = COALESCE(?, address_line1),
            address_line2 = COALESCE(?, address_line2),
            city = COALESCE(?, city),
            district = COALESCE(?, district),
            postal_code = COALESCE(?, postal_code),
            updated_at = NOW()
           WHERE id = ?`, [cleanPhone, address_line1, address_line2 || null, city, district || null, postal_code || null, customerId]);
            }
            else {
                // Create new guest customer record
                customerId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
                const guestEmail = cleanEmail || `${cleanPhone.replace(/[^0-9]/g, '')}@guest.susama.lk`;
                await connection.query(`INSERT INTO customers (
            id, name, email, phone, address_line1, address_line2, city, district, postal_code, is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())`, [customerId, customer_name.trim(), guestEmail, cleanPhone, address_line1, address_line2 || null, city, district || null, postal_code || null]);
            }
        }
        else {
            // Update logged in customer's profile with latest delivery details if empty or provided
            await connection.query(`UPDATE customers SET 
          phone = COALESCE(?, phone),
          address_line1 = COALESCE(?, address_line1),
          address_line2 = COALESCE(?, address_line2),
          city = COALESCE(?, city),
          district = COALESCE(?, district),
          postal_code = COALESCE(?, postal_code),
          updated_at = NOW()
         WHERE id = ?`, [customer_phone, address_line1, address_line2 || null, city, district || null, postal_code || null, customerId]);
        }
        // Calculate subtotal from line items
        let subtotal = 0;
        const orderItemsData = items.map((item) => {
            const unitPrice = Number(item.price) || 0;
            const quantity = Math.max(1, Number(item.quantity) || 1);
            const lineTotal = unitPrice * quantity;
            subtotal += lineTotal;
            return {
                product_id: String(item.id),
                product_name: String(item.name),
                unit_price: unitPrice,
                quantity,
                line_total: lineTotal
            };
        });
        // Check store settings for free delivery threshold & fee
        const [settingsRows] = await connection.query(`SELECT setting_key, setting_value FROM store_settings WHERE setting_key IN ('free_shipping_threshold', 'standard_shipping_fee')`);
        let freeThreshold = 7500;
        let standardFee = 450;
        if (settingsRows && settingsRows.length > 0) {
            settingsRows.forEach((r) => {
                if (r.setting_key === 'free_shipping_threshold')
                    freeThreshold = Number(r.setting_value) || 7500;
                if (r.setting_key === 'standard_shipping_fee')
                    standardFee = Number(r.setting_value) || 450;
            });
        }
        const shippingFee = subtotal >= freeThreshold ? 0 : standardFee;
        const discountAmount = 0; // Can be wired to coupons
        const totalAmount = subtotal + shippingFee - discountAmount;
        // Generate Luxury Order Reference Number e.g. SUS-84920
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const orderNumber = `SUS-${new Date().getFullYear().toString().slice(-2)}${randomNum}`;
        const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        // Insert order record
        await connection.query(`INSERT INTO orders (
        id, customer_id, order_number, subtotal, discount_amount, shipping_fee, total_amount,
        order_status, payment_status, payment_method, bank_transfer_ref, customer_notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, NOW(), NOW())`, [
            orderId,
            customerId,
            orderNumber,
            subtotal,
            discountAmount,
            shippingFee,
            totalAmount,
            payment_method === 'cod' ? 'unpaid' : 'pending_verification',
            payment_method,
            bank_transfer_ref?.trim() || null,
            customer_notes?.trim() || null
        ]);
        // Insert order items with product_id verification
        for (const item of orderItemsData) {
            let resolvedProductId = item.product_id;
            const [pCheck] = await connection.query(`SELECT id FROM products WHERE id = ? LIMIT 1`, [resolvedProductId]);
            if (!pCheck || pCheck.length === 0) {
                // Fallback: check by product name
                const [byName] = await connection.query(`SELECT id FROM products WHERE name LIKE ? LIMIT 1`, [`%${item.product_name}%`]);
                if (byName && byName.length > 0) {
                    resolvedProductId = byName[0].id;
                }
                else {
                    const [anyProd] = await connection.query(`SELECT id FROM products LIMIT 1`);
                    if (anyProd && anyProd.length > 0) {
                        resolvedProductId = anyProd[0].id;
                    }
                }
            }
            const orderItemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            await connection.query(`INSERT INTO order_items (
          id, order_id, product_id, product_name, unit_price, quantity, line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`, [orderItemId, orderId, resolvedProductId, item.product_name, item.unit_price, item.quantity, item.line_total]);
        }
        await connection.commit();
        return res.status(201).json({
            success: true,
            message: 'Your order has been placed successfully!',
            data: {
                order_id: orderId,
                order_number: orderNumber,
                subtotal,
                shipping_fee: shippingFee,
                total_amount: totalAmount,
                payment_method,
                customer_name,
                customer_phone,
                address: `${address_line1}, ${city}`,
                items_count: orderItemsData.length,
                created_at: new Date().toISOString()
            }
        });
    }
    catch (error) {
        await connection.rollback();
        console.error('Error creating order:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to place order. Please try again.',
            error: error.message
        });
    }
    finally {
        connection.release();
    }
};
exports.createOrder = createOrder;
// 2. Get Single Order by Order Number (for receipt screen)
const getOrderByNumber = async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const [orders] = await db_1.pool.query(`SELECT o.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
              c.address_line1, c.address_line2, c.city, c.district, c.postal_code
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.order_number = ? LIMIT 1`, [orderNumber]);
        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        const order = orders[0];
        // Fetch order items
        const [items] = await db_1.pool.query(`SELECT oi.*, p.primary_image, p.slug
       FROM order_items oi
       LEFT JOIN (
         SELECT p.id, p.slug, pi.image_url as primary_image
         FROM products p
         LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
       ) p ON oi.product_id = p.id
       WHERE oi.order_id = ?`, [order.id]);
        return res.json({
            success: true,
            data: {
                ...order,
                items
            }
        });
    }
    catch (error) {
        console.error('Error fetching order by number:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.getOrderByNumber = getOrderByNumber;
// 3. Get Orders for Logged In Customer (for Profile Dashboard)
const getMyOrders = async (req, res) => {
    try {
        const customerId = req.customer?.id;
        if (!customerId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const [orders] = await db_1.pool.query(`SELECT id, order_number, subtotal, shipping_fee, total_amount, order_status, payment_status, payment_method, created_at
       FROM orders 
       WHERE customer_id = ?
       ORDER BY created_at DESC`, [customerId]);
        // Fetch items for each order
        const enrichedOrders = await Promise.all(orders.map(async (order) => {
            const [items] = await db_1.pool.query(`SELECT id, product_name, unit_price, quantity, line_total FROM order_items WHERE order_id = ?`, [order.id]);
            return {
                ...order,
                items
            };
        }));
        return res.json({
            success: true,
            data: enrichedOrders
        });
    }
    catch (error) {
        console.error('Error fetching customer orders:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.getMyOrders = getMyOrders;
