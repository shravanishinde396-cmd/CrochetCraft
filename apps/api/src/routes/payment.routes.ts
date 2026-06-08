import { Router } from 'express';
import { createRazorpayOrder, verifyPayment, razorpayWebhook } from '../controllers/payment.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', razorpayWebhook); // No auth — webhook from Razorpay

export default router;
