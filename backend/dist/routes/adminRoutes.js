"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// Protect all admin management routes with verifyAdminToken
router.use(authMiddleware_1.verifyAdminToken);
// 1. Dashboard Analytics & Statistics
router.get('/stats', adminController_1.getDashboardStats);
// 2. Orders Management
router.get('/orders', adminController_1.getAdminOrders);
router.get('/orders/:id', adminController_1.getAdminOrderById);
router.put('/orders/:id/status', adminController_1.updateOrderStatus);
// 3. Products Management (Admin Catalog)
router.get('/products', adminController_1.getAdminProducts);
// 4. Customer Reviews Moderation
router.get('/reviews', adminController_1.getAdminReviews);
router.put('/reviews/:id/approve', adminController_1.updateReviewApproval);
router.delete('/reviews/:id', adminController_1.deleteReview);
// 5. VIP Newsletter Subscribers
router.get('/subscribers', adminController_1.getAdminSubscribers);
exports.default = router;
