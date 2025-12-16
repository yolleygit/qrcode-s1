'use client';

import { useState } from 'react';
import { X, Download, Upload, RotateCcw, Palette, Globe, Settings } from 'lucide-react';
import { useUserPreferences } from '../hooks/useUserPreferences';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreferencesModal({ isOpen, onClose }: PreferencesModalProps) {
  const {
    preferences,
    updateTheme,
    updateLanguage,
    updateQRStyle,
    clearRecentConfigs,
    resetPreferences,
    exportPreferences,
    importPreferences,
    savePreferences
  } = useUserPreferences();

  const [activeTab, setActiveTab] = useState<'general' | 'qr' | 'data'>('general');
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      await importPreferences(file);
      alert('偏好设置导入成功！');
    } catch (error) {
      alert('导入失败：' + (error as Error).message);
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const tabs = [
    { id: 'general', label: '常规设置', icon: Settings },
    { id: 'qr', label: 'QR码样式', icon: Palette },
    { id: 'data', label: '数据管理', icon: Globe }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            偏好设置
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex">
          {/* 侧边栏 */}
          <div className="w-48 border-r border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    外观设置
                  </h3>
                  
                  {/* 主题设置 */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      主题模式
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: '浅色' },
                        { value: 'dark', label: '深色' },
                        { value: 'system', label: '跟随系统' }
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => updateTheme(theme.value as any)}
                          className={`p-3 rounded-lg border text-sm transition-colors ${
                            preferences.theme === theme.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {theme.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 语言设置 */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      界面语言
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'zh', label: '中文' },
                        { value: 'en', label: 'English' }
                      ].map((lang) => (
                        <button
                          key={lang.value}
                          onClick={() => updateLanguage(lang.value as any)}
                          className={`p-3 rounded-lg border text-sm transition-colors ${
                            preferences.language === lang.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    功能设置
                  </h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={preferences.autoSave}
                        onChange={(e) => savePreferences({ autoSave: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        自动保存配置
                      </span>
                    </label>
                    
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={preferences.showTips}
                        onChange={(e) => savePreferences({ showTips: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        显示操作提示
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'qr' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  默认QR码样式
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 尺寸设置 */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      默认尺寸: {preferences.qrStyle.size}px
                    </label>
                    <input
                      type="range"
                      min="128"
                      max="512"
                      step="32"
                      value={preferences.qrStyle.size}
                      onChange={(e) => updateQRStyle({ size: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>128px</span>
                      <span>512px</span>
                    </div>
                  </div>

                  {/* 边距设置 */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      边距: {preferences.qrStyle.margin}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="1"
                      value={preferences.qrStyle.margin}
                      onChange={(e) => updateQRStyle({ margin: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0</span>
                      <span>8</span>
                    </div>
                  </div>

                  {/* 前景色 */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      前景色
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={preferences.qrStyle.colorDark}
                        onChange={(e) => updateQRStyle({ colorDark: e.target.value })}
                        className="w-12 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={preferences.qrStyle.colorDark}
                        onChange={(e) => updateQRStyle({ colorDark: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* 背景色 */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      背景色
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={preferences.qrStyle.colorLight}
                        onChange={(e) => updateQRStyle({ colorLight: e.target.value })}
                        className="w-12 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={preferences.qrStyle.colorLight}
                        onChange={(e) => updateQRStyle({ colorLight: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* 容错级别 */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    容错级别
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { value: 'L', label: 'L (7%)', desc: '低' },
                      { value: 'M', label: 'M (15%)', desc: '中' },
                      { value: 'Q', label: 'Q (25%)', desc: '高' },
                      { value: 'H', label: 'H (30%)', desc: '最高' }
                    ].map((level) => (
                      <button
                        key={level.value}
                        onClick={() => updateQRStyle({ errorCorrectionLevel: level.value as any })}
                        className={`p-3 rounded-lg border text-sm transition-colors ${
                          preferences.qrStyle.errorCorrectionLevel === level.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="font-medium">{level.label}</div>
                        <div className="text-xs opacity-70">{level.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  数据管理
                </h3>
                
                <div className="space-y-4">
                  {/* 最近配置 */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        最近配置 ({preferences.recentConfigs.length}/10)
                      </h4>
                      <button
                        onClick={clearRecentConfigs}
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        清空
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      清空所有最近使用的二维码配置记录
                    </p>
                  </div>

                  {/* 导入导出 */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      备份与恢复
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={exportPreferences}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        导出设置
                      </button>
                      
                      <label className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        {importing ? '导入中...' : '导入设置'}
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImport}
                          disabled={importing}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      导出您的偏好设置以便在其他设备上使用
                    </p>
                  </div>

                  {/* 重置设置 */}
                  <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
                    <h4 className="font-medium text-red-900 dark:text-red-400 mb-3">
                      重置设置
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                      这将清除所有偏好设置并恢复到默认状态，此操作不可撤销。
                    </p>
                    <button
                      onClick={() => {
                        if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
                          resetPreferences();
                          alert('设置已重置');
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      重置所有设置
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}