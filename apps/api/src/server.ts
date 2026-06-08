import app from './app';
import logger from './utils/logger';
import { prisma } from './config/database';
import { startCronJobs } from './config/cron';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('Database connected successfully.');

    // Start background tasks
    startCronJobs();

    app.listen(PORT, () => {
      logger.info(`CrochetCraft Pro API running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
