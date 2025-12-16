'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 调用自定义错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            {/* 错误图标和标题 */}
            <div className="bg-red-50 dark:bg-red-900/20 p-6 text-center border-b border-red-100 dark:border-red-800/30">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                出现错误
              </h1>
              <p className="text-sm text-red-700 dark:text-red-300">
                抱歉，页面遇到了意外错误
              </p>
            </div>

            {/* 错误详情 */}
            <div className="p-6 space-y-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <p className="mb-3">
                  我们已经记录了这个错误，并会尽快修复。您可以尝试以下操作：
                </p>
                
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                    <span>刷新页面重新加载</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                    <span>返回首页重新开始</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                    <span>清除浏览器缓存后重试</span>
                  </li>
                </ul>
              </div>

              {/* 开发环境下显示错误详情 */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <summary className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    错误详情 (开发模式)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">错误信息:</p>
                      <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap break-words">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">堆栈跟踪:</p>
                        <pre className="text-xs text-slate-500 dark:text-slate-500 whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px] touch-manipulation"
                >
                  <RefreshCw className="w-4 h-4" />
                  重试
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px] touch-manipulation"
                >
                  <RefreshCw className="w-4 h-4" />
                  刷新页面
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px] touch-manipulation"
                >
                  <Home className="w-4 h-4" />
                  返回首页
                </button>
              </div>

              {/* 报告错误链接 */}
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    const errorReport = {
                      message: this.state.error?.message,
                      stack: this.state.error?.stack,
                      userAgent: navigator.userAgent,
                      url: window.location.href,
                      timestamp: new Date().toISOString()
                    };
                    console.log('Error Report:', errorReport);
                    // 这里可以发送错误报告到服务器
                  }}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Bug className="w-3 h-3" />
                  报告此错误
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 简化的错误边界组件，用于局部错误处理
interface SimpleErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export function SimpleErrorBoundary({ 
  children, 
  fallback, 
  className = "" 
}: SimpleErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className={`p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  加载失败
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  这个组件遇到了错误，请刷新页面重试
                </p>
              </div>
            </div>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
}