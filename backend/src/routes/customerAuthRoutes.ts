import { Router } from 'express';
import {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile
} from '../controllers/customerAuthController';
import { verifyCustomerToken } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// Protected routes (require valid JWT)
router.get('/me', verifyCustomerToken, getCustomerProfile);
router.put('/profile', verifyCustomerToken, updateCustomerProfile);

export default router;
