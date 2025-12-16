import { ReactNode } from 'react';
import { cn } from '../lib/utils';
import { useBreakpoint } from '../hooks/useBreakpoint';

export interface ResponsiveLayoutProps {
  children?: ReactNode;
  className?: string;
  /** 左侧内容 - 在桌面端显示在左侧，平板端显示在上方，手机端折叠 */
  leftContent?: ReactNode;
  /** 右侧内容 - 在桌面端显示在右侧，平板端显示在下方，手机端折叠 */
  rightContent?: ReactNode;
  /** 侧边栏内容 - 仅在大屏幕桌面端显示 */
  sidebar?: ReactNode;
  /** 自定义左右分栏的比例 (桌面端) */
  splitRatio?: [number, number]; // [left%, right%]
  /** 自定义上下分栏的比例 (平板端) */
  verticalRatio?: [number, number]; // [top%, bottom%]
  /** 是否显示分割线 */
  showDivider?: boolean;
  /** 间距大小 */
  spacing?: 'sm' | 'md' | 'lg';
}

/**
 * 智能响应式布局组件
 * 
 * 实现三种布局模式：
 * - 桌面端 (>= 1024px): 左右分栏布局
 * - 平板端 (768px - 1023px): 上下分栏布局  
 * - 手机端 (< 768px): 折叠式布局
 */
export function ResponsiveLayout({
  children,
  className,
  leftContent,
  rightContent,
  sidebar,
  splitRatio = [50, 50],
  verticalRatio = [40, 60],
  showDivider = true,
  spacing = 'md'
}: ResponsiveLayoutProps) {
  const { 
    isHorizontalLayout, 
    isVerticalLayout, 
    isStackedLayout,
    isLargeDesktop 
  } = useBreakpoint();
  
  const spacingClasses = {
    sm: 'gap-2',
    md: 'gap-4', 
    lg: 'gap-6'
  };
  
  const dividerClasses = {
    horizontal: showDivider ? 'border-r border-slate-200 dark:border-slate-800' : '',
    vertical: showDivider ? 'border-b border-slate-200 dark:border-slate-800' : ''
  };

  // 桌面端左右分栏布局 (>= 1024px)
  if (isHorizontalLayout) {
    return (
      <div className={cn('flex h-full', spacingClasses[spacing], className)}>
        {/* 主要内容区域 - 左右分栏 */}
        <div className="flex flex-1 min-w-0">
          {/* 左侧面板 */}
          {leftContent && (
            <div 
              className={cn(
                'flex flex-col',
                dividerClasses.horizontal,
                'last:border-r-0'
              )}
              style={{ width: `${splitRatio[0]}%` }}
            >
              {leftContent}
            </div>
          )}
          
          {/* 右侧面板 */}
          {rightContent && (
            <div 
              className="flex flex-col flex-1 min-w-0"
              style={{ width: leftContent ? `${splitRatio[1]}%` : '100%' }}
            >
              {rightContent}
            </div>
          )}
          
          {/* 如果没有左右内容，显示主要内容 */}
          {!leftContent && !rightContent && (
            <div className="flex-1">
              {children}
            </div>
          )}
        </div>
        
        {/* 侧边栏 - 仅大屏幕显示 */}
        {sidebar && isLargeDesktop && (
          <div className={cn(
            'w-80 flex-shrink-0 bg-slate-50 dark:bg-slate-900/50',
            'border-l border-slate-200 dark:border-slate-800',
            'overflow-hidden'
          )}>
            <div className="h-full overflow-y-auto p-4">
              {sidebar}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // 平板端上下分栏布局 (768px - 1023px)
  if (isVerticalLayout) {
    return (
      <div className={cn('flex flex-col h-full', spacingClasses[spacing], className)}>
        {/* 上方面板 */}
        {leftContent && (
          <div 
            className={cn(
              'flex flex-col',
              dividerClasses.vertical,
              'last:border-b-0'
            )}
            style={{ height: `${verticalRatio[0]}%` }}
          >
            {leftContent}
          </div>
        )}
        
        {/* 下方面板 */}
        {rightContent && (
          <div 
            className="flex flex-col flex-1 min-h-0"
            style={{ height: leftContent ? `${verticalRatio[1]}%` : '100%' }}
          >
            {rightContent}
          </div>
        )}
        
        {/* 如果没有左右内容，显示主要内容 */}
        {!leftContent && !rightContent && (
          <div className="flex-1">
            {children}
          </div>
        )}
        
        {/* 侧边栏内容在平板端显示在底部 */}
        {sidebar && (
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
            {sidebar}
          </div>
        )}
      </div>
    );
  }
  
  // 手机端折叠式布局 (< 768px)
  if (isStackedLayout) {
    return (
      <div className={cn('flex flex-col', spacingClasses[spacing], className)}>
        {/* 折叠式内容 - 垂直堆叠 */}
        {leftContent && (
          <div className="w-full">
            {leftContent}
          </div>
        )}
        
        {rightContent && (
          <div className="w-full">
            {rightContent}
          </div>
        )}
        
        {/* 如果没有左右内容，显示主要内容 */}
        {!leftContent && !rightContent && (
          <div className="w-full">
            {children}
          </div>
        )}
        
        {/* 侧边栏内容在手机端显示在底部，可折叠 */}
        {sidebar && (
          <details className="mt-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
            <summary className="p-3 cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              更多选项
            </summary>
            <div className="p-3 pt-0">
              {sidebar}
            </div>
          </details>
        )}
      </div>
    );
  }
  
  // 默认布局
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  );
}

/**
 * 预设的布局组件 - 左右分栏
 */
export function HorizontalLayout({
  leftContent,
  rightContent,
  ...props
}: Omit<ResponsiveLayoutProps, 'children' | 'leftContent' | 'rightContent'> & {
  leftContent: ReactNode;
  rightContent: ReactNode;
}) {
  return (
    <ResponsiveLayout
      leftContent={leftContent}
      rightContent={rightContent}
      {...props}
    />
  );
}

/**
 * 预设的布局组件 - 上下分栏
 */
export function VerticalLayout({
  topContent,
  bottomContent,
  ...props
}: Omit<ResponsiveLayoutProps, 'children' | 'leftContent' | 'rightContent'> & {
  topContent: ReactNode;
  bottomContent: ReactNode;
}) {
  return (
    <ResponsiveLayout
      leftContent={topContent}
      rightContent={bottomContent}
      {...props}
    />
  );
}

/**
 * 预设的布局组件 - 折叠式
 */
export function StackedLayout({
  sections,
  ...props
}: Omit<ResponsiveLayoutProps, 'children' | 'leftContent' | 'rightContent'> & {
  sections: ReactNode[];
}) {
  return (
    <ResponsiveLayout {...props}>
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={index} className="w-full">
            {section}
          </div>
        ))}
      </div>
    </ResponsiveLayout>
  );
}