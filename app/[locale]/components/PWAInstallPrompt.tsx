'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA, useNotifications } from '../hooks/usePWA';

export function PWAInstallPrompt() {
  const { canInstall, installPWA, isStandalone } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 检查是否已经关闭过提示
    const isDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
    setDismissed(isDismissed);

    // 如果可以安装且未关闭，延迟显示提示
    if (canInstall && !isDismissed && !isStandalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // 3秒后显示

      return () => clearTimeout(timer);
    }
  }, [canInstall, isStandalone]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || dismissed || isStandalone) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                安装 QR Master
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                安装到桌面，享受更快的访问速度和离线功能
              </p>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Smartphone className="w-3 h-3" />
                  <span>移动端</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Monitor className="w-3 h-3" />
                  <span>桌面端</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <WifiOff className="w-3 h-3" />
                  <span>离线可用</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                >
                  立即安装
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                  aria-label="关闭"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function PWAUpdatePrompt() {
  const { updateAvailable, updateApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      setShowPrompt(true);
    }
  }, [updateAvailable]);

  const handleUpdate = async () => {
    await updateApp();
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
      >
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <Download className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                新版本可用
              </h3>
              <p className="text-sm text-green-700 dark:text-green-200 mb-3">
                发现新版本，包含性能改进和新功能
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1.5 px-3 rounded-md transition-colors"
                >
                  立即更新
                </button>
                <button
                  onClick={() => setShowPrompt(false)}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm"
                >
                  稍后提醒
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
    } else {
      // 延迟隐藏，显示"已重新连接"消息
      const timer = setTimeout(() => {
        setShowOffline(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {showOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-16 left-4 right-4 z-40"
        >
          <div className={`
            mx-auto max-w-sm rounded-lg p-3 text-center text-sm font-medium
            ${isOnline 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800'
            }
          `}>
            <div className="flex items-center justify-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>已重新连接</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>离线模式 - 部分功能可能受限</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PWAFeatures() {
  const { isStandalone, canShare, shareContent } = usePWA();
  const { canNotify, requestPermission, showNotification } = useNotifications();

  const handleShare = async () => {
    const success = await shareContent({
      title: 'QR Master - 专业二维码生成工具',
      text: '功能强大的二维码生成工具，支持静态、动态验证码和加密二维码',
      url: window.location.origin
    });

    if (success && canNotify) {
      showNotification('分享成功', {
        body: '链接已分享',
        icon: '/icons/icon-192x192.png'
      });
    }
  };

  const handleNotificationTest = async () => {
    if (!canNotify) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    showNotification('QR Master 通知测试', {
      body: '通知功能正常工作！',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'test-notification',
      requireInteraction: false
    });
  };

  if (!isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="flex flex-col gap-2">
        {canShare && (
          <button
            onClick={handleShare}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
            title="分享应用"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        )}
        
        <button
          onClick={handleNotificationTest}
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="测试通知"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 19.718A8.97 8.97 0 0112 21a8.97 8.97 0 017.132-1.282M6 12a6 6 0 1112 0v3.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}