'use client';

import React, { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  connectionType?: string;
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0
  });
  const renderStartTime = useRef<number>(Date.now());

  useEffect(() => {
    // 测量页面加载时间
    const measureLoadTime = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        
        setMetrics(prev => ({
          ...prev,
          loadTime: loadTime
        }));
      }
    };

    // 测量渲染时间
    const measureRenderTime = () => {
      const renderTime = Date.now() - renderStartTime.current;
      setMetrics(prev => ({
        ...prev,
        renderTime: renderTime
      }));
    };

    // 获取内存使用情况（如果支持）
    const measureMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize
        }));
      }
    };

    // 获取网络连接类型（如果支持）
    const measureConnectionType = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setMetrics(prev => ({
          ...prev,
          connectionType: connection.effectiveType
        }));
      }
    };

    // 延迟执行测量，确保页面完全加载
    const timer = setTimeout(() => {
      measureLoadTime();
      measureRenderTime();
      measureMemoryUsage();
      measureConnectionType();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 测量函数执行时间
  const measureFunction = <T extends (...args: any[]) => any>(
    fn: T,
    name?: string
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      if (name) {
        console.log(`${name} 执行时间: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    }) as T;
  };

  // 测量异步函数执行时间
  const measureAsyncFunction = <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    name?: string
  ): T => {
    return (async (...args: Parameters<T>) => {
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();
      
      if (name) {
        console.log(`${name} 执行时间: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    }) as T;
  };

  return {
    metrics,
    measureFunction,
    measureAsyncFunction
  };
}

// 性能监控组件
export function PerformanceMonitor({ 
  showMetrics = false 
}: { 
  showMetrics?: boolean 
}) {
  const { metrics } = usePerformance();

  if (!showMetrics || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div>加载时间: {metrics.loadTime.toFixed(2)}ms</div>
      <div>渲染时间: {metrics.renderTime}ms</div>
      {metrics.memoryUsage && (
        <div>内存使用: {(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB</div>
      )}
      {metrics.connectionType && (
        <div>网络类型: {metrics.connectionType}</div>
      )}
    </div>
  );
}

// 懒加载图片 Hook
export function useLazyImage(src: string, options?: IntersectionObserverInit) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, options]);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setIsError(true);
      img.src = imageSrc;
    }
  }, [imageSrc]);

  return {
    imgRef,
    imageSrc,
    isLoaded,
    isError
  };
}

// 虚拟滚动 Hook
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex
  };
}