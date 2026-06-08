import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../middleware/asyncHandler';

// GET /users/profile
export const getProfile = asyncHandler(async (req: any, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, name: true, email: true, phone: true, avatar: true,
      role: true, emailVerified: true, createdAt: true, lastLoginAt: true,
      addresses: { orderBy: { isDefault: 'desc' } },
      _count: { select: { orders: true, reviews: true, wishlistItems: true } },
    },
  });
  res.json(new ApiResponse(200, user));
});

// PUT /users/profile
export const updateProfile = asyncHandler(async (req: any, res: Response) => {
  const { name, phone } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { ...(name && { name }), ...(phone && { phone }) },
    select: { id: true, name: true, email: true, phone: true, avatar: true, role: true },
  });
  res.json(new ApiResponse(200, user, 'Profile updated.'));
});

// PUT /users/change-password
export const changePassword = asyncHandler(async (req: any, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || !user.password) throw new ApiError(400, 'Cannot change password for OAuth accounts.');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new ApiError(400, 'Current password is incorrect.');

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.user.id }, data: { password: hashedPassword } });
  await prisma.refreshToken.deleteMany({ where: { userId: req.user.id } });

  res.json(new ApiResponse(200, null, 'Password changed. Please login again.'));
});

// POST /users/addresses
export const addAddress = asyncHandler(async (req: any, res: Response) => {
  const { fullName, phone, line1, line2, city, state, pincode, country, isDefault } = req.body;
  if (isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
  }
  const address = await prisma.address.create({
    data: { userId: req.user.id, fullName, phone, line1, line2, city, state, pincode, country: country || 'India', isDefault: isDefault || false },
  });
  res.status(201).json(new ApiResponse(201, address, 'Address added.'));
});

// PUT /users/addresses/:id
export const updateAddress = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params;
  const address = await prisma.address.findFirst({ where: { id, userId: req.user.id } });
  if (!address) throw new ApiError(404, 'Address not found.');

  if (req.body.isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
  }
  const updated = await prisma.address.update({ where: { id }, data: req.body });
  res.json(new ApiResponse(200, updated, 'Address updated.'));
});

// DELETE /users/addresses/:id
export const deleteAddress = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params;
  const address = await prisma.address.findFirst({ where: { id, userId: req.user.id } });
  if (!address) throw new ApiError(404, 'Address not found.');

  await prisma.address.delete({ where: { id } });
  res.json(new ApiResponse(200, null, 'Address deleted.'));
});

// GET /users/addresses
export const getAddresses = asyncHandler(async (req: any, res: Response) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: { isDefault: 'desc' },
  });
  res.json(new ApiResponse(200, addresses));
});
