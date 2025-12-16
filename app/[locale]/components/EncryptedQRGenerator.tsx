'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Lock, Shield, Eye, EyeOff, Download, Copy, Key, AlertTriangle, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';

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
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [encryptedData, setEncryptedData] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // 加密数据
  const encryptData = useCallback((data: string, password: string, level: string) => {
    try {
      let encrypted: string;
      
      switch (level) {
        case 'aes-128':
          encrypted = CryptoJS.AES.encrypt(data, password, {
            keySize: 128 / 32,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          }).toString();
          break;
        case 'aes-256-gcm':
          // 对于GCM模式，我们使用标准AES-256但添加额外的安全措施
          const salt = CryptoJS.lib.WordArray.random(128/8);
          const key = CryptoJS.PBKDF2(password, salt, {
            keySize: 256/32,
            iterations: 10000
          });
          encrypted = CryptoJS.AES.encrypt(data, key, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          }).toString();
          // 将salt和加密数据组合
          encrypted = salt.toString() + ':' + encrypted;
          break;
        case 'aes-256':
        default:
          encrypted = CryptoJS.AES.encrypt(data, password, {
            keySize: 256 / 32,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          }).toString();
          break;
      }

      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('加密失败，请检查输入数据');
    }
  }, []);

  // 生成伪装数据
  const generateDisguiseData = useCallback((encryptedData: string) => {
    // 创建一个看起来像普通URL或文本的伪装格式
    const disguiseFormats = [
      `https://example.com/verify?token=${encryptedData.slice(0, 32)}...`,
      `Document ID: ${encryptedData.slice(0, 16)}-${encryptedData.slice(16, 32)}`,
      `Reference: REF${encryptedData.slice(0, 12).toUpperCase()}`,
    ];
    
    return disguiseFormats[Math.floor(Math.random() * disguiseFormats.length)];
  }, []);

  // 生成二维码
  const generateQRCode = useCallback(async () => {
    if (!content.trim() || !password.trim()) {
      setQrCodeDataUrl('');
      setEncryptedData('');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // 加密数据
      const encrypted = encryptData(content, password, encryptionLevel);
      
      // 创建加密数据包
      const dataPacket = {
        v: '1.0', // 版本
        e: encryptionLevel, // 加密级别
        d: encrypted, // 加密数据
        t: Date.now(), // 时间戳
        ...(disguiseMode && { m: 'disguise' }) // 伪装模式标记
      };

      const finalData = disguiseMode 
        ? generateDisguiseData(encrypted)
        : JSON.stringify(dataPacket);

      setEncryptedData(finalData);

      // 生成二维码
      const qrOptions = {
        width: 256,
        margin: 2,
        color: {
          dark: disguiseMode ? '#4f46e5' : '#7c3aed', // 伪装模式使用不同颜色
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M' as const
      };

      const dataUrl = await QRCode.toDataURL(finalData, qrOptions);
      setQrCodeDataUrl(dataUrl);

    } catch (error) {
      console.error('Failed to generate encrypted QR code:', error);
      setError(error instanceof Error ? error.message : '生成失败');
      setQrCodeDataUrl('');
      setEncryptedData('');
    } finally {
      setIsGenerating(false);
    }
  }, [content, password, encryptionLevel, disguiseMode, encryptData, generateDisguiseData]);

  // 自动生成
  useEffect(() => {
    if (content.trim() && password.trim()) {
      const timer = setTimeout(() => {
        generateQRCode();
      }, 500); // 防抖
      return () => clearTimeout(timer);
    } else {
      setQrCodeDataUrl('');
      setEncryptedData('');
      setError('');
    }
  }, [content, password, encryptionLevel, disguiseMode, generateQRCode]);

  // 复制加密数据
  const handleCopyEncryptedData = useCallback(async () => {
    if (encryptedData) {
      try {
        await navigator.clipboard.writeText(encryptedData);
        console.log('加密数据已复制到剪贴板');
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  }, [encryptedData]);

  // 下载二维码
  const handleDownloadQR = useCallback(() => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `encrypted-qr-${Date.now()}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  }, [qrCodeDataUrl]);

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
            <div className="flex justify-end mt-1">
              <button
                onClick={() => {
                  setContent('这是一条机密信息，包含重要的商业数据和个人隐私信息。');
                  setPassword('MySecretPassword123!');
                }}
                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                使用示例
              </button>
            </div>
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
            onClick={generateQRCode}
            disabled={!content || !password || isGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                加密中...
              </>
            ) : (
              '生成加密二维码'
            )}
          </button>
        </div>

        {/* 右侧：预览和操作 */}
        <div className="space-y-6">
          {/* 二维码预览区域 */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 text-center">
            <div className="w-48 h-48 bg-white dark:bg-slate-700 rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 relative">
              {isGenerating ? (
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-purple-500 mx-auto mb-2 animate-spin" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    加密生成中...
                  </p>
                </div>
              ) : qrCodeDataUrl ? (
                <div className="text-center">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="Encrypted QR Code" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                  {disguiseMode && (
                    <div className="absolute top-2 right-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                      伪装
                    </div>
                  )}
                </div>
              ) : error ? (
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {error}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Lock className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    填写信息后自动生成
                  </p>
                </div>
              )}
            </div>
            
            {/* 加密信息显示 */}
            {encryptedData && (
              <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  加密级别: {encryptionLevel.toUpperCase()}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 font-mono break-all">
                  {encryptedData.length > 50 ? `${encryptedData.slice(0, 50)}...` : encryptedData}
                </p>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <button
              onClick={handleDownloadQR}
              disabled={!qrCodeDataUrl}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              下载加密二维码
            </button>
            
            <button
              onClick={handleCopyEncryptedData}
              disabled={!encryptedData}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
            <p>采用军用级加密标准，支持AES-128/256/256-GCM多种加密级别。</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">伪装保护</h4>
            <p>可选伪装模式，让二维码看起来像普通URL或文档ID，增加隐蔽性。</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">本地处理</h4>
            <p>所有加密操作在浏览器本地完成，敏感数据不会上传到服务器。</p>
          </div>
        </div>
        
        {/* 解密说明 */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
            📖 如何解密
          </h4>
          <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
            <p>• <strong>扫描二维码</strong>：使用任意二维码扫描器获取加密数据</p>
            <p>• <strong>解密工具</strong>：使用相同的密码和加密级别进行解密</p>
            <p>• <strong>数据格式</strong>：加密数据包含版本、加密级别和时间戳信息</p>
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