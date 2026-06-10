import { Response } from 'express';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../middleware/asyncHandler';
import { generateOrderNumber } from '../utils/generateOrderNumber';
import { sendMail } from '../utils/emailSender';
import { getOrderConfirmationHtml } from '../utils/emailTemplates';
import logger from '../utils/logger';

// POST /orders
export const createOrder = asyncHandler(async (req: any, res: Response) => {
  const { addressId, couponCode, paymentMethod = 'RAZORPAY', notes } = req.body;

  const address = await prisma.address.findFirst({ where: { id: addressId, userId: req.user.id } });
  if (!address) throw new ApiError(404, 'Shipping address not found.');

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: { product: true },
  });
  if (cartItems.length === 0) throw new ApiError(400, 'Cart is empty.');

  // Validate stock
  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for "${item.product.title}". Available: ${item.product.stock}`);
    }
  }

  let subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.salePrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  // Apply coupon
  let discountAmount = 0;
  let couponId: string | null = null;
  if (couponCode) {
    const coupon = await prisma.coupon.findFirst({ where: { code: couponCode, isActive: true, expiryDate: { gt: new Date() } } });
    if (!coupon) throw new ApiError(400, 'Invalid or expired coupon.');
    if (subtotal < coupon.minimumOrder) throw new ApiError(400, `Minimum order amount is Rs. ${coupon.minimumOrder}.`);

    if (coupon.isFirstPurchase) {
      const orderCount = await prisma.order.count({ where: { userId: req.user.id } });
      if (orderCount > 0) throw new ApiError(400, 'This coupon is for first purchase only.');
    }

    if (coupon.usageLimit) {
      const usageCount = await prisma.couponUsage.count({ where: { couponId: coupon.id } });
      if (usageCount >= coupon.usageLimit) throw new ApiError(400, 'Coupon usage limit reached.');
    }

    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }
    couponId = coupon.id;
  }

  const taxAmount = parseFloat(((subtotal - discountAmount) * 0.18).toFixed(2));
  const shippingCharge = subtotal >= 1000 ? 0 : 80;
  const total = subtotal - discountAmount + taxAmount + shippingCharge;

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: req.user.id,
      addressId,
      subtotal,
      discountAmount,
      couponId,
      taxAmount,
      shippingCharge,
      total,
      notes,
      paymentMethod,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING',
      items: {
        create: cartItems.map(item => ({
          productId: item.productId,
          title: item.product.title,
          image: item.product.images?.[0] || '',
          quantity: item.quantity,
          price: item.product.salePrice || item.product.price,
          totalPrice: (item.product.salePrice || item.product.price) * item.quantity,
        })),
      },
      statusHistory: {
        create: [{ status: 'PENDING', note: 'Order placed.' }],
      },
    },
    include: { items: true, statusHistory: true },
  });

  // Track coupon usage
  if (couponId) {
    await prisma.couponUsage.create({ data: { couponId, userId: req.user.id, orderId: order.id } });
  }

  // Clear cart
  await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });

  // Send order confirmation email in the background
  prisma.user.findUnique({
    where: { id: req.user.id }
  }).then(async (user) => {
    if (user && user.email) {
      const emailHtml = getOrderConfirmationHtml(
        user.name,
        order.orderNumber,
        order.items,
        order.total
      );

      await sendMail({
        to: user.email,
        subject: `Order Confirmed: #${order.orderNumber}`,
        html: emailHtml,
      });
    }
  }).catch((err) => {
    logger.error(`Failed to send order confirmation email for order ${order.orderNumber}:`, err);
  });

  res.status(201).json(new ApiResponse(201, order, 'Order created successfully.'));
});

// GET /orders
export const getMyOrders = asyncHandler(async (req: any, res: Response) => {
  const { page = '1', limit = '10', status } = req.query;
  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, parseInt(limit as string));
  const skip = (pageNum - 1) * limitNum;

  const where: any = { userId: req.user.id };
  if (status) where.orderStatus = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip, take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: { select: { slug: true, images: true } } } }, statusHistory: { orderBy: { createdAt: 'desc' } } },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limitNum);
  res.json(new ApiResponse(200, orders, 'Orders fetched.', {
    page: pageNum, limit: limitNum, total, totalPages,
    hasNext: pageNum < totalPages, hasPrev: pageNum > 1,
  }));
});

// GET /orders/:orderNumber
export const getOrderByNumber = asyncHandler(async (req: any, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { orderNumber: req.params.orderNumber, userId: req.user.id },
    include: {
      items: { include: { product: { select: { slug: true, images: true } } } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
      address: true,
      coupon: true,
    },
  });
  if (!order) throw new ApiError(404, 'Order not found.');
  res.json(new ApiResponse(200, order));
});

// POST /orders/:orderNumber/cancel
export const cancelOrder = asyncHandler(async (req: any, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { orderNumber: req.params.orderNumber, userId: req.user.id },
    include: { items: true },
  });
  if (!order) throw new ApiError(404, 'Order not found.');
  if (!['PENDING', 'CONFIRMED'].includes(order.orderStatus)) {
    throw new ApiError(400, 'Only pending or confirmed orders can be cancelled.');
  }

  // Restore stock
  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      orderStatus: 'CANCELLED',
      statusHistory: { create: { status: 'CANCELLED', note: req.body.reason || 'Cancelled by customer.' } },
    },
  });

  res.json(new ApiResponse(200, null, 'Order cancelled.'));
});
