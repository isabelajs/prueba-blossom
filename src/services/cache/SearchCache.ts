/**
 * Structure for cached data entries
 * - Stores the cached value and the time it was cached.
 */
interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Simple in-memory cache for search results.
 *
 * - Uses a Map to store cached search results in memory.
 * - Time-to-live (TTL) is 30 minutes by default (configurable in constructor).
 * - Cache is lost if the page is reloaded (not persistent).
 */
class SearchCache {
  private cache = new Map<string, CachedData<unknown>>();
  private maxAge: number;

  /**
   * @param maxAgeMinutes Maximum age for cache entries, in minutes. Default is 30.
   */
  constructor(maxAgeMinutes: number = 30) {
    this.maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Retrieves a value from the cache.
   * Returns null if the entry does not exist or has expired.
   * @param key Cache key (string)
   * @returns The cached data if present and valid, otherwise null
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if entry has expired
    const age = Date.now() - cached.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Stores a value in the cache.
   * @param key Cache key (string)
   * @param data Data to store
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clears the entire cache.
   */
  clear(): void {
    this.cache.clear();
  }
}

// Singleton: provides a single shared instance of SearchCache
export const searchCache = new SearchCache(30); // 30 minutes

