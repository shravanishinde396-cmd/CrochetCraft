import { Router } from 'express';
import { getDashboard, getUsers, toggleUserActive, getAllOrders, updateOrderStatus, getInventoryLogs, getAdminReviews, approveReview, createRefund } from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

const router = Router();

router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id/toggle-active', toggleUserActive);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/inventory', getInventoryLogs);
router.get('/reviews', getAdminReviews);
router.put('/reviews/:id/approve', approveReview);
router.post('/refunds', createRefund);

export default router;
