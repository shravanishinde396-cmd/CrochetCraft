import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../middleware/asyncHandler';

// GET /products
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '12', category, sort, minPrice, maxPrice, featured, bestSeller, search } = req.query;
  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const where: any = { isActive: true };
  if (category) {
    const cat = await prisma.category.findFirst({ where: { slug: category as string } });
    if (cat) where.categoryId = cat.id;
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice as string);
    if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
  }
  if (featured === 'true') where.featured = true;
  if (bestSeller === 'true') where.bestSeller = true;
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { tags: { has: (search as string).toLowerCase() } },
    ];
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc') orderBy = { price: 'desc' };
  else if (sort === 'rating') orderBy = { rating: 'desc' };
  else if (sort === 'popularity') orderBy = { totalSold: 'desc' };
  else if (sort === 'newest') orderBy = { createdAt: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, skip, take: limitNum, orderBy,
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limitNum);
  res.json(new ApiResponse(200, products, 'Products fetched.', {
    page: pageNum, limit: limitNum, total, totalPages,
    hasNext: pageNum < totalPages, hasPrev: pageNum > 1,
  }));
});

// GET /products/featured
export const getFeaturedProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    where: { featured: true, isActive: true },
    take: 8,
    orderBy: { rating: 'desc' },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  res.json(new ApiResponse(200, products));
});

// GET /products/best-sellers
export const getBestSellers = asyncHandler(async (req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    where: { bestSeller: true, isActive: true },
    take: 8,
    orderBy: { totalSold: 'desc' },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  res.json(new ApiResponse(200, products));
});

// GET /products/:slug
export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await prisma.product.findFirst({
    where: { slug: req.params.slug, isActive: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      reviews: {
        where: { isApproved: true },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
    },
  });
  if (!product) throw new ApiError(404, 'Product not found.');
  res.json(new ApiResponse(200, product));
});

// GET /products/:slug/related
export const getRelatedProducts = asyncHandler(async (req: Request, res: Response) => {
  const product = await prisma.product.findFirst({ where: { slug: req.params.slug } });
  if (!product) throw new ApiError(404, 'Product not found.');

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    take: 4,
    orderBy: { rating: 'desc' },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  res.json(new ApiResponse(200, related));
});

// POST /products (Admin)
export const createProduct = asyncHandler(async (req: any, res: Response) => {
  const { title, slug, description, price, salePrice, stock, sku, images, categoryId, featured, bestSeller, tags, material, careInstructions, weight, dimensions } = req.body;

  const existing = await prisma.product.findFirst({ where: { OR: [{ slug }, { sku }] } });
  if (existing) throw new ApiError(409, 'Product with this slug or SKU already exists.');

  const product = await prisma.product.create({
    data: {
      title, slug, description, price, salePrice, stock, sku, images: images || [],
      categoryId, featured: featured || false, bestSeller: bestSeller || false,
      tags: tags || [], material, careInstructions, weight, dimensions,
      stockStatus: stock === 0 ? 'OUT_OF_STOCK' : stock <= 5 ? 'LOW_STOCK' : 'IN_STOCK',
    },
    include: { category: true },
  });

  await prisma.inventoryLog.create({
    data: { productId: product.id, quantity: stock, reason: 'RESTOCK', reference: 'PRODUCT_CREATED' },
  });

  res.status(201).json(new ApiResponse(201, product, 'Product created.'));
});

// PUT /products/:id (Admin)
export const updateProduct = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new ApiError(404, 'Product not found.');

  const data = { ...req.body };
  if (data.stock !== undefined) {
    data.stockStatus = data.stock === 0 ? 'OUT_OF_STOCK' : data.stock <= 5 ? 'LOW_STOCK' : 'IN_STOCK';
    const diff = data.stock - product.stock;
    if (diff !== 0) {
      await prisma.inventoryLog.create({
        data: { productId: id, quantity: Math.abs(diff), reason: diff > 0 ? 'RESTOCK' : 'ADJUSTMENT', reference: 'ADMIN_UPDATE' },
      });
    }
  }

  const updated = await prisma.product.update({ where: { id }, data, include: { category: true } });
  res.json(new ApiResponse(200, updated, 'Product updated.'));
});

// DELETE /products/:id (Admin)
export const deleteProduct = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new ApiError(404, 'Product not found.');

  await prisma.product.update({ where: { id }, data: { isActive: false } });
  res.json(new ApiResponse(200, null, 'Product deactivated.'));
});
