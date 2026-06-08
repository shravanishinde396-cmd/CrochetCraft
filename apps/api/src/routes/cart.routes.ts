import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart, getCartCount } from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.get('/count', getCartCount);
router.put('/:id', updateCartItem);
router.delete('/:id', removeCartItem);
router.delete('/', clearCart);

export default router;
