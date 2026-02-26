/** Simple in-memory cache with TTL. Survives HMR via globalThis singleton. */

interface CacheEntry<T = unknown> {
  data: T;
  expiry: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

class ServerCache {
  private store = new Map<string, CacheEntry>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
    this.store.set(key, { data, expiry: Date.now() + ttlMs });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  /** Delete every key that starts with the given prefix. */
  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }
}

// Survive HMR in dev — same pattern as db.ts
const globalForCache = globalThis as unknown as { serverCache: ServerCache };
export const cache = globalForCache.serverCache || new ServerCache();
if (process.env.NODE_ENV !== "production") globalForCache.serverCache = cache;
