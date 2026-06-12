import { CronJob } from 'cron';
import { prisma } from './database';
import { sendMail } from '../utils/emailSender';
import { getAbandonedCartHtml, getLowStockAlertHtml } from '../utils/emailTemplates';
import { ADMIN_EMAIL } from './email';
import logger from '../utils/logger';

// 1. Abandoned Cart Recovery (Daily)
export const abandonedCartJob = new CronJob('0 0 * * *', async () => {
  logger.info('Running Abandoned Cart Recovery Cron Job...');
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find cart items created or updated more than 24h ago
    const carts = await prisma.cartItem.findMany({
      where: {
        createdAt: { lte: oneDayAgo },
      },
      include: {
        user: true,
        product: true,
      },
    });

    const userCarts: Record<string, { user: any; items: any[] }> = {};
    for (const item of carts) {
      if (!userCarts[item.userId]) {
        userCarts[item.userId] = { user: item.user, items: [] };
      }
      userCarts[item.userId].items.push(item);
    }

    for (const userId in userCarts) {
      const { user, items } = userCarts[userId];
      
      // Check if we already sent a recovery email recently (within the last 3 days)
      const alreadySent = await prisma.abandonedCartEmail.findFirst({
        where: {
          userId,
          emailSentAt: { gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        },
      });

      if (alreadySent) continue;

      const checkoutUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cart`;
      const html = getAbandonedCartHtml(user.name, items, checkoutUrl);
      
      await sendMail({
        to: user.email,
        subject: 'Did you forget something in your cart?',
        html,
      });

      await prisma.abandonedCartEmail.create({
        data: {
          userId,
          emailSentAt: new Date(),
          cartSnapshot: items as any,
        },
      });
    }
  } catch (error) {
    logger.error('Error in Abandoned Cart Cron Job:', error);
  }
});

// 2. Low Stock Alert (Every 12 hours)
export const lowStockJob = new CronJob('0 */12 * * *', async () => {
  logger.info('Running Low Stock Alert Cron Job...');
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lte: 5 },
        isActive: true,
      },
    });

    if (lowStockProducts.length === 0) return;

    for (const prod of lowStockProducts) {
      const html = getLowStockAlertHtml(prod.title, prod.sku, prod.stock);
      await sendMail({
        to: ADMIN_EMAIL,
        subject: `Low Stock Alert: ${prod.title}`,
        html,
      });
    }
  } catch (error) {
    logger.error('Error in Low Stock Alert Cron Job:', error);
  }
});

// 3. Expired Coupons Clean-up (Daily at Midnight)
export const expiredCouponsJob = new CronJob('0 0 * * *', async () => {
  logger.info('Running Expired Coupons Clean-up Cron Job...');
  try {
    const now = new Date();
    const result = await prisma.coupon.updateMany({
      where: {
        expiryDate: { lte: now },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
    logger.info(`Deactivated ${result.count} expired coupons.`);
  } catch (error) {
    logger.error('Error in Expired Coupons Cron Job:', error);
  }
});

export const startCronJobs = () => {
  abandonedCartJob.start();
  lowStockJob.start();
  expiredCouponsJob.start();
  logger.info('Cron Jobs Scheduler initialized.');
};
