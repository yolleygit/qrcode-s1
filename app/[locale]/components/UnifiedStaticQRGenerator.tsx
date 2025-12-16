'use client';

import { useState, useCallback } from 'react';
import { Settings, ChevronDown, ChevronUp, Palette, Sliders } from 'lucide-react';
import { UnifiedContentLayout } from './UnifiedContentLayout';
import { UnifiedActionButtons, createStandardQRActions } from './UnifiedActionButtons';
import { OperationFeedback } from './OperationFeedback';
import { useOneClickOperations } from '../hooks/useOneClickOperations';
import { ShortcutHelpTrigger } from './KeyboardShortcutHints';
import { useUnifiedKeyboardShortcuts, createQRPageShortcuts } from '../hooks/useUnifiedKeyboardShortcuts';
import { RealTimeStatus } from './UnifiedStatusIndicator';
import { useRealTimePreview, QRStyleConfig } from '../hooks/useRealTimePreview';
import { RealTimeQRPreview } from './RealTimeQRPreview';
import { useUserPreferences, QRConfig } from '../hooks/useUserPreferences';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { RecentConfigs } from './RecentConfigs';

interface UnifiedStaticQRGeneratorProps {
  onSelectRecentConfig: (config: QRConfig) => void;
  onShowPreferences: () => void;
}

export function UnifiedStaticQRGenerator({ 
  onSelectRecentConfig, 
  onShowPreferences 
}: UnifiedStaticQRGeneratorProps) {
  const { handleError } = useErrorHandler();
  const { preferences, addRecentConfig } = useUserPreferences();
  const { executeOperation, getOperationState } = useOneClickOperations();
  
  // 实时预览系统
  const {
    config,
    previewData,
    isGenerating,
    error: previewError,
    updateContent,
    updateStyle
  } = useRealTimePreview({
    style: preferences.qrStyle
  });
  
  // UI 状态
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showRecentConfigs, setShowRecentConfigs] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  
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
          executeOperation('qr-download', {
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
          executeOperation('qr-copy', {
            type: 'copy',
            data: previewData
          });
        }
      },
      onClear: () => updateContent(''),
      onShowHelp: () => setShowShortcutHelp(true),
      onGoHome: () => window.location.href = '/'
    }),
    !!previewData
  );

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            静态二维码生成器
          </h2>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
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

      {/* 最近配置折叠面板 */}
      {showRecentConfigs && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
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

      {/* 统一内容布局 */}
      <UnifiedContentLayout
        inputTitle="内容输入"
        inputSubtitle="输入要生成二维码的内容"
        previewTitle="实时预览"
        previewSubtitle="二维码预览和下载"
        previewActions={
          previewData && (
            <div className="space-y-3">
              <UnifiedActionButtons
                buttons={createStandardQRActions({
                  data: previewData,
                  filename: `qrcode-${Date.now()}.png`,
                  includeShare: navigator.share !== undefined,
                  disabled: !previewData
                })}
                size="sm"
                fullWidth
              />
              
              {/* 操作反馈 */}
              <OperationFeedback
                result={getOperationState('qr-download').lastResult}
                operationType="download"
                showPerformance
                autoHideSuccess
              />
              
              <OperationFeedback
                result={getOperationState('qr-copy').lastResult}
                operationType="copy"
                autoHideSuccess
              />
            </div>
          )
        }
        inputArea={
          <div className="space-y-4 flex-1">
            {/* 实时状态指示器 */}
            <RealTimeStatus
              isGenerating={isGenerating}
              hasContent={!!config.content.trim()}
              hasError={!!previewError}
              errorMessage={previewError || undefined}
              successMessage="二维码生成成功"
              stats={{
                contentLength: config.content.length,
                quality: config.content.length > 100 ? 'high' : config.content.length > 20 ? 'medium' : 'low'
              }}
            />

            {/* 内容输入 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                内容 *
              </label>
              <textarea
                value={config.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="输入网址、文本或其他内容..."
                className="w-full h-24 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            
            {/* 样式控制切换 */}
            <button
              onClick={() => setShowStylePanel(!showStylePanel)}
              className={`
                flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${showStylePanel 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
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
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Sliders className="w-3 h-3" />
                  自定义样式
                </div>
                
                {/* 颜色设置 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">前景色</label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded border border-slate-200 dark:border-slate-600 cursor-pointer overflow-hidden"
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
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">背景色</label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded border border-slate-200 dark:border-slate-600 cursor-pointer overflow-hidden"
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
                
                {/* 尺寸设置 */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                      <span>尺寸</span>
                      <span>{config.style.size}px</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="600"
                      value={config.style.size}
                      onChange={(e) => handleStyleChange({ size: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                      <span>边距</span>
                      <span>{config.style.margin}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={config.style.margin}
                      onChange={(e) => handleStyleChange({ margin: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        }
        previewArea={
          <div className="flex-1 flex items-center justify-center">
            <RealTimeQRPreview
              config={config}
              className="w-full max-w-sm aspect-square"
              onPreviewGenerated={() => {}}
              onError={(error) => {
                handleError(new Error(error), '二维码生成');
              }}
            />
          </div>
        }
      />
    </div>
  );
}