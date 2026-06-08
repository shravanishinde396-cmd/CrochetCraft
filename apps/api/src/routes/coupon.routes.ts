import { Router } from 'express';
import { validateCoupon, getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/coupon.controller';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

const router = Router();

router.post('/validate', protect, validateCoupon);

// Admin
router.get('/', protect, adminOnly, getAllCoupons);
router.post('/', protect, adminOnly, createCoupon);
router.put('/:id', protect, adminOnly, updateCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);

export default router;
