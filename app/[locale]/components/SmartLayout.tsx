import { ReactNode } from 'react';
import { cn } from '../lib/utils';
import { useViewportLayout } from '../hooks/useViewportLayout';
import { useBreakpoint } from '../hooks/useBreakpoint';

export interface SmartLayoutProps {
  children: ReactNode;
  className?: string;
  sidebar?: ReactNode;
  showScrollWarning?: boolean;
  /** 是否启用无滚动模式 */
  noScroll?: boolean;
  /** 自定义最大高度 */
  maxHeight?: number;
}

export function SmartLayout({ 
  children, 
  className, 
  sidebar,
  showScrollWarning = false,
  noScroll = true,
  maxHeight
}: SmartLayoutProps) {
  const { layout, viewport, needsScroll } = useViewportLayout();
  const { 
    isMobile, 
    isTablet, 
    isDesktop,
    isHorizontalLayout,
    isVerticalLayout,
    isStackedLayout 
  } = useBreakpoint();
  
  // 计算容器高度
  const containerHeight = maxHeight || viewport.availableHeight;
  
  return (
    <div className={cn(
      'w-full mx-auto',
      className
    )}>
      {/* 滚动警告 - 仅在需要时显示 */}
      {showScrollWarning && needsScroll() && !noScroll && (
        <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium">
              当前屏幕尺寸可能需要滚动
            </span>
          </div>
        </div>
      )}
      
      {/* 主要布局容器 - 智能响应式断点系统 */}
      <div 
        className={cn(
          'w-full',
          // 桌面端左右分栏布局 (>= 1024px)
          isHorizontalLayout && 'flex gap-4',
          // 平板端上下分栏布局 (768px - 1023px)
          isVerticalLayout && 'flex flex-col gap-4',
          // 手机端折叠式布局 (< 768px)
          isStackedLayout && 'space-y-4'
        )}
        style={{
          height: noScroll && !isStackedLayout ? `${containerHeight}px` : 'auto',
          maxHeight: noScroll ? `${containerHeight}px` : 'none',
          overflow: noScroll ? 'hidden' : 'visible'
        }}
      >
        {/* 主要内容区域 - 根据断点调整布局 */}
        <div className={cn(
          'flex-1 min-w-0',
          // 桌面端左右分栏
          isHorizontalLayout && 'flex gap-4',
          // 平板端上下分栏
          isVerticalLayout && 'flex flex-col gap-4',
          // 手机端折叠式
          isStackedLayout && 'space-y-4'
        )}>
          {children}
        </div>
        
        {/* 侧边栏 - 仅桌面端显示 */}
        {sidebar && layout.showSidebar && isDesktop && (
          <div className={cn(
            'flex-shrink-0 w-72 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700',
            noScroll && 'overflow-hidden'
          )}>
            <div className={cn(
              'p-4 h-full',
              noScroll ? 'overflow-y-auto' : ''
            )}>
              {sidebar}
            </div>
          </div>
        )}
      </div>
      
      {/* 移动端/平板端侧边栏 - 折叠显示 */}
      {sidebar && (isMobile || isTablet) && !layout.showSidebar && (
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          {sidebar}
        </div>
      )}
    </div>
  );
}