import { forwardRef, useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { QrCode, Loader2, AlertTriangle, Zap, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { PreviewConfig, QRStyleConfig, DEFAULT_QR_STYLE, GenerationProgress, useRealTimePreview } from '../hooks/useRealTimePreview';

export interface RealTimeQRPreviewProps {
  config?: Partial<PreviewConfig>;
  className?: string;
  placeholder?: string;
  showError?: boolean;
  showLoading?: boolean;
  showProgress?: boolean;
  showPerformanceStats?: boolean;
  onPreviewGenerated?: (dataUrl: string) => void;
  onError?: (error: string) => void;
}

export const RealTimeQRPreview = forwardRef<HTMLDivElement, RealTimeQRPreviewProps>(
  ({ 
    config,
    className,
    placeholder = '输入内容生成二维码',
    showError = true,
    showLoading = true,
    showProgress = true,
    showPerformanceStats = false,
    onPreviewGenerated,
    onError,
    ...props 
  }, ref) => {
    const imgRef = useRef<HTMLImageElement>(null);
    
    // 使用优化的实时预览Hook
    const {
      previewData,
      isGenerating,
      error,
      progress,
      generationTime,
      updateContent,
      updateStyle,
      updateType,
      getPerformanceStats
    } = useRealTimePreview(config);
    
    // 合并配置
    const currentConfig = useMemo(() => ({
      content: config?.content || '',
      style: { ...DEFAULT_QR_STYLE, ...config?.style },
      type: config?.type || 'static' as const
    }), [config?.content, config?.style, config?.type]);
    
    // 当配置变化时更新Hook
    useEffect(() => {
      if (config?.content !== undefined) {
        updateContent(config.content);
      }
    }, [config?.content, updateContent]);
    
    useEffect(() => {
      if (config?.style) {
        updateStyle(config.style);
      }
    }, [config?.style, updateStyle]);
    
    useEffect(() => {
      if (config?.type) {
        updateType(config.type);
      }
    }, [config?.type, updateType]);
    
    // 处理回调
    useEffect(() => {
      if (previewData && onPreviewGenerated) {
        onPreviewGenerated(previewData);
      }
    }, [previewData, onPreviewGenerated]);
    
    useEffect(() => {
      if (error && onError) {
        onError(error);
      }
    }, [error, onError]);
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 transition-all duration-200',
          previewData && 'border-solid border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
          isGenerating && 'border-indigo-300 dark:border-indigo-700',
          error && showError && 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20',
          className
        )}
        style={{
          minHeight: currentConfig.style.size || 256,
          minWidth: currentConfig.style.size || 256
        }}
        {...props}
      >
        {/* 加载状态和进度指示器 */}
        {isGenerating && showLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-slate-900/90 rounded-xl z-10 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 p-4">
              <div className="relative">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                {progress && showProgress && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              
              {progress && showProgress ? (
                <div className="text-center min-w-[120px]">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {progress.message}
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {progress.progress}%
                  </div>
                </div>
              ) : (
                <span className="text-sm text-slate-600 dark:text-slate-400">生成中...</span>
              )}
            </div>
          </div>
        )}
        
        {/* 错误状态 */}
        {error && showError && !isGenerating && (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                生成失败
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          </div>
        )}
        
        {/* 预览内容 */}
        {previewData && !error && (
          <div className="p-4 flex items-center justify-center">
            <img
              ref={imgRef}
              src={previewData}
              alt="QR Code Preview"
              className="max-w-full max-h-full object-contain transition-all duration-200 hover:scale-105"
              style={{
                width: currentConfig.style.size,
                height: currentConfig.style.size
              }}
              onLoad={() => {
                // 预览加载完成的回调
                console.log('QR preview loaded');
              }}
            />
          </div>
        )}
        
        {/* 占位符 */}
        {!previewData && !isGenerating && !error && (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <QrCode className="w-12 h-12 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                二维码预览
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {placeholder}
              </p>
            </div>
          </div>
        )}
        
        {/* 实时响应指示器 */}
        {isGenerating && (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            {progress && showProgress && (
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                {progress.progress}%
              </div>
            )}
          </div>
        )}
        
        {/* 性能统计 */}
        {showPerformanceStats && generationTime > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded backdrop-blur-sm">
            <Clock className="w-3 h-3" />
            <span>{Math.round(generationTime)}ms</span>
            <Zap className="w-3 h-3 ml-1" />
          </div>
        )}
      </div>
    );
  }
);

RealTimeQRPreview.displayName = 'RealTimeQRPreview';