import { useState, useEffect } from 'react';

// 智能响应式断点系统 - 精确的布局断点定义
export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'large';

export interface BreakpointConfig {
  mobile: number;   // 768px - 手机端折叠式布局
  tablet: number;   // 1024px - 平板端上下分栏布局  
  desktop: number;  // 1280px - 桌面端左右分栏布局
}

// 精确的断点定义 - 符合任务要求 (768px, 1024px, 1280px)
export const BREAKPOINTS: BreakpointConfig = {
  mobile: 768,   // 平板端上下分栏布局的起始点
  tablet: 1024,  // 桌面端左右分栏布局的起始点  
  desktop: 1280  // 大屏幕桌面端优化布局的起始点
};

export interface BreakpointState {
  current: Breakpoint;
  width: number;
  height: number;
  // 便捷的布局检查方法
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  // 布局方向判断
  isHorizontalLayout: boolean;  // 桌面端左右分栏
  isVerticalLayout: boolean;    // 平板端上下分栏
  isStackedLayout: boolean;     // 手机端折叠式
}

/**
 * 智能响应式断点系统 Hook
 * 
 * 根据精确的断点定义 (768px, 1024px, 1280px) 提供：
 * - 桌面端左右分栏布局 (>= 1024px)
 * - 平板端上下分栏布局 (768px - 1023px)  
 * - 手机端折叠式布局 (< 768px)
 */
export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>({
    current: 'desktop',
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
    isHorizontalLayout: true,
    isVerticalLayout: false,
    isStackedLayout: false
  });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let current: Breakpoint;
      
      // 根据精确断点确定当前布局模式
      if (width >= BREAKPOINTS.desktop) {
        current = 'large';
      } else if (width >= BREAKPOINTS.tablet) {
        current = 'desktop';
      } else if (width >= BREAKPOINTS.mobile) {
        current = 'tablet';
      } else {
        current = 'mobile';
      }
      
      // 计算布局状态
      const isMobile = current === 'mobile';
      const isTablet = current === 'tablet';
      const isDesktop = current === 'desktop' || current === 'large';
      const isLargeDesktop = current === 'large';
      
      // 布局方向判断
      const isHorizontalLayout = isDesktop;      // 桌面端左右分栏
      const isVerticalLayout = isTablet;         // 平板端上下分栏
      const isStackedLayout = isMobile;          // 手机端折叠式
      
      setState({
        current,
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        isLargeDesktop,
        isHorizontalLayout,
        isVerticalLayout,
        isStackedLayout
      });
    };

    // 初始化
    updateBreakpoint();
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return state;
}

/**
 * 获取当前断点的CSS媒体查询字符串
 */
export function getMediaQuery(breakpoint: Breakpoint): string {
  switch (breakpoint) {
    case 'mobile':
      return `(max-width: ${BREAKPOINTS.mobile - 1}px)`;
    case 'tablet':
      return `(min-width: ${BREAKPOINTS.mobile}px) and (max-width: ${BREAKPOINTS.tablet - 1}px)`;
    case 'desktop':
      return `(min-width: ${BREAKPOINTS.tablet}px) and (max-width: ${BREAKPOINTS.desktop - 1}px)`;
    case 'large':
      return `(min-width: ${BREAKPOINTS.desktop}px)`;
    default:
      return '';
  }
}

/**
 * 检查当前是否匹配指定断点
 */
export function matchesBreakpoint(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = getMediaQuery(breakpoint);
  return window.matchMedia(mediaQuery).matches;
}