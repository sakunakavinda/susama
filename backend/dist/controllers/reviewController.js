"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviews = exports.createReview = exports.createProductReview = exports.getProductReviews = exports.createOverallReview = exports.getOverallReviews = void 0;
const db_1 = require("../config/db");
const crypto_1 = require("crypto");
// GET /api/reviews/overall - Get overall brand reviews and calculated average rating math
const getOverallReviews = async (req, res) => {
    try {
        const { limit = '20', offset = '0' } = req.query;
        // 1. Math calculation for Overall Store Rating
        const [statsRows] = await db_1.pool.query(`
      SELECT 
        ROUND(AVG(rating), 1) AS average_rating,
        COUNT(*) AS total_reviews,
        ROUND((SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) / COUNT(*)) * 100) AS recommendation_percentage,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS count_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS count_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS count_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS count_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS count_1
      FROM reviews
      WHERE review_type = 'overall' AND is_approved = TRUE
    `);
        const stats = statsRows[0] || {};
        const totalReviews = Number(stats.total_reviews) || 0;
        const averageRating = totalReviews > 0 ? Number(stats.average_rating) || 5.0 : 5.0;
        const recommendationPercentage = totalReviews > 0 ? Number(stats.recommendation_percentage) || 100 : 100;
        const ratingBreakdown = {
            5: Number(stats.count_5) || 0,
            4: Number(stats.count_4) || 0,
            3: Number(stats.count_3) || 0,
            2: Number(stats.count_2) || 0,
            1: Number(stats.count_1) || 0
        };
        // 2. Fetch overall reviews list
        const [reviews] = await db_1.pool.query(`SELECT id, customer_name, customer_email, rating, title, comment, is_verified_purchase, helpful_count, created_at
       FROM reviews
       WHERE review_type = 'overall' AND is_approved = TRUE
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`, [Number(limit) || 20, Number(offset) || 0]);
        res.json({
            success: true,
            stats: {
                average_rating: averageRating,
                total_reviews: totalReviews,
                recommendation_percentage: recommendationPercentage,
                rating_breakdown: ratingBreakdown
            },
            data: reviews
        });
    }
    catch (error) {
        console.error('Error fetching overall reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch overall reviews',
            error: error.message
        });
    }
};
exports.getOverallReviews = getOverallReviews;
// POST /api/reviews/overall - Submit an overall brand review
const createOverallReview = async (req, res) => {
    try {
        const { customer_name, customer_email, rating, title, comment } = req.body;
        if (!customer_name || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: customer_name, rating, and comment are required'
            });
        }
        const numRating = Number(rating);
        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be an integer between 1 and 5'
            });
        }
        const reviewId = (0, crypto_1.randomUUID)();
        await db_1.pool.query(`INSERT INTO reviews (id, product_id, review_type, customer_name, customer_email, rating, title, comment, is_verified_purchase, is_approved)
       VALUES (?, NULL, 'overall', ?, ?, ?, ?, ?, TRUE, TRUE)`, [reviewId, customer_name.trim(), customer_email?.trim() || null, numRating, title?.trim() || null, comment.trim()]);
        // Calculate updated overall math
        const [updatedStats] = await db_1.pool.query(`
      SELECT 
        ROUND(AVG(rating), 1) AS average_rating,
        COUNT(*) AS total_reviews
      FROM reviews
      WHERE review_type = 'overall' AND is_approved = TRUE
    `);
        res.status(201).json({
            success: true,
            message: 'Overall brand review submitted successfully',
            data: {
                id: reviewId,
                customer_name,
                rating: numRating,
                title,
                comment
            },
            stats: updatedStats[0]
        });
    }
    catch (error) {
        console.error('Error submitting overall review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit overall review',
            error: error.message
        });
    }
};
exports.createOverallReview = createOverallReview;
// GET /api/reviews/product/:productId - Get product-specific reviews & calculated rating math
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        // Check if productId is UUID or slug
        const [productRows] = await db_1.pool.query(`SELECT id, name, slug, rating, reviews FROM products WHERE id = ? OR slug = ? LIMIT 1`, [productId, productId]);
        if (productRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const product = productRows[0];
        // 1. Math calculation for Product Rating
        const [statsRows] = await db_1.pool.query(`
      SELECT 
        ROUND(AVG(rating), 1) AS average_rating,
        COUNT(*) AS total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS count_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS count_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS count_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS count_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS count_1
      FROM reviews
      WHERE product_id = ? AND review_type = 'product' AND is_approved = TRUE
    `, [product.id]);
        const stats = statsRows[0] || {};
        const totalReviews = Number(stats.total_reviews) || 0;
        const averageRating = totalReviews > 0 ? Number(stats.average_rating) || 5.0 : 5.0;
        const ratingBreakdown = {
            5: Number(stats.count_5) || 0,
            4: Number(stats.count_4) || 0,
            3: Number(stats.count_3) || 0,
            2: Number(stats.count_2) || 0,
            1: Number(stats.count_1) || 0
        };
        // 2. Fetch product reviews
        const [reviews] = await db_1.pool.query(`SELECT id, customer_name, rating, title, comment, is_verified_purchase, helpful_count, created_at
       FROM reviews
       WHERE product_id = ? AND review_type = 'product' AND is_approved = TRUE
       ORDER BY created_at DESC`, [product.id]);
        res.json({
            success: true,
            product: {
                id: product.id,
                name: product.name,
                slug: product.slug,
                average_rating: averageRating,
                total_reviews: totalReviews,
                rating_breakdown: ratingBreakdown
            },
            data: reviews
        });
    }
    catch (error) {
        console.error('Error fetching product reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product reviews',
            error: error.message
        });
    }
};
exports.getProductReviews = getProductReviews;
// POST /api/reviews/product - Submit a product rating & review
const createProductReview = async (req, res) => {
    try {
        const { product_id, customer_name, customer_email, rating, title, comment } = req.body;
        if (!product_id || !customer_name || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: product_id, customer_name, rating, comment are required'
            });
        }
        const numRating = Number(rating);
        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be an integer between 1 and 5'
            });
        }
        // Verify product exists
        const [productRows] = await db_1.pool.query(`SELECT id, name FROM products WHERE id = ? LIMIT 1`, [product_id]);
        if (productRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const reviewId = (0, crypto_1.randomUUID)();
        await db_1.pool.query(`INSERT INTO reviews (id, product_id, review_type, customer_name, customer_email, rating, title, comment, is_verified_purchase, is_approved)
       VALUES (?, ?, 'product', ?, ?, ?, ?, ?, TRUE, TRUE)`, [reviewId, product_id, customer_name.trim(), customer_email?.trim() || null, numRating, title?.trim() || null, comment.trim()]);
        // Sync product aggregated rating & reviews count
        await db_1.pool.query(`UPDATE products 
       SET 
         rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = ? AND review_type = 'product' AND is_approved = TRUE),
         reviews = (SELECT COUNT(*) FROM reviews WHERE product_id = ? AND review_type = 'product' AND is_approved = TRUE)
       WHERE id = ?`, [product_id, product_id, product_id]);
        // Return the updated product stats
        const [updatedProduct] = await db_1.pool.query(`SELECT id, name, rating, reviews FROM products WHERE id = ?`, [product_id]);
        res.status(201).json({
            success: true,
            message: 'Product review submitted successfully',
            data: {
                id: reviewId,
                product_id,
                customer_name,
                rating: numRating,
                title,
                comment
            },
            product: updatedProduct[0]
        });
    }
    catch (error) {
        console.error('Error creating product review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product review',
            error: error.message
        });
    }
};
exports.createProductReview = createProductReview;
// POST /api/reviews - Universal review submission handler
const createReview = async (req, res) => {
    if (req.body.product_id) {
        return (0, exports.createProductReview)(req, res);
    }
    else {
        return (0, exports.createOverallReview)(req, res);
    }
};
exports.createReview = createReview;
// GET /api/reviews - General listing with optional type and product_id filters
const getReviews = async (req, res) => {
    try {
        const { type, product_id, limit = '50', offset = '0' } = req.query;
        let query = `
      SELECT 
        r.id,
        r.product_id,
        r.review_type,
        p.name AS product_name,
        p.slug AS product_slug,
        r.customer_name,
        r.customer_email,
        r.rating,
        r.title,
        r.comment,
        r.is_verified_purchase,
        r.helpful_count,
        r.created_at
      FROM reviews r
      LEFT JOIN products p ON r.product_id = p.id
      WHERE r.is_approved = TRUE
    `;
        const queryParams = [];
        if (type) {
            query += ` AND r.review_type = ?`;
            queryParams.push(type);
        }
        if (product_id) {
            query += ` AND (r.product_id = ? OR p.slug = ?)`;
            queryParams.push(product_id, product_id);
        }
        query += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
        queryParams.push(Number(limit) || 50, Number(offset) || 0);
        const [rows] = await db_1.pool.query(query, queryParams);
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    }
    catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
};
exports.getReviews = getReviews;
