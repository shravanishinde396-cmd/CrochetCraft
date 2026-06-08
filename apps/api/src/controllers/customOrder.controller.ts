import { Response } from 'express';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../middleware/asyncHandler';

// POST /custom-orders
export const createCustomOrder = asyncHandler(async (req: any, res: Response) => {
  const { title, description, budget, referenceImages, deadline, name, email, phone } = req.body;
  const customOrder = await prisma.customOrder.create({
    data: {
      userId: req.user.id,
      name: name || req.user.name,
      email: email || req.user.email,
      phone: phone || req.user.phone || '',
      description: title ? `${title}: ${description}` : description,
      referenceImages: referenceImages || [],
      dueDate: deadline ? new Date(deadline) : null,
    },
  });
  res.status(201).json(new ApiResponse(201, customOrder, 'Custom order request submitted.'));
});

// GET /custom-orders
export const getMyCustomOrders = asyncHandler(async (req: any, res: Response) => {
  const orders = await prisma.customOrder.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(new ApiResponse(200, orders));
});

// GET /custom-orders/:id
export const getCustomOrderById = asyncHandler(async (req: any, res: Response) => {
  const order = await prisma.customOrder.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!order) throw new ApiError(404, 'Custom order not found.');
  res.json(new ApiResponse(200, order));
});

// GET /custom-orders/admin/all (Admin)
export const getAllCustomOrders = asyncHandler(async (req: any, res: Response) => {
  const { status } = req.query;
  const where: any = {};
  if (status) where.status = status;

  const orders = await prisma.customOrder.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  res.json(new ApiResponse(200, orders));
});

// PUT /custom-orders/:id/status (Admin)
export const updateCustomOrderStatus = asyncHandler(async (req: any, res: Response) => {
  const { status, adminNote, quotedPrice } = req.body;
  const order = await prisma.customOrder.findUnique({ where: { id: req.params.id } });
  if (!order) throw new ApiError(404, 'Custom order not found.');

  const updated = await prisma.customOrder.update({
    where: { id: req.params.id },
    data: {
      status,
      adminNote,
      quotedPrice: quotedPrice ? parseFloat(quotedPrice) : null,
    },
  });
  res.json(new ApiResponse(200, updated, 'Custom order status updated.'));
});
