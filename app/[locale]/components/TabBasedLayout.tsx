'use client';

import React, { useState, useCallback } from 'react';
import { QrCode, Shield, Lock, Check } from 'lucide-react';
import { StaticQRGenerator } from './StaticQRGenerator';
import { TOTPGenerator } from './TOTPGenerator';
import { EncryptedQRGenerator } from './EncryptedQRGenerator';

// Tab 数据类型
interface TabData {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  features: string[];
  status: 'available' | 'beta';
}

// Tab 配置
const tabs: TabData[] = [
  {
    id: 'static',
    title: '静态二维码',
    description: '生成普通二维码，支持网址、文本等内容',
    icon: QrCode,
    gradient: 'from-blue-500 to-indigo-600',
    features: ['实时预览', '高清导出', '样式定制'],
    status: 'available',
  },
  {
    id: 'totp',
    title: '动态验证码',
    description: '生成TOTP双因素认证二维码',
    icon: Shield,
    gradient: 'from-green-500 to-emerald-600',
    features: ['Google兼容', '实时更新', '安全可靠'],
    status: 'beta',
  },
  {
    id: 'encrypted',
    title: '加密二维码',
    description: '军用级加密保护敏感数据',
    icon: Lock,
    gradient: 'from-purple-500 to-violet-600',
    features: ['AES-256加密', '伪装保护', '本地处理'],
    status: 'beta',
  },
];

// 固定高度常量
const CONTAINER_HEIGHT = 520;

interface TabBasedLayoutProps {
  onSelectRecentConfig?: (config: any) => void;
  onShowPreferences?: () => void;
}

export function TabBasedLayout({
  onSelectRecentConfig,
  onShowPreferences,
}: TabBasedLayoutProps) {
  const [activeTab, setActiveTab] = useState('static');

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  return (
    <section className="py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 固定双栏布局 */}
        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
          {/* 左侧：信息卡片 */}
          <div className="w-full lg:w-[300px] lg:flex-shrink-0">
            <div
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col"
              style={{ height: CONTAINER_HEIGHT }}
            >
              {/* Tab 导航 */}
              <div className="border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                <nav className="flex h-12" aria-label="Tabs">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`
                          flex-1 flex flex-col items-center justify-center gap-0.5
                          text-xs font-medium border-b-2 transition-colors duration-150
                          ${
                            isActive
                              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20'
                              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:block truncate px-1 text-[10px]">
                          {tab.title}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* 卡片内容区 */}
              <div className="flex-1 p-4 overflow-hidden">
                <div className="relative h-full">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <div
                        key={tab.id}
                        className={`
                          absolute inset-0 transition-opacity duration-150
                          ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}
                        `}
                      >
                        {/* 图标 + 标题 */}
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${tab.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {tab.title}
                              </h3>
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                  tab.status === 'available'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}
                              >
                                {tab.status === 'available' ? '可用' : '测试'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 描述 */}
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                          {tab.description}
                        </p>

                        {/* 功能特点 */}
                        <div className="space-y-1.5 mb-3">
                          <h4 className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            核心功能
                          </h4>
                          {tab.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                            >
                              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* 使用提示 */}
                        <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            👉 在右侧区域开始使用
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：功能操作区 */}
          <div className="flex-1 min-w-0">
            <div
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden"
              style={{ height: CONTAINER_HEIGHT }}
            >
              <div className="relative h-full">
                {/* 静态二维码 */}
                <div
                  className={`
                    absolute inset-0 transition-opacity duration-150 overflow-auto
                    ${activeTab === 'static' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}
                  `}
                >
                  <div className="p-4 h-full">
                    <StaticQRGenerator
                      onSelectRecentConfig={onSelectRecentConfig || (() => {})}
                      onShowPreferences={onShowPreferences || (() => {})}
                      isEmbedded={true}
                    />
                  </div>
                </div>

                {/* TOTP 验证码 */}
                <div
                  className={`
                    absolute inset-0 transition-opacity duration-150 overflow-auto
                    ${activeTab === 'totp' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}
                  `}
                >
                  <div className="p-4 h-full">
                    <TOTPGenerator
                      onSelectRecentConfig={onSelectRecentConfig}
                      onShowPreferences={onShowPreferences}
                      isEmbedded={true}
                    />
                  </div>
                </div>

                {/* 加密二维码 */}
                <div
                  className={`
                    absolute inset-0 transition-opacity duration-150 overflow-auto
                    ${activeTab === 'encrypted' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}
                  `}
                >
                  <div className="p-4 h-full">
                    <EncryptedQRGenerator
                      onSelectRecentConfig={onSelectRecentConfig}
                      onShowPreferences={onShowPreferences}
                      isEmbedded={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
