'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Download, Link as LinkIcon, Check, Settings, Copy, 
  Palette, Sliders, ChevronDown, ChevronUp
} from 'lucide-react';
import { SmartLayout } from './SmartLayout';
import { InputPanel, PreviewPanel } from './SmartPanel';
import { useRealTimePreview, QRStyleConfig } from '../hooks/useRealTimePreview';
import { RealTimeQRPreview } from './RealTimeQRPreview';
import { useUserPreferences, QRConfig } from '../hooks/useUserPreferences';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useViewportLayout } from '../hooks/useViewportLayout';
import { RecentConfigs } from './RecentConfigs';
import { useOneClickOperations } from '../hooks/useOneClickOperations';
import { OperationFeedback } from './OperationFeedback';
import { ShortcutHelpTrigger } from './KeyboardShortcutHints';
import { useUnifiedKeyboardShortcuts, createQRPageShortcuts } from '../hooks/useUnifiedKeyboardShortcuts';

interface StaticQRGeneratorProps {
  onSelectRecentConfig: (config: QRConfig) => void;
  onShowPreferences: () => void;
  isEmbedded?: boolean;
}

export function StaticQRGenerator({ 
  onSelectRecentConfig, 
  onShowPreferences,
  isEmbedded = false
}: StaticQRGeneratorProps) {
  const { handleError } = useErrorHandler();
  const { preferences, addRecentConfig } = useUserPreferences();
  const { viewport, isMobile, isTablet, isDesktop } = useViewportLayout();
  const { executeOperation, getOperationState } = useOneClickOperations();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 实时预览系统（带性能优化）
  const {
    config,
    previewData,
    isGenerating,
    error: previewError,
    progress,
    generationTime,
    updateContent,
    updateStyle,
    clearCache
  } = useRealTimePreview({
    style: preferences.qrStyle
  });
  
  // UI 状态
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showRecentConfigs, setShowRecentConfigs] = useState(false);
  
  // 处理内容输入
  const handleContentChange = useCallback((value: string) => {
    updateContent(value);
  }, [updateContent]);
  
  // 处理样式更新
  const handleStyleChange = useCallback((styleUpdate: Partial<QRStyleConfig>) => {
    updateStyle(styleUpdate);
  }, [updateStyle]);

  // 键盘快捷键
  const { availableShortcuts } = useUnifiedKeyboardShortcuts(
    createQRPageShortcuts({
      onDownload: () => {
        if (previewData) {
          executeOperation('static-qr-download', {
            type: 'download',
            data: previewData,
            filename: `qrcode-${Date.now()}.png`,
            onSuccess: () => {
              if (preferences.autoSave) {
                addRecentConfig({
                  content: config.content,
                  type: 'url',
                  style: config.style,
                  name: `静态二维码 - ${new Date().toLocaleString('zh-CN')}`
                });
              }
            }
          });
        }
      },
      onCopy: () => {
        if (previewData) {
          executeOperation('static-qr-copy', {
            type: 'copy',
            data: previewData
          });
        }
      },
      onClear: () => updateContent(''),
      onGoHome: () => window.location.href = '/'
    }),
    !!previewData
  );

  // 计算容器高度以实现无滚动体验
  const containerHeight = Math.min(
    viewport.availableHeight - 120, // 减去标题区域
    600 // 最大高度限制
  );

  return (
    <section 
      id="quick-generate" 
      ref={containerRef}
      className={isEmbedded ? "" : "bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"}
      style={isEmbedded ? {} : { 
        minHeight: isMobile ? 'auto' : `${containerHeight}px`,
        maxHeight: isMobile ? 'none' : `${containerHeight + 100}px`
      }}
    >
      {/* 紧凑标题区域 - 仅在非嵌入模式显示 */}
      {!isEmbedded && (
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              静态二维码
            </h2>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              实时预览
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShortcutHelpTrigger shortcuts={availableShortcuts} compact />
            <button
              onClick={() => setShowRecentConfigs(!showRecentConfigs)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
              title="最近配置"
            >
              {showRecentConfigs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={onShowPreferences}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
              title="偏好设置"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 最近配置折叠面板 - 仅在非嵌入模式显示 */}
      {!isEmbedded && showRecentConfigs && (
        <div className="px-4 sm:px-6 lg:px-8 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <RecentConfigs 
            compact
            onSelectConfig={(recentConfig) => {
              updateContent(recentConfig.content);
              updateStyle(recentConfig.style);
              onSelectRecentConfig(recentConfig);
              setShowRecentConfigs(false);
            }}
          />
        </div>
      )}
      
      {/* 主要内容区域 - 左右分栏布局 */}
      <div 
        className="px-4 sm:px-6 lg:px-8 py-4"
        style={{ 
          height: isMobile ? 'auto' : `${containerHeight - 80}px`,
          overflow: 'hidden'
        }}
      >
        <div className={`
          h-full
          ${isDesktop ? 'flex gap-6' : 'flex flex-col gap-4'}
        `}>
          {/* 左侧：输入区域 */}
          <div className={`
            ${isDesktop ? 'w-[45%] flex-shrink-0' : 'w-full'}
            ${isMobile ? '' : 'h-full'}
            flex flex-col
          `}>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex-1 flex flex-col">
              {/* 输入框 */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-base rounded-xl min-h-[48px] touch-manipulation transition-shadow"
                  placeholder="输入网址、文本或其他内容..."
                  value={config.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  autoComplete="url"
                />
              </div>
              
              {/* 样式控制切换 */}
              <button
                onClick={() => setShowStylePanel(!showStylePanel)}
                className={`
                  flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-3
                  ${showStylePanel 
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  样式设置
                </span>
                {showStylePanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {/* 样式控制面板 */}
              {showStylePanel && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 mb-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Sliders className="w-3 h-3" />
                    自定义样式
                  </div>
                  
                  {/* 颜色设置 - 紧凑布局 */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">前景色</label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-7 h-7 rounded border border-slate-200 dark:border-slate-600 cursor-pointer overflow-hidden"
                          style={{ backgroundColor: config.style.colorDark }}
                        >
                          <input 
                            type="color" 
                            value={config.style.colorDark} 
                            onChange={(e) => handleStyleChange({ colorDark: e.target.value })}
                            className="w-full h-full opacity-0 cursor-pointer" 
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {config.style.colorDark}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">背景色</label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-7 h-7 rounded border border-slate-200 dark:border-slate-600 cursor-pointer overflow-hidden"
                          style={{ backgroundColor: config.style.colorLight }}
                        >
                          <input 
                            type="color" 
                            value={config.style.colorLight} 
                            onChange={(e) => handleStyleChange({ colorLight: e.target.value })}
                            className="w-full h-full opacity-0 cursor-pointer" 
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {config.style.colorLight}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 尺寸设置 - 紧凑布局 */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span>尺寸</span>
                        <span>{config.style.size}px</span>
                      </div>
                      <input
                        type="range"
                        min="200"
                        max="600"
                        value={config.style.size}
                        onChange={(e) => handleStyleChange({ size: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span>边距</span>
                        <span>{config.style.margin}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={config.style.margin}
                        onChange={(e) => handleStyleChange({ margin: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* 特性标签 - 紧凑 */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-auto pt-3">
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>实时预览</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>高清导出</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>完全免费</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 右侧：预览区域 */}
          <div className={`
            ${isDesktop ? 'flex-1' : 'w-full'}
            ${isMobile ? '' : 'h-full'}
            flex flex-col
          `}>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl p-4 flex-1 flex flex-col items-center justify-center">
              {/* QR码预览 */}
              <div className="flex-1 flex items-center justify-center w-full">
                <RealTimeQRPreview
                  config={config}
                  className="w-full max-w-[280px] aspect-square"
                  showProgress={true}
                  showPerformanceStats={isDesktop}
                  onPreviewGenerated={() => {}}
                  onError={(error) => {
                    handleError(new Error(error), '二维码生成');
                  }}
                />
              </div>
              
              {/* 操作按钮 - 一键操作 */}
              {previewData && (
                <div className="w-full max-w-[280px] mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => executeOperation('static-qr-download', {
                        type: 'download',
                        data: previewData,
                        filename: `qrcode-${Date.now()}.png`,
                        onSuccess: () => {
                          if (preferences.autoSave) {
                            addRecentConfig({
                              content: config.content,
                              type: 'url',
                              style: config.style,
                              name: `静态二维码 - ${new Date().toLocaleString('zh-CN')}`
                            });
                          }
                        }
                      })}
                      disabled={getOperationState('static-qr-download').isLoading || !config.content.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] touch-manipulation hover:shadow-lg active:scale-[0.98]"
                    >
                      {getOperationState('static-qr-download').isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm">下载中</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span className="text-sm">下载</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => executeOperation('static-qr-copy', {
                        type: 'copy',
                        data: previewData
                      })}
                      disabled={getOperationState('static-qr-copy').isLoading}
                      className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px] touch-manipulation"
                    >
                      {getOperationState('static-qr-copy').isLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-sm">复制</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* 操作反馈 */}
                  <OperationFeedback
                    result={getOperationState('static-qr-download').lastResult}
                    operationType="download"
                    showPerformance={isDesktop}
                    autoHideSuccess
                  />
                  
                  <OperationFeedback
                    result={getOperationState('static-qr-copy').lastResult}
                    operationType="copy"
                    autoHideSuccess
                  />
                </div>
              )}
              
              {/* 状态指示和性能信息 */}
              {isGenerating && (
                <div className="mt-3 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  {progress ? progress.message : '生成中...'}
                  {progress && (
                    <span className="text-slate-500 dark:text-slate-400">
                      ({progress.progress}%)
                    </span>
                  )}
                </div>
              )}
              
              {/* 性能统计和状态信息 */}
              <div className="mt-3 space-y-2">
                {/* 生成状态 */}
                {isGenerating && (
                  <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                    {progress ? progress.message : '生成中...'}
                    {progress && (
                      <span className="text-slate-500 dark:text-slate-400">
                        ({progress.progress}%)
                      </span>
                    )}
                  </div>
                )}
                
                {/* 性能统计（仅桌面端显示） */}
                {isDesktop && generationTime > 0 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>生成时间: {Math.round(generationTime)}ms</span>
                    <button
                      onClick={clearCache}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      清理缓存
                    </button>
                  </div>
                )}
                
                {/* 错误信息 */}
                {previewError && (
                  <div className="text-xs text-red-500 dark:text-red-400">
                    {previewError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
