import { useState, useEffect, useCallback, useRef } from 'react';

interface KeyboardNavigationOptions {
  disabled?: boolean;
  wrapAround?: boolean;
  vertical?: boolean;
}

export const useKeyboardNavigation = <T extends HTMLElement>(
  itemsCount: number,
  options: KeyboardNavigationOptions = {}
) => {
  const { disabled = false, wrapAround = true, vertical = true } = options;
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const containerRef = useRef<T>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      let newIndex = focusedIndex;

      if (vertical) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          newIndex = focusedIndex + 1;
          if (newIndex >= itemsCount) {
            newIndex = wrapAround ? 0 : itemsCount - 1;
          }
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          newIndex = focusedIndex - 1;
          if (newIndex < 0) {
            newIndex = wrapAround ? itemsCount - 1 : 0;
          }
        }
      } else {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          newIndex = focusedIndex + 1;
          if (newIndex >= itemsCount) {
            newIndex = wrapAround ? 0 : itemsCount - 1;
          }
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          newIndex = focusedIndex - 1;
          if (newIndex < 0) {
            newIndex = wrapAround ? itemsCount - 1 : 0;
          }
        }
      }

      if (newIndex !== focusedIndex) {
        setFocusedIndex(newIndex);
      }
    },
    [focusedIndex, itemsCount, disabled, wrapAround, vertical]
  );

  useEffect(() => {
    if (containerRef.current) {
      const element = containerRef.current;
      element.addEventListener('keydown', handleKeyDown as EventListener);

      return () => {
        element.removeEventListener('keydown', handleKeyDown as EventListener);
      };
    }
  }, [handleKeyDown]);

  const focusItem = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  const resetFocus = useCallback(() => {
    setFocusedIndex(0);
  }, []);

  return {
    focusedIndex,
    focusItem,
    resetFocus,
    containerRef,
  };
};