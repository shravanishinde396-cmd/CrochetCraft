import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../middleware/asyncHandler';

// GET /search
export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
  const { q, category, minPrice, maxPrice, sort, page = '1', limit = '12' } = req.query;
  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, parseInt(limit as string));
  const skip = (pageNum - 1) * limitNum;

  const where: any = { isActive: true };

  if (q) {
    where.OR = [
      { title: { contains: q as string, mode: 'insensitive' } },
      { description: { contains: q as string, mode: 'insensitive' } },
      { tags: { has: (q as string).toLowerCase() } },
    ];
  }

  if (category) {
    const cat = await prisma.category.findFirst({ where: { slug: category as string } });
    if (cat) where.categoryId = cat.id;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice as string);
    if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc') orderBy = { price: 'desc' };
  else if (sort === 'rating') orderBy = { rating: 'desc' };
  else if (sort === 'popularity') orderBy = { totalSold: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, skip, take: limitNum, orderBy,
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limitNum);
  res.json(new ApiResponse(200, products, 'Search results.', {
    page: pageNum, limit: limitNum, total, totalPages,
    hasNext: pageNum < totalPages, hasPrev: pageNum > 1,
  }));
});

// GET /search/suggestions
export const searchSuggestions = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || (q as string).length < 2) {
    return res.json(new ApiResponse(200, []));
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      title: { contains: q as string, mode: 'insensitive' },
    },
    take: 5,
    select: { title: true, slug: true, price: true, salePrice: true, images: true },
  });

  res.json(new ApiResponse(200, products));
});
