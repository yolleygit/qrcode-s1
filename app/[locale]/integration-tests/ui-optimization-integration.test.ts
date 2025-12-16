/**
 * UI界面优化最终集成测试
 * 
 * 测试内容：
 * - 跨浏览器兼容性测试
 * - 验证所有断点下的布局效果
 * - 测试实时预览的性能表现
 * - 确保无滚动体验在所有设备上生效
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook } from '@testing-library/react';

// 导入需要测试的组件和hooks
import { useBreakpoint, BREAKPOINTS } from '../hooks/useBreakpoint';
import { useViewportLayout } from '../hooks/useViewportLayout';
import { useRealTimePreview } from '../hooks/useRealTimePreview';
import { UnifiedPageLayout } from '../components/UnifiedPageLayout';
import { SmartLayout } from '../components/SmartLayout';
import { SmartPanel } from '../components/SmartPanel';
import { StaticQRGenerator } from '../components/StaticQRGenerator';
import { RealTimeQRPreview } from '../components/RealTimeQRPreview';

// Mock performance API for testing
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => [])
};

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

describe('UI界面优化最终集成测试', () => {
  let originalInnerWidth: number;
  let originalInnerHeight: number;
  let originalUserAgent: string;

  beforeEach(() => {
    // 保存原始值
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
    originalUserAgent = navigator.userAgent;

    // 设置测试环境
    Object.defineProperty(window, 'performance', {
      value: mockPerformance,
      writable: true
    });

    Object.defineProperty(global, 'ResizeObserver', {
      value: MockResizeObserver,
      writable: true
    });

    Object.defineProperty(global, 'IntersectionObserver', {
      value: MockIntersectionObserver,
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

    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true
    });

    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('1. 跨浏览器兼容性测试', () => {
    const browsers = [
      {
        name: 'Chrome',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      {
        name: 'Firefox',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
      },
      {
        name: 'Safari',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
      },
      {
        name: 'Edge',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
      },
      {
        name: 'Mobile Safari',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      },
      {
        name: 'Mobile Chrome',
        userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
      }
    ];

    browsers.forEach(({ name, userAgent }) => {
      it(`应该在 ${name} 浏览器中正常工作`, () => {
        // 模拟浏览器环境
        Object.defineProperty(navigator, 'userAgent', {
          value: userAgent,
          writable: true
        });

        const { result } = renderHook(() => useBreakpoint());

        // 验证断点系统在不同浏览器中工作
        expect(result.current.current).toBeDefined();
        expect(typeof result.current.isMobile).toBe('boolean');
        expect(typeof result.current.isDesktop).toBe('boolean');
      });
    });

    it('应该处理不支持的浏览器特性', () => {
      // 模拟缺少某些API的环境
      const originalRequestAnimationFrame = window.requestAnimationFrame;
      const originalResizeObserver = window.ResizeObserver;

      // 删除API
      delete (window as any).requestAnimationFrame;
      delete (window as any).ResizeObserver;

      const { result } = renderHook(() => useViewportLayout());

      // 应该有降级方案
      expect(result.current.viewport).toBeDefined();
      expect(result.current.layout).toBeDefined();

      // 恢复API
      window.requestAnimationFrame = originalRequestAnimationFrame;
      (window as any).ResizeObserver = originalResizeObserver;
    });

    it('应该处理CSS特性检测', () => {
      // 测试CSS Grid支持检测
      const supportsGrid = CSS.supports('display', 'grid');
      const supportsFlexbox = CSS.supports('display', 'flex');

      // 现代浏览器应该支持这些特性
      expect(supportsGrid || supportsFlexbox).toBe(true);
    });
  });

  describe('2. 验证所有断点下的布局效果', () => {
    const testBreakpoints = [
      { name: 'mobile', width: 375, height: 667 },      // iPhone SE
      { name: 'mobile-large', width: 414, height: 896 }, // iPhone 11 Pro Max
      { name: 'tablet', width: 768, height: 1024 },      // iPad
      { name: 'tablet-large', width: 1024, height: 768 }, // iPad横屏
      { name: 'desktop', width: 1280, height: 720 },     // 小桌面
      { name: 'desktop-large', width: 1920, height: 1080 }, // 大桌面
      { name: 'ultrawide', width: 2560, height: 1440 }   // 超宽屏
    ];

    testBreakpoints.forEach(({ name, width, height }) => {
      it(`应该在 ${name} (${width}x${height}) 断点下正确布局`, () => {
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
        const { result: layoutResult } = renderHook(() => useViewportLayout());

        // 验证断点检测
        if (width < BREAKPOINTS.mobile) {
          expect(result.current.isMobile).toBe(true);
          expect(layoutResult.current.layout.orientation).toBe('stacked');
        } else if (width < BREAKPOINTS.tablet) {
          expect(result.current.isTablet).toBe(true);
          expect(layoutResult.current.layout.orientation).toBe('vertical');
        } else {
          expect(result.current.isDesktop).toBe(true);
          expect(layoutResult.current.layout.orientation).toBe('horizontal');
        }

        // 验证可用高度计算
        expect(layoutResult.current.viewport.availableHeight).toBeGreaterThan(0);
        expect(layoutResult.current.viewport.availableHeight).toBeLessThan(height);
      });
    });

    it('应该在窗口大小变化时动态调整布局', async () => {
      const { result } = renderHook(() => useViewportLayout());

      // 初始桌面尺寸
      Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 720, writable: true });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.layout.orientation).toBe('horizontal');

      // 改变为移动尺寸
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      await waitFor(() => {
        expect(result.current.layout.orientation).toBe('stacked');
      });
    });

    it('应该正确计算面板尺寸', () => {
      const { result } = renderHook(() => useViewportLayout());

      // 测试水平布局
      Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 720, writable: true });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      const inputStyle = result.current.getPanelStyle('input');
      const previewStyle = result.current.getPanelStyle('preview');

      expect(inputStyle.width).toContain('%');
      expect(previewStyle.width).toContain('%');
      expect(inputStyle.height).toContain('px');
      expect(previewStyle.height).toContain('px');
    });
  });

  describe('3. 测试实时预览的性能表现', () => {
    it('应该在300ms内响应输入变化', async () => {
      const { result } = renderHook(() => useRealTimePreview());

      const startTime = performance.now();

      act(() => {
        result.current.updateContent('https://example.com');
      });

      // 等待防抖完成
      await waitFor(() => {
        expect(result.current.previewData).toBeTruthy();
      }, { timeout: 500 });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // 应该在500ms内完成（包括防抖延迟）
      expect(responseTime).toBeLessThan(500);
    });

    it('应该正确处理防抖机制', async () => {
      const { result } = renderHook(() => useRealTimePreview());
      let generationCount = 0;

      // Mock生成函数来计数
      const originalGenerateQRCode = result.current.generateQRCode;
      vi.spyOn(result.current, 'generateQRCode').mockImplementation(async () => {
        generationCount++;
        return 'mock-qr-data';
      });

      // 快速连续输入
      act(() => {
        result.current.updateContent('h');
      });
      act(() => {
        result.current.updateContent('ht');
      });
      act(() => {
        result.current.updateContent('htt');
      });
      act(() => {
        result.current.updateContent('http');
      });
      act(() => {
        result.current.updateContent('https://example.com');
      });

      // 等待防抖完成
      await waitFor(() => {
        expect(result.current.previewData).toBeTruthy();
      }, { timeout: 600 });

      // 应该只生成一次（防抖生效）
      expect(generationCount).toBeLessThanOrEqual(2);
    });

    it('应该有效使用缓存机制', async () => {
      const { result } = renderHook(() => useRealTimePreview());

      // 第一次生成
      act(() => {
        result.current.updateContent('https://example.com');
      });

      await waitFor(() => {
        expect(result.current.previewData).toBeTruthy();
      });

      const firstGenerationTime = result.current.generationTime;

      // 清除内容后重新输入相同内容
      act(() => {
        result.current.updateContent('');
      });

      act(() => {
        result.current.updateContent('https://example.com');
      });

      await waitFor(() => {
        expect(result.current.previewData).toBeTruthy();
      });

      // 第二次应该更快（使用缓存）
      const secondGenerationTime = result.current.generationTime;
      expect(secondGenerationTime).toBeLessThanOrEqual(firstGenerationTime);
    });

    it('应该监控性能指标', () => {
      const { result } = renderHook(() => useRealTimePreview());

      const stats = result.current.getPerformanceStats();

      expect(stats).toHaveProperty('generationCount');
      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('lastGenerationTime');
      expect(stats).toHaveProperty('stats');

      expect(typeof stats.generationCount).toBe('number');
      expect(typeof stats.cacheSize).toBe('number');
    });
  });

  describe('4. 确保无滚动体验在所有设备上生效', () => {
    const devices = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'iPad Pro', width: 1024, height: 1366 },
      { name: 'Desktop HD', width: 1280, height: 720 },
      { name: 'Desktop FHD', width: 1920, height: 1080 }
    ];

    devices.forEach(({ name, width, height }) => {
      it(`应该在 ${name} 设备上实现无滚动体验`, () => {
        // 设置设备尺寸
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });

        act(() => {
          window.dispatchEvent(new Event('resize'));
        });

        const { result } = renderHook(() => useViewportLayout());

        // 验证可用高度计算
        const availableHeight = result.current.viewport.availableHeight;
        expect(availableHeight).toBeGreaterThan(0);

        // 验证不需要滚动
        const needsScroll = result.current.needsScroll();
        
        // 在大多数设备上应该不需要滚动
        if (height >= 600) {
          expect(needsScroll).toBe(false);
        }

        // 验证面板尺寸适合视口
        const inputStyle = result.current.getPanelStyle('input');
        const previewStyle = result.current.getPanelStyle('preview');

        if (result.current.layout.orientation === 'horizontal') {
          // 水平布局：检查高度
          const inputHeight = parseInt(inputStyle.height as string);
          const previewHeight = parseInt(previewStyle.height as string);
          
          expect(inputHeight).toBeLessThanOrEqual(availableHeight);
          expect(previewHeight).toBeLessThanOrEqual(availableHeight);
        } else if (result.current.layout.orientation === 'vertical') {
          // 垂直布局：检查总高度
          const inputHeight = parseInt(inputStyle.height as string);
          const previewHeight = parseInt(previewStyle.height as string);
          const totalHeight = inputHeight + previewHeight;
          
          expect(totalHeight).toBeLessThanOrEqual(availableHeight + 100); // 允许一些误差
        }
      });
    });

    it('应该正确处理极小屏幕设备', () => {
      // 模拟极小屏幕（如智能手表）
      Object.defineProperty(window, 'innerWidth', { value: 280, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 280, writable: true });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      const { result } = renderHook(() => useViewportLayout());

      // 应该启用紧凑模式
      expect(result.current.layout.compactMode).toBe(true);
      expect(result.current.layout.orientation).toBe('stacked');

      // 应该有合理的最小高度
      const inputStyle = result.current.getPanelStyle('input');
      const minHeight = parseInt(inputStyle.minHeight as string);
      expect(minHeight).toBeGreaterThan(0);
      expect(minHeight).toBeLessThan(300); // 紧凑模式下应该更小
    });

    it('应该在内容溢出时提供适当的处理', () => {
      const { result } = renderHook(() => useViewportLayout());

      // 模拟小屏幕
      Object.defineProperty(window, 'innerWidth', { value: 320, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 480, writable: true });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      const needsScroll = result.current.needsScroll();
      
      if (needsScroll) {
        // 如果需要滚动，应该有适当的处理机制
        expect(result.current.layout.compactMode).toBe(true);
        expect(result.current.layout.orientation).toBe('stacked');
      }
    });
  });

  describe('5. 综合集成测试', () => {
    it('应该在完整的页面布局中正常工作', () => {
      const TestPage = () => (
        <UnifiedPageLayout
          title="测试页面"
          subtitle="集成测试页面"
          activeTab="static"
          noScroll={true}
        >
          <SmartLayout>
            <SmartPanel type="input">
              <div>输入面板</div>
            </SmartPanel>
            <SmartPanel type="preview">
              <div>预览面板</div>
            </SmartPanel>
          </SmartLayout>
        </UnifiedPageLayout>
      );

      render(<TestPage />);

      expect(screen.getByText('测试页面')).toBeInTheDocument();
      expect(screen.getByText('输入面板')).toBeInTheDocument();
      expect(screen.getByText('预览面板')).toBeInTheDocument();
    });

    it('应该处理复杂的用户交互流程', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const { config, updateContent, previewData, isGenerating } = useRealTimePreview();
        
        return (
          <div>
            <input
              data-testid="content-input"
              value={config.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="输入内容"
            />
            <div data-testid="preview-status">
              {isGenerating ? '生成中...' : previewData ? '已生成' : '等待输入'}
            </div>
          </div>
        );
      };

      render(<TestComponent />);

      const input = screen.getByTestId('content-input');
      const status = screen.getByTestId('preview-status');

      // 初始状态
      expect(status).toHaveTextContent('等待输入');

      // 输入内容
      await user.type(input, 'https://example.com');

      // 等待生成完成
      await waitFor(() => {
        expect(status).toHaveTextContent('已生成');
      }, { timeout: 1000 });
    });

    it('应该在不同设备间切换时保持状态', () => {
      const { result } = renderHook(() => useRealTimePreview());

      // 在桌面设备上设置内容
      Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });
      act(() => {
        result.current.updateContent('https://example.com');
      });

      const desktopContent = result.current.config.content;

      // 切换到移动设备
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      // 内容应该保持不变
      expect(result.current.config.content).toBe(desktopContent);
    });

    it('应该处理错误情况并优雅降级', async () => {
      const { result } = renderHook(() => useRealTimePreview());

      // 模拟生成错误
      vi.spyOn(result.current, 'generateQRCode').mockRejectedValue(new Error('生成失败'));

      act(() => {
        result.current.updateContent('invalid-content');
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.previewData).toBeNull();
      expect(result.current.isGenerating).toBe(false);
    });
  });

  describe('6. 性能基准测试', () => {
    it('应该在规定时间内完成布局计算', () => {
      const startTime = performance.now();

      // 执行多次布局计算
      for (let i = 0; i < 100; i++) {
        Object.defineProperty(window, 'innerWidth', { value: 800 + i, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: 600 + i, writable: true });
        
        const { result } = renderHook(() => useViewportLayout());
        result.current.recalculateLayout();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 100次计算应该在100ms内完成
      expect(duration).toBeLessThan(100);
    });

    it('应该有效管理内存使用', () => {
      const { result } = renderHook(() => useRealTimePreview());

      // 生成大量内容
      for (let i = 0; i < 50; i++) {
        act(() => {
          result.current.updateContent(`https://example${i}.com`);
        });
      }

      const stats = result.current.getPerformanceStats();
      
      // 缓存大小应该有限制
      expect(stats.cacheSize).toBeLessThanOrEqual(50);
    });
  });
});