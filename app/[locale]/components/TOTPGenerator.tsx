'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Copy, Download, Key, Clock, RefreshCw } from 'lucide-react';

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
  const [showOptional, setShowOptional] = useState(false);
  const [currentCode, setCurrentCode] = useState('123456');
  const [timeLeft, setTimeLeft] = useState(29);
  const [qrGenerated, setQrGenerated] = useState(false);

  // 模拟验证码倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // 生成新的验证码
          setCurrentCode(Math.floor(100000 + Math.random() * 900000).toString());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleGenerate = useCallback(() => {
    if (secretKey.trim()) {
      setQrGenerated(true);
      // 这里应该调用实际的TOTP生成逻辑
    }
  }, [secretKey]);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(currentCode);
  }, [currentCode]);

  const handleCopyURI = useCallback(() => {
    const uri = `otpauth://totp/${encodeURIComponent(accountName || 'Account')}?secret=${secretKey}&issuer=QRMaster`;
    navigator.clipboard.writeText(uri);
  }, [accountName, secretKey]);

  return (
    <div className={`h-full ${isEmbedded ? '' : 'p-6'}`}>
      {/* 标题区 */}
      {!isEmbedded && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            生成 TOTP 动态二维码
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            用于 Google Authenticator 等双因素认证应用
          </p>
        </div>
      )}

      {/* 主要内容区 - 左右布局 */}
      <div className="grid lg:grid-cols-2 gap-6 h-full">
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              密钥由服务提供方提供，请妥善保管
            </p>
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
                    仅用于显示，不影响验证码生成
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={!secretKey.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm"
          >
            生成 TOTP 二维码
          </button>
        </div>

        {/* 右侧：结果区 */}
        <div className="space-y-4">
          {/* 动态二维码 */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <div className="aspect-square bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 mb-3">
              {qrGenerated ? (
                <div className="text-center">
                  <div className="w-32 h-32 bg-slate-200 dark:bg-slate-600 rounded-lg mb-2 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    TOTP 二维码
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    扫描后添加到验证器 App
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
                <Clock className="w-3 h-3" />
                <span>有效期：{timeLeft} 秒</span>
              </div>
            </div>
            {secretKey.trim() ? (
              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white tracking-wider">
                {currentCode.slice(0, 3)} {currentCode.slice(3)}
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
              disabled={!qrGenerated}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Copy className="w-4 h-4" />
              复制验证码
            </button>
            
            <button
              onClick={handleCopyURI}
              disabled={!qrGenerated}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Copy className="w-4 h-4" />
              复制 TOTP URI
            </button>
            
            <button
              disabled={!qrGenerated}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              下载二维码
            </button>
          </div>
        </div>
      </div>

      {/* 底部安全提醒 */}
      <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
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