'use client';

import { useCallback, useState, useEffect } from 'react';

export interface ErrorInfo {
  message: string;
  type: 'network' | 'validation' | 'permission' | 'timeout' | 'unknown';
  code?: string | number;
  details?: any;
  timestamp: Date;
}

export interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: boolean;
}

export function useErrorHandler() {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);

  // 处理错误的主要函数
  const handleError = useCallback((error: Error | ErrorInfo | string, context?: string) => {
    let errorInfo: ErrorInfo;

    if (typeof error === 'string') {
      errorInfo = {
        message: error,
        type: 'unknown',
        timestamp: new Date()
      };
    } else if (error instanceof Error) {
      errorInfo = {
        message: error.message,
        type: getErrorType(error),
        details: { stack: error.stack, name: error.name },
        timestamp: new Date()
      };
    } else {
      errorInfo = error;
    }

    // 添加上下文信息
    if (context) {
      errorInfo.details = { ...errorInfo.details, context };
    }

    // 记录错误
    console.error(`Error${context ? ` in ${context}` : ''}:`, errorInfo);
    
    // 添加到错误列表
    setErrors(prev => [errorInfo, ...prev.slice(0, 9)]); // 保留最近10个错误

    // 显示用户友好的错误消息
    showUserFriendlyError(errorInfo);

    return errorInfo;
  }, []);

  // 重试函数
  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    const { maxRetries = 3, delay = 1000, backoff = true } = options;
    
    setIsRetrying(true);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        setIsRetrying(false);
        return result;
      } catch (error) {
        if (attempt === maxRetries) {
          setIsRetrying(false);
          throw error;
        }
        
        // 计算延迟时间
        const currentDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay;
        await new Promise(resolve => setTimeout(resolve, currentDelay));
      }
    }
    
    setIsRetrying(false);
    throw new Error('Max retries exceeded');
  }, []);

  // 清除错误
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // 清除特定错误
  const clearError = useCallback((index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    errors,
    isRetrying,
    handleError,
    retry,
    clearErrors,
    clearError
  };
}

// 确定错误类型
function getErrorType(error: Error): ErrorInfo['type'] {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  if (name.includes('network') || message.includes('network') || message.includes('fetch')) {
    return 'network';
  }
  
  if (name.includes('validation') || message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }
  
  if (name.includes('permission') || message.includes('permission') || message.includes('unauthorized')) {
    return 'permission';
  }
  
  if (name.includes('timeout') || message.includes('timeout')) {
    return 'timeout';
  }
  
  return 'unknown';
}

// 显示用户友好的错误消息
function showUserFriendlyError(errorInfo: ErrorInfo) {
  const userMessage = getUserFriendlyMessage(errorInfo);
  
  // 动态导入toast以避免循环依赖
  import('../components/Toast').then(({ toast }) => {
    toast.error(userMessage, {
      duration: 5000,
      action: errorInfo.type === 'network' ? {
        label: '重试',
        onClick: () => {
          // 这里可以触发重试逻辑
          console.log('Retry action triggered');
        }
      } : undefined
    });
  }).catch(() => {
    // 如果toast导入失败，回退到console
    console.warn('User Error:', userMessage);
  });
}

// 获取用户友好的错误消息
function getUserFriendlyMessage(errorInfo: ErrorInfo): string {
  switch (errorInfo.type) {
    case 'network':
      return '网络连接出现问题，请检查网络后重试';
    case 'validation':
      return '输入信息有误，请检查后重新提交';
    case 'permission':
      return '权限不足，请联系管理员或重新登录';
    case 'timeout':
      return '操作超时，请稍后重试';
    default:
      return '操作失败，请稍后重试';
  }
}

// 网络状态检测Hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true); // 默认为true避免hydration mismatch
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const checkNetworkStatus = useCallback(() => {
    if (typeof navigator !== 'undefined') {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (!online) {
        setNetworkError('网络连接已断开，请检查网络设置');
      } else {
        setNetworkError(null);
      }
      
      return online;
    }
    return true;
  }, []);

  // 初始化和监听网络状态变化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true);
      
      // 初始化网络状态
      setIsOnline(navigator.onLine);
      
      const handleOnline = () => {
        setIsOnline(true);
        setNetworkError(null);
      };
      
      const handleOffline = () => {
        setIsOnline(false);
        setNetworkError('网络连接已断开，请检查网络设置');
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return {
    isOnline: mounted ? isOnline : true, // 在mounted之前始终返回true
    networkError,
    checkNetworkStatus
  };
}