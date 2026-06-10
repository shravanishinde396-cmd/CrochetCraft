import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendMail } from '../utils/emailSender';
import { getNewOfferHtml } from '../utils/emailTemplates';
import logger from '../utils/logger';

// POST /coupons/validate
export const validateCoupon = asyncHandler(async (req: any, res: Response) => {
  const { code, subtotal } = req.body;
  const coupon = await prisma.coupon.findFirst({
    where: { code: code.toUpperCase(), isActive: true, expiryDate: { gt: new Date() } },
  });
  if (!coupon) throw new ApiError(404, 'Invalid or expired coupon code.');

  if (subtotal < coupon.minimumOrder) {
    throw new ApiError(400, `Minimum order amount for this coupon is Rs. ${coupon.minimumOrder}.`);
  }

  if (coupon.isFirstPurchase) {
    const orderCount = await prisma.order.count({ where: { userId: req.user.id } });
    if (orderCount > 0) throw new ApiError(400, 'This coupon is valid for first-time customers only.');
  }

  if (coupon.usageLimit) {
    const usageCount = await prisma.couponUsage.count({ where: { couponId: coupon.id } });
    if (usageCount >= coupon.usageLimit) throw new ApiError(400, 'Coupon usage limit reached.');
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maximumDiscount && discount > coupon.maximumDiscount) discount = coupon.maximumDiscount;
  } else {
    discount = coupon.discountValue;
  }

  res.json(new ApiResponse(200, {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    calculatedDiscount: discount,
    minimumOrder: coupon.minimumOrder,
  }, 'Coupon is valid.'));
});

// GET /coupons (Admin)
export const getAllCoupons = asyncHandler(async (req: any, res: Response) => {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { usages: true } } },
  });
  res.json(new ApiResponse(200, coupons));
});

// POST /coupons (Admin)
export const createCoupon = asyncHandler(async (req: any, res: Response) => {
  const { code, description, discountType, discountValue, minimumOrder, maximumDiscount, usageLimit, expiryDate, isFirstPurchase, categoryId } = req.body;
  const existing = await prisma.coupon.findFirst({ where: { code: code.toUpperCase() } });
  if (existing) throw new ApiError(409, 'Coupon code already exists.');

  const coupon = await prisma.coupon.create({
    data: { code: code.toUpperCase(), description, discountType, discountValue, minimumOrder, maximumDiscount, usageLimit, expiryDate: new Date(expiryDate), isFirstPurchase: isFirstPurchase || false, categoryId },
  });

  // Send email notifications to all registered customers and newsletter subscribers in the background
  Promise.all([
    prisma.user.findMany({
      where: { isActive: true },
      select: { email: true, name: true }
    }),
    prisma.newsletterSubscriber.findMany({
      where: { isSubscribed: true },
      select: { email: true, user: { select: { name: true } } }
    })
  ]).then(async ([users, subscribers]) => {
    const recipients = new Map<string, string>(); // email -> name

    // Add newsletter subscribers
    for (const sub of subscribers) {
      recipients.set(sub.email.toLowerCase(), sub.user?.name || 'Craft Lover');
    }

    // Add/override with registered customers
    for (const u of users) {
      recipients.set(u.email.toLowerCase(), u.name);
    }

    logger.info(`Sending new coupon email to ${recipients.size} unique recipients (customers and subscribers)...`);

    const sendPromises = Array.from(recipients.entries()).map(([email, name]) => {
      const emailHtml = getNewOfferHtml(
        name,
        coupon.code,
        coupon.discountValue,
        coupon.discountType,
        coupon.expiryDate,
        coupon.description || undefined
      );

      return sendMail({
        to: email,
        subject: `New Offer: Get ${coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `Rs. ${coupon.discountValue}`} OFF!`,
        html: emailHtml,
      }).catch(err => {
        logger.error(`Failed to send coupon email to ${email}:`, err);
      });
    });

    await Promise.allSettled(sendPromises);
  }).catch((err) => {
    logger.error('Failed to notify users about new coupon:', err);
  });

  res.status(201).json(new ApiResponse(201, coupon, 'Coupon created.'));
});

// PUT /coupons/:id (Admin)
export const updateCoupon = asyncHandler(async (req: any, res: Response) => {
  const coupon = await prisma.coupon.findUnique({ where: { id: req.params.id } });
  if (!coupon) throw new ApiError(404, 'Coupon not found.');
  const data = { ...req.body };
  if (data.expiryDate) data.expiryDate = new Date(data.expiryDate);
  const updated = await prisma.coupon.update({ where: { id: req.params.id }, data });
  res.json(new ApiResponse(200, updated, 'Coupon updated.'));
});

// DELETE /coupons/:id (Admin)
export const deleteCoupon = asyncHandler(async (req: any, res: Response) => {
  await prisma.coupon.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json(new ApiResponse(200, null, 'Coupon deactivated.'));
});
