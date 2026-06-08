import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../middleware/asyncHandler';

// GET /categories
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(new ApiResponse(200, categories));
});

// GET /categories/:slug
export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
  const category = await prisma.category.findFirst({
    where: { slug: req.params.slug, isActive: true },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw new ApiError(404, 'Category not found.');
  res.json(new ApiResponse(200, category));
});

// GET /categories/:slug/products
export const getCategoryProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '12', sort } = req.query;
  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, parseInt(limit as string));
  const skip = (pageNum - 1) * limitNum;

  const category = await prisma.category.findFirst({ where: { slug: req.params.slug } });
  if (!category) throw new ApiError(404, 'Category not found.');

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc') orderBy = { price: 'desc' };
  else if (sort === 'rating') orderBy = { rating: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { categoryId: category.id, isActive: true },
      skip, take: limitNum, orderBy,
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.product.count({ where: { categoryId: category.id, isActive: true } }),
  ]);

  const totalPages = Math.ceil(total / limitNum);
  res.json(new ApiResponse(200, { category, products }, 'Category products fetched.', {
    page: pageNum, limit: limitNum, total, totalPages,
    hasNext: pageNum < totalPages, hasPrev: pageNum > 1,
  }));
});

// POST /categories (Admin)
export const createCategory = asyncHandler(async (req: any, res: Response) => {
  const { name, slug, description, image } = req.body;
  const existing = await prisma.category.findFirst({ where: { slug } });
  if (existing) throw new ApiError(409, 'Category with this slug already exists.');

  const category = await prisma.category.create({ data: { name, slug, description, image } });
  res.status(201).json(new ApiResponse(201, category, 'Category created.'));
});

// PUT /categories/:id (Admin)
export const updateCategory = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new ApiError(404, 'Category not found.');

  const updated = await prisma.category.update({ where: { id }, data: req.body });
  res.json(new ApiResponse(200, updated, 'Category updated.'));
});

// DELETE /categories/:id (Admin)
export const deleteCategory = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params;
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) throw new ApiError(400, 'Cannot delete category with existing products. Reassign them first.');

  await prisma.category.update({ where: { id }, data: { isActive: false } });
  res.json(new ApiResponse(200, null, 'Category deactivated.'));
});
