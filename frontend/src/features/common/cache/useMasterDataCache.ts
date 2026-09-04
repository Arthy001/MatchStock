// Smart In-Memory Cache Engine for Master Data Features
const cacheStore: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_TTL_MS = 60 * 1000; // 1 minute default TTL

export const masterDataCache = {
  get: <T>(key: string): T | null => {
    const cached = cacheStore[key];
    if (!cached) return null;
    const isExpired = Date.now() - cached.timestamp > CACHE_TTL_MS;
    if (isExpired) {
      delete cacheStore[key];
      return null;
    }
    return cached.data as T;
  },

  set: <T>(key: string, data: T): void => {
    cacheStore[key] = {
      data,
      timestamp: Date.now(),
    };
  },

  invalidate: (key?: string): void => {
    if (key) {
      delete cacheStore[key];
    } else {
      Object.keys(cacheStore).forEach((k) => delete cacheStore[k]);
    }
  },
};
