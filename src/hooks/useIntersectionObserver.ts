import { useEffect, useRef } from "react";

interface UseIntersectionObserverProps {
  onIntersect: () => void;
  enabled: boolean;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Hook genérico para Intersection Observer
 * Útil para scroll infinito, lazy loading, etc.
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

