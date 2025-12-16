'use client';

import { useCallback, useState, useRef } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { toast } from '../components/Toast';

export interface OneClickOperationConfig {
  /** 操作类型 */
  type: 'download' | 'copy' | 'share' | 'save' | 'print';
  /** 操作数据 */
  data: string | Blob | File;
  /** 文件名（用于下载） */
  filename?: string;
  /** 操作成功回调 */
  onSuccess?: () => void;
  /** 操作失败回调 */
  onError?: (error: Error) => void;
  /** 是否显示成功提示 */
  showSuccessToast?: boolean;
  /** 是否显示错误提示 */
  showErrorToast?: boolean;
  /** 重试配置 */
  retryConfig?: {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
  };
}

export interface OneClickOperationResult {
  success: boolean;
  error?: Error;
  duration: number;
  retryCount: number;
}

export function useOneClickOperations() {
  const { handleError, retry } = useErrorHandler();
  const [operationStates, setOperationStates] = useState<Record<string, {
    isLoading: boolean;
    lastResult?: OneClickOperationResult;
  }>>({});
  
  const operationTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // 执行一键操作
  const executeOperation = useCallback(async (
    operationId: string,
    config: OneClickOperationConfig
  ): Promise<OneClickOperationResult> => {
    const startTime = Date.now();
    let retryCount = 0;

    // 设置加载状态
    setOperationStates(prev => ({
      ...prev,
      [operationId]: { isLoading: true }
    }));

    try {
      const result = await retry(async () => {
        retryCount++;
        
        switch (config.type) {
          case 'download':
            await performDownload(config.data, config.filename);
            break;
          case 'copy':
            await performCopy(config.data);
            break;
          case 'share':
            await performShare(config.data, config.filename);
            break;
          case 'save':
            await performSave(config.data, config.filename);
            break;
          case 'print':
            await performPrint(config.data);
            break;
          default:
            throw new Error(`Unsupported operation type: ${config.type}`);
        }
      }, config.retryConfig || { maxRetries: 3, delay: 1000, backoff: true });

      const duration = Date.now() - startTime;
      const operationResult: OneClickOperationResult = {
        success: true,
        duration,
        retryCount: retryCount - 1
      };

      // 更新状态
      setOperationStates(prev => ({
        ...prev,
        [operationId]: { isLoading: false, lastResult: operationResult }
      }));

      // 显示成功反馈
      if (config.showSuccessToast !== false) {
        showSuccessToast(config.type, duration);
      }

      // 调用成功回调
      config.onSuccess?.();

      return operationResult;

    } catch (error) {
      const duration = Date.now() - startTime;
      const operationError = error instanceof Error ? error : new Error('操作失败');
      const operationResult: OneClickOperationResult = {
        success: false,
        error: operationError,
        duration,
        retryCount
      };

      // 更新状态
      setOperationStates(prev => ({
        ...prev,
        [operationId]: { isLoading: false, lastResult: operationResult }
      }));

      // 处理错误
      if (config.showErrorToast !== false) {
        handleError(operationError, `${config.type}操作`);
      }

      // 调用错误回调
      config.onError?.(operationError);

      return operationResult;
    }
  }, [handleError, retry]);

  // 获取操作状态
  const getOperationState = useCallback((operationId: string) => {
    return operationStates[operationId] || { isLoading: false };
  }, [operationStates]);

  // 清除操作状态
  const clearOperationState = useCallback((operationId: string) => {
    setOperationStates(prev => {
      const newState = { ...prev };
      delete newState[operationId];
      return newState;
    });

    // 清除定时器
    if (operationTimeouts.current[operationId]) {
      clearTimeout(operationTimeouts.current[operationId]);
      delete operationTimeouts.current[operationId];
    }
  }, []);

  return {
    executeOperation,
    getOperationState,
    clearOperationState
  };
}

// 执行下载操作
async function performDownload(data: string | Blob | File, filename?: string): Promise<void> {
  let downloadUrl: string;
  let shouldRevoke = false;

  if (typeof data === 'string') {
    // 如果是 data URL，直接使用
    if (data.startsWith('data:')) {
      downloadUrl = data;
    } else {
      // 如果是普通字符串，创建 blob
      const blob = new Blob([data], { type: 'text/plain' });
      downloadUrl = URL.createObjectURL(blob);
      shouldRevoke = true;
    }
  } else {
    // 如果是 Blob 或 File，创建 URL
    downloadUrl = URL.createObjectURL(data);
    shouldRevoke = true;
  }

  try {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || `download-${Date.now()}`;
    
    // 添加到 DOM，触发下载，然后移除
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 等待一小段时间确保下载开始
    await new Promise(resolve => setTimeout(resolve, 100));
  } finally {
    // 清理 URL
    if (shouldRevoke) {
      URL.revokeObjectURL(downloadUrl);
    }
  }
}

// 执行复制操作
async function performCopy(data: string | Blob | File): Promise<void> {
  if (typeof data === 'string') {
    // 复制文本
    await navigator.clipboard.writeText(data);
  } else {
    // 复制文件或图片
    const clipboardItem = new ClipboardItem({
      [data.type]: data
    });
    await navigator.clipboard.write([clipboardItem]);
  }
}

// 执行分享操作
async function performShare(data: string | Blob | File, filename?: string): Promise<void> {
  if (!navigator.share) {
    throw new Error('当前浏览器不支持分享功能');
  }

  if (typeof data === 'string') {
    await navigator.share({
      text: data,
      title: '分享内容'
    });
  } else {
    const file = data instanceof File ? data : new File([data], filename || 'shared-file', { type: data.type });
    await navigator.share({
      files: [file],
      title: '分享文件'
    });
  }
}

// 执行保存操作（另存为）
async function performSave(data: string | Blob | File, filename?: string): Promise<void> {
  // 检查是否支持 File System Access API
  if ('showSaveFilePicker' in window) {
    try {
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: filename || 'untitled',
        types: [{
          description: '所有文件',
          accept: { '*/*': [] }
        }]
      });

      const writable = await fileHandle.createWritable();
      
      if (typeof data === 'string') {
        await writable.write(data);
      } else {
        await writable.write(data);
      }
      
      await writable.close();
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('用户取消了保存操作');
      }
      throw error;
    }
  } else {
    // 回退到普通下载
    await performDownload(data, filename);
  }
}

// 执行打印操作
async function performPrint(data: string | Blob | File): Promise<void> {
  if (typeof data === 'string') {
    // 如果是 data URL（图片），在新窗口中打印
    if (data.startsWith('data:image/')) {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('无法打开打印窗口，请检查浏览器弹窗设置');
      }
      
      printWindow.document.write(`
        <html>
          <head><title>打印</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;">
            <img src="${data}" style="max-width:100%;max-height:100%;object-fit:contain;" onload="window.print();window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      // 普通文本打印
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('无法打开打印窗口，请检查浏览器弹窗设置');
      }
      
      printWindow.document.write(`
        <html>
          <head><title>打印</title></head>
          <body style="font-family:monospace;white-space:pre-wrap;padding:20px;">
            ${data}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  } else {
    // 对于 Blob 或 File，转换为 URL 后打印
    const url = URL.createObjectURL(data);
    try {
      const printWindow = window.open(url, '_blank');
      if (!printWindow) {
        throw new Error('无法打开打印窗口，请检查浏览器弹窗设置');
      }
      
      // 等待内容加载后打印
      printWindow.addEventListener('load', () => {
        printWindow.print();
        printWindow.close();
      });
    } finally {
      // 延迟清理 URL，确保打印完成
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  }
}

// 显示成功提示
function showSuccessToast(operationType: string, duration: number) {
  const messages = {
    download: '下载成功',
    copy: '复制成功',
    share: '分享成功',
    save: '保存成功',
    print: '打印任务已发送'
  };

  const message = messages[operationType as keyof typeof messages] || '操作成功';
  
  toast.success(message, {
    duration: 2000,
    title: `${message} (${Math.round(duration)}ms)`
  });
}

// 预设的一键操作配置
export const createQuickDownload = (
  data: string | Blob | File,
  filename?: string,
  options?: Partial<OneClickOperationConfig>
): OneClickOperationConfig => ({
  type: 'download',
  data,
  filename,
  showSuccessToast: true,
  showErrorToast: true,
  retryConfig: { maxRetries: 3, delay: 500 },
  ...options
});

export const createQuickCopy = (
  data: string | Blob | File,
  options?: Partial<OneClickOperationConfig>
): OneClickOperationConfig => ({
  type: 'copy',
  data,
  showSuccessToast: true,
  showErrorToast: true,
  retryConfig: { maxRetries: 2, delay: 300 },
  ...options
});

export const createQuickShare = (
  data: string | Blob | File,
  filename?: string,
  options?: Partial<OneClickOperationConfig>
): OneClickOperationConfig => ({
  type: 'share',
  data,
  filename,
  showSuccessToast: true,
  showErrorToast: true,
  retryConfig: { maxRetries: 1 },
  ...options
});