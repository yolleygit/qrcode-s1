'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Clock,
  Zap,
  TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { OneClickOperationResult } from '../hooks/useOneClickOperations';

export interface OperationFeedbackProps {
  /** 操作结果 */
  result?: OneClickOperationResult;
  /** 操作类型 */
  operationType: string;
  /** 是否显示性能信息 */
  showPerformance?: boolean;
  /** 是否显示重试按钮 */
  showRetryButton?: boolean;
  /** 重试回调 */
  onRetry?: () => void;
  /** 自定义类名 */
  className?: string;
  /** 是否自动隐藏成功消息 */
  autoHideSuccess?: boolean;
  /** 自动隐藏延迟（毫秒） */
  autoHideDelay?: number;
}

export function OperationFeedback({
  result,
  operationType,
  showPerformance = false,
  showRetryButton = true,
  onRetry,
  className,
  autoHideSuccess = true,
  autoHideDelay = 3000
}: OperationFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (result) {
      setIsVisible(true);
      
      // 自动隐藏成功消息
      if (result.success && autoHideSuccess) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, autoHideDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [result, autoHideSuccess, autoHideDelay]);

  if (!result || !isVisible) {
    return null;
  }

  const getStatusConfig = () => {
    if (result.success) {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        title: '操作成功',
        message: getSuccessMessage()
      };
    } else {
      return {
        icon: <XCircle className="w-4 h-4" />,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        title: '操作失败',
        message: result.error?.message || '未知错误'
      };
    }
  };

  const getSuccessMessage = () => {
    const messages: Record<string, string> = {
      download: '文件下载成功',
      copy: '内容已复制到剪贴板',
      share: '分享成功',
      save: '文件保存成功',
      print: '打印任务已发送'
    };
    return messages[operationType] || '操作完成';
  };

  const getPerformanceLevel = () => {
    if (result.duration < 500) return 'excellent';
    if (result.duration < 1000) return 'good';
    if (result.duration < 2000) return 'fair';
    return 'slow';
  };

  const getPerformanceColor = () => {
    const level = getPerformanceLevel();
    switch (level) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'fair': return 'text-yellow-600 dark:text-yellow-400';
      case 'slow': return 'text-red-600 dark:text-red-400';
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={cn(
      'border rounded-lg p-3 transition-all duration-300',
      statusConfig.bgColor,
      statusConfig.borderColor,
      'animate-in fade-in slide-in-from-top-2',
      className
    )}>
      <div className="flex items-start gap-3">
        {/* 状态图标 */}
        <div className={cn('flex-shrink-0 mt-0.5', statusConfig.color)}>
          {statusConfig.icon}
        </div>

        {/* 内容区域 */}
        <div className="flex-1 min-w-0">
          {/* 主要消息 */}
          <div className="flex items-center justify-between">
            <h4 className={cn('text-sm font-medium', statusConfig.color)}>
              {statusConfig.title}
            </h4>
            
            {/* 性能指示器 */}
            {showPerformance && result.success && (
              <div className="flex items-center gap-1">
                <TrendingUp className={cn('w-3 h-3', getPerformanceColor())} />
                <span className={cn('text-xs font-mono', getPerformanceColor())}>
                  {Math.round(result.duration)}ms
                </span>
              </div>
            )}
          </div>

          {/* 详细消息 */}
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {statusConfig.message}
          </p>

          {/* 重试信息 */}
          {result.retryCount > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <RefreshCw className="w-3 h-3" />
              <span>重试了 {result.retryCount} 次</span>
            </div>
          )}

          {/* 性能详情 */}
          {showPerformance && result.success && (
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>耗时: {Math.round(result.duration)}ms</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>性能: {getPerformanceLevel() === 'excellent' ? '优秀' : 
                           getPerformanceLevel() === 'good' ? '良好' : 
                           getPerformanceLevel() === 'fair' ? '一般' : '较慢'}</span>
              </div>
            </div>
          )}
        </div>

        {/* 重试按钮 */}
        {!result.success && showRetryButton && onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
            title="重试操作"
          >
            <RefreshCw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        )}
      </div>
    </div>
  );
}

// 操作状态指示器组件
export interface OperationStatusIndicatorProps {
  /** 是否正在执行操作 */
  isLoading: boolean;
  /** 操作结果 */
  result?: OneClickOperationResult;
  /** 操作类型 */
  operationType: string;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
}

export function OperationStatusIndicator({
  isLoading,
  result,
  operationType,
  size = 'md'
}: OperationStatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (isLoading) {
    return (
      <div className={cn(
        'border-2 border-current border-t-transparent rounded-full animate-spin',
        sizeClasses[size],
        'text-blue-600 dark:text-blue-400'
      )} />
    );
  }

  if (result?.success) {
    return (
      <CheckCircle className={cn(
        sizeClasses[size],
        'text-green-600 dark:text-green-400'
      )} />
    );
  }

  if (result && !result.success) {
    return (
      <XCircle className={cn(
        sizeClasses[size],
        'text-red-600 dark:text-red-400'
      )} />
    );
  }

  return null;
}

// 批量操作反馈组件
export interface BatchOperationFeedbackProps {
  /** 操作结果列表 */
  results: Array<{
    id: string;
    type: string;
    result: OneClickOperationResult;
  }>;
  /** 是否显示详细信息 */
  showDetails?: boolean;
  /** 自定义类名 */
  className?: string;
}

export function BatchOperationFeedback({
  results,
  showDetails = false,
  className
}: BatchOperationFeedbackProps) {
  const successCount = results.filter(r => r.result.success).length;
  const failureCount = results.length - successCount;
  const totalDuration = results.reduce((sum, r) => sum + r.result.duration, 0);
  const avgDuration = results.length > 0 ? totalDuration / results.length : 0;

  if (results.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      'border rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
      className
    )}>
      {/* 汇总信息 */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-slate-900 dark:text-white">
          批量操作结果
        </h4>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle className="w-3 h-3" />
            {successCount} 成功
          </span>
          {failureCount > 0 && (
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <XCircle className="w-3 h-3" />
              {failureCount} 失败
            </span>
          )}
        </div>
      </div>

      {/* 性能信息 */}
      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <span>总耗时: {Math.round(totalDuration)}ms</span>
        <span>平均耗时: {Math.round(avgDuration)}ms</span>
        <span>操作数量: {results.length}</span>
      </div>

      {/* 详细结果 */}
      {showDetails && (
        <div className="space-y-2">
          {results.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-2">
                <OperationStatusIndicator
                  isLoading={false}
                  result={item.result}
                  operationType={item.type}
                  size="sm"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {item.type} #{index + 1}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {Math.round(item.result.duration)}ms
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}