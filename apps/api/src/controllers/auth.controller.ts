import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../middleware/asyncHandler';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import { sendMail } from '../utils/emailSender';
import { ADMIN_EMAIL } from '../config/email';
import { getWelcomeEmailHtml, getPasswordResetHtml, getAdminNewUserRegisteredHtml } from '../utils/emailTemplates';
import logger from '../utils/logger';

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-64-char-refresh-secret';

// POST /auth/register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new ApiError(409, 'User with this email already exists.');

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, phone, role: 'CUSTOMER' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  // Send welcome email in the background
  const welcomeHtml = getWelcomeEmailHtml(user.name);
  sendMail({
    to: user.email,
    subject: 'Welcome to CrochetCraft Pro!',
    html: welcomeHtml,
  }).catch((err) => {
    logger.error(`Failed to send welcome email to ${user.email}:`, err);
  });

  // Send notification email to admin in the background
  const adminHtml = getAdminNewUserRegisteredHtml(user);
  sendMail({
    to: ADMIN_EMAIL,
    subject: `Admin Alert: New User Registered - ${user.name}`,
    html: adminHtml,
  }).catch((err) => {
    logger.error(`Failed to send admin user registration notification for ${user.email}:`, err);
  });

  res.status(201).json(new ApiResponse(201, { user, accessToken, refreshToken }, 'Registration successful.'));
});

// POST /auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) throw new ApiError(401, 'Invalid email or password.');
  if (!user.isActive) throw new ApiError(403, 'Account is deactivated. Contact support.');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password.');

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  // Rotate: delete old refresh tokens for this user, store new one
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  const { password: _, ...safeUser } = user;
  res.json(new ApiResponse(200, { user: safeUser, accessToken, refreshToken }, 'Login successful.'));
});

// POST /auth/refresh-token
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, 'Refresh token is required.');

  const storedToken = await prisma.refreshToken.findFirst({
    where: { token: refreshToken, expiresAt: { gt: new Date() } },
  });
  if (!storedToken) throw new ApiError(401, 'Invalid or expired refresh token.');

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, email: true, role: true } });
    if (!user) throw new ApiError(401, 'User not found.');

    const newAccessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    res.json(new ApiResponse(200, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Token refreshed.'));
  } catch {
    throw new ApiError(401, 'Invalid refresh token.');
  }
});

// POST /auth/logout
export const logout = asyncHandler(async (req: any, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  res.json(new ApiResponse(200, null, 'Logged out successfully.'));
});

// POST /auth/forgot-password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal user existence
    return res.json(new ApiResponse(200, null, 'If the email exists, a reset link has been sent.'));
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  await prisma.passwordReset.deleteMany({ where: { userId: user.id } });
  await prisma.passwordReset.create({
    data: { token: hashedToken, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });

  // Send password reset email in the background
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  const resetHtml = getPasswordResetHtml(user.name, resetUrl);
  sendMail({
    to: user.email,
    subject: 'Reset Your Password - CrochetCraft Pro',
    html: resetHtml,
  }).catch((err) => {
    logger.error(`Failed to send password reset email to ${user.email}:`, err);
  });

  res.json(new ApiResponse(200, { resetToken }, 'Password reset link sent to your email.'));
});

// POST /auth/reset-password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const resetRecord = await prisma.passwordReset.findFirst({
    where: { token: hashedToken, expiresAt: { gt: new Date() } },
  });
  if (!resetRecord) throw new ApiError(400, 'Invalid or expired reset token.');

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: resetRecord.userId }, data: { password: hashedPassword } });
  await prisma.passwordReset.deleteMany({ where: { userId: resetRecord.userId } });
  await prisma.refreshToken.deleteMany({ where: { userId: resetRecord.userId } });

  res.json(new ApiResponse(200, null, 'Password reset successfully. Please login with your new password.'));
});

// GET /auth/me
export const getMe = asyncHandler(async (req: any, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, name: true, email: true, phone: true, avatar: true,
      role: true, emailVerified: true, createdAt: true, lastLoginAt: true,
      addresses: true,
    },
  });
  res.json(new ApiResponse(200, user, 'User profile fetched.'));
});
