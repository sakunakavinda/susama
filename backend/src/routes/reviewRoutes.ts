import { Router } from 'express';
import { 
  getReviews, 
  getOverallReviews, 
  createOverallReview, 
  getProductReviews, 
  createProductReview, 
  createReview 
} from '../controllers/reviewController';

const router = Router();

// Overall brand reviews & math calculation
router.get('/overall', getOverallReviews);
router.post('/overall', createOverallReview);

// Product reviews & per-product rating math
router.get('/product/:productId', getProductReviews);
router.post('/product', createProductReview);

// General reviews endpoints
router.get('/', getReviews);
router.post('/', createReview);

export default router;
