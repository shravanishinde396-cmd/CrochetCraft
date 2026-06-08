import { Response } from 'express';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../middleware/asyncHandler';

// GET /admin/dashboard
export const getDashboard = asyncHandler(async (req: any, res: Response) => {
  const totalUsers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
  const totalProducts = await prisma.product.count({ where: { isActive: true } });
  const totalOrders = await prisma.order.count();
  const totalRevenueResult = await prisma.order.aggregate({
    where: { paymentStatus: 'PAID' },
    _sum: { total: true },
  });
  const totalRevenue = totalRevenueResult._sum.total || 0;

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
  });

  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lte: 5 }, isActive: true },
    orderBy: { stock: 'asc' },
    take: 10,
    select: { id: true, title: true, slug: true, stock: true, sku: true, stockStatus: true },
  });

  const pendingCustomOrders = await prisma.customOrder.count({ where: { status: 'PENDING' } });

  // Monthly revenue (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyOrders = await prisma.order.findMany({
    where: { paymentStatus: 'PAID', createdAt: { gte: sixMonthsAgo } },
    select: { total: true, createdAt: true },
  });

  const monthlyRevenue: Record<string, number> = {};
  monthlyOrders.forEach(order => {
    const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
    monthlyRevenue[key] = (monthlyRevenue[key] || 0) + order.total;
  });

  // Order status distribution
  const orderStatusCounts = await prisma.order.groupBy({
    by: ['orderStatus'],
    _count: true,
  });

  res.json(new ApiResponse(200, {
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingCustomOrders,
    },
    recentOrders,
    lowStockProducts,
    monthlyRevenue,
    orderStatusCounts,
  }));
});

// GET /admin/users
export const getUsers = asyncHandler(async (req: any, res: Response) => {
  const { page = '1', limit = '20', search, role } = req.query;
  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(100, parseInt(limit as string));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: limitNum,
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true, lastLoginAt: true, _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limitNum);
  res.json(new ApiResponse(200, users, 'Users fetched.', {
    page: pageNum, limit: limitNum, total, totalPages,
    hasNext: pageNum < totalPages, hasPrev: pageNum > 1,
  }));
});

// PUT /admin/users/:id/toggle-active
export const toggleUserActive = asyncHandler(async (req: any, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new ApiError(404, 'User not found.');
  if (user.role === 'ADMIN') throw new ApiError(400, 'Cannot deactivate admin accounts.');

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: !user.isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });
  res.json(new ApiResponse(200, updated, `User ${updated.isActive ? 'activated' : 'deactivated'}.`));
});

// GET /admin/orders
export const getAllOrders = asyncHandler(async (req: any, res: Response) => {
  const { page = '1', limit = '20', status, search } = req.query;
  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(100, parseInt(limit as string));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (status) where.orderStatus = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search as string, mode: 'insensitive' } },
      { user: { name: { contains: search as string, mode: 'insensitive' } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip, take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: true,
        address: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limitNum);
  res.json(new ApiResponse(200, orders, 'Orders fetched.', {
    page: pageNum, limit: limitNum, total, totalPages,
    hasNext: pageNum < totalPages, hasPrev: pageNum > 1,
  }));
});

// PUT /admin/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req: any, res: Response) => {
  const { status, trackingNumber, courierName, trackingUrl, note } = req.body;
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) throw new ApiError(404, 'Order not found.');

  const data: any = { orderStatus: status };
  if (trackingNumber) data.trackingNumber = trackingNumber;
  if (courierName) data.courierName = courierName;
  if (trackingUrl) data.trackingUrl = trackingUrl;
  if (status === 'DELIVERED') data.deliveredAt = new Date();

  await prisma.order.update({
    where: { id: req.params.id },
    data: {
      ...data,
      statusHistory: { create: { status, note: note || `Status updated to ${status} by admin.` } },
    },
  });

  res.json(new ApiResponse(200, null, `Order status updated to ${status}.`));
});

// GET /admin/inventory
export const getInventoryLogs = asyncHandler(async (req: any, res: Response) => {
  const { page = '1', limit = '20' } = req.query;
  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(100, parseInt(limit as string));
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    prisma.inventoryLog.findMany({
      skip, take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { title: true, sku: true, stock: true } } },
    }),
    prisma.inventoryLog.count(),
  ]);

  const totalPages = Math.ceil(total / limitNum);
  res.json(new ApiResponse(200, logs, 'Inventory logs fetched.', {
    page: pageNum, limit: limitNum, total, totalPages,
    hasNext: pageNum < totalPages, hasPrev: pageNum > 1,
  }));
});

// GET /admin/reviews
export const getAdminReviews = asyncHandler(async (req: any, res: Response) => {
  const { approved } = req.query;
  const where: any = {};
  if (approved === 'true') where.isApproved = true;
  if (approved === 'false') where.isApproved = false;

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { title: true, slug: true } },
    },
  });
  res.json(new ApiResponse(200, reviews));
});

// PUT /admin/reviews/:id/approve
export const approveReview = asyncHandler(async (req: any, res: Response) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) throw new ApiError(404, 'Review not found.');

  await prisma.review.update({ where: { id: req.params.id }, data: { isApproved: true } });
  res.json(new ApiResponse(200, null, 'Review approved.'));
});

// POST /admin/refunds
export const createRefund = asyncHandler(async (req: any, res: Response) => {
  const { orderId, amount, reason } = req.body;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.paymentStatus !== 'PAID') throw new ApiError(400, 'Can only refund paid orders.');

  const refund = await prisma.refund.create({
    data: {
      orderId, userId: order.userId, amount, reason,
      status: 'PENDING',
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'REFUNDED',
      statusHistory: { create: { status: 'CANCELLED', note: `Refund initiated: Rs. ${amount}. Reason: ${reason}` } },
    },
  });

  res.status(201).json(new ApiResponse(201, refund, 'Refund initiated.'));
});
