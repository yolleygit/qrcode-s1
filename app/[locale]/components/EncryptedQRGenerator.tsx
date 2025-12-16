'use client';

import React, { useState } from 'react';
import { Lock, Shield, Eye, EyeOff, Download, Copy, Key, AlertTriangle } from 'lucide-react';

interface EncryptedQRGeneratorProps {
  onSelectRecentConfig?: (config: any) => void;
  onShowPreferences?: () => void;
  isEmbedded?: boolean;
}

export function EncryptedQRGenerator({ 
  onSelectRecentConfig, 
  onShowPreferences,
  isEmbedded = false 
}: EncryptedQRGeneratorProps) {
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [encryptionLevel, setEncryptionLevel] = useState('aes-256');
  const [disguiseMode, setDisguiseMode] = useState(false);

  return (
    <div className={`space-y-6 ${isEmbedded ? '' : 'p-6'}`}>
      {!isEmbedded && (
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            加密二维码生成器
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            军用级 AES-256 加密保护您的敏感数据
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* 左侧：输入表单 */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              要加密的内容 *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入需要加密的敏感信息..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              加密密码 *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="设置一个强密码"
                className="w-full px-4 py-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              加密级别
            </label>
            <select
              value={encryptionLevel}
              onChange={(e) => setEncryptionLevel(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            >
              <option value="aes-128">AES-128 (快速)</option>
              <option value="aes-256">AES-256 (推荐)</option>
              <option value="aes-256-gcm">AES-256-GCM (最高安全)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="disguiseMode"
              checked={disguiseMode}
              onChange={(e) => setDisguiseMode(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
            />
            <label htmlFor="disguiseMode" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              启用伪装模式
            </label>
          </div>

          <button
            disabled={!content || !password}
            className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            生成加密二维码
          </button>
        </div>

        {/* 右侧：预览和操作 */}
        <div className="space-y-6">
          {/* 二维码预览区域 */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 text-center">
            <div className="w-48 h-48 bg-white dark:bg-slate-700 rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
              <div className="text-center">
                <Lock className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  填写信息后生成加密二维码
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
              下载加密二维码
            </button>
            
            <button
              disabled
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              复制加密数据
            </button>
          </div>

          {/* 安全信息 */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">
                  安全保障
                </h4>
                <ul className="text-xs text-green-700 dark:text-green-400 space-y-1">
                  <li>• 本地加密，数据不上传</li>
                  <li>• 军用级 AES 加密算法</li>
                  <li>• 支持伪装模式隐藏内容</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能说明 */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-500" />
          功能特性
        </h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">AES-256 加密</h4>
            <p>采用军用级加密标准，确保数据安全性达到最高级别。</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">伪装保护</h4>
            <p>可选伪装模式，让二维码看起来像普通内容，增加隐蔽性。</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">本地处理</h4>
            <p>所有加密操作在本地完成，敏感数据不会上传到服务器。</p>
          </div>
        </div>
      </div>

      {/* 安全警告 */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
              重要提醒
            </h4>
            <p className="text-xs text-red-700 dark:text-red-400">
              请务必记住您的加密密码，一旦丢失将无法恢复加密的数据。建议使用密码管理器安全保存。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}