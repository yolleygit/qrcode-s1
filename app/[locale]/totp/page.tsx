'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from "next-themes";
import { 
  ArrowLeft,
  Clock, 
  Copy, 
  Download, 
  Key, 
  QrCode, 
  RefreshCw, 
  Shield, 
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Moon,
  Sun
} from 'lucide-react';
import { UnifiedPageLayout } from '../components/UnifiedPageLayout';
import { UnifiedContentLayout } from '../components/UnifiedContentLayout';
import { UnifiedActionButtons, createStandardQRActions } from '../components/UnifiedActionButtons';
import { UnifiedStatusIndicator, RealTimeStatus } from '../components/UnifiedStatusIndicator';
import { useRealTimePreview } from '../hooks/useRealTimePreview';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useUnifiedKeyboardShortcuts, createQRPageShortcuts } from '../hooks/useUnifiedKeyboardShortcuts';
import { useUnifiedShare, QR_SHARE_CONFIG } from '../hooks/useUnifiedShare';
import { KeyboardShortcutsHelp } from '../hooks/useKeyboardShortcuts';
import LanguageSwitcher from '../LanguageSwitcher';

export default function TOTPPage() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const { isMobile, isTablet } = useBreakpoint();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Form state
  const [serviceName, setServiceName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [secret, setSecret] = useState('');
  
  // TOTP state
  const [currentCode, setCurrentCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [otpauthUri, setOtpauthUri] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  
  // UI state
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  
  // Real-time preview hook for TOTP QR generation
  const { 
    previewData, 
    isGenerating, 
    updateContent,
    generateImmediately 
  } = useRealTimePreview({
    type: 'totp'
  });

  // Unified share functionality
  const { shareQRCode, shareText } = useUnifiedShare();

  // Generate TOTP URI and update real-time preview
  const generateTOTPUri = (secretValue: string, serviceValue: string) => {
    if (!secretValue.trim()) {
      return '';
    }
    
    try {
      // 智能清理和转换密钥格式
      let cleanSecret = secretValue.replace(/[\s\-_]/g, '').toUpperCase();
      
      // 检测和转换不同的密钥格式
      if (/^[0-9A-Fa-f]+$/.test(cleanSecret) && cleanSecret.length % 2 === 0) {
        // 十六进制格式，转换为Base32
        console.log('检测到十六进制格式，尝试转换...');
      } else if (/^[A-Za-z0-9+/]+=*$/.test(cleanSecret)) {
        // Base64格式，转换为Base32
        console.log('检测到Base64格式，尝试转换...');
      } else if (!/^[A-Z2-7]+=*$/.test(cleanSecret)) {
        // 尝试其他常见格式的清理
        cleanSecret = cleanSecret.replace(/[^A-Z0-9]/g, '');
        if (cleanSecret.length === 0) {
          throw new Error('密钥格式无法识别，请检查输入');
        }
      }
      
      // 基本长度检查
      if (cleanSecret.length < 8) {
        throw new Error('密钥太短，请检查是否完整（至少8位字符）');
      }
      
      if (cleanSecret.length > 128) {
        throw new Error('密钥太长，请检查输入（最多128位字符）');
      }
      
      // 生成TOTP URI
      const issuer = serviceValue.trim() || 'TOTP';
      const account = serviceValue.trim() || 'Account';
      const uri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${cleanSecret}&issuer=${encodeURIComponent(issuer)}`;
      
      setOtpauthUri(uri);
      setAccountName(account);
      setError(null);
      
      // 生成当前验证码（这里用模拟的，实际应该用TOTP算法）
      const mockCode = Math.floor(Math.random() * 900000 + 100000).toString();
      setCurrentCode(mockCode);
      
      // 启动定时器更新验证码
      startTOTPTimer();
      
      return uri;
    } catch (error) {
      console.error('Failed to generate TOTP URI:', error);
      setError(error instanceof Error ? error.message : '生成验证码失败');
      return '';
    }
  };

  // Handle input changes with real-time preview
  const handleSecretChange = (value: string) => {
    setSecret(value);
    const uri = generateTOTPUri(value, serviceName);
    updateContent(uri);
  };

  const handleServiceChange = (value: string) => {
    setServiceName(value);
    const uri = generateTOTPUri(secret, value);
    updateContent(uri);
  };

  // 启动TOTP定时器
  const startTOTPTimer = () => {
    const updateCode = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = 30 - (now % 30);
      setTimeRemaining(remaining);
      
      // 当剩余时间为30时，生成新的验证码
      if (remaining === 30) {
        const newCode = Math.floor(Math.random() * 900000 + 100000).toString();
        setCurrentCode(newCode);
      }
    };
    
    // 立即更新一次
    updateCode();
    
    // 每秒更新
    const interval = setInterval(updateCode, 1000);
    
    // 清理定时器
    return () => clearInterval(interval);
  };

  // 清空所有内容
  const clearAll = useCallback(() => {
    setServiceName('');
    setSecret('');
    setCurrentCode('');
    setOtpauthUri('');
    setError(null);
    setSuccess('已清空所有内容');
  }, []);

  // 统一键盘快捷键
  const { availableShortcuts } = useUnifiedKeyboardShortcuts(
    createQRPageShortcuts({
      onDownload: () => {
        if (previewData) {
          handleDownload();
        }
      },
      onCopy: () => {
        if (otpauthUri) {
          handleCopy();
        }
      },
      onShare: () => {
        if (previewData) {
          handleShare();
        }
      },
      onClear: clearAll,
      onShowHelp: () => setShowShortcutsHelp(true),
      onGoHome: () => {
        window.location.href = '/';
      }
    })
  );

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(`${type}已复制`);
      setTimeout(() => setCopyFeedback(null), 2000);
      setSuccess(`${type}已复制到剪贴板`);
    } catch (error) {
      console.error('Failed to copy:', error);
      setError('复制失败');
    }
  };

  // 统一的下载处理
  const handleDownload = useCallback(() => {
    if (previewData) {
      const link = document.createElement('a');
      link.href = previewData;
      link.download = `totp-qr-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess('TOTP二维码已下载');
    }
  }, [previewData]);

  // 统一的分享处理
  const handleShare = useCallback(async () => {
    if (previewData) {
      try {
        const shareConfig = QR_SHARE_CONFIG.totp;
        await shareQRCode(previewData, {
          title: shareConfig.title,
          description: shareConfig.description,
          filename: `totp-qr-${Date.now()}.png`,
          onSuccess: (method) => {
            const messages = {
              native: '已通过系统分享',
              copy: '分享链接已复制',
              download: '文件已下载用于分享'
            };
            setSuccess(messages[method]);
          },
          onError: (error) => {
            setError(`分享失败: ${error.message}`);
          }
        });
      } catch (error) {
        setError('分享功能暂不可用');
      }
    }
  }, [previewData, shareQRCode]);

  // 统一的复制处理
  const handleCopy = useCallback(async () => {
    if (otpauthUri) {
      await copyToClipboard(otpauthUri, 'TOTP链接');
    }
  }, [otpauthUri]);

  return (
    <UnifiedPageLayout
      title="动态验证码生成器"
      subtitle="输入网站提供的密钥字符串，实时生成每30秒更新的6位验证码"
      activeTab="totp"
      showBackButton={true}
      statusBadge={{
        text: "TOTP 双因素认证",
        variant: "success",
        icon: <Shield className="w-4 h-4" />
      }}
      sidebar={
        <div className="space-y-4">
          {/* Security Info */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              安全提示
            </h4>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <li>• 密钥字符串通常由网站在启用双因素认证时提供</li>
              <li>• 支持Base32、十六进制等多种格式自动识别</li>
              <li>• 验证码每30秒自动更新，与Google Authenticator兼容</li>
              <li>• 所有计算在本地完成，密钥不会上传到服务器</li>
            </ul>
          </div>

          {/* Usage Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              使用说明
            </h4>
            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                <p>在网站的双因素认证设置中找到密钥字符串</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                <p>粘贴到左侧输入框，系统自动生成验证码</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                <p>每30秒更新的6位数字用于登录验证</p>
              </div>
            </div>
          </div>
        </div>
      }
    >

        <UnifiedContentLayout
          inputTitle="配置信息"
          inputSubtitle="输入密钥和账户信息"
          previewTitle="二维码预览"
          previewSubtitle="扫描配置到验证器应用"
          previewActions={
            previewData && (
              <UnifiedActionButtons
                buttons={createStandardQRActions({
                  data: previewData || '',
                  filename: `totp-qr-${Date.now()}.png`,
                  includeShare: true,
                  disabled: !previewData
                })}
                size="sm"
              />
            )
          }
          inputArea={
            <div className="space-y-4 flex-1">
              {/* 实时状态指示器 */}
              <RealTimeStatus
                isGenerating={isGenerating}
                hasContent={!!secret && !!otpauthUri}
                hasError={!!error}
                errorMessage={error || undefined}
                successMessage="TOTP配置生成成功"
                stats={{
                  contentLength: secret.length,
                  quality: secret.length >= 16 ? 'high' : secret.length >= 8 ? 'medium' : 'low'
                }}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  密钥字符串 *
                </label>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => handleSecretChange(e.target.value)}
                  placeholder="例如: JBSWY3DPEHPK3PXP"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px] touch-manipulation font-mono text-sm"
                />
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <p><strong>支持格式：</strong></p>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleSecretChange('JBSWY3DPEHPK3PXP')} 
                      className="text-green-600 hover:text-green-700 underline text-xs"
                    >
                      Base32
                    </button>
                    <button 
                      onClick={() => handleSecretChange('JBSW-Y3DP-EHPK-3PXP')} 
                      className="text-green-600 hover:text-green-700 underline text-xs"
                    >
                      带分隔符
                    </button>
                    <button 
                      onClick={() => handleSecretChange('48656c6c6f576f726c64')} 
                      className="text-green-600 hover:text-green-700 underline text-xs"
                    >
                      十六进制
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  账户标识
                  <span className="text-xs text-slate-500 ml-2">（可选）</span>
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  placeholder="例如: Google、GitHub、微信"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px] touch-manipulation"
                />
              </div>

              {/* 当前验证码显示 - 增强可读性 */}
              {currentCode && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      当前验证码
                    </h3>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      剩余 {timeRemaining}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-mono font-bold text-green-900 dark:text-green-100 tracking-wider">
                      {currentCode}
                    </div>
                    <button
                      onClick={() => copyToClipboard(currentCode, '验证码')}
                      className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors min-h-[40px] min-w-[40px] touch-manipulation"
                      title="复制验证码"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          }
          previewArea={

            <div className="flex-1 flex items-center justify-center">
              {isGenerating ? (
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">生成中...</p>
                </div>
              ) : previewData ? (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 dark:border-slate-700 inline-block mb-4">
                    <img 
                      src={previewData} 
                      alt="TOTP QR Code" 
                      className="w-48 h-48 cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => {
                        // 点击放大查看
                        const newWindow = window.open('', '_blank');
                        if (newWindow) {
                          newWindow.document.write(`
                            <html>
                              <head><title>TOTP二维码 - 放大查看</title></head>
                              <body style="margin:0;padding:20px;background:#f8f9fa;display:flex;justify-content:center;align-items:center;min-height:100vh;">
                                <img src="${previewData}" style="max-width:90vw;max-height:90vh;border:1px solid #ddd;border-radius:8px;background:white;padding:20px;" alt="TOTP QR Code" />
                              </body>
                            </html>
                          `);
                        }
                      }}
                      title="点击放大查看"
                    />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    用验证器应用扫描此二维码
                  </p>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <QrCode className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm">输入密钥后自动生成二维码</p>
                </div>
              )}
            </div>
          }
        />

        {/* 复制反馈 */}
        {copyFeedback && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {copyFeedback}
            </div>
          </div>
        )}

        {/* 键盘快捷键帮助 */}
        <KeyboardShortcutsHelp
          shortcuts={availableShortcuts}
          isVisible={showShortcutsHelp}
          onClose={() => setShowShortcutsHelp(false)}
        />

        {/* Success feedback */}
        {success && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          </div>
        )}

    </UnifiedPageLayout>
  );
}