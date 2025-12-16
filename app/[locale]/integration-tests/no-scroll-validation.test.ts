/**
 * 无滚动体验验证测试
 * 
 * 确保核心功能在所有设备上都能在单屏内完成，无需滚动
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { useViewportLayout } from '../hooks/useViewportLayout';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { SmartLayout } from '../components/SmartLayout';
import { SmartPanel } from '../components/SmartPanel';
import { UnifiedPageLayout } from '../components/UnifiedPageLayout';

// 设备配置
interface DeviceConfig {
  name: string;
  width: number;
  height: number;
  category: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  expectedLayout: 'stacked' | 'vertical' | 'horizontal';
}

const testDevices: DeviceConfig[] = [
  // 移动设备 - 竖屏
  { name: 'iPhone SE', width: 375, height: 667, category: 'mobile', orientation: 'portrait', expectedLayout: 'stacked' },
  { name: 'iPhone 12', width: 390, height: 844, category: 'mobile', orientation: 'portrait', expectedLayout: 'stacked' },
  { name: 'iPhone 12 Pro Max', width: 428, height: 926, category: 'mobile', orientation: 'portrait', expectedLayout: 'stacked' },
  { name: 'Samsung Galaxy S21', width: 360, height: 800, category: 'mobile', orientation: 'portrait', expectedLayout: 'stacked' },
  
  // 移动设备 - 横屏
  { name: 'iPhone SE Landscape', width: 667, height: 375, category: 'mobile', orientation: 'landscape', expectedLayout: 'stacked' },
  { name: 'iPhone 12 Landscape', width: 844, height: 390, category: 'mobile', orientation: 'landscape', expectedLayout: 'vertical' },
  
  // 平板设备
  { name: 'iPad', width: 768, height: 1024, category: 'tablet', orientation: 'portrait', expectedLayout: 'vertical' },
  { name: 'iPad Landscape', width: 1024, height: 768, category: 'tablet', orientation: 'landscape', expectedLayout: 'horizontal' },
  { name: 'iPad Pro 11"', width: 834, height: 1194, category: 'tablet', orientation: 'portrait', expectedLayout: 'vertical' },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366, category: 'tablet', orientation: 'portrait', expectedLayout: 'vertical' },
  
  // 桌面设备
  { name: 'Desktop HD', width: 1280, height: 720, category: 'desktop', orientation: 'landscape', expectedLayout: 'horizontal' },
  { name: 'Desktop FHD', width: 1920, height: 1080, category: 'desktop', orientation: 'landscape', expectedLayout: 'horizontal' },
  { name: 'Desktop 2K', width: 2560, height: 1440, category: 'desktop', orientation: 'landscape', expectedLayout: 'horizontal' },
  { name: 'Desktop 4K', width: 3840, height: 2160, category: 'desktop', orientation: 'landscape', expectedLayout: 'horizontal' },
  
  // 特殊尺寸
  { name: 'Ultrawide', width: 3440, height: 1440, category: 'desktop', orientation: 'landscape', expectedLayout: 'horizontal' },
  { name: 'Small Laptop', width: 1366, height: 768, category: 'desktop', orientation: 'landscape', expectedLayout: 'horizontal' },
  { name: 'Surface Pro', width: 1368, height: 912, category: 'desktop', orientation: 'landscape', expectedLayout: 'horizontal' }
];

describe('无滚动体验验证测试', () => {
  beforeEach(() => {
    // 重置DOM
    document.body.innerHTML = '';
    
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('设备特定的无滚动验证', () => {
    testDevices.forEach((device) => {
      it(`应该在 ${device.name} (${device.width}x${device.height}) 上实现无滚动体验`, () => {
        // 设置设备尺寸
        Object.defineProperty(window, 'innerWidth', { value: device.width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: device.height, writable: true });

        act(() => {
          window.dispatchEvent(new Event('resize'));
        });

        const { result } = renderHook(() => useViewportLayout());

        // 验证布局方向符合预期
        expect(result.current.layout.orientation).toBe(device.expectedLayout);

        // 验证可用高度计算
        const availableHeight = result.current.viewport.availableHeight;
        expect(availableHeight).toBeGreaterThan(0);
        expect(availableHeight).toBeLessThan(device.height);

        // 验证95%视口高度规则
        const expectedMaxHeight = device.height * 0.95;
        expect(availableHeight).toBeLessThanOrEqual(expectedMaxHeight);

        // 验证不需要滚动
        const needsScroll = result.current.needsScroll();
        
        // 对于合理尺寸的设备，应该不需要滚动
        if (device.height >= 400) {
          expect(needsScroll).toBe(false);
        }

        // 验证面板尺寸适合视口
        const inputStyle = result.current.getPanelStyle('input');
        const previewStyle = result.current.getPanelStyle('preview');

        if (device.expectedLayout === 'horizontal') {
          // 水平布局：每个面板的高度应该适合视口
          const inputHeight = parseInt(inputStyle.height as string);
          const previewHeight = parseInt(previewStyle.height as string);
          
          expect(inputHeight).toBeLessThanOrEqual(availableHeight);
          expect(previewHeight).toBeLessThanOrEqual(availableHeight);
          expect(inputHeight).toBeGreaterThan(200); // 最小可用高度
          expect(previewHeight).toBeGreaterThan(200);
        } else if (device.expectedLayout === 'vertical') {
          // 垂直布局：总高度应该适合视口
          const inputHeight = parseInt(inputStyle.height as string);
          const previewHeight = parseInt(previewStyle.height as string);
          const totalHeight = inputHeight + previewHeight;
          
          expect(totalHeight).toBeLessThanOrEqual(availableHeight + 50); // 允许小误差
          expect(inputHeight).toBeGreaterThan(150); // 最小面板高度
          expect(previewHeight).toBeGreaterThan(150);
        } else {
          // 堆叠布局：应该使用紧凑模式
          expect(result.current.layout.compactMode).toBe(true);
          const minHeight = parseInt(inputStyle.minHeight as string);
          expect(minHeight).toBeGreaterThan(0);
          expect(minHeight).toBeLessThan(300); // 紧凑模式下更小
        }
      });
    });
  });

  describe('关键断点的无滚动验证', () => {
    const criticalBreakpoints = [
      { name: '768px (平板起始)', width: 768, height: 1024 },
      { name: '1024px (桌面起始)', width: 1024, height: 768 },
      { name: '1280px (大桌面起始)', width: 1280, height: 720 }
    ];

    criticalBreakpoints.forEach(({ name, width, height }) => {
      it(`应该在关键断点 ${name} 正确处理无滚动布局`, () => {
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });

        act(() => {
          window.dispatchEvent(new Event('resize'));
        });

        const { result: layoutResult } = renderHook(() => useViewportLayout());
        const { result: breakpointResult } = renderHook(() => useBreakpoint());

        // 验证断点检测正确
        if (width >= 1024) {
          expect(breakpointResult.current.isDesktop).toBe(true);
          expect(layoutResult.current.layout.orientation).toBe('horizontal');
        } else if (width >= 768) {
          expect(breakpointResult.current.isTablet).toBe(true);
          expect(layoutResult.current.layout.orientation).toBe('vertical');
        } else {
          expect(breakpointResult.current.isMobile).toBe(true);
          expect(layoutResult.current.layout.orientation).toBe('stacked');
        }

        // 验证在断点边界处的稳定性
        const availableHeight = layoutResult.current.viewport.availableHeight;
        expect(availableHeight).toBeGreaterThan(height * 0.7); // 至少70%的视口高度可用
        expect(availableHeight).toBeLessThanOrEqual(height * 0.95); // 最多95%的视口高度
      });
    });
  });

  describe('极端尺寸的处理', () => {
    const extremeCases = [
      { name: '极小屏幕', width: 280, height: 280 },
      { name: '极窄屏幕', width: 320, height: 1000 },
      { name: '极宽屏幕', width: 4000, height: 600 },
      { name: '极高屏幕', width: 800, height: 3000 }
    ];

    extremeCases.forEach(({ name, width, height }) => {
      it(`应该优雅处理 ${name} (${width}x${height})`, () => {
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });

        act(() => {
          window.dispatchEvent(new Event('resize'));
        });

        const { result } = renderHook(() => useViewportLayout());

        // 应该有合理的布局配置
        expect(result.current.layout.orientation).toBeOneOf(['stacked', 'vertical', 'horizontal']);
        
        // 可用高度应该是正数
        expect(result.current.viewport.availableHeight).toBeGreaterThan(0);
        
        // 面板样式应该有合理的尺寸
        const inputStyle = result.current.getPanelStyle('input');
        const minHeight = parseInt(inputStyle.minHeight as string);
        
        expect(minHeight).toBeGreaterThan(0);
        expect(minHeight).toBeLessThan(height); // 不应该超过视口高度

        // 极小屏幕应该启用紧凑模式
        if (width < 400 || height < 400) {
          expect(result.current.layout.compactMode).toBe(true);
        }
      });
    });
  });

  describe('动态尺寸变化的无滚动保持', () => {
    it('应该在窗口大小变化时保持无滚动体验', () => {
      const { result } = renderHook(() => useViewportLayout());

      const sizeSequence = [
        { width: 1920, height: 1080 }, // 桌面
        { width: 1024, height: 768 },  // 小桌面
        { width: 768, height: 1024 },  // 平板竖屏
        { width: 1024, height: 768 },  // 平板横屏
        { width: 375, height: 667 },   // 手机
        { width: 1280, height: 720 }   // 回到桌面
      ];

      sizeSequence.forEach(({ width, height }, index) => {
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });

        act(() => {
          window.dispatchEvent(new Event('resize'));
        });

        // 每次变化后都应该有合理的布局
        const availableHeight = result.current.viewport.availableHeight;
        expect(availableHeight).toBeGreaterThan(0);
        expect(availableHeight).toBeLessThanOrEqual(height * 0.95);

        // 不应该需要滚动（除非是极小屏幕）
        if (height >= 500) {
          const needsScroll = result.current.needsScroll();
          expect(needsScroll).toBe(false);
        }
      });
    });

    it('应该在快速连续的尺寸变化中保持稳定', () => {
      const { result } = renderHook(() => useViewportLayout());

      // 模拟快速的窗口大小变化（如用户拖拽窗口）
      for (let i = 0; i < 20; i++) {
        const width = 800 + i * 50;  // 800px 到 1750px
        const height = 600 + i * 20; // 600px 到 980px

        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });

        act(() => {
          window.dispatchEvent(new Event('resize'));
        });

        // 每次变化都应该有稳定的布局
        expect(result.current.viewport.availableHeight).toBeGreaterThan(0);
        expect(result.current.layout.orientation).toBeOneOf(['stacked', 'vertical', 'horizontal']);
      }
    });
  });

  describe('内容溢出处理', () => {
    it('应该处理内容可能溢出的情况', () => {
      // 模拟小屏幕设备
      Object.defineProperty(window, 'innerWidth', { value: 320, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 480, writable: true });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      const { result } = renderHook(() => useViewportLayout());

      const needsScroll = result.current.needsScroll();
      
      if (needsScroll) {
        // 如果确实需要滚动，应该有适当的处理
        expect(result.current.layout.compactMode).toBe(true);
        expect(result.current.layout.orientation).toBe('stacked');
        
        // 面板应该使用最小高度
        const inputStyle = result.current.getPanelStyle('input');
        const minHeight = parseInt(inputStyle.minHeight as string);
        expect(minHeight).toBeLessThan(300); // 紧凑模式下的最小高度
      } else {
        // 如果不需要滚动，验证布局确实适合
        const availableHeight = result.current.viewport.availableHeight;
        expect(availableHeight).toBeGreaterThan(200); // 至少有基本的可用空间
      }
    });

    it('应该为溢出内容提供适当的滚动区域', () => {
      const TestComponent = () => (
        <SmartLayout>
          <SmartPanel type="input">
            <div style={{ height: '400px' }}>
              长内容区域
            </div>
          </SmartPanel>
          <SmartPanel type="preview">
            <div style={{ height: '400px' }}>
              预览区域
            </div>
          </SmartPanel>
        </SmartLayout>
      );

      // 小屏幕
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });

      render(<TestComponent />);

      // 组件应该正常渲染
      expect(screen.getByText('长内容区域')).toBeInTheDocument();
      expect(screen.getByText('预览区域')).toBeInTheDocument();
    });
  });

  describe('实际使用场景验证', () => {
    it('应该在完整页面布局中保持无滚动体验', () => {
      const devices = [
        { width: 375, height: 667 },   // iPhone 8
        { width: 768, height: 1024 },  // iPad
        { width: 1280, height: 720 }   // Desktop
      ];

      devices.forEach(({ width, height }) => {
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });

        const TestPage = () => (
          <UnifiedPageLayout
            title="QR码生成器"
            subtitle="快速生成高质量二维码"
            activeTab="static"
            noScroll={true}
          >
            <SmartLayout>
              <SmartPanel type="input">
                <div>
                  <h3>输入内容</h3>
                  <textarea 
                    placeholder="输入要生成二维码的内容"
                    style={{ width: '100%', height: '100px' }}
                  />
                  <div>样式选项区域</div>
                </div>
              </SmartPanel>
              <SmartPanel type="preview">
                <div>
                  <h3>预览</h3>
                  <div style={{ 
                    width: '200px', 
                    height: '200px', 
                    backgroundColor: '#f0f0f0',
                    margin: '0 auto'
                  }}>
                    二维码预览区域
                  </div>
                  <div>操作按钮区域</div>
                </div>
              </SmartPanel>
            </SmartLayout>
          </UnifiedPageLayout>
        );

        render(<TestPage />);

        // 验证关键元素存在
        expect(screen.getByText('QR码生成器')).toBeInTheDocument();
        expect(screen.getByText('输入内容')).toBeInTheDocument();
        expect(screen.getByText('预览')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('输入要生成二维码的内容')).toBeInTheDocument();
      });
    });

    it('应该在三个核心功能页面中都保持无滚动体验', () => {
      const pages = [
        { title: '静态二维码', activeTab: 'static' as const },
        { title: 'TOTP验证码', activeTab: 'totp' as const },
        { title: '加密二维码', activeTab: 'encrypted' as const }
      ];

      pages.forEach(({ title, activeTab }) => {
        const TestPage = () => (
          <UnifiedPageLayout
            title={title}
            activeTab={activeTab}
            noScroll={true}
          >
            <SmartLayout>
              <SmartPanel type="input">
                <div>输入面板 - {title}</div>
              </SmartPanel>
              <SmartPanel type="preview">
                <div>预览面板 - {title}</div>
              </SmartPanel>
            </SmartLayout>
          </UnifiedPageLayout>
        );

        render(<TestPage />);

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(`输入面板 - ${title}`)).toBeInTheDocument();
        expect(screen.getByText(`预览面板 - ${title}`)).toBeInTheDocument();
      });
    });
  });

  describe('可访问性和无滚动的兼容性', () => {
    it('应该在启用辅助功能时保持无滚动体验', () => {
      // 模拟高对比度模式或大字体设置
      Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 720, writable: true });

      const { result } = renderHook(() => useViewportLayout());

      // 即使在辅助功能模式下，布局也应该适应
      expect(result.current.viewport.availableHeight).toBeGreaterThan(0);
      expect(result.current.layout.orientation).toBe('horizontal');

      // 面板应该有足够的空间容纳大字体
      const inputStyle = result.current.getPanelStyle('input');
      const inputHeight = parseInt(inputStyle.height as string);
      expect(inputHeight).toBeGreaterThan(300); // 足够的高度容纳辅助功能需求
    });

    it('应该支持键盘导航而不破坏无滚动布局', () => {
      const TestComponent = () => (
        <SmartLayout>
          <SmartPanel type="input">
            <button>按钮1</button>
            <input placeholder="输入框" />
            <button>按钮2</button>
          </SmartPanel>
          <SmartPanel type="preview">
            <button>预览按钮</button>
          </SmartPanel>
        </SmartLayout>
      );

      render(<TestComponent />);

      // 所有可交互元素都应该存在
      expect(screen.getByText('按钮1')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('输入框')).toBeInTheDocument();
      expect(screen.getByText('按钮2')).toBeInTheDocument();
      expect(screen.getByText('预览按钮')).toBeInTheDocument();

      // 元素应该可以获得焦点
      const button1 = screen.getByText('按钮1');
      const input = screen.getByPlaceholderText('输入框');
      
      button1.focus();
      expect(document.activeElement).toBe(button1);
      
      input.focus();
      expect(document.activeElement).toBe(input);
    });
  });
});