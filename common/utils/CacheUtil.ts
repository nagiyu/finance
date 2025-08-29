interface CacheType {
  value: any;
  timestamp: number;
}

export default class CacheUtil {
  private static cache = new Map<string, CacheType>();

  private static readonly CACHE_TTL = 10 * 60 * 1000;

  public static get<T>(key: string): T | null {
    const cacheData = this.cache.get(key);

    if (cacheData && (Date.now() - cacheData.timestamp < this.CACHE_TTL)) {
      return cacheData.value as T;
    }

    return null;
  }

  public static set(key: string, value: any[]): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  public static clear(key: string): void {
    this.cache.delete(key);
  }
}
