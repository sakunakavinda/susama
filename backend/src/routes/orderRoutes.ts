import { Router } from 'express';
import {
  createOrder,
  getOrderByNumber,
  getMyOrders
} from '../controllers/orderController';
import { verifyCustomerToken, optionalCustomerToken } from '../middleware/authMiddleware';

const router = Router();

// Place a new order (accessible to guests and logged-in customers)
router.post('/', optionalCustomerToken, createOrder);

// Retrieve past orders of the authenticated customer
router.get('/my-orders', verifyCustomerToken, getMyOrders);

// Get single order receipt by order number (e.g. SUS-261048)
router.get('/:orderNumber', getOrderByNumber);

export default router;
