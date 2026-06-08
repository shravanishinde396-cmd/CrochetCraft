import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../middleware/asyncHandler';

// POST /newsletter/subscribe
export const subscribe = asyncHandler(async (req: any, res: Response) => {
  const { email } = req.body;
  const existing = await prisma.newsletterSubscriber.findFirst({ where: { email } });
  if (existing) {
    if (existing.isSubscribed) throw new ApiError(409, 'Already subscribed.');
    await prisma.newsletterSubscriber.update({ where: { id: existing.id }, data: { isSubscribed: true } });
    return res.json(new ApiResponse(200, null, 'Re-subscribed successfully.'));
  }

  await prisma.newsletterSubscriber.create({
    data: { email, userId: req.user?.id || null },
  });
  res.status(201).json(new ApiResponse(201, null, 'Subscribed to newsletter.'));
});

// POST /newsletter/unsubscribe
export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const subscriber = await prisma.newsletterSubscriber.findFirst({ where: { email } });
  if (!subscriber) throw new ApiError(404, 'Email not found in subscribers.');

  await prisma.newsletterSubscriber.update({ where: { id: subscriber.id }, data: { isSubscribed: false } });
  res.json(new ApiResponse(200, null, 'Unsubscribed from newsletter.'));
});

// GET /newsletter/subscribers (Admin)
export const getSubscribers = asyncHandler(async (req: any, res: Response) => {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isSubscribed: true },
    orderBy: { subscribedAt: 'desc' },
  });
  res.json(new ApiResponse(200, subscribers));
});
