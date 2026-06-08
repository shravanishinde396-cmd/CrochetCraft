import { Response } from 'express';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../middleware/asyncHandler';

// GET /reviews/product/:productId
export const getProductReviews = asyncHandler(async (req: any, res: Response) => {
  const { page = '1', limit = '10' } = req.query;
  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, parseInt(limit as string));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId: req.params.productId, isApproved: true },
      skip, take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    }),
    prisma.review.count({ where: { productId: req.params.productId, isApproved: true } }),
  ]);

  const totalPages = Math.ceil(total / limitNum);
  res.json(new ApiResponse(200, reviews, 'Reviews fetched.', {
    page: pageNum, limit: limitNum, total, totalPages,
    hasNext: pageNum < totalPages, hasPrev: pageNum > 1,
  }));
});

// POST /reviews
export const createReview = asyncHandler(async (req: any, res: Response) => {
  const { productId, rating, title, review } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new ApiError(404, 'Product not found.');

  const existing = await prisma.review.findFirst({
    where: { userId: req.user.id, productId },
  });
  if (existing) throw new ApiError(409, 'You have already reviewed this product.');

  // Check if user purchased the product
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId: req.user.id, orderStatus: 'DELIVERED' },
    },
  });

  const newReview = await prisma.review.create({
    data: {
      userId: req.user.id, productId, rating, title, review,
      isVerifiedPurchase: !!hasPurchased,
    },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  // Update product rating
  const avgRating = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: avgRating._avg.rating || product.rating,
      reviewsCount: avgRating._count.rating,
    },
  });

  res.status(201).json(new ApiResponse(201, newReview, 'Review submitted.'));
});

// PUT /reviews/:id
export const updateReview = asyncHandler(async (req: any, res: Response) => {
  const review = await prisma.review.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!review) throw new ApiError(404, 'Review not found.');

  const updated = await prisma.review.update({
    where: { id: review.id },
    data: { rating: req.body.rating, title: req.body.title, review: req.body.review },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });
  res.json(new ApiResponse(200, updated, 'Review updated.'));
});

// DELETE /reviews/:id
export const deleteReview = asyncHandler(async (req: any, res: Response) => {
  const review = await prisma.review.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!review) throw new ApiError(404, 'Review not found.');

  await prisma.review.delete({ where: { id: review.id } });
  res.json(new ApiResponse(200, null, 'Review deleted.'));
});

// POST /reviews/:id/helpful
export const markHelpful = asyncHandler(async (req: any, res: Response) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) throw new ApiError(404, 'Review not found.');

  await prisma.review.update({
    where: { id: review.id },
    data: { helpfulCount: { increment: 1 } },
  });
  res.json(new ApiResponse(200, null, 'Marked as helpful.'));
});
