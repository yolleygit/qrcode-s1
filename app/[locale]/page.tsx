'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Download, Wand2, Link as LinkIcon, Check, QrCode, 
  Shield, Zap, Lock, X, Settings, Copy
} from 'lucide-react';
import QRCodeStyling, {
  ErrorCorrectionLevel,
  DotType,
  CornerSquareType
} from 'qr-code-styling';
import { FeatureCardProps } from './components/FeatureCard';
import { FeatureGrid } from './components/FeatureGrid';
import { UnifiedNavigation } from './components/UnifiedNavigation';
import { SimpleErrorBoundary } from './components/ErrorBoundary';
import { useErrorHandler } from './hooks/useErrorHandler';
import { NetworkStatus } from './components/NetworkStatus';
import { useKeyboardShortcuts, KeyboardShortcutsHelp, ShortcutHint } from './hooks/useKeyboardShortcuts';
import { useUnifiedKeyboardShortcuts, createQRPageShortcuts } from './hooks/useUnifiedKeyboardShortcuts';
import { ContextMenuContainer } from './hooks/useContextMenu';
import { useUserPreferences, QRConfig } from './hooks/useUserPreferences';
import { PreferencesModal } from './components/PreferencesModal';
import { RecentConfigs } from './components/RecentConfigs';
// 新的所见即所得组件
import { SmartLayout } from './components/SmartLayout';
import { InputPanel, PreviewPanel, ControlsPanel } from './components/SmartPanel';
import { useRealTimePreview } from './hooks/useRealTimePreview';
import { RealTimeQRPreview } from './components/RealTimeQRPreview';
import { StaticQRGenerator } from './components/StaticQRGenerator';
import { MobileHomePage } from './components/MobileHomePage';

export default function Home() {
  // 错误处理
  const { handleError, retry } = useErrorHandler();
  
  // 用户偏好设置
  const { 
    preferences, 
    updateQRStyle, 
    addRecentConfig,
    isLoading: preferencesLoading 
  } = useUserPreferences();
  
  // UI 状态
  const [showPreferences, setShowPreferences] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Check if mobile view should be used
  const [isMobileView, setIsMobileView] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  // 统一键盘快捷键
  const { availableShortcuts } = useUnifiedKeyboardShortcuts(
    createQRPageShortcuts({
      onShowHelp: () => setShowShortcutsHelp(true),
      onToggleMode: () => {
        // 在主页上，切换到不同的功能
        const currentUrl = window.location.pathname;
        if (currentUrl === '/') {
          window.location.href = '/totp';
        } else if (currentUrl === '/totp') {
          window.location.href = '/encrypted-qr';
        } else {
          window.location.href = '/';
        }
      }
    })
  );

  // 页面特定的快捷键
  useKeyboardShortcuts([
    {
      key: '?',
      shiftKey: true,
      callback: () => {
        setShowShortcutsHelp(true);
      },
      description: 'Shift+?: 显示快捷键帮助'
    }
  ]);

  // 选择最近配置（现在由StaticQRGenerator处理）
  const handleSelectRecentConfig = (config: QRConfig) => {
    // 这个回调现在由StaticQRGenerator组件处理
    console.log('Selected recent config:', config);
  };

  // 功能卡片数据
  const featureCards: FeatureCardProps[] = [
    {
      id: 'static',
      title: '静态二维码',
      description: '生成普通二维码，支持网址、文本等内容',
      icon: QrCode,
      href: '#quick-generate',
      status: 'available',
      gradient: 'from-blue-500 to-indigo-600',
      features: ['实时预览', '高清导出', '样式定制'],
      isPopular: true,
      onClick: () => {
        // 滚动到快速生成区域
        document.getElementById('quick-generate')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
    },
    {
      id: 'totp',
      title: '动态验证码',
      description: '生成TOTP双因素认证二维码',
      icon: Shield,
      href: '/totp',
      status: 'beta',
      gradient: 'from-green-500 to-emerald-600',
      features: ['Google兼容', '实时更新', '安全可靠']
    },
    {
      id: 'encrypted',
      title: '加密二维码',
      description: '军用级加密保护敏感数据',
      icon: Lock,
      href: '/encrypted-qr',
      status: 'beta',
      gradient: 'from-purple-500 to-violet-600',
      features: ['AES-256加密', '伪装保护', '本地处理']
    }
  ];

  // Render mobile version for small screens
  if (isMobileView) {
    return <MobileHomePage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 overflow-x-hidden">
      
      {/* 统一导航栏 */}
      <UnifiedNavigation />
      
      {/* 网络状态指示器 */}
      <NetworkStatus />

      {/* 主要内容区域 */}
      <main className="pt-16">
        
        {/* 英雄区域 */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold border border-indigo-100 dark:border-indigo-800 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              完全免费 · 无需登录
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-6">
              选择您需要的
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                二维码类型
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12">
              三种强大的二维码生成工具，满足不同场景需求。简单、快速、安全。
            </p>
          </div>
        </section>

        {/* 功能卡片区域 */}
        <SimpleErrorBoundary>
          <FeatureGrid 
            cards={featureCards}
            columns={{ mobile: 1, tablet: 2, desktop: 3 }}
            gap={6}
          />
        </SimpleErrorBoundary>

        {/* 所见即所得快速生成区域 */}
        <SimpleErrorBoundary>
          <StaticQRGenerator 
            onSelectRecentConfig={handleSelectRecentConfig}
            onShowPreferences={() => setShowPreferences(true)}
          />
        </SimpleErrorBoundary>

        {/* 特性展示 */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                为什么选择 QR Master？
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                专业、安全、易用的二维码生成工具
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Zap,
                  title: '快速生成',
                  description: '输入即生成，无需等待'
                },
                {
                  icon: Shield,
                  title: '安全可靠',
                  description: '本地处理，隐私保护'
                },
                {
                  icon: QrCode,
                  title: '高质量输出',
                  description: '支持高清PNG和SVG格式'
                },
                {
                  icon: Check,
                  title: '完全免费',
                  description: '无需注册，永久免费使用'
                }
              ].map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* 简化的页脚 */}
      <footer className="bg-slate-900 dark:bg-black text-white py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">QR Master</span>
            </div>
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} QR Master. 简单、快速、专业的二维码生成工具。
            </p>
          </div>
        </div>
      </footer>



      {/* 快捷键帮助 */}
      <KeyboardShortcutsHelp
        shortcuts={availableShortcuts}
        isVisible={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />

      {/* 偏好设置模态框 */}
      <PreferencesModal 
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />

      {/* 桌面端快捷键提示 */}
      <div className="hidden lg:block fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowShortcutsHelp(true)}
          className="bg-slate-800 dark:bg-slate-700 text-white p-2 rounded-full shadow-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
          title="显示快捷键帮助 (Shift+?)"
        >
          <span className="text-sm font-mono">?</span>
        </button>
      </div>
    </div>
  );
}