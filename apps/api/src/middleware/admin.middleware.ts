import { Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const adminOnly = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized. Please log in first.');
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
    throw new ApiError(403, 'Access denied. Admins only.');
  }

  next();
};

export default adminOnly;
