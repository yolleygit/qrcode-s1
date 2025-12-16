'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useErrorHandler';

interface NetworkStatusProps {
  className?: string;
  showWhenOnline?: boolean;
}

export function NetworkStatus({ 
  className = "", 
  showWhenOnline = false 
}: NetworkStatusProps) {
  const { isOnline, networkError } = useNetworkStatus();
  const [showStatus, setShowStatus] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (!isOnline) {
      setShowStatus(true);
      setWasOffline(true);
    } else if (wasOffline) {
      // 网络恢复时显示短暂的成功消息
      setShowStatus(true);
      const timer = setTimeout(() => {
        if (!showWhenOnline) {
          setShowStatus(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    } else if (showWhenOnline) {
      setShowStatus(true);
    }
  }, [isOnline, wasOffline, showWhenOnline, mounted]);

  if (!mounted || !showStatus) {
    return null;
  }

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <div
        className={`
          px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border
          transition-all duration-300 ease-out
          ${isOnline 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }
        `}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          {isOnline ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>网络已连接</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>网络连接断开</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 简单的网络状态指示器，用于导航栏等位置
export function NetworkIndicator({ className = "" }: { className?: string }) {
  const { isOnline } = useNetworkStatus();

  return (
    <div className={`flex items-center ${className}`}>
      {isOnline ? (
        <Wifi className="w-4 h-4 text-green-500" />
      ) : (
        <div className="flex items-center gap-1">
          <WifiOff className="w-4 h-4 text-red-500" />
          <AlertTriangle className="w-3 h-3 text-red-500" />
        </div>
      )}
    </div>
  );
}

// 离线提示横幅
export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (!isOnline) {
      setShow(true);
    } else {
      // 网络恢复时延迟隐藏
      const timer = setTimeout(() => setShow(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, mounted]);

  if (!mounted || !show) {
    return null;
  }

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-[60] 
        transform transition-transform duration-300 ease-out
        ${!isOnline ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium">
        <div className="flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>
            {!isOnline 
              ? '网络连接已断开，部分功能可能无法使用' 
              : '网络连接已恢复'
            }
          </span>
        </div>
      </div>
    </div>
  );
}