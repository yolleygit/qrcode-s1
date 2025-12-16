'use client';

import { useCallback } from 'react';

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

export interface ShareOptions {
  fallbackCopy?: boolean;
  showFeedback?: boolean;
  onSuccess?: (method: 'native' | 'copy' | 'download') => void;
  onError?: (error: Error) => void;
}

export function useUnifiedShare() {
  // 检查是否支持原生分享
  const isNativeShareSupported = useCallback((data: ShareData): boolean => {
    if (!navigator.share) return false;
    
    // 检查文件分享支持
    if (data.files && data.files.length > 0) {
      return navigator.canShare && navigator.canShare({ files: data.files });
    }
    
    return true;
  }, []);

  // 原生分享
  const nativeShare = useCallback(async (data: ShareData): Promise<void> => {
    if (!navigator.share) {
      throw new Error('Native sharing not supported');
    }

    try {
      await navigator.share(data);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // 用户取消分享，不抛出错误
        return;
      }
      throw error;
    }
  }, []);

  // 复制到剪贴板作为备选方案
  const copyFallback = useCallback(async (data: ShareData): Promise<void> => {
    const textToCopy = [
      data.title,
      data.text,
      data.url
    ].filter(Boolean).join('\n\n');

    if (!textToCopy) {
      throw new Error('No text content to copy');
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (error) {
      // 备选的复制方法
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (execError) {
        document.body.removeChild(textArea);
        throw new Error('Failed to copy to clipboard');
      }
    }
  }, []);

  // 下载文件作为备选方案
  const downloadFallback = useCallback((data: ShareData): void => {
    if (data.files && data.files.length > 0) {
      data.files.forEach((file, index) => {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name || `shared-file-${index + 1}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    } else if (data.url) {
      // 如果是URL，尝试在新窗口打开
      window.open(data.url, '_blank');
    }
  }, []);

  // 统一分享函数
  const share = useCallback(async (
    data: ShareData, 
    options: ShareOptions = {}
  ): Promise<'native' | 'copy' | 'download'> => {
    const {
      fallbackCopy = true,
      showFeedback = true,
      onSuccess,
      onError
    } = options;

    try {
      // 尝试原生分享
      if (isNativeShareSupported(data)) {
        await nativeShare(data);
        onSuccess?.('native');
        return 'native';
      }

      // 备选方案1：复制到剪贴板
      if (fallbackCopy && (data.title || data.text || data.url)) {
        await copyFallback(data);
        onSuccess?.('copy');
        return 'copy';
      }

      // 备选方案2：下载文件或打开链接
      downloadFallback(data);
      onSuccess?.('download');
      return 'download';

    } catch (error) {
      const shareError = error instanceof Error ? error : new Error('Share failed');
      onError?.(shareError);
      throw shareError;
    }
  }, [isNativeShareSupported, nativeShare, copyFallback, downloadFallback]);

  // 分享QR码图片
  const shareQRCode = useCallback(async (
    imageDataUrl: string,
    options: {
      title?: string;
      description?: string;
      filename?: string;
    } & ShareOptions = {}
  ): Promise<'native' | 'copy' | 'download'> => {
    const {
      title = '二维码',
      description = '扫描此二维码获取信息',
      filename = `qr-code-${Date.now()}.png`,
      ...shareOptions
    } = options;

    try {
      // 将 data URL 转换为 File 对象
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'image/png' });

      return await share({
        title,
        text: description,
        files: [file]
      }, shareOptions);
    } catch (error) {
      // 如果文件分享失败，尝试复制图片数据URL
      try {
        await copyFallback({
          title,
          text: description,
          url: imageDataUrl
        });
        shareOptions.onSuccess?.('copy');
        return 'copy';
      } catch (copyError) {
        // 最后备选：下载图片
        const link = document.createElement('a');
        link.href = imageDataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        shareOptions.onSuccess?.('download');
        return 'download';
      }
    }
  }, [share, copyFallback]);

  // 分享文本内容
  const shareText = useCallback(async (
    text: string,
    options: {
      title?: string;
    } & ShareOptions = {}
  ): Promise<'native' | 'copy' | 'download'> => {
    const { title = '分享内容', ...shareOptions } = options;

    return await share({
      title,
      text
    }, shareOptions);
  }, [share]);

  // 分享链接
  const shareUrl = useCallback(async (
    url: string,
    options: {
      title?: string;
      description?: string;
    } & ShareOptions = {}
  ): Promise<'native' | 'copy' | 'download'> => {
    const { 
      title = '分享链接', 
      description,
      ...shareOptions 
    } = options;

    return await share({
      title,
      text: description,
      url
    }, shareOptions);
  }, [share]);

  return {
    share,
    shareQRCode,
    shareText,
    shareUrl,
    isNativeShareSupported
  };
}

// 预设的分享配置
export const QR_SHARE_CONFIG = {
  static: {
    title: '静态二维码',
    description: '扫描此二维码获取信息'
  },
  totp: {
    title: 'TOTP验证码',
    description: '扫描此二维码配置双因素认证'
  },
  encrypted: {
    title: '加密二维码',
    description: '扫描此二维码查看加密内容'
  }
} as const;