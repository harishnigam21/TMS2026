import { useState, useCallback, useRef, useEffect } from "react";

export function useElementHeight(): [
  (node: HTMLElement | null) => void,
  number
] {
  const [height, setHeight] = useState<number>(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);

      const resizeObserver = new ResizeObserver((entries) => {
        if (entries[0]) {
          setHeight(entries[0].contentRect.height);
        }
      });

      resizeObserver.observe(node);
      observerRef.current = resizeObserver;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [ref, height];
}