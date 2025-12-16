'use client';

import { useState, useEffect } from 'react';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'zh' | 'en';
  qrStyle: {
    size: number;
    margin: number;
    colorDark: string;
    colorLight: string;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  };
  recentConfigs: QRConfig[];
  autoSave: boolean;
  showTips: boolean;
}

export interface QRConfig {
  id: string;
  content: string;
  type: 'url' | 'text' | 'totp' | 'encrypted';
  style: UserPreferences['qrStyle'];
  createdAt: Date;
  name?: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'zh',
  qrStyle: {
    size: 256,
    margin: 4,
    colorDark: '#000000',
    colorLight: '#ffffff',
    errorCorrectionLevel: 'M'
  },
  recentConfigs: [],
  autoSave: true,
  showTips: true
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // 加载偏好设置
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem('qr-master-preferences');
        if (stored) {
          const parsed = JSON.parse(stored);
          // 确保数据结构完整
          setPreferences({
            ...DEFAULT_PREFERENCES,
            ...parsed,
            qrStyle: {
              ...DEFAULT_PREFERENCES.qrStyle,
              ...parsed.qrStyle
            }
          });
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // 保存偏好设置
  const savePreferences = (newPreferences: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    
    try {
      localStorage.setItem('qr-master-preferences', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  // 更新主题
  const updateTheme = (theme: UserPreferences['theme']) => {
    savePreferences({ theme });
  };

  // 更新语言
  const updateLanguage = (language: UserPreferences['language']) => {
    savePreferences({ language });
  };

  // 更新QR样式
  const updateQRStyle = (style: Partial<UserPreferences['qrStyle']>) => {
    savePreferences({
      qrStyle: { ...preferences.qrStyle, ...style }
    });
  };

  // 添加到最近配置
  const addRecentConfig = (config: Omit<QRConfig, 'id' | 'createdAt'>) => {
    const newConfig: QRConfig = {
      ...config,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    const updatedRecent = [
      newConfig,
      ...preferences.recentConfigs.filter(c => c.content !== config.content).slice(0, 9)
    ];

    savePreferences({ recentConfigs: updatedRecent });
  };

  // 删除最近配置
  const removeRecentConfig = (id: string) => {
    const updatedRecent = preferences.recentConfigs.filter(c => c.id !== id);
    savePreferences({ recentConfigs: updatedRecent });
  };

  // 清空最近配置
  const clearRecentConfigs = () => {
    savePreferences({ recentConfigs: [] });
  };

  // 重置所有偏好
  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem('qr-master-preferences');
  };

  // 导出偏好设置
  const exportPreferences = () => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-master-preferences-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 导入偏好设置
  const importPreferences = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          // 验证数据结构
          if (imported && typeof imported === 'object') {
            const validated = {
              ...DEFAULT_PREFERENCES,
              ...imported,
              qrStyle: {
                ...DEFAULT_PREFERENCES.qrStyle,
                ...imported.qrStyle
              }
            };
            savePreferences(validated);
            resolve();
          } else {
            reject(new Error('Invalid preferences file format'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  return {
    preferences,
    isLoading,
    updateTheme,
    updateLanguage,
    updateQRStyle,
    addRecentConfig,
    removeRecentConfig,
    clearRecentConfigs,
    resetPreferences,
    exportPreferences,
    importPreferences,
    savePreferences
  };
}