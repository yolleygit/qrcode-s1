'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  AlertTriangle,
  Info,
  QrCode,
  ArrowLeft,
  X
} from 'lucide-react';
import Link from 'next/link';
// import { EncryptedQRService } from './services/encryptedQRService';
// import { DisguiseService } from './services/disguiseService';
// import { 
//   EncryptionRequest, 
//   DEFAULT_ENCRYPTION_CONFIG, 
//   DEFAULT_QR_STYLE 
// } from './interfaces';
import { UnifiedNavigation } from '../components/UnifiedNavigation';
import { FileUploadZone } from '../hooks/useDragAndDrop';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '../hooks/useKeyboardShortcuts';
import { useUnifiedKeyboardShortcuts, createQRPageShortcuts } from '../hooks/useUnifiedKeyboardShortcuts';
import { useUnifiedShare, QR_SHARE_CONFIG } from '../hooks/useUnifiedShare';
import { ContextMenuContainer } from '../hooks/useContextMenu';
import { SmartLayout } from '../components/SmartLayout';
import { SmartPanel, InputPanel, PreviewPanel } from '../components/SmartPanel';
import { RealTimeQRPreview } from '../components/RealTimeQRPreview';
import { useRealTimePreview } from '../hooks/useRealTimePreview';
import { MobileTabNavigation, QR_MASTER_TABS } from '../components/MobileTabNavigation';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { UnifiedActionButtons, createStandardQRActions } from '../components/UnifiedActionButtons';

export default function EncryptedQRPage() {
  const { isMobile, isTablet } = useBreakpoint();
  
  // Services (temporarily disabled)
  // const encryptedQRService = EncryptedQRService.getInstance();
  // const disguiseService = DisguiseService.getInstance();
  
  // State
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [loading, setLoading] = useState(false);
  
  // Encrypt mode state
  const [plaintext, setPlaintext] = useState('');
  const [password, setPassword] = useState('');
  const [disguiseText, setDisguiseText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  
  // Decrypt mode state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [decryptPassword, setDecryptPassword] = useState('');
  const [decryptResult, setDecryptResult] = useState<string | null>(null);
  const [showDecryptPassword, setShowDecryptPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // UI state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Real-time preview hooks for both modes
  const encryptPreview = useRealTimePreview({
    type: 'encrypted'
  });
  
  const [decryptPreview, setDecryptPreview] = useState<string | null>(null);
  const [decryptPreviewLoading, setDecryptPreviewLoading] = useState(false);

  // Unified share functionality
  const { shareQRCode, shareText } = useUnifiedShare();

  // 简单的加密函数（实际项目中应使用更安全的加密方法）
  const encryptData = async (data: string, password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    const passwordBytes = encoder.encode(password);
    
    // 简单的XOR加密（仅用于演示）
    const encrypted = new Uint8Array(dataBytes.length);
    for (let i = 0; i < dataBytes.length; i++) {
      encrypted[i] = dataBytes[i] ^ passwordBytes[i % passwordBytes.length];
    }
    
    // 转换为Base64
    return btoa(String.fromCharCode(...encrypted));
  };

  // 简单的解密函数
  const decryptData = async (encryptedData: string, password: string): Promise<string> => {
    try {
      const encrypted = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
      const passwordBytes = new TextEncoder().encode(password);
      
      const decrypted = new Uint8Array(encrypted.length);
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ passwordBytes[i % passwordBytes.length];
      }
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      throw new Error('解密失败，请检查密码是否正确');
    }
  };

  // Get default disguise text on component mount
  React.useEffect(() => {
    if (!disguiseText) {
      setDisguiseText('欢迎访问我们的官方网站'); // 默认文本
    }
  }, []);

  // Cleanup uploaded image URL on unmount
  React.useEffect(() => {
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
    };
  }, [uploadedImageUrl]);

  // Real-time encryption effect
  React.useEffect(() => {
    if (plaintext.trim() && password) {
      const generateEncryptedContent = async () => {
        try {
          const encryptedData = await encryptData(plaintext, password);
          const qrData = disguiseText ? `${disguiseText}|${encryptedData}` : encryptedData;
          
          // Check data length
          if (qrData.length > 2000) {
            setError('数据过长可能影响二维码扫描，建议缩短内容或密码长度');
            return;
          }
          
          // Update real-time preview
          encryptPreview.updateContent(qrData);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : '加密失败');
        }
      };
      
      generateEncryptedContent();
    } else {
      encryptPreview.updateContent('');
      setError(null);
    }
  }, [plaintext, password, disguiseText]);

  const handleEncrypt = async () => {
    if (!plaintext.trim()) {
      setError('请输入要加密的内容');
      return;
    }
    
    if (!password) {
      setError('请输入密码');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Generate the QR code immediately from preview
      const qrData = await encryptPreview.generateQRCode();
      setGeneratedQR(qrData);
      setSuccess(`加密二维码生成成功！${disguiseText ? '包含伪装内容，可安全分享。' : ''}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加密失败');
    } finally {
      setLoading(false);
    }
  };

  // Real-time decryption preview
  React.useEffect(() => {
    if (uploadedFile && uploadedImageUrl) {
      const processDecryption = async () => {
        setDecryptPreviewLoading(true);
        setError(null);
        
        try {
          // Parse QR code from uploaded image
          const jsQR = (await import('jsqr')).default;
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error('图片加载失败，请检查图片是否损坏'));
            img.src = uploadedImageUrl;
          });
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx!.drawImage(img, 0, 0);
          
          const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (!code) {
            throw new Error('无法识别二维码。请确保图片清晰且二维码完整可见。');
          }
          
          const qrData = code.data;
          
          // Check for disguise text
          const parts = qrData.split('|');
          let encryptedData = qrData;
          let disguiseContent = '';
          
          if (parts.length === 2) {
            disguiseContent = parts[0];
            encryptedData = parts[1];
          }
          
          if (decryptPassword) {
            // Try to decrypt
            try {
              const decryptedContent = await decryptData(encryptedData, decryptPassword);
              setDecryptPreview(decryptedContent);
              setIsAuthenticated(true);
            } catch (decryptError) {
              // Show disguise content if decryption fails
              setDecryptPreview(disguiseContent || '密码错误，显示伪装内容');
              setIsAuthenticated(false);
            }
          } else {
            // Show disguise content or raw data
            setDecryptPreview(disguiseContent || qrData);
            setIsAuthenticated(false);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : '解析失败');
          setDecryptPreview(null);
        } finally {
          setDecryptPreviewLoading(false);
        }
      };
      
      processDecryption();
    } else {
      setDecryptPreview(null);
      setIsAuthenticated(false);
    }
  }, [uploadedFile, uploadedImageUrl, decryptPassword]);

  const handleDecrypt = async () => {
    if (!uploadedFile) {
      setError('请上传二维码图片');
      return;
    }

    // Validation
    if (!uploadedFile.type.startsWith('image/')) {
      setError('请上传有效的图片文件（JPG、PNG、GIF等）');
      return;
    }

    if (uploadedFile.size > 10 * 1024 * 1024) {
      setError('图片文件过大，请选择小于10MB的图片');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Use the real-time preview result
      if (decryptPreview) {
        setDecryptResult(decryptPreview);
        setSuccess(isAuthenticated ? '解密成功！' : '二维码解析成功');
      } else {
        throw new Error('无法解析二维码内容');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '解密失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setDecryptResult(null);
      setIsAuthenticated(false);
      setError(null);
      
      // Create preview URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      setUploadedImageUrl(imageUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setSuccess('内容已复制到剪贴板');
    } catch (err) {
      setError('复制失败');
    }
  };

  // 统一的下载处理
  const handleDownload = useCallback((dataUrl?: string) => {
    const imageUrl = dataUrl || generatedQR;
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `encrypted-qr-${mode}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccess('二维码已下载');
  }, [generatedQR, mode]);

  // 统一的分享处理
  const handleShare = useCallback(async (dataUrl?: string) => {
    const imageUrl = dataUrl || generatedQR;
    if (!imageUrl) return;

    try {
      const shareConfig = QR_SHARE_CONFIG.encrypted;
      await shareQRCode(imageUrl, {
        title: shareConfig.title,
        description: shareConfig.description,
        filename: `encrypted-qr-${mode}-${Date.now()}.png`,
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
  }, [generatedQR, mode, shareQRCode]);

  // 统一的复制处理
  const handleCopy = useCallback(async () => {
    if (mode === 'encrypt') {
      if (generatedQR) {
        // 复制图片数据URL
        await copyToClipboard(generatedQR);
      }
    } else {
      if (decryptPreview) {
        await copyToClipboard(decryptPreview);
      }
    }
  }, [mode, generatedQR, decryptPreview]);

  // 清空所有内容
  const clearAll = useCallback(() => {
    setPlaintext('');
    setPassword('');
    setDisguiseText('欢迎访问我们的官方网站');
    setGeneratedQR(null);
    setUploadedFile(null);
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }
    setUploadedImageUrl(null);
    setDecryptPassword('');
    setDecryptResult(null);
    setDecryptPreview(null);
    setIsAuthenticated(false);
    setError(null);
    setSuccess(null);
    setCopied(false);
    setSuccess('已清空所有内容');
  }, [uploadedImageUrl]);

  // 统一键盘快捷键
  const { availableShortcuts } = useUnifiedKeyboardShortcuts(
    createQRPageShortcuts({
      onDownload: () => {
        if ((mode === 'encrypt' && generatedQR) || (mode === 'decrypt' && decryptPreview)) {
          handleDownload();
        }
      },
      onCopy: () => {
        if ((mode === 'encrypt' && generatedQR) || (mode === 'decrypt' && decryptPreview)) {
          handleCopy();
        }
      },
      onShare: () => {
        if ((mode === 'encrypt' && generatedQR) || (mode === 'decrypt' && decryptPreview)) {
          handleShare();
        }
      },
      onClear: clearAll,
      onToggleMode: () => {
        setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt');
      },
      onShowHelp: () => setShowShortcutsHelp(true),
      onGoHome: () => {
        window.location.href = '/';
      }
    })
  );

  // 页面特定的快捷键
  useKeyboardShortcuts([
    {
      key: 'e',
      ctrlKey: true,
      callback: () => {
        if (mode === 'encrypt' && plaintext && password && !loading) {
          handleEncrypt();
        }
      },
      description: 'Ctrl+E: 生成加密二维码'
    },
    {
      key: 'd',
      ctrlKey: true,
      callback: () => {
        if (mode === 'decrypt' && uploadedFile && !loading) {
          handleDecrypt();
        }
      },
      description: 'Ctrl+D: 解密二维码'
    }
  ]);



  // 处理拖拽上传
  const handleFileSelect = (files: File[]) => {
    const file = files[0];
    if (file) {
      setUploadedFile(file);
      setDecryptResult(null);
      setIsAuthenticated(false);
      setError(null);
      
      // Create preview URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      setUploadedImageUrl(imageUrl);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* 统一导航栏 */}
      <UnifiedNavigation 
        showBackButton={true}
        title="加密二维码"
      />
      
      {/* Mobile Tab Navigation */}
      {(isMobile || isTablet) && (
        <MobileTabNavigation
          tabs={QR_MASTER_TABS}
          activeTab="encrypted"
          onTabChange={(tabId) => {
            if (tabId === 'static') {
              window.location.href = '/';
            } else if (tabId === 'totp') {
              window.location.href = '/totp';
            }
          }}
        />
      )}
      
      {/* 模式切换 */}
      <div className={`${(isMobile || isTablet) ? 'pt-32' : 'pt-16'} bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 py-4">
            <button
              onClick={() => setMode('encrypt')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 min-h-[44px] touch-manipulation ${
                mode === 'encrypt' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Lock className="w-4 h-4" />
              加密模式
            </button>
            <button
              onClick={() => setMode('decrypt')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 min-h-[44px] touch-manipulation ${
                mode === 'decrypt' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Unlock className="w-4 h-4" />
              解密模式
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SmartLayout 
          noScroll={true}
          showScrollWarning={false}
          sidebar={
            <div className="space-y-4">
              {/* Security Info */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  安全提示
                </h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• 使用强密码（建议至少12位，包含大小写字母、数字、特殊字符）</li>
                  <li>• 密码不会被存储，请妥善保管</li>
                  <li>• 所有加密操作在本地完成，数据不会上传到服务器</li>
                  <li>• 生成的二维码使用高错误纠正级别，提高扫描成功率</li>
                </ul>
              </div>

              {/* Scanning Tips */}
              {mode === 'decrypt' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    扫描技巧
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• 确保二维码完整清晰，光线充足</li>
                    <li>• 避免反光和阴影影响</li>
                    <li>• 如果扫描失败，尝试调整图片亮度和对比度</li>
                    <li>• 支持截图和拍照的二维码图片</li>
                  </ul>
                </div>
              )}
            </div>
          }
        >
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-green-700 dark:text-green-300">{success}</span>
            </div>
          )}

          {mode === 'encrypt' ? (
            // Encrypt Mode - Left-Right Layout
            <>
              <InputPanel
                title="加密数据"
                subtitle="输入敏感信息和密码"
                scrollable={true}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      敏感数据 *
                    </label>
                    <textarea
                      value={plaintext}
                      onChange={(e) => setPlaintext(e.target.value)}
                      placeholder="输入要加密的敏感信息..."
                      className="w-full h-32 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
                        placeholder="输入密码（建议至少12位）"
                        className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      伪装文本
                      <span className="text-xs text-slate-500 ml-2">（扫描时显示的无害内容）</span>
                    </label>
                    <input
                      type="text"
                      value={disguiseText}
                      onChange={(e) => setDisguiseText(e.target.value)}
                      placeholder="输入伪装文本..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  {/* Real-time status feedback */}
                  {plaintext && password && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">实时加密预览已生成</span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        数据长度: {plaintext.length} 字符 | 密码强度: {password.length >= 12 ? '强' : password.length >= 8 ? '中' : '弱'}
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleEncrypt}
                    disabled={loading || !plaintext.trim() || !password}
                    className="group w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] touch-manipulation hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    title="快捷键: Ctrl+E"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        生成最终版本...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        生成加密二维码
                      </>
                    )}
                  </button>
                </div>
              </InputPanel>

              <PreviewPanel
                title="实时预览"
                subtitle="加密二维码预览"
                scrollable={false}
              >
                <div className="flex-1 flex items-center justify-center">
                  <RealTimeQRPreview
                    config={{
                      content: encryptPreview.config.content,
                      style: encryptPreview.config.style,
                      type: 'encrypted'
                    }}
                    placeholder="输入内容和密码生成加密二维码"
                    className="w-full max-w-sm"
                    onPreviewGenerated={(dataUrl) => {
                      // Store for download
                      setGeneratedQR(dataUrl);
                    }}
                  />
                </div>
                
                {/* Action buttons */}
                {encryptPreview.previewData && (
                  <div className="mt-4">
                    <UnifiedActionButtons
                      buttons={createStandardQRActions({
                        data: generatedQR || '',
                        filename: `encrypted-qr-${Date.now()}.png`,
                        includeShare: true,
                        disabled: !generatedQR
                      })}
                      size="sm"
                      fullWidth={isMobile}
                      direction={isMobile ? 'vertical' : 'horizontal'}
                    />
                  </div>
                )}
              </PreviewPanel>
            </>
          ) : (
            // Decrypt Mode - Left-Right Layout
            <>
              <InputPanel
                title="解密二维码"
                subtitle="上传图片并输入密码"
                scrollable={true}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      上传二维码图片 *
                    </label>
                    
                    {uploadedImageUrl ? (
                      // Enhanced file preview with drag-and-drop support
                      <ContextMenuContainer
                        menuItems={[
                          {
                            id: 'replace',
                            label: '更换文件',
                            icon: Upload,
                            onClick: () => fileInputRef.current?.click()
                          },
                          {
                            id: 'remove',
                            label: '移除文件',
                            icon: X,
                            onClick: () => {
                              setUploadedFile(null);
                              if (uploadedImageUrl) {
                                URL.revokeObjectURL(uploadedImageUrl);
                              }
                              setUploadedImageUrl(null);
                              setDecryptResult(null);
                              setIsAuthenticated(false);
                            }
                          }
                        ]}
                        className="border-2 border-solid border-purple-300 dark:border-purple-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20"
                      >
                        <div className="space-y-3 text-center">
                          <div className="relative inline-block">
                            <img 
                              src={uploadedImageUrl} 
                              alt="Uploaded QR Code" 
                              className="w-32 h-32 object-contain rounded-lg border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => fileInputRef.current?.click()}
                            />
                            {decryptPreviewLoading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {uploadedFile?.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            右键点击查看更多选项 | 点击图片更换
                          </p>
                        </div>
                      </ContextMenuContainer>
                    ) : (
                      // Enhanced drag and drop upload zone
                      <FileUploadZone
                        onFileSelect={handleFileSelect}
                        acceptedTypes={['image/*']}
                        maxFiles={1}
                        maxSize={10 * 1024 * 1024} // 10MB
                        multiple={false}
                        className="min-h-[140px] border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                      />
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      解密密码
                      <span className="text-xs text-slate-500 ml-2">（留空查看伪装内容）</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showDecryptPassword ? 'text' : 'password'}
                        value={decryptPassword}
                        onChange={(e) => setDecryptPassword(e.target.value)}
                        placeholder="输入密码解锁真实内容"
                        className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDecryptPassword(!showDecryptPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showDecryptPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Real-time decryption status */}
                  {uploadedFile && (
                    <div className={`p-3 rounded-lg border ${
                      decryptPreview 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}>
                      <div className={`flex items-center gap-2 ${
                        decryptPreview 
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-blue-700 dark:text-blue-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          decryptPreviewLoading 
                            ? 'bg-blue-500 animate-pulse'
                            : decryptPreview 
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                        }`}></div>
                        <span className="text-sm font-medium">
                          {decryptPreviewLoading 
                            ? '正在解析二维码...'
                            : decryptPreview 
                              ? `解析成功 ${isAuthenticated ? '(已解密)' : '(显示伪装内容)'}`
                              : '等待解析'
                          }
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleDecrypt}
                    disabled={loading || !uploadedFile}
                    className="group w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] touch-manipulation hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    title="快捷键: Ctrl+D"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        处理中...
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        确认解密
                      </>
                    )}
                  </button>
                </div>
              </InputPanel>

              <PreviewPanel
                title="解密预览"
                subtitle={isAuthenticated ? "真实内容" : "伪装内容"}
                scrollable={false}
              >
                <div className="flex-1 flex items-center justify-center">
                  {decryptPreview ? (
                    <div className="w-full max-w-md">
                      <div className={`p-4 rounded-lg border ${
                        isAuthenticated 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      }`}>
                        <div className="flex items-center gap-2 mb-3">
                          {isAuthenticated ? (
                            <>
                              <Unlock className="w-5 h-5 text-green-600 dark:text-green-400" />
                              <span className="font-medium text-green-800 dark:text-green-200">解密成功</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <span className="font-medium text-blue-800 dark:text-blue-200">伪装内容</span>
                            </>
                          )}
                        </div>
                        <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">
                          {decryptPreview}
                        </p>
                      </div>
                      
                      {!isAuthenticated && decryptPassword && (
                        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                            <Info className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">
                              密码可能不正确，显示伪装内容。请检查密码后重试。
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Unlock className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                        等待解密结果
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        上传二维码图片并输入密码进行解密
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Action buttons */}
                {decryptPreview && (
                  <div className="mt-4">
                    <UnifiedActionButtons
                      buttons={[
                        {
                          type: 'copy',
                          label: '复制内容',
                          onClick: () => handleCopy(),
                          variant: 'primary',
                          disabled: !decryptPreview
                        },
                        {
                          type: 'share',
                          label: '分享内容',
                          onClick: async () => {
                            try {
                              await shareText(decryptPreview, {
                                title: isAuthenticated ? '解密内容' : '二维码内容',
                                onSuccess: (method) => {
                                  const messages = {
                                    native: '已通过系统分享',
                                    copy: '内容已复制',
                                    download: '内容已保存'
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
                          },
                          variant: 'outline',
                          disabled: !decryptPreview
                        }
                      ]}
                      size="sm"
                      fullWidth={isMobile}
                      direction={isMobile ? 'vertical' : 'horizontal'}
                    />
                  </div>
                )}
              </PreviewPanel>
            </>
          )}

          {/* Clear Button */}
          <div className="mt-6 text-center">
            <button
              onClick={clearAll}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium py-2 px-4 transition-colors"
            >
              清空所有内容
            </button>
          </div>
        </SmartLayout>
      </main>

      {/* 键盘快捷键帮助 */}
      <KeyboardShortcutsHelp
        shortcuts={availableShortcuts}
        isVisible={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />


      {/* Toast notifications */}
      {error && (
        <div className="fixed top-20 right-4 z-50 max-w-md">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  操作失败
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-20 right-4 z-50 max-w-md">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                  操作成功
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {success}
                </p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-green-400 hover:text-green-600 dark:hover:text-green-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}