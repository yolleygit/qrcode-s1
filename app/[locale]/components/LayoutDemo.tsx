'use client';

import { useState } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { ResponsiveLayout, HorizontalLayout, VerticalLayout, StackedLayout } from './ResponsiveLayout';
import { SmartPanel, InputPanel, PreviewPanel, ControlsPanel } from './SmartPanel';

/**
 * 布局演示组件 - 展示智能响应式断点系统的三种布局模式
 * 
 * 演示内容：
 * - 桌面端左右分栏布局 (>= 1024px)
 * - 平板端上下分栏布局 (768px - 1023px)  
 * - 手机端折叠式布局 (< 768px)
 */
export function LayoutDemo() {
  const { 
    current, 
    width, 
    height,
    isHorizontalLayout, 
    isVerticalLayout, 
    isStackedLayout,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop
  } = useBreakpoint();
  
  const [demoContent, setDemoContent] = useState('Hello, World!');

  // 演示内容组件
  const DemoInput = () => (
    <InputPanel 
      title="输入区域" 
      subtitle={`当前断点: ${current} (${width}px)`}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            演示内容
          </label>
          <textarea
            value={demoContent}
            onChange={(e) => setDemoContent(e.target.value)}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none"
            rows={4}
            placeholder="输入一些内容来测试实时预览..."
          />
        </div>
        
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <div>• 桌面端 (≥1024px): 左右分栏</div>
          <div>• 平板端 (768-1023px): 上下分栏</div>
          <div>• 手机端 (&lt;768px): 折叠式</div>
        </div>
      </div>
    </InputPanel>
  );

  const DemoPreview = () => (
    <PreviewPanel 
      title="预览区域"
      subtitle="实时显示效果"
    >
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
        <div className="text-center p-8">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {demoContent || '预览内容'}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            当前布局模式: {
              isHorizontalLayout ? '桌面端左右分栏' :
              isVerticalLayout ? '平板端上下分栏' :
              isStackedLayout ? '手机端折叠式' : '未知'
            }
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            视口尺寸: {width} × {height}
          </div>
        </div>
      </div>
    </PreviewPanel>
  );

  const DemoSidebar = () => (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          断点信息
        </h3>
        <div className="space-y-2 text-sm">
          <div className={`p-2 rounded ${current === 'mobile' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
            手机端: {isMobile ? '✓' : '✗'} (&lt;768px)
          </div>
          <div className={`p-2 rounded ${current === 'tablet' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
            平板端: {isTablet ? '✓' : '✗'} (768-1023px)
          </div>
          <div className={`p-2 rounded ${current === 'desktop' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
            桌面端: {isDesktop && !isLargeDesktop ? '✓' : '✗'} (1024-1279px)
          </div>
          <div className={`p-2 rounded ${current === 'large' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
            大屏幕: {isLargeDesktop ? '✓' : '✗'} (≥1280px)
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          布局特性
        </h3>
        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <div>• 左右分栏: {isHorizontalLayout ? '启用' : '禁用'}</div>
          <div>• 上下分栏: {isVerticalLayout ? '启用' : '禁用'}</div>
          <div>• 折叠式: {isStackedLayout ? '启用' : '禁用'}</div>
          <div>• 侧边栏: {isLargeDesktop ? '显示' : '隐藏'}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full">
      <ResponsiveLayout
        leftContent={<DemoInput />}
        rightContent={<DemoPreview />}
        sidebar={<DemoSidebar />}
        splitRatio={[40, 60]}
        verticalRatio={[35, 65]}
        showDivider={true}
        spacing="md"
        className="h-full"
      />
    </div>
  );
}

/**
 * 布局测试组件 - 用于测试不同的布局组合
 */
export function LayoutTest() {
  const [layoutType, setLayoutType] = useState<'responsive' | 'horizontal' | 'vertical' | 'stacked'>('responsive');
  
  const testContent = {
    left: (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg h-full">
        <h3 className="font-semibold mb-2">左侧/上方内容</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          这里是左侧内容区域，在桌面端显示在左侧，平板端显示在上方，手机端折叠显示。
        </p>
      </div>
    ),
    right: (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg h-full">
        <h3 className="font-semibold mb-2">右侧/下方内容</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          这里是右侧内容区域，在桌面端显示在右侧，平板端显示在下方，手机端折叠显示。
        </p>
      </div>
    ),
    sidebar: (
      <div className="space-y-3">
        <h3 className="font-semibold">侧边栏</h3>
        <div className="space-y-2">
          {['responsive', 'horizontal', 'vertical', 'stacked'].map((type) => (
            <button
              key={type}
              onClick={() => setLayoutType(type as any)}
              className={`w-full p-2 text-left rounded text-sm ${
                layoutType === type 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' 
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {type === 'responsive' ? '智能响应式' :
               type === 'horizontal' ? '强制左右分栏' :
               type === 'vertical' ? '强制上下分栏' : '强制折叠式'}
            </button>
          ))}
        </div>
      </div>
    )
  };

  const renderLayout = () => {
    switch (layoutType) {
      case 'horizontal':
        return (
          <HorizontalLayout
            leftContent={testContent.left}
            rightContent={testContent.right}
            sidebar={testContent.sidebar}
          />
        );
      case 'vertical':
        return (
          <VerticalLayout
            topContent={testContent.left}
            bottomContent={testContent.right}
            sidebar={testContent.sidebar}
          />
        );
      case 'stacked':
        return (
          <StackedLayout
            sections={[testContent.left, testContent.right]}
            sidebar={testContent.sidebar}
          />
        );
      default:
        return (
          <ResponsiveLayout
            leftContent={testContent.left}
            rightContent={testContent.right}
            sidebar={testContent.sidebar}
          />
        );
    }
  };

  return (
    <div className="h-full">
      {renderLayout()}
    </div>
  );
}