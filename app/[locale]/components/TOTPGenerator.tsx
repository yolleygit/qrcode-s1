'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Shield, Copy, Download, Key, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';
import { authenticator } from 'otplib';

interface TOTPGeneratorProps {
  onSelectRecentConfig?: (config: any) => void;
  onShowPreferences?: () => void;
  isEmbedded?: boolean;
}

export function TOTPGenerator({ 
  onSelectRecentConfig, 
  onShowPreferences,
  isEmbedded = false 
}: TOTPGeneratorProps) {
  const [secretKey, setSecretKey] = useState('');
  const [accountName, setAccountName] = useState('');
  const [issuer, setIssuer] = useState('QR Master');
  const [showOptional, setShowOptional] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [currentToken, setCurrentToken] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 生成TOTP URI
  const generateTOTPUri = useCallback(() => {
    if (!secretKey.trim()) return '';
    
    const account = accountName.trim() || 'Account';
    const issuerName = issuer.trim() || 'QR Master';
    
    return `otpauth://totp/${encodeURIComponent(issuerName)}:${encodeURIComponent(account)}?secret=${secretKey.trim().toUpperCase().replace(/\s/g, '')}&issuer=${encodeURIComponent(issuerName)}`;
  }, [secretKey, accountName, issuer]);

  // 生成二维码
  const generateQRCode = useCallback(async () => {
    const uri = generateTOTPUri();
    if (!uri) {
      setQrCodeDataUrl('');
      return;
    }

    setIsGenerating(true);
    try {
      const dataUrl = await QRCode.toDataURL(uri, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setQrCodeDataUrl('');
    } finally {
      setIsGenerating(false);
    }
  }, [generateTOTPUri]);

  // 生成当前TOTP验证码
  const generateCurrentToken = useCallback(() => {
    if (!secretKey.trim()) {
      setCurrentToken('');
      setError('');
      return;
    }

    try {
      const cleanSecret = secretKey.trim().toUpperCase().replace(/\s/g, '');
      
      // 验证密钥格式
      if (!/^[A-Z2-7]+=*$/.test(cleanSecret)) {
        throw new Error('密钥格式无效，请使用Base32格式');
      }
      
      const token = authenticator.generate(cleanSecret);
      setCurrentToken(token);
      setError('');
    } catch (error) {
      console.error('Failed to generate TOTP token:', error);
      setCurrentToken('');
      setError(error instanceof Error ? error.message : '生成验证码失败');
    }
  }, [secretKey]);

  const handleGenerate = useCallback(async () => {
    if (secretKey.trim()) {
      await generateQRCode();
      generateCurrentToken();
    }
  }, [secretKey, generateQRCode, generateCurrentToken]);

  // 定时器效果 - 更新验证码和倒计时
  useEffect(() => {
    if (!secretKey.trim()) return;

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = 30 - (now % 30);
      setTimeRemaining(remaining);

      // 当倒计时到0时，生成新的验证码
      if (remaining === 30) {
        generateCurrentToken();
      }
    };

    // 立即更新一次
    updateTimer();

    // 每秒更新
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [secretKey, generateCurrentToken]);

  // 当密钥改变时自动生成
  useEffect(() => {
    if (secretKey.trim()) {
      handleGenerate();
    } else {
      setQrCodeDataUrl('');
      setCurrentToken('');
    }
  }, [secretKey, handleGenerate]);

  const handleCopyCode = useCallback(async () => {
    if (currentToken) {
      try {
        await navigator.clipboard.writeText(currentToken);
        // 这里可以添加toast通知
        console.log('验证码已复制到剪贴板');
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  }, [currentToken]);

  const handleCopyURI = useCallback(async () => {
    const uri = generateTOTPUri();
    if (uri) {
      try {
        await navigator.clipboard.writeText(uri);
        console.log('TOTP URI已复制到剪贴板');
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  }, [generateTOTPUri]);

  const handleDownloadQR = useCallback(() => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `totp-qr-${accountName || 'account'}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  }, [qrCodeDataUrl, accountName]);

  return (
    <div className="h-full space-y-4">
      {/* 主要内容区 - 左右布局 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 左侧：输入区 */}
        <div className="space-y-4">
          {/* 密钥输入 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              密钥（Secret Key）*
            </label>
            <input
              type="text"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="JBSWY3DPEHPK3PXP..."
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors font-mono text-sm"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                密钥由服务提供方提供，请妥善保管
              </p>
              <button
                onClick={() => setSecretKey('JBSWY3DPEHPK3PXP')}
                className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                使用示例
              </button>
            </div>
          </div>

          {/* 可选信息展开 */}
          <div>
            <button
              onClick={() => setShowOptional(!showOptional)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <span className={`transform transition-transform ${showOptional ? 'rotate-90' : ''}`}>
                ▸
              </span>
              显示信息（可选）
            </button>
            
            {showOptional && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    账户名称（可选）
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="my-email@gmail.com"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    用于在验证器应用中显示
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    发行方（可选）
                  </label>
                  <input
                    type="text"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    placeholder="QR Master"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    服务提供商名称
                  </p>
                </div>
              </div>
            )}
          </div>


        </div>

        {/* 右侧：结果区 */}
        <div className="space-y-4">
          {/* 动态二维码 */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <div className="aspect-square bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 relative">
              {isGenerating ? (
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-spin" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    生成中...
                  </p>
                </div>
              ) : qrCodeDataUrl ? (
                <div className="text-center">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="TOTP QR Code" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              ) : secretKey.trim() ? (
                <div className="text-center">
                  <Shield className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-xs text-red-500 dark:text-red-400">
                    生成失败，请检查密钥
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    输入密钥后自动生成
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 当前验证码 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                当前验证码
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${timeRemaining > 10 ? 'bg-green-500' : timeRemaining > 5 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <span>{timeRemaining}s</span>
                </div>
              </div>
            </div>
            {currentToken ? (
              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white tracking-wider">
                {currentToken.slice(0, 3)} {currentToken.slice(3)}
              </div>
            ) : error ? (
              <div className="text-center">
                <div className="text-lg font-mono font-bold text-red-400 dark:text-red-500 tracking-wider mb-1">
                  错误
                </div>
                <p className="text-xs text-red-500 dark:text-red-400">
                  {error}
                </p>
              </div>
            ) : secretKey.trim() ? (
              <div className="text-2xl font-mono font-bold text-yellow-400 dark:text-yellow-500 tracking-wider">
                生成中...
              </div>
            ) : (
              <div className="text-2xl font-mono font-bold text-slate-400 dark:text-slate-600 tracking-wider">
                --- ---
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="space-y-2">
            <button
              onClick={handleCopyCode}
              disabled={!currentToken}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Copy className="w-4 h-4" />
              复制验证码
            </button>
            
            <button
              onClick={handleCopyURI}
              disabled={!secretKey.trim()}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Copy className="w-4 h-4" />
              复制 TOTP URI
            </button>
            
            <button
              onClick={handleDownloadQR}
              disabled={!qrCodeDataUrl}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              下载二维码
            </button>
          </div>
        </div>
      </div>

      {/* 底部安全提醒 */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Key className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              🔐 <strong>安全提醒：</strong>验证码每 30 秒变化，请勿截图/分享；密钥不要与他人共享
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}