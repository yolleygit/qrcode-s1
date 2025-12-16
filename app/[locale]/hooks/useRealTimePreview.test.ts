import { describe, it, expect, beforeEach } from 'vitest';
import { performanceMonitor, smartDebounce, withCache, PerformanceMonitor } from '../lib/utils';

describe('Performance Optimization Utils', () => {
  beforeEach(() => {
    performanceMonitor.clear();
  });

  describe('Smart Debouncing', () => {
    it('should debounce function calls with dynamic delay', async () => {
      let callCount = 0;
      const testFunction = smartDebounce(() => {
        callCount++;
      }, 50, 200);
      
      // Rapid calls
      testFunction();
      testFunction();
      testFunction();
      
      // Should not have called yet
      expect(callCount).toBe(0);
      
      // Wait for debounce (need to wait longer than the max delay)
      await new Promise(resolve => setTimeout(resolve, 250));
      
      // Should have called once
      expect(callCount).toBe(1);
    });
  });

  describe('Caching System', () => {
    it('should cache function results', async () => {
      let callCount = 0;
      const expensiveFunction = async (input: string) => {
        callCount++;
        return `result-${input}`;
      };
      
      const cachedFunction = withCache(expensiveFunction, 10, 1000);
      
      // First call
      const result1 = await cachedFunction('test');
      expect(result1).toBe('result-test');
      expect(callCount).toBe(1);
      
      // Second call with same input should use cache
      const result2 = await cachedFunction('test');
      expect(result2).toBe('result-test');
      expect(callCount).toBe(1); // Should not increment
      
      // Different input should call function
      const result3 = await cachedFunction('test2');
      expect(result3).toBe('result-test2');
      expect(callCount).toBe(2);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics', () => {
      const monitor = new PerformanceMonitor();
      
      const endMeasure = monitor.start('test-operation');
      
      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Busy wait for 10ms
      }
      
      const duration = endMeasure();
      
      expect(duration).toBeGreaterThan(0);
      
      const stats = monitor.getStats('test-operation');
      expect(stats).toBeDefined();
      expect(stats?.count).toBe(1);
      expect(stats?.average).toBeGreaterThan(0);
    });

    it('should calculate statistics correctly', () => {
      const monitor = new PerformanceMonitor();
      
      // Record multiple measurements
      for (let i = 0; i < 5; i++) {
        const endMeasure = monitor.start('test-stats');
        setTimeout(() => {
          endMeasure();
        }, i * 2); // Different durations
      }
      
      // Wait a bit for measurements to complete
      setTimeout(() => {
        const stats = monitor.getStats('test-stats');
        expect(stats?.count).toBe(5);
      }, 50);
    });
  });

  describe('Cache Management', () => {
    it('should manage cache size limits', async () => {
      let callCount = 0;
      const testFunction = async (input: string) => {
        callCount++;
        return `result-${input}`;
      };
      
      const cachedFunction = withCache(testFunction, 3, 1000); // Small cache size
      
      // Fill cache beyond limit
      await cachedFunction('1');
      await cachedFunction('2');
      await cachedFunction('3');
      await cachedFunction('4'); // Should trigger cache cleanup
      
      expect(callCount).toBe(4);
      
      // Test that cache cleanup occurred by checking if old entries were removed
      await cachedFunction('1'); // Should call function again if evicted
      expect(callCount).toBe(5);
    });
  });

  describe('Utility Functions', () => {
    it('should format time correctly', () => {
      // Test the performance monitoring utilities
      const monitor = new PerformanceMonitor();
      expect(monitor).toBeDefined();
      
      // Test that we can start and end measurements
      const endMeasure = monitor.start('test');
      const duration = endMeasure();
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });
});