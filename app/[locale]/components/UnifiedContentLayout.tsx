'use client';

import { ReactNode } from 'react';
import { cn } from '../lib/utils';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useViewportLayout } from '../hooks/useViewportLayout';

export interface UnifiedContentLayoutProps {
  /** 输入区域内容 */
  inputArea: ReactNode;
  /** 预览区域内容 */
  previewArea: ReactNode;
  /** 控制区域内容（可选） */
  controlsArea?: ReactNode;
  /** 输入区域标题 */
  inputTitle?: string;
  /** 输入区域副标题 */
  inputSubtitle?: string;
  /** 预览区域标题 */
  previewTitle?: string;
  /** 预览区域副标题 */
  previewSubtitle?: string;
  /** 控制区域标题 */
  controlsTitle?: string;
  /** 预览区域操作按钮 */
  previewActions?: ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 是否启用无滚动模式 */
  noScroll?: boolean;
}

export function UnifiedContentLayout({
  inputArea,
  previewArea,
  controlsArea,
  inputTitle = '输入配置',
  inputSubtitle = '设置生成参数',
  previewTitle = '实时预览',
  previewSubtitle = '查看生成结果',
  controlsTitle = '高级选项',
  previewActions,
  className,
  noScroll = true
}: UnifiedContentLayoutProps) {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const { viewport, layout } = useViewportLayout();

  // 计算面板尺寸分配
  const getPanelSizes = () => {
    if (isDesktop) {
      // 桌面端左右分栏
      if (controlsArea) {
        return {
          input: '35%',
          preview: '40%',
          controls: '25%'
        };
      } else {
        return {
          input: '45%',
          preview: '55%',
          controls: '0%'
        };
      }
    } else if (isTablet) {
      // 平板端上下分栏
      return {
        input: '100%',
        preview: '100%',
        controls: '100%'
      };
    } else {
      // 移动端折叠式
      return {
        input: '100%',
        preview: '100%',
        controls: '100%'
      };
    }
  };

  const panelSizes = getPanelSizes();
  const contentHeight = noScroll ? viewport.availableHeight - 200 : 'auto'; // 减去头部和边距

  return (
    <div className={cn(
      'w-full h-full',
      className
    )}>
      <div 
        className={cn(
          'w-full',
          // 桌面端左右分栏布局
          isDesktop && 'flex gap-6',
          // 平板端上下分栏布局
          isTablet && 'flex flex-col gap-4',
          // 移动端折叠式布局
          isMobile && 'space-y-4'
        )}
        style={{
          height: noScroll ? `${contentHeight}px` : 'auto',
          maxHeight: noScroll ? `${contentHeight}px` : 'none',
          overflow: noScroll ? 'hidden' : 'visible'
        }}
      >
        {/* 输入区域面板 */}
        <div 
          className={cn(
            'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm',
            // 桌面端左右分栏的边框处理
            isDesktop && controlsArea && 'border-r-0 rounded-r-none',
            isDesktop && !controlsArea && 'border-r-0 rounded-r-none',
            // 平板端上下分栏的边框处理
            isTablet && 'border-b-0 rounded-b-none first:border-b-0 first:rounded-b-none',
            // 移动端独立面板
            isMobile && 'mb-4'
          )}
          style={{
            width: panelSizes.input,
            height: noScroll && !isMobile ? '100%' : 'auto',
            minHeight: isMobile ? '300px' : noScroll ? '100%' : '400px'
          }}
        >
          {/* 面板头部 */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                {inputTitle}
              </h3>
              {inputSubtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                  {inputSubtitle}
                </p>
              )}
            </div>
          </div>
          
          {/* 面板内容 */}
          <div className={cn(
            'p-6 flex-1 flex flex-col',
            noScroll && !isMobile ? 'overflow-y-auto' : ''
          )}>
            {inputArea}
          </div>
        </div>

        {/* 预览区域面板 */}
        <div 
          className={cn(
            'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm',
            // 桌面端左右分栏的边框处理
            isDesktop && controlsArea && 'border-l-0 rounded-l-none border-r-0 rounded-r-none',
            isDesktop && !controlsArea && 'border-l-0 rounded-l-none',
            // 平板端上下分栏的边框处理
            isTablet && controlsArea && 'border-t-0 rounded-t-none border-b-0 rounded-b-none',
            isTablet && !controlsArea && 'border-t-0 rounded-t-none',
            // 移动端独立面板
            isMobile && 'mb-4'
          )}
          style={{
            width: panelSizes.preview,
            height: noScroll && !isMobile ? '100%' : 'auto',
            minHeight: isMobile ? '300px' : noScroll ? '100%' : '400px'
          }}
        >
          {/* 面板头部 */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                {previewTitle}
              </h3>
              {previewSubtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                  {previewSubtitle}
                </p>
              )}
            </div>
            {previewActions && (
              <div className="flex items-center gap-2 ml-4">
                {previewActions}
              </div>
            )}
          </div>
          
          {/* 面板内容 */}
          <div className="p-6 flex-1 flex flex-col">
            {previewArea}
          </div>
        </div>

        {/* 控制区域面板（可选） */}
        {controlsArea && (
          <div 
            className={cn(
              'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm',
              // 桌面端左右分栏的边框处理
              isDesktop && 'border-l-0 rounded-l-none',
              // 平板端上下分栏的边框处理
              isTablet && 'border-t-0 rounded-t-none',
              // 移动端独立面板
              isMobile && ''
            )}
            style={{
              width: panelSizes.controls,
              height: noScroll && !isMobile ? '100%' : 'auto',
              minHeight: isMobile ? '200px' : noScroll ? '100%' : '300px'
            }}
          >
            {/* 面板头部 */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {controlsTitle}
                </h3>
              </div>
            </div>
            
            {/* 面板内容 */}
            <div className={cn(
              'p-6 flex-1 flex flex-col',
              noScroll && !isMobile ? 'overflow-y-auto' : ''
            )}>
              {controlsArea}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}