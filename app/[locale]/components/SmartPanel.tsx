import { forwardRef, ReactNode } from 'react';
import { cn } from '../lib/utils';
import { useViewportLayout } from '../hooks/useViewportLayout';
import { useBreakpoint } from '../hooks/useBreakpoint';

export interface SmartPanelProps {
  children: ReactNode;
  type: 'input' | 'preview' | 'controls';
  className?: string;
  minHeight?: number;
  maxHeight?: number;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  scrollable?: boolean;
}

export const SmartPanel = forwardRef<HTMLDivElement, SmartPanelProps>(
  ({ 
    children, 
    type, 
    className, 
    minHeight, 
    maxHeight, 
    title,
    subtitle,
    actions,
    scrollable = true,
    ...props 
  }, ref) => {
    const { layout, getPanelStyle } = useViewportLayout();
    const { 
      isMobile, 
      isHorizontalLayout, 
      isVerticalLayout, 
      isStackedLayout 
    } = useBreakpoint();
    
    const panelStyle = getPanelStyle(type);
    
    // 应用自定义高度限制
    if (minHeight) {
      panelStyle.minHeight = `${minHeight}px`;
    }
    if (maxHeight) {
      panelStyle.maxHeight = `${maxHeight}px`;
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm',
          // 桌面端左右分栏布局的边框处理
          isHorizontalLayout && type !== 'controls' && 'border-r-0 rounded-r-none',
          isHorizontalLayout && type === 'preview' && 'border-l-0 rounded-l-none border-r-0 rounded-r-none',
          isHorizontalLayout && type === 'controls' && 'border-l-0 rounded-l-none',
          // 平板端上下分栏布局的边框处理
          isVerticalLayout && type !== 'controls' && 'border-b-0 rounded-b-none',
          isVerticalLayout && type === 'preview' && 'border-t-0 rounded-t-none border-b-0 rounded-b-none',
          isVerticalLayout && type === 'controls' && 'border-t-0 rounded-t-none',
          // 手机端折叠式布局的间距
          isStackedLayout && 'mb-4 last:mb-0',
          // 紧凑模式 (手机端)
          layout.compactMode && 'shadow-none border-slate-300 dark:border-slate-700',
          className
        )}
        style={panelStyle}
        {...props}
      >
        {/* 面板头部 */}
        {(title || subtitle || actions) && (
          <div className={cn(
            'flex items-center justify-between border-b border-slate-200 dark:border-slate-800',
            layout.compactMode ? 'px-3 py-2' : 'px-4 py-3'
          )}>
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className={cn(
                  'font-semibold text-slate-900 dark:text-slate-100 truncate',
                  layout.compactMode ? 'text-sm' : 'text-base'
                )}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className={cn(
                  'text-slate-500 dark:text-slate-400 truncate',
                  layout.compactMode ? 'text-xs mt-0.5' : 'text-sm mt-1'
                )}>
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2 ml-3">
                {actions}
              </div>
            )}
          </div>
        )}
        
        {/* 面板内容 */}
        <div className={cn(
          'flex-1 flex flex-col',
          scrollable && 'overflow-hidden',
          layout.compactMode ? 'p-3' : 'p-4'
        )}>
          {scrollable ? (
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {children}
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          )}
        </div>
      </div>
    );
  }
);

SmartPanel.displayName = 'SmartPanel';

// 预设的面板类型组件
export const InputPanel = forwardRef<HTMLDivElement, Omit<SmartPanelProps, 'type'>>(
  (props, ref) => <SmartPanel ref={ref} type="input" {...props} />
);

export const PreviewPanel = forwardRef<HTMLDivElement, Omit<SmartPanelProps, 'type'>>(
  (props, ref) => <SmartPanel ref={ref} type="preview" scrollable={false} {...props} />
);

export const ControlsPanel = forwardRef<HTMLDivElement, Omit<SmartPanelProps, 'type'>>(
  (props, ref) => <SmartPanel ref={ref} type="controls" {...props} />
);

InputPanel.displayName = 'InputPanel';
PreviewPanel.displayName = 'PreviewPanel';
ControlsPanel.displayName = 'ControlsPanel';