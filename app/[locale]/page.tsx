'use client';

import { useState, useEffect } from 'react';
import { QrCode, Zap, Shield, Check } from 'lucide-react';
import { SimpleErrorBoundary } from './components/ErrorBoundary';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from './hooks/useKeyboardShortcuts';
import { useUnifiedKeyboardShortcuts, createQRPageShortcuts } from './hooks/useUnifiedKeyboardShortcuts';
import { useUserPreferences, QRConfig } from './hooks/useUserPreferences';
import { PreferencesModal } from './components/PreferencesModal';
import { StaticQRGenerator } from './components/StaticQRGenerator';
import { MobileHomePage } from './components/MobileHomePage';
import { TabBasedLayout } from './components/TabBasedLayout';

export default function Home() {
  // 用户偏好设置
  const { preferences } = useUserPreferences();

  // UI 状态
  const [showPreferences, setShowPreferences] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // 移动端检测
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 键盘快捷键
  const { availableShortcuts } = useUnifiedKeyboardShortcuts(
    createQRPageShortcuts({
      onShowHelp: () => setShowShortcutsHelp(true),
      onToggleMode: () => {},
    })
  );

  useKeyboardShortcuts([
    {
      key: '?',
      shiftKey: true,
      callback: () => setShowShortcutsHelp(true),
      description: 'Shift+?: 显示快捷键帮助',
    },
  ]);

  const handleSelectRecentConfig = (config: QRConfig) => {
    console.log('Selected recent config:', config);
  };

  // 移动端渲染
  if (isMobileView) {
    return <MobileHomePage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      {/* 精简导航栏 - 仅 Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                QR Master
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="pt-14">
        {/* 核心文案区 - 功能区正上方 */}
        <section className="pt-8 pb-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              专业的二维码生成工具
            </h1>
            <div className="flex items-center justify-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                完全免费
              </span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span>无需登录</span>
            </div>
          </div>
        </section>

        {/* 核心功能区 - 三种二维码类型 */}
        <SimpleErrorBoundary>
          <TabBasedLayout
            onSelectRecentConfig={handleSelectRecentConfig}
            onShowPreferences={() => setShowPreferences(true)}
          />
        </SimpleErrorBoundary>

        {/* 特性展示 - 紧凑版 */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-100/50 dark:bg-slate-900/50">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Zap, title: '快速生成', desc: '输入即生成' },
                { icon: Shield, title: '安全可靠', desc: '本地处理' },
                { icon: QrCode, title: '高清输出', desc: 'PNG/SVG' },
                { icon: Check, title: '完全免费', desc: '无需注册' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 精简页脚 */}
      <footer className="py-6 px-4 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1 rounded">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
              QR Master
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} 简单、快速、专业
          </p>
        </div>
      </footer>

      {/* 模态框 */}
      <KeyboardShortcutsHelp
        shortcuts={availableShortcuts}
        isVisible={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
      <PreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </div>
  );
}
