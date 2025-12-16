'use client';

import React, { useState } from 'react';
import { Shield, Clock, Key, Copy, Download, Settings } from 'lucide-react';

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
  const [serviceName, setServiceName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [issuer, setIssuer] = useState('');

  return (
    <div className={`space-y-6 ${isEmbedded ? '' : 'p-6'}`}>
      {!isEmbedded && (
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            TOTP 动态验证码生成器
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            生成兼容 Google Authenticator 的双因素认证二维码
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* 左侧：输入表单 */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              服务名称 *
            </label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="例如：GitHub, Google, Microsoft"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              账户名称 *
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="例如：user@example.com"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              密钥 (Secret Key) *
            </label>
            <input
              type="text"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Base32 编码的密钥"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              发行者 (可选)
            </label>
            <input
              type="text"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="例如：公司名称"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>

          <button
            disabled={!serviceName || !accountName || !secretKey}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            生成 TOTP 二维码
          </button>
        </div>

        {/* 右侧：预览和操作 */}
        <div className="space-y-6">
          {/* 二维码预览区域 */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 text-center">
            <div className="w-48 h-48 bg-white dark:bg-slate-700 rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
              <div className="text-center">
                <Shield className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  填写信息后生成二维码
                </p>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <button
              disabled
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              下载二维码
            </button>
            
            <button
              disabled
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              复制 TOTP URI
            </button>
          </div>

          {/* 安全提示 */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                  安全提醒
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  请妥善保管您的密钥，不要与他人分享。建议在安全的环境中生成和使用 TOTP 二维码。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-green-500" />
          使用说明
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">1. 填写信息</h4>
            <p>输入服务名称、账户名称和密钥。密钥通常由服务提供商提供。</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">2. 扫描二维码</h4>
            <p>使用 Google Authenticator 或其他 TOTP 应用扫描生成的二维码。</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">3. 验证设置</h4>
            <p>在相应服务中输入应用显示的 6 位验证码完成设置。</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">4. 安全使用</h4>
            <p>妥善保管备份码，定期检查账户安全设置。</p>
          </div>
        </div>
      </div>
    </div>
  );
}