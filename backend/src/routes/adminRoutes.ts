import { Router } from 'express';
import { verifyAdminToken } from '../middleware/authMiddleware';
import {
  getDashboardStats,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  getAdminProducts,
  getAdminReviews,
  updateReviewApproval,
  deleteReview,
  getAdminSubscribers
} from '../controllers/adminController';

const router = Router();

// Protect all admin management routes with verifyAdminToken
router.use(verifyAdminToken);

// 1. Dashboard Analytics & Statistics
router.get('/stats', getDashboardStats);

// 2. Orders Management
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.put('/orders/:id/status', updateOrderStatus);

// 3. Products Management (Admin Catalog)
router.get('/products', getAdminProducts);

// 4. Customer Reviews Moderation
router.get('/reviews', getAdminReviews);
router.put('/reviews/:id/approve', updateReviewApproval);
router.delete('/reviews/:id', deleteReview);

// 5. VIP Newsletter Subscribers
router.get('/subscribers', getAdminSubscribers);

export default router;
