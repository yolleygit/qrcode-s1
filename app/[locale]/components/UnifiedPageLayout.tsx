'use client';

import { ReactNode } from 'react';
import { cn } from '../lib/utils';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useViewportLayout } from '../hooks/useViewportLayout';
import { UnifiedNavigation } from './UnifiedNavigation';
import { MobileTabNavigation, QR_MASTER_TABS } from './MobileTabNavigation';

export interface UnifiedPageLayoutProps {
  children: ReactNode;
  /** 页面标题 */
  title: string;
  /** 页面副标题 */
  subtitle?: string;
  /** 当前激活的标签页 */
  activeTab: 'static' | 'totp' | 'encrypted';
  /** 页面头部的操作按钮 */
  headerActions?: ReactNode;
  /** 侧边栏内容 */
  sidebar?: ReactNode;
  /** 是否显示返回按钮 */
  showBackButton?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 是否启用无滚动模式 */
  noScroll?: boolean;
  /** 页面状态指示器 */
  statusBadge?: {
    text: string;
    variant: 'success' | 'warning' | 'info' | 'beta';
    icon?: ReactNode;
  };
}

export function UnifiedPageLayout({
  children,
  title,
  subtitle,
  activeTab,
  headerActions,
  sidebar,
  showBackButton = false,
  className,
  noScroll = true,
  statusBadge
}: UnifiedPageLayoutProps) {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const { viewport, layout } = useViewportLayout();

  // 状态徽章样式映射
  const badgeStyles = {
    success: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800',
    warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
    beta: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800'
  };

  // 计算容器高度
  const headerHeight = (isMobile || isTablet) ? 120 : 80; // 包含导航栏和标题的高度
  const containerHeight = noScroll ? viewport.availableHeight : 'auto';
  const contentHeight = noScroll && typeof containerHeight === 'number' 
    ? containerHeight - headerHeight 
    : 'auto';

  return (
    <div className={cn(
      'min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300',
      className
    )}>
      {/* 统一导航栏 */}
      <UnifiedNavigation 
        showBackButton={showBackButton}
        title={showBackButton ? title : undefined}
      />
      
      {/* 移动端标签导航 */}
      {(isMobile || isTablet) && (
        <MobileTabNavigation
          tabs={QR_MASTER_TABS}
          activeTab={activeTab}
          onTabChange={(tabId) => {
            if (tabId === 'static') {
              window.location.href = '/';
            } else if (tabId === 'totp') {
              window.location.href = '/totp';
            } else if (tabId === 'encrypted') {
              window.location.href = '/encrypted-qr';
            }
          }}
        />
      )}

      {/* 页面头部 - 统一的视觉层次 */}
      <header className={cn(
        'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800',
        (isMobile || isTablet) ? 'pt-32' : 'pt-16'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex-1 min-w-0">
              {/* 状态徽章 */}
              {statusBadge && (
                <div className={cn(
                  'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border mb-3',
                  badgeStyles[statusBadge.variant]
                )}>
                  {statusBadge.icon && (
                    <span className="flex-shrink-0">
                      {statusBadge.icon}
                    </span>
                  )}
                  {statusBadge.text}
                </div>
              )}
              
              {/* 页面标题 */}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {title}
              </h1>
              
              {/* 页面副标题 */}
              {subtitle && (
                <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* 头部操作按钮 */}
            {headerActions && (
              <div className="flex items-center gap-2 ml-4">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        style={{
          height: noScroll ? `${contentHeight}px` : 'auto',
          maxHeight: noScroll ? `${contentHeight}px` : 'none',
          overflow: noScroll ? 'hidden' : 'visible'
        }}
      >
        <div className={cn(
          'h-full',
          // 桌面端左右分栏布局
          isDesktop && sidebar && 'flex gap-6',
          // 平板端和移动端垂直布局
          (isMobile || isTablet) && 'flex flex-col gap-4'
        )}>
          {/* 主要内容区域 */}
          <div className={cn(
            'flex-1 min-w-0',
            noScroll && 'overflow-hidden'
          )}>
            {children}
          </div>
          
          {/* 侧边栏 - 仅桌面端显示 */}
          {sidebar && isDesktop && (
            <div className={cn(
              'flex-shrink-0 w-80 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800',
              noScroll && 'overflow-hidden'
            )}>
              <div className={cn(
                'p-6 h-full',
                noScroll ? 'overflow-y-auto' : ''
              )}>
                {sidebar}
              </div>
            </div>
          )}
        </div>
        
        {/* 移动端/平板端侧边栏 - 折叠显示 */}
        {sidebar && (isMobile || isTablet) && (
          <div className="mt-6 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            {sidebar}
          </div>
        )}
      </main>
    </div>
  );
}