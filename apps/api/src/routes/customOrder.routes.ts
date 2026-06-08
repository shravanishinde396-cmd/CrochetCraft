import { Router } from 'express';
import { createCustomOrder, getMyCustomOrders, getCustomOrderById, getAllCustomOrders, updateCustomOrderStatus } from '../controllers/customOrder.controller';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

const router = Router();

router.use(protect);

router.post('/', createCustomOrder);
router.get('/', getMyCustomOrders);
router.get('/:id', getCustomOrderById);

// Admin
router.get('/admin/all', adminOnly, getAllCustomOrders);
router.put('/:id/status', adminOnly, updateCustomOrderStatus);

export default router;
