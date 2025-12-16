'use client';

import { useState } from 'react';
import { QrCode, Shield, Lock, Settings, Download, Share, Copy } from 'lucide-react';
import { MobileTabNavigation, QR_MASTER_TABS, MORE_OPTIONS } from './MobileTabNavigation';
import { MobileFoldingLayout, createQRMasterSections } from './MobileFoldingLayout';
import { MobileDrawerPanel, DrawerQuickActions, createQRStyleSection } from './MobileDrawerPanel';
import { StaticQRGenerator } from './StaticQRGenerator';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useUserPreferences } from '../hooks/useUserPreferences';

interface MobileHomePageProps {
  onNavigate?: (path: string) => void;
}

export function MobileHomePage({ onNavigate }: MobileHomePageProps) {
  const { isMobile, isTablet } = useBreakpoint();
  const { preferences, updateQRStyle } = useUserPreferences();
  
  // State
  const [activeTab, setActiveTab] = useState('static');
  const [showStyleDrawer, setShowStyleDrawer] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);

  // Don't render on desktop
  if (!isMobile && !isTablet) {
    return null;
  }

  // Handle tab changes with navigation
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // Navigate to different pages for non-static tabs
    if (tabId !== 'static' && onNavigate) {
      const routes = {
        totp: '/totp',
        encrypted: '/encrypted-qr'
      };
      onNavigate(routes[tabId as keyof typeof routes] || '/');
    }
  };

  // Handle QR generation
  const handleQRGenerated = (dataUrl: string) => {
    setGeneratedQR(dataUrl);
  };

  // Quick actions
  const handleDownload = () => {
    if (generatedQR) {
      const link = document.createElement('a');
      link.href = generatedQR;
      link.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (generatedQR && navigator.share) {
      try {
        // Convert data URL to blob
        const response = await fetch(generatedQR);
        const blob = await response.blob();
        const file = new File([blob], 'qr-code.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'QR Master - 二维码',
          text: '使用 QR Master 生成的二维码',
          files: [file]
        });
      } catch (error) {
        console.error('Share failed:', error);
        // Fallback to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    if (generatedQR) {
      try {
        // Convert data URL to blob and copy to clipboard
        const response = await fetch(generatedQR);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      } catch (error) {
        console.error('Copy failed:', error);
      }
    }
  };

  // Create sections for folding layout
  const sections = createQRMasterSections(
    // Input Content
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          输入内容
        </label>
        <textarea
          placeholder="输入网址、文本或其他内容..."
          className="w-full h-24 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none touch-manipulation"
        />
      </div>
      
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors min-h-[44px] touch-manipulation">
          生成二维码
        </button>
        <button 
          onClick={() => setShowStyleDrawer(true)}
          className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>,
    
    // Preview Content
    <div className="text-center">
      <div className="w-48 h-48 mx-auto bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
        {generatedQR ? (
          <img 
            src={generatedQR} 
            alt="Generated QR Code" 
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <div className="text-slate-400">
            <QrCode className="w-16 h-16 mx-auto mb-2" />
            <p className="text-sm">输入内容后生成</p>
          </div>
        )}
      </div>
      
      {generatedQR && (
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleDownload}
            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
          >
            <Share className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>,
    
    // Options Content
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          二维码尺寸
        </label>
        <input
          type="range"
          min="128"
          max="512"
          step="32"
          defaultValue="256"
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            前景色
          </label>
          <input
            type="color"
            defaultValue="#000000"
            className="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            背景色
          </label>
          <input
            type="color"
            defaultValue="#ffffff"
            className="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
          />
        </div>
      </div>
      
      <button 
        onClick={() => setShowStyleDrawer(true)}
        className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors min-h-[44px] touch-manipulation"
      >
        更多样式选项
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile Tab Navigation */}
      <MobileTabNavigation
        tabs={QR_MASTER_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showMoreOptions={true}
        moreOptions={[
          ...MORE_OPTIONS,
          {
            id: 'style-settings',
            label: '样式设置',
            icon: Settings,
            onClick: () => setShowStyleDrawer(true)
          }
        ]}
      />

      {/* Main Content - Only show for static tab */}
      {activeTab === 'static' && (
        <MobileFoldingLayout
          sections={sections}
          singleHandMode={true}
          compactMode={false}
          floatingActions={
            <DrawerQuickActions
              onDownload={generatedQR ? handleDownload : undefined}
              onShare={generatedQR ? handleShare : undefined}
              onCopy={generatedQR ? handleCopy : undefined}
              onSettings={() => setShowSettingsDrawer(true)}
            />
          }
        />
      )}

      {/* Style Drawer */}
      <MobileDrawerPanel
        isOpen={showStyleDrawer}
        onClose={() => setShowStyleDrawer(false)}
        title="二维码样式"
        height={70}
        sections={[
          createQRStyleSection(
            preferences.qrStyle || {
              size: 256,
              colorDark: '#000000',
              colorLight: '#ffffff',
              errorCorrectionLevel: 'M'
            },
            updateQRStyle
          ),
          {
            id: 'presets',
            title: '样式预设',
            icon: QrCode,
            content: (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: '经典黑白', dark: '#000000', light: '#ffffff' },
                  { name: '蓝色主题', dark: '#1e40af', light: '#dbeafe' },
                  { name: '绿色主题', dark: '#166534', light: '#dcfce7' },
                  { name: '紫色主题', dark: '#7c3aed', light: '#ede9fe' }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => updateQRStyle({
                      colorDark: preset.dark,
                      colorLight: preset.light
                    })}
                    className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left min-h-[44px] touch-manipulation"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: preset.dark }}
                      />
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: preset.light }}
                      />
                    </div>
                    <span className="text-sm font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>
            )
          }
        ]}
        actions={
          <button
            onClick={() => {
              // Reset to defaults
              updateQRStyle({
                size: 256,
                colorDark: '#000000',
                colorLight: '#ffffff',
                errorCorrectionLevel: 'M'
              });
            }}
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            重置
          </button>
        }
      />

      {/* Settings Drawer */}
      <MobileDrawerPanel
        isOpen={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
        title="应用设置"
        height={60}
        sections={[
          {
            id: 'general',
            title: '通用设置',
            icon: Settings,
            content: (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">自动保存</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">显示提示</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">单手模式</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}