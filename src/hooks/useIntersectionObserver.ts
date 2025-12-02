import { useEffect, useRef } from "react";

interface UseIntersectionObserverProps {
  /**
   * Callback called when the observed element enters the viewport.
   */
  onIntersect: () => void;
  /**
   * If false, the observer will not be attached or triggered.
   */
  enabled: boolean;
  /**
   * Threshold at which the observer callback is triggered.
   * Defaults to 0.1 (10% of the element is visible).
   */
  threshold?: number;
  /**
   * Root margin for the observer (e.g., "0px", "100px 0px").
   * Defaults to "0px".
   */
  rootMargin?: string;
}

/**
 * Generic Intersection Observer hook.
 * Useful for infinite scroll, lazy loading, and triggering actions when an element enters the viewport.
 *
 * Usage:
 *   const { ref } = useIntersectionObserver({ onIntersect, enabled });
 *   <div ref={ref} />
 *
 * @param {UseIntersectionObserverProps} props - Configuration options for the observer.
 * @returns {{ ref: React.RefObject<HTMLDivElement> }} An object containing the ref to assign to the target element.
 */
export const useIntersectionObserver = ({
  onIntersect,
  enabled,
  threshold = 0.1,
  rootMargin = "0px",
}: UseIntersectionObserverProps) => {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onIntersect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [enabled, onIntersect, threshold, rootMargin]);

  return { ref: targetRef };
};
