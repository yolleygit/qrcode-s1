import { useState, useEffect } from 'react';
import { Activity, Clock, Database, Zap, TrendingUp, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { performanceMonitor } from '../lib/utils';
import { useMemoryMonitoring } from '../hooks/usePerformanceOptimization';

export interface PerformanceDashboardProps {
  className?: string;
  compact?: boolean;
  showMemory?: boolean;
  showCache?: boolean;
  refreshInterval?: number;
}

export function PerformanceDashboard({
  className,
  compact = false,
  showMemory = true,
  showCache = true,
  refreshInterval = 2000
}: PerformanceDashboardProps) {
  const [qrStats, setQrStats] = useState<any>(null);
  const [renderStats, setRenderStats] = useState<any>(null);
  const memoryInfo = useMemoryMonitoring();
  
  useEffect(() => {
    const updateStats = () => {
      setQrStats(performanceMonitor.getStats('qr-generation'));
      setRenderStats(performanceMonitor.getStats('render-RealTimeQRPreview'));
    };
    
    updateStats();
    const interval = setInterval(updateStats, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatTime = (ms: number) => {
    if (ms < 1) return '<1ms';
    return `${Math.round(ms)}ms`;
  };
  
  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400',
        className
      )}>
        {qrStats && (
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>QR: {formatTime(qrStats.average)}</span>
          </div>
        )}
        {renderStats && (
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>渲染: {formatTime(renderStats.average)}</span>
          </div>
        )}
        {memoryInfo && showMemory && (
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            <span>{formatBytes(memoryInfo.usedJSHeapSize)}</span>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn(
      'bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4',
      className
    )}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          性能监控
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* QR Generation Performance */}
        {qrStats && (
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                二维码生成
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>平均时间:</span>
                <span className="font-mono">{formatTime(qrStats.average)}</span>
              </div>
              <div className="flex justify-between">
                <span>中位数:</span>
                <span className="font-mono">{formatTime(qrStats.median)}</span>
              </div>
              <div className="flex justify-between">
                <span>P95:</span>
                <span className="font-mono">{formatTime(qrStats.p95)}</span>
              </div>
              <div className="flex justify-between">
                <span>总次数:</span>
                <span className="font-mono">{qrStats.count}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Render Performance */}
        {renderStats && (
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                组件渲染
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>平均时间:</span>
                <span className="font-mono">{formatTime(renderStats.average)}</span>
              </div>
              <div className="flex justify-between">
                <span>最大时间:</span>
                <span className="font-mono">{formatTime(renderStats.max)}</span>
              </div>
              <div className="flex justify-between">
                <span>渲染次数:</span>
                <span className="font-mono">{renderStats.count}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Memory Usage */}
        {memoryInfo && showMemory && (
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                内存使用
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>已使用:</span>
                <span className="font-mono">{formatBytes(memoryInfo.usedJSHeapSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>总计:</span>
                <span className="font-mono">{formatBytes(memoryInfo.totalJSHeapSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>限制:</span>
                <span className="font-mono">{formatBytes(memoryInfo.jsHeapSizeLimit)}</span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                  <div 
                    className="bg-purple-600 dark:bg-purple-400 h-1.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Performance Tips */}
      <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
            性能建议
          </span>
        </div>
        <div className="text-xs text-indigo-800 dark:text-indigo-200 space-y-1">
          {qrStats && qrStats.average > 500 && (
            <div>• 二维码生成时间较长，考虑降低图片质量或启用更积极的缓存</div>
          )}
          {renderStats && renderStats.average > 16 && (
            <div>• 组件渲染时间超过16ms，可能影响60fps流畅度</div>
          )}
          {memoryInfo && (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) > 0.8 && (
            <div>• 内存使用率较高，建议清理缓存或减少同时处理的数据量</div>
          )}
          {(!qrStats || qrStats.average < 200) && (!renderStats || renderStats.average < 16) && (
            <div>• 性能表现良好！继续保持优化策略</div>
          )}
        </div>
      </div>
    </div>
  );
}