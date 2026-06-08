import { Response } from 'express';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../middleware/asyncHandler';

// GET /wishlist
export const getWishlist = asyncHandler(async (req: any, res: Response) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user.id },
    include: { product: { include: { category: { select: { name: true, slug: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(new ApiResponse(200, items));
});

// POST /wishlist
export const addToWishlist = asyncHandler(async (req: any, res: Response) => {
  const { productId } = req.body;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new ApiError(404, 'Product not found.');

  const existing = await prisma.wishlistItem.findFirst({
    where: { userId: req.user.id, productId },
  });
  if (existing) throw new ApiError(409, 'Product already in wishlist.');

  const item = await prisma.wishlistItem.create({
    data: { userId: req.user.id, productId },
    include: { product: true },
  });
  res.status(201).json(new ApiResponse(201, item, 'Added to wishlist.'));
});

// DELETE /wishlist/:productId
export const removeFromWishlist = asyncHandler(async (req: any, res: Response) => {
  const { productId } = req.params;
  const item = await prisma.wishlistItem.findFirst({
    where: { userId: req.user.id, productId },
  });
  if (!item) throw new ApiError(404, 'Item not in wishlist.');

  await prisma.wishlistItem.delete({ where: { id: item.id } });
  res.json(new ApiResponse(200, null, 'Removed from wishlist.'));
});

// GET /wishlist/check/:productId
export const checkWishlist = asyncHandler(async (req: any, res: Response) => {
  const { productId } = req.params;
  const item = await prisma.wishlistItem.findFirst({
    where: { userId: req.user.id, productId },
  });
  res.json(new ApiResponse(200, { isInWishlist: !!item }));
});

// DELETE /wishlist
export const clearWishlist = asyncHandler(async (req: any, res: Response) => {
  await prisma.wishlistItem.deleteMany({ where: { userId: req.user.id } });
  res.json(new ApiResponse(200, null, 'Wishlist cleared.'));
});
