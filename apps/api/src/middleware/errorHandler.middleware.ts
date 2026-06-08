import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import logger from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  // If error is a Prisma validation or unique constraint error
  if (err.code && err.code.startsWith('P')) {
    let message = 'Database error occurred';
    let statusCode = 400;
    if (err.code === 'P2002') {
      message = `Duplicate field value entered: ${err.meta?.target || ''}`;
    } else if (err.code === 'P2025') {
      message = 'Record not found';
      statusCode = 404;
    }
    error = new ApiError(statusCode, message, [], err.stack);
  }

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  };

  logger.error(`${req.method} ${req.originalUrl} - ${error.statusCode} - ${error.message}`);
  if (process.env.NODE_ENV === 'development' && error.stack) {
    logger.error(error.stack);
  }

  res.status(error.statusCode).json(response);
};

export default errorHandler;
