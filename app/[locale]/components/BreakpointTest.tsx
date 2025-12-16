'use client';

import { useEffect, useState } from 'react';
import { useBreakpoint, BREAKPOINTS, getMediaQuery, matchesBreakpoint } from '../hooks/useBreakpoint';
import { useViewportLayout } from '../hooks/useViewportLayout';

/**
 * 断点系统测试组件
 * 
 * 用于验证智能响应式断点系统的正确性：
 * - 精确的断点定义 (768px, 1024px, 1280px)
 * - 桌面端左右分栏布局 (>= 1024px)
 * - 平板端上下分栏布局 (768px - 1023px)
 * - 手机端折叠式布局 (< 768px)
 */
export function BreakpointTest() {
  const breakpointState = useBreakpoint();
  const layoutState = useViewportLayout();
  const [mediaQueries, setMediaQueries] = useState<Record<string, boolean>>({});
  
  const {
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
  } = breakpointState;

  // 测试媒体查询
  useEffect(() => {
    const updateMediaQueries = () => {
      setMediaQueries({
        mobile: matchesBreakpoint('mobile'),
        tablet: matchesBreakpoint('tablet'),
        desktop: matchesBreakpoint('desktop'),
        large: matchesBreakpoint('large')
      });
    };

    updateMediaQueries();
    window.addEventListener('resize', updateMediaQueries);
    return () => window.removeEventListener('resize', updateMediaQueries);
  }, []);

  // 验证断点逻辑
  const validateBreakpoints = () => {
    const errors: string[] = [];
    
    // 验证断点值
    if (BREAKPOINTS.mobile !== 768) {
      errors.push(`Mobile断点应为768px，实际为${BREAKPOINTS.mobile}px`);
    }
    if (BREAKPOINTS.tablet !== 1024) {
      errors.push(`Tablet断点应为1024px，实际为${BREAKPOINTS.tablet}px`);
    }
    if (BREAKPOINTS.desktop !== 1280) {
      errors.push(`Desktop断点应为1280px，实际为${BREAKPOINTS.desktop}px`);
    }
    
    // 验证当前断点逻辑
    if (width < 768 && current !== 'mobile') {
      errors.push(`宽度${width}px应为mobile断点，实际为${current}`);
    }
    if (width >= 768 && width < 1024 && current !== 'tablet') {
      errors.push(`宽度${width}px应为tablet断点，实际为${current}`);
    }
    if (width >= 1024 && width < 1280 && current !== 'desktop') {
      errors.push(`宽度${width}px应为desktop断点，实际为${current}`);
    }
    if (width >= 1280 && current !== 'large') {
      errors.push(`宽度${width}px应为large断点，实际为${current}`);
    }
    
    // 验证布局模式
    if (width >= 1024 && !isHorizontalLayout) {
      errors.push(`宽度${width}px应启用左右分栏布局`);
    }
    if (width >= 768 && width < 1024 && !isVerticalLayout) {
      errors.push(`宽度${width}px应启用上下分栏布局`);
    }
    if (width < 768 && !isStackedLayout) {
      errors.push(`宽度${width}px应启用折叠式布局`);
    }
    
    return errors;
  };

  const errors = validateBreakpoints();

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          智能响应式断点系统测试
        </h2>
        
        {/* 验证结果 */}
        <div className={`p-4 rounded-lg mb-4 ${
          errors.length === 0 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className={`font-semibold ${
            errors.length === 0 ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
          }`}>
            {errors.length === 0 ? '✅ 所有测试通过' : `❌ 发现 ${errors.length} 个问题`}
          </div>
          {errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-300">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 当前状态 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 视口信息 */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            视口信息
          </h3>
          <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <div>宽度: {width}px</div>
            <div>高度: {height}px</div>
            <div>当前断点: <span className="font-mono font-semibold">{current}</span></div>
          </div>
        </div>

        {/* 断点状态 */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            断点状态
          </h3>
          <div className="space-y-1 text-sm">
            <div className={isMobile ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
              手机端: {isMobile ? '✓' : '✗'} (&lt;768px)
            </div>
            <div className={isTablet ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
              平板端: {isTablet ? '✓' : '✗'} (768-1023px)
            </div>
            <div className={isDesktop && !isLargeDesktop ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
              桌面端: {isDesktop && !isLargeDesktop ? '✓' : '✗'} (1024-1279px)
            </div>
            <div className={isLargeDesktop ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
              大屏幕: {isLargeDesktop ? '✓' : '✗'} (≥1280px)
            </div>
          </div>
        </div>

        {/* 布局模式 */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            布局模式
          </h3>
          <div className="space-y-1 text-sm">
            <div className={isHorizontalLayout ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
              左右分栏: {isHorizontalLayout ? '启用' : '禁用'}
            </div>
            <div className={isVerticalLayout ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
              上下分栏: {isVerticalLayout ? '启用' : '禁用'}
            </div>
            <div className={isStackedLayout ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
              折叠式: {isStackedLayout ? '启用' : '禁用'}
            </div>
          </div>
        </div>
      </div>

      {/* 断点定义 */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          断点定义 (符合任务要求)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-mono font-semibold">768px</div>
            <div className="text-slate-600 dark:text-slate-400">平板端上下分栏布局起始点</div>
          </div>
          <div>
            <div className="font-mono font-semibold">1024px</div>
            <div className="text-slate-600 dark:text-slate-400">桌面端左右分栏布局起始点</div>
          </div>
          <div>
            <div className="font-mono font-semibold">1280px</div>
            <div className="text-slate-600 dark:text-slate-400">大屏幕桌面端优化布局起始点</div>
          </div>
        </div>
      </div>

      {/* 媒体查询测试 */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          媒体查询测试
        </h3>
        <div className="space-y-2 text-sm">
          {Object.entries(mediaQueries).map(([breakpoint, matches]) => (
            <div key={breakpoint} className="flex justify-between items-center">
              <span className="font-mono">{getMediaQuery(breakpoint as any)}</span>
              <span className={matches ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
                {matches ? '匹配' : '不匹配'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 布局系统状态 */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          布局系统状态
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold mb-1">布局配置</div>
            <div className="space-y-1 text-slate-600 dark:text-slate-400">
              <div>方向: {layoutState.layout.orientation}</div>
              <div>断点: {layoutState.layout.breakpoint}</div>
              <div>紧凑模式: {layoutState.layout.compactMode ? '是' : '否'}</div>
              <div>显示侧边栏: {layoutState.layout.showSidebar ? '是' : '否'}</div>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-1">面板尺寸</div>
            <div className="space-y-1 text-slate-600 dark:text-slate-400">
              <div>输入区: {layoutState.layout.panelSizes.input}%</div>
              <div>预览区: {layoutState.layout.panelSizes.preview}%</div>
              <div>控制区: {layoutState.layout.panelSizes.controls}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}