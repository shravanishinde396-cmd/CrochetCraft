import { Router } from 'express';
import { subscribe, unsubscribe, getSubscribers } from '../controllers/newsletter.controller';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

const router = Router();

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

// Admin
router.get('/subscribers', protect, adminOnly, getSubscribers);

export default router;
