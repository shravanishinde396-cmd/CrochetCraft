import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { razorpay, RAZORPAY_KEY_SECRET } from '../config/razorpay';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../middleware/asyncHandler';

// POST /payments/create-order
export const createRazorpayOrder = asyncHandler(async (req: any, res: Response) => {
  const { orderId } = req.body;
  const order = await prisma.order.findFirst({ where: { id: orderId, userId: req.user.id } });
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.paymentStatus === 'PAID') throw new ApiError(400, 'Order is already paid.');

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.total * 100),
    currency: 'INR',
    receipt: order.orderNumber,
    notes: { orderId: order.id, userId: req.user.id },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: razorpayOrder.id },
  });

  res.json(new ApiResponse(200, {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    orderNumber: order.orderNumber,
  }, 'Razorpay order created.'));
});

// POST /payments/verify
export const verifyPayment = asyncHandler(async (req: any, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, 'Payment verification failed. Invalid signature.');
  }

  const order = await prisma.order.findFirst({ where: { razorpayOrderId: razorpay_order_id } });
  if (!order) throw new ApiError(404, 'Order not found.');

  // Update order payment status and deduct stock
  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: 'PAID',
      orderStatus: 'CONFIRMED',
      razorpayPaymentId: razorpay_payment_id,
      statusHistory: { create: { status: 'CONFIRMED', note: 'Payment verified. Order confirmed.' } },
    },
  });

  // Deduct product stock
  const orderItems = await prisma.orderItem.findMany({ where: { orderId: order.id } });
  for (const item of orderItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: { decrement: item.quantity },
        totalSold: { increment: item.quantity },
      },
    });
  }

  res.json(new ApiResponse(200, { orderNumber: order.orderNumber }, 'Payment verified and order confirmed.'));
});

// POST /payments/webhook
export const razorpayWebhook = asyncHandler(async (req: Request, res: Response) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const signature = req.headers['x-razorpay-signature'] as string;

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new ApiError(400, 'Invalid webhook signature.');
  }

  const event = req.body.event;
  const payload = req.body.payload;

  if (event === 'payment.captured') {
    const razorpayPaymentId = payload.payment.entity.id;
    const razorpayOrderId = payload.payment.entity.order_id;

    const order = await prisma.order.findFirst({ where: { razorpayOrderId } });
    if (order && order.paymentStatus !== 'PAID') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          orderStatus: 'CONFIRMED',
          razorpayPaymentId,
          statusHistory: { create: { status: 'CONFIRMED', note: 'Payment captured via webhook.' } },
        },
      });
    }
  } else if (event === 'payment.failed') {
    const razorpayOrderId = payload.payment.entity.order_id;
    const order = await prisma.order.findFirst({ where: { razorpayOrderId } });
    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED' },
      });
    }
  }

  res.json({ status: 'ok' });
});
