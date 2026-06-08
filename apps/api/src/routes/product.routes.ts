import { Router } from 'express';
import { getProducts, getFeaturedProducts, getBestSellers, getProductBySlug, getRelatedProducts, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/best-sellers', getBestSellers);
router.get('/:slug', getProductBySlug);
router.get('/:slug/related', getRelatedProducts);

// Admin routes
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
