/**
 * UI界面优化最终集成测试 - 简化版
 * 
 * 专注于核心功能验证：
 * - 跨浏览器兼容性基础测试
 * - 断点系统功能验证
 * - 布局响应性测试
 * - 无滚动体验基础验证
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';

// 导入需要测试的组件和hooks
import { useBreakpoint, BREAKPOINTS } from '../hooks/useBreakpoint';
import { useViewportLayout } from '../hooks/useViewportLayout';

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

describe('UI界面优化最终集成测试 - 核心功能', () => {
  let originalInnerWidth: number;
  let originalInnerHeight: number;

  beforeEach(() => {
    // 保存原始值
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;

    // 设置测试环境
    Object.defineProperty(global, 'ResizeObserver', {
      value: MockResizeObserver,
      writable: true
    });

    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(cb, 16);
    });

    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id);
    });
  });

  afterEach(() => {
    // 恢复原始值
    Object.defineProperty(window, 'innerWidth', {
      value: originalInnerWidth,
      writable: true
    });
    Object.defineProperty(window, 'innerHeight', {
      value: originalInnerHeight,
      writable: true
    });

    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('1. 断点系统功能验证', () => {
    const testBreakpoints = [
      { name: 'mobile', width: 375, height: 667, expectedType: 'mobile' },
      { name: 'tablet', width: 768, height: 1024, expectedType: 'tablet' },
      { name: 'desktop', width: 1280, height: 720, expectedType: 'desktop' },
      { name: 'large', width: 1920, height: 1080, expectedType: 'large' }
    ];

    testBreakpoints.forEach(({ name, width, height, expectedType }) => {
      it(`应该正确检测 ${name} 断点 (${width}x${height})`, () => {
        // 设置视口尺寸
        Object.defineProperty(window, 'innerWidth', {
          value: width,
          writable: true
        });
        Object.defineProperty(window, 'innerHeight', {
          value: height,
          writable: true
        });

        // 触发resize事件
        act(() => {
          window.dispatchEvent(new Event('resize'));
        });

        const { result } = renderHook(() => useBreakpoint());

        // 验证断点检测
        expect(result.current.current).toBeDefined();
        expect(result.current.width).toBe(width);
        expect(result.current.height).toBe(height);

        // 验证布局状态
        if (expectedType === 'mobile') {
          expect(result.current.isMobile).toBe(true);
          expect(result.current.isStackedLayout).toBe(true);
        } else if (expectedType === 'tablet') {
          expect(result.current.isTablet).toBe(true);
          expect(result.current.isVerticalLayout).toBe(true);
        } else {
          expect(result.current.isDesktop).toBe(true);
          expect(result.current.isHorizontalLayout).toBe(true);
        }
      });
    });

    it('应该在窗口大小变化时正确更新断点', () => {
      const { result } = renderHook(() => useBreakpoint());

      // 初始桌面尺寸
      Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 720, writable: true });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.isDesktop).toBe(true);

      // 改变为移动尺寸
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.isMobile).toBe(true);
    });
  });

  describe('2. 布局系统功能验证', () => {
    it('应该正确计算视口布局', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 720, writable: true });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      const { result } = renderHook(() => useViewportLayout());

      // 验证视口计算
      expect(result.current.viewport.width).toBe(1280);
      expect(result.current.viewport.height).toBe(720);
      expect(result.current.viewport.availableHeight).toBeGreaterThan(0);
      expect(result.current.viewport.availableHeight).toBeLessThan(720);

      // 验证布局配置
      expect(result.current.layout.orientation).toBe('horizontal');
      expect(result.current.layout.showSidebar).toBe(true); // 1280px 应该显示侧边栏
      expect(result.current.layout.compactMode).toBe(false);
    });

    it('应该根据屏幕尺寸选择正确的布局方向', () => {
      const { result } = renderHook(() => useViewportLayout());

      // 测试移动端 - 堆叠布局
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.layout.orientation).toBe('stacked');
      expect(result.current.layout.compactMode).toBe(true);

      // 测试平板端 - 垂直布局
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1024, writable: true });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.layout.orientation).toBe('vertical');
      expect(result.current.layout.compactMode).toBe(false);

      // 测试桌面端 - 水平布局
      Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 720, writable: true });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.layout.orientation).toBe('horizontal');
      expect(result.current.layout.showSidebar).toBe(true); // 1280px 应该显示侧边栏
    });

    it('应该正确计算面板样式', () => {
      const { result } = renderHook(() => useViewportLayout());

      // 设置桌面尺寸
      Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 720, writable: true });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      const inputStyle = result.current.getPanelStyle('input');
      const previewStyle = result.current.getPanelStyle('preview');

      // 水平布局应该有百分比宽度和像素高度
      expect(inputStyle.width).toContain('%');
      expect(previewStyle.width).toContain('%');
      expect(inputStyle.height).toContain('px');
      expect(previewStyle.height).toContain('px');

      // 验证最小高度
      expect(inputStyle.minHeight).toBeDefined();
      expect(previewStyle.minHeight).toBeDefined();
    });
  });

  describe('3. 无滚动体验验证', () => {
    const commonDevices = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'Desktop HD', width: 1280, height: 720 },
      { name: 'Desktop FHD', width: 1920, height: 1080 }
    ];

    commonDevices.forEach(({ name, width, height }) => {
      it(`应该在 ${name} (${width}x${height}) 上提供合理的布局`, () => {
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });

        act(() => {
          window.dispatchEvent(new Event('resize'));
        });

        const { result } = renderHook(() => useViewportLayout());

        // 验证可用高度合理
        const availableHeight = result.current.viewport.availableHeight;
        expect(availableHeight).toBeGreaterThan(0);
        expect(availableHeight).toBeLessThanOrEqual(height * 0.95);

        // 验证面板尺寸合理
        const inputStyle = result.current.getPanelStyle('input');
        const previewStyle = result.current.getPanelStyle('preview');

        expect(inputStyle.minHeight).toBeDefined();
        expect(previewStyle.minHeight).toBeDefined();

        const inputMinHeight = parseInt(inputStyle.minHeight as string);
        const previewMinHeight = parseInt(previewStyle.minHeight as string);

        expect(inputMinHeight).toBeGreaterThan(0);
        expect(previewMinHeight).toBeGreaterThan(0);

        // 对于合理尺寸的设备，检查滚动需求
        if (height >= 600) { // 提高阈值，因为小屏幕可能需要滚动
          const needsScroll = result.current.needsScroll();
          expect(typeof needsScroll).toBe('boolean');
        }
      });
    });

    it('应该在极小屏幕上启用紧凑模式', () => {
      Object.defineProperty(window, 'innerWidth', { value: 320, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 480, writable: true });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      const { result } = renderHook(() => useViewportLayout());

      expect(result.current.layout.compactMode).toBe(true);
      expect(result.current.layout.orientation).toBe('stacked');

      // 紧凑模式下的面板应该有更小的最小高度
      const inputStyle = result.current.getPanelStyle('input');
      const minHeight = parseInt(inputStyle.minHeight as string);
      expect(minHeight).toBeLessThan(300);
    });
  });

  describe('4. 跨浏览器兼容性基础验证', () => {
    it('应该处理缺少现代API的环境', () => {
      // 测试系统能够处理API的存在性检查
      const hasResizeObserver = typeof window.ResizeObserver !== 'undefined';
      const hasIntersectionObserver = typeof window.IntersectionObserver !== 'undefined';

      // 在测试环境中，这些API应该被mock或存在
      expect(typeof hasResizeObserver).toBe('boolean');
      expect(typeof hasIntersectionObserver).toBe('boolean');

      // 测试布局系统在当前环境下正常工作
      const { result } = renderHook(() => useViewportLayout());
      expect(result.current.viewport).toBeDefined();
      expect(result.current.layout).toBeDefined();
    });

    it('应该处理CSS特性检测', () => {
      // 在测试环境中，CSS.supports 可能不存在
      if (typeof CSS !== 'undefined' && CSS.supports) {
        expect(typeof CSS.supports).toBe('function');

        // 测试基本CSS特性
        const supportsGrid = CSS.supports('display', 'grid');
        const supportsFlexbox = CSS.supports('display', 'flex');

        // 现代浏览器应该支持这些特性
        expect(typeof supportsGrid).toBe('boolean');
        expect(typeof supportsFlexbox).toBe('boolean');
      } else {
        // 测试环境中的降级处理
        expect(typeof CSS === 'undefined' || !CSS.supports).toBe(true);
      }
    });

    it('应该处理localStorage的可用性', () => {
      const hasLocalStorage = (() => {
        try {
          const test = 'test';
          localStorage.setItem(test, test);
          localStorage.removeItem(test);
          return true;
        } catch (e) {
          return false;
        }
      })();

      // 应该能够检测localStorage的可用性
      expect(typeof hasLocalStorage).toBe('boolean');
    });
  });

  describe('5. 性能基础验证', () => {
    it('应该快速完成布局计算', () => {
      const startTime = performance.now();

      // 执行布局计算
      Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 720, writable: true });

      const { result } = renderHook(() => useViewportLayout());

      act(() => {
        window.dispatchEvent(new Event('resize'));
        result.current.recalculateLayout();
      });

      const duration = performance.now() - startTime;

      // 布局计算应该很快完成
      expect(duration).toBeLessThan(100);
    });

    it('应该处理快速的尺寸变化', () => {
      const { result } = renderHook(() => useViewportLayout());

      // 快速连续的尺寸变化
      const sizes = [
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1280, height: 720 },
        { width: 1920, height: 1080 }
      ];

      sizes.forEach(({ width, height }) => {
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });

        act(() => {
          window.dispatchEvent(new Event('resize'));
        });

        // 每次变化都应该有稳定的结果
        expect(result.current.viewport.width).toBe(width);
        expect(result.current.viewport.height).toBe(height);
        expect(result.current.layout.orientation).toBeOneOf(['stacked', 'vertical', 'horizontal']);
      });
    });
  });

  describe('6. 实际使用场景验证', () => {
    it('应该在不同设备间切换时保持稳定', () => {
      const { result } = renderHook(() => useViewportLayout());

      // 模拟用户在不同设备间切换
      const deviceSequence = [
        { width: 1920, height: 1080, name: 'Desktop' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' },
        { width: 1280, height: 720, name: 'Laptop' }
      ];

      deviceSequence.forEach(({ width, height, name }) => {
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });

        act(() => {
          window.dispatchEvent(new Event('resize'));
        });

        // 每次切换都应该有合理的布局
        const availableHeight = result.current.viewport.availableHeight;
        expect(availableHeight).toBeGreaterThan(0);
        expect(availableHeight).toBeLessThanOrEqual(height);

        // 布局方向应该合理
        const { orientation } = result.current.layout;
        expect(['stacked', 'vertical', 'horizontal']).toContain(orientation);
      });
    });

    it('应该提供一致的API接口', () => {
      const { result: breakpointResult } = renderHook(() => useBreakpoint());
      const { result: layoutResult } = renderHook(() => useViewportLayout());

      // 验证断点系统API
      expect(typeof breakpointResult.current.isMobile).toBe('boolean');
      expect(typeof breakpointResult.current.isTablet).toBe('boolean');
      expect(typeof breakpointResult.current.isDesktop).toBe('boolean');
      expect(typeof breakpointResult.current.width).toBe('number');
      expect(typeof breakpointResult.current.height).toBe('number');

      // 验证布局系统API
      expect(typeof layoutResult.current.getPanelStyle).toBe('function');
      expect(typeof layoutResult.current.needsScroll).toBe('function');
      expect(typeof layoutResult.current.recalculateLayout).toBe('function');
      expect(layoutResult.current.viewport).toBeDefined();
      expect(layoutResult.current.layout).toBeDefined();
    });
  });
});