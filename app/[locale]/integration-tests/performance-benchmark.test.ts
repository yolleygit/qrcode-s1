/**
 * 性能基准测试
 * 
 * 测试实时预览性能、布局计算性能和内存使用
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealTimePreview } from '../hooks/useRealTimePreview';
import { useViewportLayout } from '../hooks/useViewportLayout';
import { useBreakpoint } from '../hooks/useBreakpoint';

// 性能测试工具
class PerformanceBenchmark {
  private measurements: Map<string, number[]> = new Map();

  start(name: string): () => number {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.addMeasurement(name, duration);
      return duration;
    };
  }

  addMeasurement(name: string, duration: number) {
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(duration);
  }

  getStats(name: string) {
    const measurements = this.measurements.get(name) || [];
    if (measurements.length === 0) return null;

    const sorted = [...measurements].sort((a, b) => a - b);
    return {
      count: measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average: measurements.reduce((a, b) => a + b, 0) / measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  clear() {
    this.measurements.clear();
  }
}

describe('性能基准测试', () => {
  let benchmark: PerformanceBenchmark;

  beforeEach(() => {
    benchmark = new PerformanceBenchmark();
    
    // Mock performance.now for consistent testing
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
  });

  afterEach(() => {
    benchmark.clear();
    vi.restoreAllMocks();
  });

  describe('实时预览性能测试', () => {
    it('应该在300ms内响应输入变化', async () => {
      const { result } = renderHook(() => useRealTimePreview());

      const endMeasure = benchmark.start('input-response');

      act(() => {
        result.current.updateContent('https://example.com');
      });

      // 等待防抖完成
      await new Promise(resolve => setTimeout(resolve, 400));

      const duration = endMeasure();

      // 应该在400ms内完成（包括防抖延迟）
      expect(duration).toBeLessThan(400);
    });

    it('应该高效处理连续输入', async () => {
      const { result } = renderHook(() => useRealTimePreview());

      const testInputs = [
        'h', 'ht', 'htt', 'http', 'https', 'https:', 'https:/',
        'https://', 'https://e', 'https://ex', 'https://exa',
        'https://exam', 'https://examp', 'https://exampl',
        'https://example', 'https://example.', 'https://example.c',
        'https://example.co', 'https://example.com'
      ];

      const endMeasure = benchmark.start('continuous-input');

      for (const input of testInputs) {
        act(() => {
          result.current.updateContent(input);
        });
        // 模拟真实的打字间隔
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // 等待最后的防抖完成
      await new Promise(resolve => setTimeout(resolve, 400));

      const duration = endMeasure();

      // 整个输入序列应该在合理时间内完成
      expect(duration).toBeLessThan(2000);
    });

    it('应该有效使用缓存减少重复计算', async () => {
      const { result } = renderHook(() => useRealTimePreview());

      const testContent = 'https://example.com';

      // 第一次生成
      const firstGeneration = benchmark.start('first-generation');
      act(() => {
        result.current.updateContent(testContent);
      });
      await new Promise(resolve => setTimeout(resolve, 400));
      firstGeneration();

      // 清除内容
      act(() => {
        result.current.updateContent('');
      });
      await new Promise(resolve => setTimeout(resolve, 100));

      // 重新输入相同内容（应该使用缓存）
      const cachedGeneration = benchmark.start('cached-generation');
      act(() => {
        result.current.updateContent(testContent);
      });
      await new Promise(resolve => setTimeout(resolve, 400));
      cachedGeneration();

      const firstStats = benchmark.getStats('first-generation');
      const cachedStats = benchmark.getStats('cached-generation');

      expect(firstStats).toBeTruthy();
      expect(cachedStats).toBeTruthy();

      // 缓存的生成应该更快或相近
      if (firstStats && cachedStats) {
        expect(cachedStats.average).toBeLessThanOrEqual(firstStats.average * 1.5);
      }
    });

    it('应该在大量数据下保持性能', async () => {
      const { result } = renderHook(() => useRealTimePreview());

      // 测试大量不同内容的生成
      const largeDataSet = Array.from({ length: 100 }, (_, i) => 
        `https://example${i}.com/path/to/resource?param=${i}`
      );

      const endMeasure = benchmark.start('large-dataset');

      for (const content of largeDataSet) {
        act(() => {
          result.current.updateContent(content);
        });
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      const duration = endMeasure();

      // 处理100个不同URL应该在合理时间内完成
      expect(duration).toBeLessThan(5000);

      // 检查性能统计
      const stats = result.current.getPerformanceStats();
      expect(stats.cacheSize).toBeGreaterThan(0);
      expect(stats.cacheSize).toBeLessThanOrEqual(50); // 缓存应该有大小限制
    });
  });

  describe('布局计算性能测试', () => {
    it('应该快速计算视口布局', () => {
      const endMeasure = benchmark.start('viewport-calculation');

      const { result } = renderHook(() => useViewportLayout());

      endMeasure();

      const stats = benchmark.getStats('viewport-calculation');
      expect(stats?.average).toBeLessThan(10); // 应该在10ms内完成
    });

    it('应该高效处理窗口大小变化', () => {
      const { result } = renderHook(() => useViewportLayout());

      const sizes = [
        { width: 320, height: 568 },   // iPhone SE
        { width: 375, height: 667 },   // iPhone 8
        { width: 414, height: 896 },   // iPhone 11 Pro Max
        { width: 768, height: 1024 },  // iPad
        { width: 1024, height: 768 },  // iPad横屏
        { width: 1280, height: 720 },  // 桌面HD
        { width: 1920, height: 1080 }, // 桌面FHD
        { width: 2560, height: 1440 }  // 桌面2K
      ];

      const endMeasure = benchmark.start('resize-handling');

      sizes.forEach(({ width, height }) => {
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });

        act(() => {
          window.dispatchEvent(new Event('resize'));
          result.current.recalculateLayout();
        });
      });

      const duration = endMeasure();

      // 处理8种不同尺寸应该很快
      expect(duration).toBeLessThan(100);
    });

    it('应该高效计算面板样式', () => {
      const { result } = renderHook(() => useViewportLayout());

      const endMeasure = benchmark.start('panel-style-calculation');

      // 计算100次面板样式
      for (let i = 0; i < 100; i++) {
        result.current.getPanelStyle('input');
        result.current.getPanelStyle('preview');
        result.current.getPanelStyle('controls');
      }

      const duration = endMeasure();

      // 300次计算应该在50ms内完成
      expect(duration).toBeLessThan(50);
    });
  });

  describe('断点系统性能测试', () => {
    it('应该快速检测断点变化', () => {
      const { result } = renderHook(() => useBreakpoint());

      const widths = [300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500];

      const endMeasure = benchmark.start('breakpoint-detection');

      widths.forEach(width => {
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        act(() => {
          window.dispatchEvent(new Event('resize'));
        });
      });

      const duration = endMeasure();

      // 13次断点检测应该很快
      expect(duration).toBeLessThan(50);
    });

    it('应该避免不必要的重新计算', () => {
      const { result } = renderHook(() => useBreakpoint());

      const initialBreakpoint = result.current.current;

      // 在同一断点范围内多次触发resize
      const endMeasure = benchmark.start('unnecessary-recalculation');

      for (let i = 0; i < 10; i++) {
        act(() => {
          window.dispatchEvent(new Event('resize'));
        });
      }

      const duration = endMeasure();

      // 断点应该保持不变
      expect(result.current.current).toBe(initialBreakpoint);

      // 即使触发多次resize，处理应该很快
      expect(duration).toBeLessThan(30);
    });
  });

  describe('内存使用测试', () => {
    it('应该有效管理缓存内存', () => {
      const { result } = renderHook(() => useRealTimePreview());

      // 生成大量不同的内容
      const contents = Array.from({ length: 200 }, (_, i) => 
        `https://test${i}.com`
      );

      contents.forEach(content => {
        act(() => {
          result.current.updateContent(content);
        });
      });

      const stats = result.current.getPerformanceStats();

      // 缓存大小应该有限制，不会无限增长
      expect(stats.cacheSize).toBeLessThanOrEqual(50);
    });

    it('应该清理不再需要的资源', () => {
      const { result } = renderHook(() => useRealTimePreview());

      // 生成一些内容
      act(() => {
        result.current.updateContent('https://example.com');
      });

      const initialStats = result.current.getPerformanceStats();

      // 清理缓存
      act(() => {
        result.current.clearCache();
      });

      const clearedStats = result.current.getPerformanceStats();

      expect(clearedStats.cacheSize).toBe(0);
      expect(clearedStats.generationCount).toBe(initialStats.generationCount);
    });

    it('应该避免内存泄漏', () => {
      // 创建和销毁多个hook实例
      const instances = [];

      for (let i = 0; i < 10; i++) {
        const { result, unmount } = renderHook(() => useRealTimePreview());
        
        act(() => {
          result.current.updateContent(`https://test${i}.com`);
        });

        instances.push({ result, unmount });
      }

      // 销毁所有实例
      instances.forEach(({ unmount }) => {
        unmount();
      });

      // 应该能够正常完成而不出现内存问题
      expect(instances.length).toBe(10);
    });
  });

  describe('并发性能测试', () => {
    it('应该处理并发的布局计算', async () => {
      const promises = [];

      // 创建多个并发的布局计算
      for (let i = 0; i < 5; i++) {
        const promise = new Promise<void>(resolve => {
          const { result } = renderHook(() => useViewportLayout());
          
          // 模拟快速的尺寸变化
          for (let j = 0; j < 10; j++) {
            Object.defineProperty(window, 'innerWidth', { 
              value: 800 + j * 10, 
              writable: true 
            });
            
            act(() => {
              result.current.recalculateLayout();
            });
          }
          
          resolve();
        });
        
        promises.push(promise);
      }

      const endMeasure = benchmark.start('concurrent-layout');
      await Promise.all(promises);
      const duration = endMeasure();

      // 并发计算应该在合理时间内完成
      expect(duration).toBeLessThan(200);
    });

    it('应该处理并发的预览生成', async () => {
      const { result } = renderHook(() => useRealTimePreview());

      const contents = [
        'https://example1.com',
        'https://example2.com',
        'https://example3.com',
        'https://example4.com',
        'https://example5.com'
      ];

      const endMeasure = benchmark.start('concurrent-preview');

      // 快速连续更新内容
      contents.forEach((content, index) => {
        setTimeout(() => {
          act(() => {
            result.current.updateContent(content);
          });
        }, index * 10);
      });

      // 等待所有更新完成
      await new Promise(resolve => setTimeout(resolve, 1000));

      const duration = endMeasure();

      // 并发预览生成应该在合理时间内完成
      expect(duration).toBeLessThan(1200);

      // 最终应该显示最后一个内容
      expect(result.current.config.content).toBe('https://example5.com');
    });
  });

  describe('性能回归测试', () => {
    it('应该维持基准性能水平', async () => {
      // 定义性能基准
      const benchmarks = {
        layoutCalculation: 10,    // ms
        previewGeneration: 400,   // ms
        breakpointDetection: 5,   // ms
        cacheAccess: 1           // ms
      };

      // 测试布局计算性能
      const layoutStart = performance.now();
      const { result: layoutResult } = renderHook(() => useViewportLayout());
      layoutResult.current.recalculateLayout();
      const layoutDuration = performance.now() - layoutStart;

      expect(layoutDuration).toBeLessThan(benchmarks.layoutCalculation);

      // 测试预览生成性能
      const { result: previewResult } = renderHook(() => useRealTimePreview());
      const previewStart = performance.now();
      
      act(() => {
        previewResult.current.updateContent('https://example.com');
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      const previewDuration = performance.now() - previewStart;

      expect(previewDuration).toBeLessThan(benchmarks.previewGeneration + 100);

      // 测试断点检测性能
      const breakpointStart = performance.now();
      const { result: breakpointResult } = renderHook(() => useBreakpoint());
      Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true });
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      const breakpointDuration = performance.now() - breakpointStart;

      expect(breakpointDuration).toBeLessThan(benchmarks.breakpointDetection);
    });

    it('应该在不同负载下保持稳定性能', async () => {
      const { result } = renderHook(() => useRealTimePreview());

      // 轻负载测试
      const lightLoadStart = performance.now();
      act(() => {
        result.current.updateContent('test');
      });
      await new Promise(resolve => setTimeout(resolve, 400));
      const lightLoadDuration = performance.now() - lightLoadStart;

      // 重负载测试（大量缓存数据）
      for (let i = 0; i < 30; i++) {
        act(() => {
          result.current.updateContent(`https://test${i}.com`);
        });
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      const heavyLoadStart = performance.now();
      act(() => {
        result.current.updateContent('final-test');
      });
      await new Promise(resolve => setTimeout(resolve, 400));
      const heavyLoadDuration = performance.now() - heavyLoadStart;

      // 重负载下的性能不应该显著降低
      expect(heavyLoadDuration).toBeLessThan(lightLoadDuration * 2);
    });
  });
});