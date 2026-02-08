// Bundle size and loading performance optimizations

/**
 * Dynamic import helper with error boundary and loading state
 */
export async function dynamicImport<T>(
  importFn: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      console.warn(`Dynamic import attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        throw error;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
    }
  }
  throw new Error('Failed to dynamically import module after retries');
};

/**
 * Lazy load components with preloading capability
 */
export class ComponentLoader {
  private static preloadQueue: Array<() => Promise<any>> = [];
  private static loadedComponents: Map<string, any> = new Map();

  static async load<T>(key: string, loader: () => Promise<{ default: T }>): Promise<T> {
    if (this.loadedComponents.has(key)) {
      return this.loadedComponents.get(key);
    }

    try {
      const module = await loader();
      this.loadedComponents.set(key, module.default);
      return module.default;
    } catch (error) {
      console.error(`Failed to load component ${key}:`, error);
      throw error;
    }
  }

  static preload(loader: () => Promise<any>): void {
    this.preloadQueue.push(loader);
  }

  static async processPreloads(): Promise<void> {
    const promises = this.preloadQueue.map(loader => loader().catch(console.warn));
    await Promise.all(promises);
    this.preloadQueue = [];
  }
}

/**
 * Image optimization utilities
 */
export class ImageOptimizer {
  static optimizeSrc(src: string, width?: number, quality?: number): string {
    // In a real implementation, this would use an image optimization service
    // like Next.js Image, Cloudinary, or Imgix
    if (!width) return src;

    // Example for Next.js Image optimization
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (quality) params.set('q', quality.toString());

    if (src.startsWith('http')) {
      // External image - construct optimization URL
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}${params}`;
    }

    return src; // Return original for local images
  }

  static async preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }
}

/**
 * Memory management for large datasets
 */
export class DataManager {
  private static readonly MAX_CACHE_SIZE = 1000;
  private static cache: Map<string, any> = new Map();

  static set(key: string, data: any): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry (Map preserves insertion order)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, data);
  }

  static get(key: string): any {
    return this.cache.get(key);
  }

  static clear(): void {
    this.cache.clear();
  }

  static size(): number {
    return this.cache.size;
  }
}

/**
 * Debounced search for large datasets
 */
export class SearchOptimizer {
  private static debouncedSearch: ((query: string) => void) | null = null;

  static createDebouncedSearch(
    searchFn: (query: string) => void,
    delay: number = 300
  ): (query: string) => void {
    if (this.debouncedSearch) {
      return this.debouncedSearch;
    }

    let timeoutId: NodeJS.Timeout;

    const debounced = (query: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        searchFn(query);
      }, delay);
    };

    this.debouncedSearch = debounced;
    return debounced;
  }
}

/**
 * Virtual scrolling data handler
 */
export interface PaginationOptions {
  pageSize: number;
  currentPage: number;
}

export class DataPaginator {
  static paginate<T>(data: T[], options: PaginationOptions): T[] {
    const startIndex = options.currentPage * options.pageSize;
    return data.slice(startIndex, startIndex + options.pageSize);
  }

  static getTotalPages(totalItems: number, pageSize: number): number {
    return Math.ceil(totalItems / pageSize);
  }
}

/**
 * Compression utilities for data transfer
 */
export class DataCompressor {
  // Simple compression using built-in browser APIs where available
  static async compress(data: any): Promise<string> {
    try {
      // For browsers that support CompressionStream
      if ('CompressionStream' in window) {
        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(JSON.stringify(data));

        writer.write(uint8Array);
        writer.close();

        const chunks: Uint8Array[] = [];
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            chunks.push(value);
          }
        }

        // Combine chunks
        const combined = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }

        // Convert to base64 using a method that works without downlevelIteration
        let binary = '';
        const bytes = combined as unknown as number[];
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      } else {
        // Fallback to simple stringification
        return JSON.stringify(data);
      }
    } catch (error) {
      console.warn('Compression failed, returning uncompressed data:', error);
      return JSON.stringify(data);
    }
  }

  static async decompress(compressedData: string): Promise<any> {
    try {
      // For browsers that support DecompressionStream
      if ('DecompressionStream' in window) {
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        // Convert base64 to uint8array
        const binaryString = atob(compressedData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        writer.write(bytes);
        writer.close();

        const chunks: Uint8Array[] = [];
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            chunks.push(value);
          }
        }

        // Combine chunks and convert back to string
        const combined = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }

        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(combined));
      } else {
        // Fallback to simple parsing
        return JSON.parse(compressedData);
      }
    } catch (error) {
      console.warn('Decompression failed, attempting simple parse:', error);
      return JSON.parse(compressedData);
    }
  }
}