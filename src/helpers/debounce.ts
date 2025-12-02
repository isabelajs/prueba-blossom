/**
 * Retrasa la ejecución de una función hasta que pasen {delay}ms sin nuevas llamadas
 * 
 * @param func - Función a ejecutar
 * @param delay - Delay en milisegundos (default: 300ms)
 */
export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  delay: number = 300
): (...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function debounced(...args: Parameters<F>) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Limpia un objeto removiendo propiedades undefined, null o strings vacíos
 * 
 * @param obj - Objeto a limpiar
 * @returns Nuevo objeto limpio
 */
export function cleanObject<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc as any)[key] = value;
    }
    return acc;
  }, {} as Partial<T>);
}
