import { Response } from 'express';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../middleware/asyncHandler';

// GET /cart
export const getCart = asyncHandler(async (req: any, res: Response) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: { product: { include: { category: { select: { name: true, slug: true } } } } },
    orderBy: { createdAt: 'desc' },
  });

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.salePrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  res.json(new ApiResponse(200, { items, subtotal, itemCount: items.length }));
});

// POST /cart
export const addToCart = asyncHandler(async (req: any, res: Response) => {
  const { productId, quantity = 1 } = req.body;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found.');
  if (product.stock < quantity) throw new ApiError(400, `Only ${product.stock} items available.`);

  const existing = await prisma.cartItem.findFirst({
    where: { userId: req.user.id, productId },
  });

  let item;
  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > product.stock) throw new ApiError(400, `Only ${product.stock} items available.`);
    item = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
      include: { product: true },
    });
  } else {
    item = await prisma.cartItem.create({
      data: { userId: req.user.id, productId, quantity },
      include: { product: true },
    });
  }

  res.status(201).json(new ApiResponse(201, item, 'Item added to cart.'));
});

// PUT /cart/:id
export const updateCartItem = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const cartItem = await prisma.cartItem.findFirst({
    where: { id, userId: req.user.id },
    include: { product: true },
  });
  if (!cartItem) throw new ApiError(404, 'Cart item not found.');
  if (quantity > cartItem.product.stock) throw new ApiError(400, `Only ${cartItem.product.stock} items available.`);

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id } });
    return res.json(new ApiResponse(200, null, 'Item removed from cart.'));
  }

  const updated = await prisma.cartItem.update({
    where: { id },
    data: { quantity },
    include: { product: true },
  });
  res.json(new ApiResponse(200, updated, 'Cart item updated.'));
});

// DELETE /cart/:id
export const removeCartItem = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params;
  const item = await prisma.cartItem.findFirst({ where: { id, userId: req.user.id } });
  if (!item) throw new ApiError(404, 'Cart item not found.');

  await prisma.cartItem.delete({ where: { id } });
  res.json(new ApiResponse(200, null, 'Item removed from cart.'));
});

// DELETE /cart
export const clearCart = asyncHandler(async (req: any, res: Response) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
  res.json(new ApiResponse(200, null, 'Cart cleared.'));
});

// GET /cart/count
export const getCartCount = asyncHandler(async (req: any, res: Response) => {
  const count = await prisma.cartItem.count({ where: { userId: req.user.id } });
  res.json(new ApiResponse(200, { count }));
});
