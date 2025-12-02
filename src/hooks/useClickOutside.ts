import { useEffect, useRef } from "react";

/**
 * Hook to detect clicks outside a given element.
 * Useful for closing modals, dropdowns, tooltips, etc.
 *
 * @param handler - Function to execute when a click occurs outside the element
 * @param enabled - Whether the hook is active (default: true)
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
