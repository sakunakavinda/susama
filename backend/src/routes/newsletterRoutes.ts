import { Router } from 'express';
import { subscribe, getSubscribers, unsubscribe } from '../controllers/newsletterController';

const router = Router();

// POST /api/newsletter/subscribe - Subscribe to newsletter
router.post('/subscribe', subscribe);

// GET /api/newsletter/subscribers - Get subscriber list (admin/internal)
router.get('/subscribers', getSubscribers);

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
router.post('/unsubscribe', unsubscribe);

export default router;
