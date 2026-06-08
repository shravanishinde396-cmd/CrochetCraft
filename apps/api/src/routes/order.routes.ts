import { Router } from 'express';
import { createOrder, getMyOrders, getOrderByNumber, cancelOrder } from '../controllers/order.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:orderNumber', getOrderByNumber);
router.post('/:orderNumber/cancel', cancelOrder);

export default router;
