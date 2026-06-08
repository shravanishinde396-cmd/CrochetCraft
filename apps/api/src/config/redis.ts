import Redis from 'ioredis';
import { logger } from '../utils/logger';

class MemoryRedisMock {
  private store = new Map<string, string>();
  private expiries = new Map<string, number>();

  async get(key: string): Promise<string | null> {
    this.checkExpiry(key);
    return this.store.get(key) || null;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<string> {
    this.store.set(key, value);
    if (mode === 'EX' && duration) {
      this.expiries.set(key, Date.now() + duration * 1000);
    }
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key);
    this.store.delete(key);
    this.expiries.delete(key);
    return existed ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    this.checkExpiry(key);
    const val = Number(this.store.get(key) || 0) + 1;
    this.store.set(key, String(val));
    return val;
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (this.store.has(key)) {
      this.expiries.set(key, Date.now() + seconds * 1000);
      return 1;
    }
    return 0;
  }

  private checkExpiry(key: string) {
    const expiry = this.expiries.get(key);
    if (expiry && expiry < Date.now()) {
      this.store.delete(key);
      this.expiries.delete(key);
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (event === 'connect') {
      setTimeout(() => callback(), 100);
    }
  }
}

let redis: any;

if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
  try {
    redis = new Redis(process.env.REDIS_URL);
    redis.on('error', (err: any) => {
      logger.error('Redis connection error, using MemoryMock fallback.');
      redis = new MemoryRedisMock();
    });
  } catch (error) {
    logger.error('Failed to initialize Redis, using MemoryMock.');
    redis = new MemoryRedisMock();
  }
} else {
  logger.info('Redis not configured, using in-memory mock client.');
  redis = new MemoryRedisMock();
}

export { redis };
export default redis;
