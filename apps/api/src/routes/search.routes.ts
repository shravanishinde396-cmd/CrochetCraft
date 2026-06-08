import { Router } from 'express';
import { searchProducts, searchSuggestions } from '../controllers/search.controller';
import { searchLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.get('/', searchLimiter, searchProducts);
router.get('/suggestions', searchLimiter, searchSuggestions);

export default router;
