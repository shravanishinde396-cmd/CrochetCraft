import { Router } from 'express';
import { getCategories, getCategoryBySlug, getCategoryProducts, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

const router = Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.get('/:slug/products', getCategoryProducts);

// Admin
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
