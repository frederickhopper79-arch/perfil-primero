"use client";
import { useCallback, useRef, useState } from "react";

interface VirtualScrollOptions {
  itemCount: number;
  itemHeight: number;
  overscan?: number;
}

export function useVirtualScroll({ itemCount, itemHeight, overscan = 3 }: VirtualScrollOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  const onScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
      setContainerHeight(containerRef.current.clientHeight);
    }
  }, []);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = Array.from(
    { length: Math.max(0, endIndex - startIndex + 1) },
    (_, i) => ({ index: startIndex + i, offsetTop: (startIndex + i) * itemHeight })
  );

  const totalHeight = itemCount * itemHeight;

  return { containerRef, onScroll, visibleItems, totalHeight };
}
