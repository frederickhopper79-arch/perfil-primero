"use client";
import { useVirtualScroll } from "@/lib/hooks/useVirtualScroll";

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  keyExtractor,
}: VirtualListProps<T>) {
  const { containerRef, onScroll, visibleItems, totalHeight } = useVirtualScroll({
    itemCount: items.length,
    itemHeight,
  });

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="virtualContainer"
      style={{ height, overflowY: "auto" }}
    >
      <div className="virtualInner" style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map(({ index, offsetTop }) => (
          <div
            key={keyExtractor(items[index], index)}
            className="virtualItem"
            style={{ position: "absolute", top: offsetTop, left: 0, right: 0, height: itemHeight }}
          >
            {renderItem(items[index], index)}
          </div>
        ))}
      </div>
    </div>
  );
}
