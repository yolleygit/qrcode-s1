'use client';

import { useState } from 'react';
import { Clock, X, Copy, Star } from 'lucide-react';
import { useUserPreferences, QRConfig } from '../hooks/useUserPreferences';

const getTypeLabel = (type: QRConfig['type']) => {
  const labels = {
    url: '网址',
    text: '文本',
    totp: '动态码',
    encrypted: '加密'
  };
  return labels[type] || type;
};

const getTypeColor = (type: QRConfig['type']) => {
  const colors = {
    url: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    text: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    totp: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    encrypted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
  };
  return colors[type] || colors.text;
};

interface RecentConfigsProps {
  onSelectConfig?: (config: QRConfig) => void;
  className?: string;
  compact?: boolean;
}

export function RecentConfigs({ onSelectConfig, className = '', compact = false }: RecentConfigsProps) {
  const { preferences, removeRecentConfig, clearRecentConfigs } = useUserPreferences();
  const [showAll, setShowAll] = useState(false);

  const displayConfigs = showAll 
    ? preferences.recentConfigs 
    : preferences.recentConfigs.slice(0, compact ? 3 : 5);

  if (preferences.recentConfigs.length === 0) {
    if (compact) {
      return (
        <div className={`text-center text-gray-500 dark:text-gray-400 py-2 ${className}`}>
          <p className="text-xs">暂无最近配置</p>
        </div>
      );
    }
    return (
      <div className={`p-6 text-center text-gray-500 dark:text-gray-400 ${className}`}>
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">暂无最近使用的配置</p>
      </div>
    );
  }

  // 紧凑模式 - 水平滚动列表
  if (compact) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            最近使用
          </span>
          {preferences.recentConfigs.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {showAll ? '收起' : `全部 (${preferences.recentConfigs.length})`}
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {displayConfigs.map((config) => (
            <button
              key={config.id}
              onClick={() => onSelectConfig?.(config)}
              className="flex-shrink-0 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${getTypeColor(config.type)}`}>
                  {getTypeLabel(config.type)}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                {config.content}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            最近使用 ({preferences.recentConfigs.length})
          </h3>
        </div>
        
        {preferences.recentConfigs.length > 0 && (
          <button
            onClick={clearRecentConfigs}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 hover:underline"
          >
            清空全部
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {displayConfigs.map((config) => (
          <div
            key={config.id}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(config.type)}`}>
                    {getTypeLabel(config.type)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(config.createdAt).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <p className="text-sm text-gray-900 dark:text-white font-medium truncate mb-1">
                  {config.name || '未命名配置'}
                </p>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {config.content}
                </p>
                
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>尺寸: {config.style.size}px</span>
                  <span>容错: {config.style.errorCorrectionLevel}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopyContent(config.content)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  title="复制内容"
                >
                  <Copy className="w-4 h-4" />
                </button>
                
                {onSelectConfig && (
                  <button
                    onClick={() => onSelectConfig(config)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                    title="使用此配置"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={() => removeRecentConfig(config.id)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                  title="删除"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {preferences.recentConfigs.length > 5 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showAll ? '收起' : `查看全部 ${preferences.recentConfigs.length} 项`}
          </button>
        </div>
      )}
    </div>
  );
}