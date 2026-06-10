import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './config/database';

async function showLogs() {
  console.log('Fetching last 10 email logs from database...');
  const db = prisma as any;
  try {
    const logs = await db.emailLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    console.log(JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Error fetching logs:', error);
  }
}

showLogs().then(() => process.exit(0));
