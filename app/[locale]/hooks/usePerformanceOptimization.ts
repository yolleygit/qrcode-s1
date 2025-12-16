import { useCallback, useRef, useState, useEffect } from 'react';
import { performanceMonitor } from '../lib/utils';

export interface PerformanceMetrics {
  averageTime: number;
  totalOperations: number;
  cacheHitRate: number;
  memoryUsage: number;
}

export interface OptimizationConfig {
  enableCaching: boolean;
  cacheSize: number;
  cacheTTL: number; // Time to live in milliseconds
  enableMetrics: boolean;
  enableThrottling: boolean;
  throttleDelay: number;
}

const DEFAULT_CONFIG: OptimizationConfig = {
  enableCaching: true,
  cacheSize: 50,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  enableMetrics: true,
  enableThrottling: true,
  throttleDelay: 100
};

export function usePerformanceOptimization<T extends (...args: any[]) => Promise<any>>(
  operation: T,
  config: Partial<OptimizationConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Cache management
  const cacheRef = useRef(new Map<string, { data: any; timestamp: number; hits: number }>());
  const metricsRef = useRef({
    totalOperations: 0,
    cacheHits: 0,
    totalTime: 0
  });
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    averageTime: 0,
    totalOperations: 0,
    cacheHitRate: 0,
    memoryUsage: 0
  });
  
  // Throttling
  const throttleRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRef = useRef<{ resolve: Function; reject: Function; args: Parameters<T> } | null>(null);
  
  // Generate cache key
  const getCacheKey = useCallback((args: Parameters<T>): string => {
    return JSON.stringify(args);
  }, []);
  
  // Cache operations
  const getFromCache = useCallback((key: string) => {
    if (!finalConfig.enableCaching) return null;
    
    const cached = cacheRef.current.get(key);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < finalConfig.cacheTTL) {
        cached.hits++;
        metricsRef.current.cacheHits++;
        return cached.data;
      } else {
        cacheRef.current.delete(key);
      }
    }
    return null;
  }, [finalConfig.enableCaching, finalConfig.cacheTTL]);
  
  const setToCache = useCallback((key: string, data: any) => {
    if (!finalConfig.enableCaching) return;
    
    // Manage cache size
    if (cacheRef.current.size >= finalConfig.cacheSize) {
      const entries = Array.from(cacheRef.current.entries());
      // Sort by hits (ascending) then by timestamp (ascending) - remove least used and oldest
      entries.sort((a, b) => {
        if (a[1].hits !== b[1].hits) {
          return a[1].hits - b[1].hits;
        }
        return a[1].timestamp - b[1].timestamp;
      });
      
      // Remove oldest 20% of entries
      const toRemove = Math.ceil(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        cacheRef.current.delete(entries[i][0]);
      }
    }
    
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0
    });
  }, [finalConfig.enableCaching, finalConfig.cacheSize]);
  
  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    metricsRef.current.cacheHits = 0;
  }, []);
  
  // Update metrics
  const updateMetrics = useCallback(() => {
    if (!finalConfig.enableMetrics) return;
    
    const { totalOperations, cacheHits, totalTime } = metricsRef.current;
    const cacheHitRate = totalOperations > 0 ? (cacheHits / totalOperations) * 100 : 0;
    const averageTime = totalOperations > 0 ? totalTime / totalOperations : 0;
    
    // Estimate memory usage (rough calculation)
    const memoryUsage = cacheRef.current.size * 1024; // Assume 1KB per cache entry
    
    setMetrics({
      averageTime: Math.round(averageTime * 100) / 100,
      totalOperations,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      memoryUsage
    });
  }, [finalConfig.enableMetrics]);
  
  // Optimized operation wrapper
  const optimizedOperation = useCallback(async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const cacheKey = getCacheKey(args);
    
    // Check cache first
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult !== null) {
      metricsRef.current.totalOperations++;
      updateMetrics();
      return cachedResult;
    }
    
    // Handle throttling
    if (finalConfig.enableThrottling) {
      return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
        // Cancel previous pending operation
        if (pendingRef.current) {
          clearTimeout(throttleRef.current!);
        }
        
        pendingRef.current = { resolve, reject, args };
        
        throttleRef.current = setTimeout(async () => {
          const pending = pendingRef.current;
          pendingRef.current = null;
          
          if (pending) {
            try {
              const result = await executeOperation(pending.args);
              pending.resolve(result);
            } catch (error) {
              pending.reject(error);
            }
          }
        }, finalConfig.throttleDelay);
      });
    } else {
      return executeOperation(args);
    }
  }, [getCacheKey, getFromCache, updateMetrics, finalConfig.enableThrottling, finalConfig.throttleDelay]);
  
  // Execute the actual operation
  const executeOperation = useCallback(async (args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const cacheKey = getCacheKey(args);
    const endMeasure = performanceMonitor.start('optimized-operation');
    
    metricsRef.current.totalOperations++;
    
    try {
      const result = await operation(...args);
      
      // Cache the result
      setToCache(cacheKey, result);
      
      // Update timing metrics
      const duration = endMeasure();
      metricsRef.current.totalTime += duration;
      
      updateMetrics();
      
      return result;
    } catch (error) {
      endMeasure();
      updateMetrics();
      throw error;
    }
  }, [operation, getCacheKey, setToCache, updateMetrics]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, []);
  
  // Periodic metrics update
  useEffect(() => {
    if (!finalConfig.enableMetrics) return;
    
    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [finalConfig.enableMetrics, updateMetrics]);
  
  return {
    execute: optimizedOperation,
    metrics,
    clearCache,
    getCacheStats: () => ({
      size: cacheRef.current.size,
      maxSize: finalConfig.cacheSize,
      hitRate: metrics.cacheHitRate
    }),
    getPerformanceStats: () => performanceMonitor.getStats('optimized-operation')
  };
}

// Hook for monitoring component render performance
export function useRenderPerformance(componentName: string) {
  const renderCountRef = useRef(0);
  const [renderMetrics, setRenderMetrics] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0
  });
  
  useEffect(() => {
    const endMeasure = performanceMonitor.start(`render-${componentName}`);
    renderCountRef.current++;
    
    // Measure render time in next tick
    const timeoutId = setTimeout(() => {
      const renderTime = endMeasure();
      const stats = performanceMonitor.getStats(`render-${componentName}`);
      
      setRenderMetrics({
        renderCount: renderCountRef.current,
        averageRenderTime: stats?.average || 0,
        lastRenderTime: renderTime
      });
    }, 0);
    
    return () => clearTimeout(timeoutId);
  });
  
  return renderMetrics;
}

// Hook for memory usage monitoring
export function useMemoryMonitoring() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);
  
  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        });
      }
    };
    
    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return memoryInfo;
}