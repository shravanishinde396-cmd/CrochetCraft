import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from './asyncHandler';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-64-char-access-secret';

export const protect = asyncHandler(async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      throw new ApiError(401, 'User account no longer exists.');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'User account is deactivated.');
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token has expired.');
    }
    throw new ApiError(401, 'Invalid access token.');
  }
});

export default protect;
