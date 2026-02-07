// Performance optimization utilities

/**
 * Debounce function to limit the rate at which a function can fire
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to ensure a function is called at most once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memoize function to cache results of expensive function calls
 */
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func.apply(this, args) as ReturnType<T>;
    cache.set(key, result);

    return result;
  } as T;
}

/**
 * Lazy load images to improve performance
 */
export const lazyLoadImage = (imageSrc: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
};

/**
 * Virtual scrolling calculations
 */
export interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  totalItems: number;
  overscan?: number;
}

export interface VirtualizationResult {
  startIndex: number;
  endIndex: number;
  visibleItems: number;
}

export const calculateVisibleItems = (
  scrollTop: number,
  options: VirtualizationOptions
): VirtualizationResult => {
  const { itemHeight, containerHeight, totalItems, overscan = 5 } = options;

  const itemsPerViewport = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(totalItems - 1, startIndex + itemsPerViewport + (2 * overscan));
  const visibleItems = endIndex - startIndex + 1;

  return {
    startIndex,
    endIndex,
    visibleItems,
  };
};

/**
 * Memory management utilities
 */
export class MemoryManager {
  private static instance: MemoryManager;
  private observers: Set<() => void> = new Set();

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Subscribe to memory pressure events
   */
  subscribe(callback: () => void): () => void {
    this.observers.add(callback);

    return () => {
      this.observers.delete(callback);
    };
  }

  /**
   * Clear cached data to free up memory
   */
  clearCache(): void {
    // In a real implementation, this would clear various caches
    console.info('Memory cleared');
  }

  /**
   * Check if the browser supports memory pressure API
   */
  static supportsMemoryPressure(): boolean {
    return 'memory' in performance;
  }

  /**
   * Get current memory usage (when available)
   */
  static getMemoryInfo(): PerformanceMemory | null {
    if (MemoryManager.supportsMemoryPressure()) {
      return (performance as any).memory;
    }
    return null;
  }
}

/**
 * Batch DOM updates to improve performance
 */
export class BatchUpdater {
  private queue: Array<() => void> = [];
  private scheduled = false;

  schedule(updateFn: () => void): void {
    this.queue.push(updateFn);

    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  private flush(): void {
    while (this.queue.length > 0) {
      const update = this.queue.shift();
      if (update) update();
    }
    this.scheduled = false;
  }
}

export const batchUpdater = new BatchUpdater();