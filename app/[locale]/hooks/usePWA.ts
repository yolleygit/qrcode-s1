'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    canInstall: false,
    installPrompt: null
  });

  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // 检测PWA状态
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 检测是否在独立模式下运行
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');

    // 检测是否已安装
    const isInstalled = isStandalone || 
                       localStorage.getItem('pwa-installed') === 'true';

    setPwaState(prev => ({
      ...prev,
      isStandalone,
      isInstalled
    }));

    // 监听安装提示事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        canInstall: true,
        installPrompt: installEvent
      }));
    };

    // 监听应用安装事件
    const handleAppInstalled = () => {
      localStorage.setItem('pwa-installed', 'true');
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        installPrompt: null
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 监听网络状态
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // 监听Service Worker更新
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleSWUpdate = () => {
      setUpdateAvailable(true);
    };

    // 检查Service Worker更新
    navigator.serviceWorker.addEventListener('controllerchange', handleSWUpdate);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleSWUpdate);
    };
  }, []);

  // 安装PWA
  const installPWA = useCallback(async () => {
    if (!pwaState.installPrompt) return false;

    try {
      await pwaState.installPrompt.prompt();
      const choiceResult = await pwaState.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setPwaState(prev => ({
          ...prev,
          canInstall: false,
          installPrompt: null
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('PWA安装失败:', error);
      return false;
    }
  }, [pwaState.installPrompt]);

  // 更新应用
  const updateApp = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    } catch (error) {
      console.error('应用更新失败:', error);
    }
  }, []);

  // 分享功能
  const shareContent = useCallback(async (data: {
    title?: string;
    text?: string;
    url?: string;
  }) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('分享失败:', error);
        return false;
      }
    }
    
    // 降级方案：复制到剪贴板
    if (data.url) {
      try {
        await navigator.clipboard.writeText(data.url);
        return true;
      } catch (error) {
        console.error('复制失败:', error);
        return false;
      }
    }
    
    return false;
  }, []);

  // 获取设备信息
  const getDeviceInfo = useCallback(() => {
    if (typeof window === 'undefined') return null;

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenWidth: screen.width,
      screenHeight: screen.height,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth
    };
  }, []);

  return {
    // 状态
    ...pwaState,
    isOnline,
    updateAvailable,
    
    // 方法
    installPWA,
    updateApp,
    shareContent,
    getDeviceInfo,
    
    // 工具函数
    canShare: typeof navigator !== 'undefined' && !!navigator.share,
    supportsNotifications: typeof window !== 'undefined' && 'Notification' in window,
    supportsServiceWorker: typeof window !== 'undefined' && 'serviceWorker' in navigator
  };
}

// 通知权限管理Hook
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('请求通知权限失败:', error);
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback(async (
    title: string,
    options?: NotificationOptions
  ) => {
    if (!isSupported || permission !== 'granted') return null;

    try {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      });

      return notification;
    } catch (error) {
      console.error('显示通知失败:', error);
      return null;
    }
  }, [isSupported, permission]);

  return {
    permission,
    isSupported,
    canNotify: permission === 'granted',
    requestPermission,
    showNotification
  };
}

// 离线存储Hook
export function useOfflineStorage() {
  const [isSupported, setIsSupported] = useState(false);
  const [storageQuota, setStorageQuota] = useState<{
    quota: number;
    usage: number;
    available: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsSupported('indexedDB' in window);

    // 获取存储配额信息
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        setStorageQuota({
          quota: estimate.quota || 0,
          usage: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0)
        });
      });
    }
  }, []);

  const clearCache = useCallback(async () => {
    if (!('caches' in window)) return false;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      return true;
    } catch (error) {
      console.error('清除缓存失败:', error);
      return false;
    }
  }, []);

  const getCacheSize = useCallback(async () => {
    if (!('caches' in window)) return 0;

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error('获取缓存大小失败:', error);
      return 0;
    }
  }, []);

  return {
    isSupported,
    storageQuota,
    clearCache,
    getCacheSize
  };
}