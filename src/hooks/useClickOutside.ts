import { useEffect, useRef } from "react";

/**
 * Hook para detectar clicks fuera de un elemento
 * Útil para cerrar modals, dropdowns, tooltips, etc.
 *
 * @param handler - Función a ejecutar cuando se hace click fuera
 * @param enabled - Si el hook está activo (default: true)
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  handler: () => void,
  enabled: boolean = true
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    // Usar mousedown/touchstart en vez de click para mejor UX
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [handler, enabled]);

  return ref;
};
