import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, checkWishlist, clearWishlist } from '../controllers/wishlist.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.get('/check/:productId', checkWishlist);
router.delete('/:productId', removeFromWishlist);
router.delete('/', clearWishlist);

export default router;
