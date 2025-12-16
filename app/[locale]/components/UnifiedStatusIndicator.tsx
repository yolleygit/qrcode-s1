'use client';

import { ReactNode } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle, 
  Clock, 
  Zap,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '../lib/utils';
import { unifiedComponentClasses } from '../lib/unifiedDesignSystem';

export interface UnifiedStatusIndicatorProps {
  /** 状态类型 */
  status: 'success' | 'warning' | 'error' | 'info' | 'loading' | 'idle' | 'processing';
  /** 状态消息 */
  message: string;
  /** 详细描述（可选） */
  description?: string;
  /** 自定义图标 */
  icon?: ReactNode;
  /** 是否显示动画 */
  animated?: boolean;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否可关闭 */
  dismissible?: boolean;
  /** 关闭回调 */
  onDismiss?: () => void;
  /** 自定义类名 */
  className?: string;
  /** 是否显示进度指示器 */
  showProgress?: boolean;
  /** 进度值 (0-100) */
  progress?: number;
}

export function UnifiedStatusIndicator({
  status,
  message,
  description,
  icon,
  animated = true,
  size = 'md',
  dismissible = false,
  onDismiss,
  className,
  showProgress = false,
  progress = 0
}: UnifiedStatusIndicatorProps) {
  
  // 状态样式映射
  const statusStyles = {
    success: {
      container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
      icon: 'text-green-600 dark:text-green-400',
      defaultIcon: <CheckCircle className="w-5 h-5" />
    },
    warning: {
      container: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
      icon: 'text-amber-600 dark:text-amber-400',
      defaultIcon: <AlertTriangle className="w-5 h-5" />
    },
    error: {
      container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      icon: 'text-red-600 dark:text-red-400',
      defaultIcon: <XCircle className="w-5 h-5" />
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
      icon: 'text-blue-600 dark:text-blue-400',
      defaultIcon: <Info className="w-5 h-5" />
    },
    loading: {
      container: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200',
      icon: 'text-indigo-600 dark:text-indigo-400',
      defaultIcon: <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
    },
    processing: {
      container: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200',
      icon: 'text-purple-600 dark:text-purple-400',
      defaultIcon: <Zap className="w-5 h-5" />
    },
    idle: {
      container: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
      icon: 'text-slate-500 dark:text-slate-400',
      defaultIcon: <Clock className="w-5 h-5" />
    }
  };

  // 尺寸样式
  const sizeStyles = {
    sm: {
      container: 'p-3 text-sm',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    md: {
      container: 'p-4 text-base',
      icon: 'w-5 h-5',
      text: 'text-base'
    },
    lg: {
      container: 'p-6 text-lg',
      icon: 'w-6 h-6',
      text: 'text-lg'
    }
  };

  const currentStatusStyle = statusStyles[status];
  const currentSizeStyle = sizeStyles[size];
  const displayIcon = icon || currentStatusStyle.defaultIcon;

  return (
    <div className={cn(
      'border rounded-lg flex items-start gap-3 transition-all duration-200',
      currentStatusStyle.container,
      currentSizeStyle.container,
      animated && 'animate-in fade-in slide-in-from-top-2 duration-300',
      className
    )}>
      {/* 状态图标 */}
      <div className={cn(
        'flex-shrink-0 mt-0.5',
        currentStatusStyle.icon,
        animated && status === 'loading' && 'animate-pulse'
      )}>
        {displayIcon}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 min-w-0">
        {/* 主要消息 */}
        <div className={cn(
          'font-medium',
          currentSizeStyle.text
        )}>
          {message}
        </div>

        {/* 详细描述 */}
        {description && (
          <div className={cn(
            'mt-1 opacity-80',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          )}>
            {description}
          </div>
        )}

        {/* 进度条 */}
        {showProgress && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span>进度</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-white/50 dark:bg-slate-700/50 rounded-full h-2">
              <div 
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  status === 'success' && 'bg-green-500',
                  status === 'warning' && 'bg-amber-500',
                  status === 'error' && 'bg-red-500',
                  status === 'info' && 'bg-blue-500',
                  status === 'loading' && 'bg-indigo-500',
                  status === 'processing' && 'bg-purple-500',
                  status === 'idle' && 'bg-slate-400'
                )}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 关闭按钮 */}
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 p-1 rounded-md transition-colors',
            'hover:bg-black/10 dark:hover:bg-white/10',
            currentStatusStyle.icon
          )}
          aria-label="关闭"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// 预设的状态指示器组件
export const SuccessIndicator = (props: Omit<UnifiedStatusIndicatorProps, 'status'>) => (
  <UnifiedStatusIndicator status="success" {...props} />
);

export const WarningIndicator = (props: Omit<UnifiedStatusIndicatorProps, 'status'>) => (
  <UnifiedStatusIndicator status="warning" {...props} />
);

export const ErrorIndicator = (props: Omit<UnifiedStatusIndicatorProps, 'status'>) => (
  <UnifiedStatusIndicator status="error" {...props} />
);

export const InfoIndicator = (props: Omit<UnifiedStatusIndicatorProps, 'status'>) => (
  <UnifiedStatusIndicator status="info" {...props} />
);

export const LoadingIndicator = (props: Omit<UnifiedStatusIndicatorProps, 'status'>) => (
  <UnifiedStatusIndicator status="loading" {...props} />
);

export const ProcessingIndicator = (props: Omit<UnifiedStatusIndicatorProps, 'status'>) => (
  <UnifiedStatusIndicator status="processing" {...props} />
);

// 实时状态指示器（用于所见即所得功能）
export interface RealTimeStatusProps {
  /** 是否正在生成 */
  isGenerating: boolean;
  /** 是否有内容 */
  hasContent: boolean;
  /** 是否有错误 */
  hasError: boolean;
  /** 错误消息 */
  errorMessage?: string;
  /** 生成成功的消息 */
  successMessage?: string;
  /** 数据统计信息 */
  stats?: {
    contentLength?: number;
    generationTime?: number;
    quality?: 'high' | 'medium' | 'low';
  };
}

export function RealTimeStatus({
  isGenerating,
  hasContent,
  hasError,
  errorMessage,
  successMessage,
  stats
}: RealTimeStatusProps) {
  if (hasError && errorMessage) {
    return (
      <ErrorIndicator
        message="生成失败"
        description={errorMessage}
        size="sm"
      />
    );
  }

  if (isGenerating) {
    return (
      <LoadingIndicator
        message="实时生成中..."
        description="正在处理您的输入"
        size="sm"
        animated
      />
    );
  }

  if (hasContent) {
    return (
      <SuccessIndicator
        message={successMessage || "生成成功"}
        description={stats ? `内容长度: ${stats.contentLength} 字符` : "实时预览已更新"}
        size="sm"
        icon={<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
      />
    );
  }

  return (
    <InfoIndicator
      message="等待输入"
      description="输入内容后自动生成预览"
      size="sm"
      icon={<Eye className="w-4 h-4" />}
    />
  );
}