import { useState, useCallback, useMemo, ReactNode } from 'react';
import { FixedSizeList as List, ListOnScrollProps } from 'react-window';

interface VirtualizedListHookProps<T> {
  items: T[];
  itemHeight?: number;
  containerHeight?: number;
  overscanCount?: number;
}

export const useVirtualizedList = <T,>({
  items,
  itemHeight = 50,
  containerHeight = 400,
  overscanCount = 5,
}: VirtualizedListHookProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((params: ListOnScrollProps) => {
    setScrollTop(params.scrollOffset);
  }, []);

  const VirtualizedListComponent = useCallback(
    ({ renderItem }: { renderItem: (item: T, index: number) => ReactNode }) => (
      <List
        height={containerHeight}
        itemCount={items.length}
        itemSize={itemHeight}
        overscanCount={overscanCount}
        onScroll={handleScroll}
      >
        {({ index, style }) => <div style={style}>{renderItem(items[index], index)}</div>}
      </List>
    ),
    [items, containerHeight, itemHeight, overscanCount, handleScroll]
  );

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscanCount,
      items.length
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscanCount, items.length]);

  return {
    VirtualizedListComponent,
    visibleRange,
    scrollTop,
    containerHeight,
    itemHeight,
  };
};