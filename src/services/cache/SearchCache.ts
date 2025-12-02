/**
 * Estructura de datos cacheados
 */
interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Cache simple en memoria para resultados de búsqueda
 * - Guarda resultados en Map (memoria)
 * - TTL de 30 minutos por defecto
 * - Se pierde al recargar la página
 */
class SearchCache {
  private cache = new Map<string, CachedData<unknown>>();
  private maxAge: number;

  constructor(maxAgeMinutes: number = 30) {
    this.maxAge = maxAgeMinutes * 60 * 1000; // Convertir a ms
  }

  /**
   * Obtiene un valor del cache
   * Retorna null si no existe o ha expirado
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Verificar si ha expirado
    const age = Date.now() - cached.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Guarda un valor en el cache
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Limpia todo el cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Singleton: una única instancia compartida
export const searchCache = new SearchCache(30); // 30 minutos

