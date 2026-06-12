import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendMail } from '../utils/emailSender';
import { getNewsletterWelcomeHtml } from '../utils/emailTemplates';
import logger from '../utils/logger';

// POST /newsletter/subscribe
export const subscribe = asyncHandler(async (req: any, res: Response) => {
  const { email } = req.body;
  const existing = await prisma.newsletterSubscriber.findFirst({ where: { email } });
  if (existing) {
    if (existing.isSubscribed) throw new ApiError(409, 'Already subscribed.');
    await prisma.newsletterSubscriber.update({ where: { id: existing.id }, data: { isSubscribed: true } });
    
    // Send welcome email in background for re-subscribers
    const emailHtml = getNewsletterWelcomeHtml(email);
    sendMail({
      to: email,
      subject: 'Welcome to the CrochetCraft Pro Newsletter',
      html: emailHtml,
    }).catch((err) => logger.error(`Failed to send newsletter welcome email to ${email}:`, err));

    return res.json(new ApiResponse(200, null, 'Re-subscribed successfully.'));
  }

  await prisma.newsletterSubscriber.create({
    data: { email, userId: req.user?.id || null },
  });

  // Send welcome email in background
  const emailHtml = getNewsletterWelcomeHtml(email);
  sendMail({
    to: email,
    subject: 'Welcome to the CrochetCraft Pro Newsletter',
    html: emailHtml,
  }).catch((err) => logger.error(`Failed to send newsletter welcome email to ${email}:`, err));

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
