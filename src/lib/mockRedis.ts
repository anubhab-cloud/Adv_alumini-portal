// Mock Redis Client for Local/Offline Testing. Persists states to LocalStorage.

const isClient = typeof window !== 'undefined';

interface CacheItem {
  value: any;
  expiresAt: number | null;
}

export const mockRedis = {
  // 1. Basic Get/Set with TTL (in seconds)
  get: <T>(key: string): T | null => {
    if (!isClient) return null;
    const data = localStorage.getItem(`redis:string:${key}`);
    if (!data) return null;

    try {
      const item: CacheItem = JSON.parse(data);
      if (item.expiresAt && Date.now() > item.expiresAt) {
        localStorage.removeItem(`redis:string:${key}`);
        return null;
      }
      return item.value as T;
    } catch {
      return null;
    }
  },

  set: (key: string, value: any, ttlSeconds?: number): void => {
    if (!isClient) return;
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    const item: CacheItem = { value, expiresAt };
    localStorage.setItem(`redis:string:${key}`, JSON.stringify(item));
  },

  del: (key: string): void => {
    if (!isClient) return;
    localStorage.removeItem(`redis:string:${key}`);
    localStorage.removeItem(`redis:zset:${key}`);
    localStorage.removeItem(`redis:counter:${key}`);
  },

  // 2. Atomic Decrement for Event Seat Capacities
  decr: (key: string, initialValue: number = 300): number => {
    if (!isClient) return 0;
    const stored = localStorage.getItem(`redis:counter:${key}`);
    let current = stored !== null ? parseInt(stored, 10) : initialValue;
    current -= 1;
    localStorage.setItem(`redis:counter:${key}`, current.toString());
    return current;
  },

  getCounter: (key: string, defaultValue: number = 300): number => {
    if (!isClient) return defaultValue;
    const stored = localStorage.getItem(`redis:counter:${key}`);
    return stored !== null ? parseInt(stored, 10) : defaultValue;
  },

  // 3. Sorted Sets (ZSET) for Waitlisting
  zadd: (key: string, score: number, member: string): void => {
    if (!isClient) return;
    const stored = localStorage.getItem(`redis:zset:${key}`);
    let zset: { member: string; score: number }[] = stored ? JSON.parse(stored) : [];
    
    // Remove if member exists
    zset = zset.filter(item => item.member !== member);
    
    // Insert and sort
    zset.push({ member, score });
    zset.sort((a, b) => a.score - b.score);
    
    localStorage.setItem(`redis:zset:${key}`, JSON.stringify(zset));
  },

  zrange: (key: string): string[] => {
    if (!isClient) return [];
    const stored = localStorage.getItem(`redis:zset:${key}`);
    if (!stored) return [];
    const zset: { member: string; score: number }[] = JSON.parse(stored);
    return zset.map(item => item.member);
  },

  zrank: (key: string, member: string): number => {
    if (!isClient) return -1;
    const members = mockRedis.zrange(key);
    return members.indexOf(member);
  },

  // 4. Rate Limiting (Sliding Window Log)
  checkRateLimit: (ip: string, endpoint: string, maxRequests: number = 20, windowSeconds: number = 60): { allowed: boolean; remaining: number } => {
    if (!isClient) return { allowed: true, remaining: maxRequests };
    
    const key = `redis:ratelimit:${ip}:${endpoint}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;
    
    const stored = localStorage.getItem(key);
    let timestamps: number[] = stored ? JSON.parse(stored) : [];
    
    // Prune expired timestamps
    timestamps = timestamps.filter(ts => ts > windowStart);
    
    if (timestamps.length >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    
    // Add current request
    timestamps.push(now);
    localStorage.setItem(key, JSON.stringify(timestamps));
    
    return { allowed: true, remaining: maxRequests - timestamps.length };
  }
};
