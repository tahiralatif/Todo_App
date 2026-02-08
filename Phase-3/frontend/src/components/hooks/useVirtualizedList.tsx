'use client';

import { useState, useCallback, useMemo, ReactNode } from 'react';

interface VirtualizedListHookProps<T> {
  items: T[];
  itemHeight?: number;
  containerHeight?: number;
  overscanCount?: number;
}

interface ListOnScrollProps {
  scrollOffset: number;
  scrollUpdateWasRequested: boolean;
}

// Separate component to avoid complex callback issues
function VirtualizedListInnerComponent(props: {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  overscanCount: number;
  handleScroll: (params: ListOnScrollProps) => void;
  renderItem: (item: any, index: number) => ReactNode;
}) {
  const { items, itemHeight, containerHeight, overscanCount, handleScroll, renderItem } = props;
  
  // Use dynamic import to avoid SSR issues
  const List = require('react-window').FixedSizeList;
  
  return (
    <List
      height={containerHeight}
      itemCount={items.length}
      itemSize={itemHeight}
      overscanCount={overscanCount}
      onScroll={handleScroll}
    >
      {({ index, style }: { index: number; style: React.CSSProperties }) => (
        <div style={style}>{renderItem(items[index], index)}</div>
      )}
    </List>
  );
};

export function useVirtualizedList(props: VirtualizedListHookProps<any>) {
  const { items, itemHeight = 50, containerHeight = 400, overscanCount = 5 } = props;
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((params: ListOnScrollProps) => {
    setScrollTop(params.scrollOffset);
  }, []);

  const VirtualizedListComponent = useCallback(({ renderItem }: { renderItem: (item: any, index: number) => ReactNode }) => {
    return (
      <VirtualizedListInnerComponent
        items={items}
        itemHeight={itemHeight}
        containerHeight={containerHeight}
        overscanCount={overscanCount}
        handleScroll={handleScroll}
        renderItem={renderItem}
      />
    );
  }, [items, itemHeight, containerHeight, overscanCount, handleScroll]);

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
