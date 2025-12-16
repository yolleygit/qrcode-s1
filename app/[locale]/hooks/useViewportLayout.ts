import { useState, useEffect, useCallback } from 'react';

export interface ViewportDimensions {
  width: number;
  height: number;
  availableHeight: number; // 减去导航栏等固定元素的可用高度
  availableWidth: number;  // 减去边距的可用宽度
}

export interface LayoutConfig {
  orientation: 'horizontal' | 'vertical' | 'stacked';
  panelSizes: {
    input: number;    // 百分比
    preview: number;  // 百分比
    controls: number; // 百分比
  };
  showSidebar: boolean;
  compactMode: boolean;
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'large';
}

export interface LayoutBreakpoints {
  mobile: number;   // 768px
  tablet: number;   // 1024px
  desktop: number;  // 1280px
}

// 精确的布局断点定义 - 符合任务要求
const LAYOUT_BREAKPOINTS: LayoutBreakpoints = {
  mobile: 768,   // 768px - 平板端上下分栏布局的起始点
  tablet: 1024,  // 1024px - 桌面端左右分栏布局的起始点  
  desktop: 1280  // 1280px - 大屏幕桌面端优化布局的起始点
};

const LAYOUT_CONSTANTS = {
  navHeight: 64,      // 导航栏高度
  footerHeight: 0,    // 页脚高度
  padding: 32,        // 页面内边距
  minPanelHeight: 300, // 面板最小高度
  maxContentHeight: 0.95 // 最大内容高度占视口的95%
};

export function useViewportLayout() {
  const [viewport, setViewport] = useState<ViewportDimensions>({
    width: 0,
    height: 0,
    availableHeight: 0,
    availableWidth: 0
  });
  
  const [layout, setLayout] = useState<LayoutConfig>({
    orientation: 'horizontal',
    panelSizes: { input: 40, preview: 40, controls: 20 },
    showSidebar: true,
    compactMode: false,
    breakpoint: 'desktop'
  });
  
  // 计算视口尺寸
  const calculateViewport = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const availableHeight = Math.floor(
      (height - LAYOUT_CONSTANTS.navHeight - LAYOUT_CONSTANTS.footerHeight) * 
      LAYOUT_CONSTANTS.maxContentHeight
    );
    const availableWidth = width - LAYOUT_CONSTANTS.padding * 2;
    
    return { width, height, availableHeight, availableWidth };
  }, []);
  
  // 根据视口尺寸确定布局配置 - 智能响应式断点系统
  const calculateLayout = useCallback((viewport: ViewportDimensions): LayoutConfig => {
    const { width } = viewport;
    
    if (width >= LAYOUT_BREAKPOINTS.desktop) {
      // >= 1280px: 大屏幕桌面端 - 左右分栏 + 侧边栏
      return {
        orientation: 'horizontal',
        panelSizes: { input: 35, preview: 45, controls: 20 },
        showSidebar: true,
        compactMode: false,
        breakpoint: 'large'
      };
    } else if (width >= LAYOUT_BREAKPOINTS.tablet) {
      // >= 1024px: 桌面端 - 左右分栏布局，无侧边栏
      return {
        orientation: 'horizontal',
        panelSizes: { input: 45, preview: 55, controls: 0 },
        showSidebar: false,
        compactMode: false,
        breakpoint: 'desktop'
      };
    } else if (width >= LAYOUT_BREAKPOINTS.mobile) {
      // >= 768px: 平板端 - 上下分栏布局
      return {
        orientation: 'vertical',
        panelSizes: { input: 40, preview: 60, controls: 0 },
        showSidebar: false,
        compactMode: false,
        breakpoint: 'tablet'
      };
    } else {
      // < 768px: 手机端 - 折叠式布局，紧凑模式
      return {
        orientation: 'stacked',
        panelSizes: { input: 100, preview: 100, controls: 100 },
        showSidebar: false,
        compactMode: true,
        breakpoint: 'mobile'
      };
    }
  }, []);
  
  // 更新视口和布局
  const updateLayout = useCallback(() => {
    const newViewport = calculateViewport();
    const newLayout = calculateLayout(newViewport);
    
    setViewport(newViewport);
    setLayout(newLayout);
  }, [calculateViewport, calculateLayout]);
  
  // 监听窗口大小变化
  useEffect(() => {
    updateLayout();
    
    const handleResize = () => {
      updateLayout();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateLayout]);
  
  // 获取面板样式
  const getPanelStyle = useCallback((type: 'input' | 'preview' | 'controls') => {
    const { availableHeight, availableWidth } = viewport;
    const percentage = layout.panelSizes[type];
    
    if (layout.orientation === 'horizontal') {
      return {
        width: `${percentage}%`,
        height: `${availableHeight}px`,
        minHeight: `${LAYOUT_CONSTANTS.minPanelHeight}px`,
        maxHeight: `${availableHeight}px`
      };
    } else if (layout.orientation === 'vertical') {
      return {
        width: '100%',
        height: `${Math.floor((availableHeight * percentage) / 100)}px`,
        minHeight: `${LAYOUT_CONSTANTS.minPanelHeight}px`,
        maxHeight: `${Math.floor((availableHeight * percentage) / 100)}px`
      };
    } else {
      // stacked mode
      const minHeight = layout.compactMode 
        ? LAYOUT_CONSTANTS.minPanelHeight * 0.8 
        : LAYOUT_CONSTANTS.minPanelHeight;
      
      return {
        width: '100%',
        height: 'auto',
        minHeight: `${minHeight}px`
      };
    }
  }, [viewport, layout]);
  
  // 检查是否需要滚动
  const needsScroll = useCallback(() => {
    const totalMinHeight = layout.orientation === 'stacked' 
      ? LAYOUT_CONSTANTS.minPanelHeight * 2 // 输入区 + 预览区
      : LAYOUT_CONSTANTS.minPanelHeight;
    
    return viewport.availableHeight < totalMinHeight;
  }, [viewport.availableHeight, layout.orientation]);
  
  // 强制重新计算布局
  const recalculateLayout = useCallback(() => {
    updateLayout();
  }, [updateLayout]);
  
  return {
    // 状态
    viewport,
    layout,
    
    // 工具方法
    getPanelStyle,
    needsScroll,
    recalculateLayout,
    
    // 布局信息
    isMobile: layout.breakpoint === 'mobile',
    isTablet: layout.breakpoint === 'tablet',
    isDesktop: layout.breakpoint === 'desktop' || layout.breakpoint === 'large',
    isLargeDesktop: layout.breakpoint === 'large',
    
    // 常量
    constants: LAYOUT_CONSTANTS,
    breakpoints: LAYOUT_BREAKPOINTS
  };
}