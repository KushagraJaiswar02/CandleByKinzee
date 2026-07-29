import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

let redisClient = null;

if (REDIS_URL) {
  if (!global.redisInstance) {
    global.redisInstance = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    });
    
    global.redisInstance.on('error', (err) => {
      console.error('[Redis Error]', err);
    });
  }
  redisClient = global.redisInstance;
} else {
  // Ephemeral in-memory mock fallback for development without Redis
  if (!global.mockRedisStore) {
    global.mockRedisStore = new Map();
    console.warn('[Redis] REDIS_URL not configured. Falling back to local in-memory mock store.');
  }
  
  redisClient = {
    async get(key) {
      const entry = global.mockRedisStore.get(key);
      if (!entry) return null;
      if (entry.expires && entry.expires < Date.now()) {
        global.mockRedisStore.delete(key);
        return null;
      }
      return entry.value;
    },
    async set(key, value, mode, duration) {
      let expires = null;
      if (mode === 'EX' && duration) {
        expires = Date.now() + duration * 1000;
      }
      global.mockRedisStore.set(key, { value: String(value), expires });
      return 'OK';
    },
    async del(key) {
      return global.mockRedisStore.delete(key) ? 1 : 0;
    },
    async incr(key) {
      const entry = global.mockRedisStore.get(key);
      let num = entry ? parseInt(entry.value, 10) || 0 : 0;
      num += 1;
      global.mockRedisStore.set(key, { value: String(num), expires: entry ? entry.expires : null });
      return num;
    },
    async expire(key, seconds) {
      const entry = global.mockRedisStore.get(key);
      if (entry) {
        entry.expires = Date.now() + seconds * 1000;
        global.mockRedisStore.set(key, entry);
        return 1;
      }
      return 0;
    }
  };
}

export async function invalidateProductCache() {
  if (REDIS_URL) {
    try {
      const keys = await global.redisInstance.keys('products:*');
      if (keys.length > 0) {
        await global.redisInstance.del(...keys);
      }
    } catch (err) {
      console.error('[Redis Invalidate Error]', err);
    }
  } else {
    if (global.mockRedisStore) {
      for (const key of global.mockRedisStore.keys()) {
        if (key.startsWith('products:')) {
          global.mockRedisStore.delete(key);
        }
      }
    }
  }
}

export default redisClient;
