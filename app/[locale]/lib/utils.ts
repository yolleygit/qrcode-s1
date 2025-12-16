import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 生成随机ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // 降级方案
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

// 下载文件
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 验证URL
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// 验证邮箱
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 格式化日期
export function formatDate(date: Date, locale: string = 'zh-CN'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// 获取相对时间
export function getRelativeTime(date: Date, locale: string = 'zh-CN'): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return '刚刚';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}分钟前`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}小时前`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}天前`;
  } else {
    return formatDate(date, locale);
  }
}

// 智能防抖 - 根据输入频率动态调整延迟
export function smartDebounce<T extends (...args: any[]) => any>(
  func: T,
  minDelay: number = 100,
  maxDelay: number = 500
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout;
  let lastCallTime = 0;
  let callCount = 0;
  
  const debouncedFunc = (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    // 计算调用频率
    if (timeSinceLastCall < 1000) {
      callCount++;
    } else {
      callCount = 1;
    }
    
    // 根据调用频率动态调整延迟
    const dynamicDelay = Math.min(
      maxDelay,
      Math.max(minDelay, minDelay + (callCount * 50))
    );
    
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
      callCount = 0;
    }, dynamicDelay);
    
    lastCallTime = now;
  };
  
  debouncedFunc.cancel = () => {
    clearTimeout(timeout);
    callCount = 0;
  };
  
  return debouncedFunc;
}

// 带缓存的函数包装器
export function withCache<T extends (...args: any[]) => Promise<any>>(
  func: T,
  cacheSize: number = 50,
  ttl: number = 5 * 60 * 1000 // 5分钟
): T {
  const cache = new Map<string, { value: any; timestamp: number }>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    const now = Date.now();
    
    // 检查缓存
    const cached = cache.get(key);
    if (cached && (now - cached.timestamp) < ttl) {
      return Promise.resolve(cached.value);
    }
    
    // 清理过期缓存
    if (cache.size >= cacheSize) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // 删除最旧的一半
      const toDelete = entries.slice(0, Math.floor(entries.length / 2));
      toDelete.forEach(([key]) => cache.delete(key));
    }
    
    // 执行函数并缓存结果
    return func(...args).then((result: any) => {
      cache.set(key, { value: result, timestamp: now });
      return result;
    });
  }) as T;
}

// 性能监控工具
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  start(label: string): () => number {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      const times = this.metrics.get(label)!;
      times.push(duration);
      
      // 保留最近100次记录
      if (times.length > 100) {
        times.shift();
      }
      
      return duration;
    };
  }
  
  getStats(label: string) {
    const times = this.metrics.get(label) || [];
    if (times.length === 0) return null;
    
    const sorted = [...times].sort((a, b) => a - b);
    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    
    return {
      count: times.length,
      average: Math.round(avg * 100) / 100,
      median: Math.round(median * 100) / 100,
      p95: Math.round(p95 * 100) / 100,
      min: Math.round(sorted[0] * 100) / 100,
      max: Math.round(sorted[sorted.length - 1] * 100) / 100
    };
  }
  
  clear(label?: string) {
    if (label) {
      this.metrics.delete(label);
    } else {
      this.metrics.clear();
    }
  }
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();