'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from '../lib/utils';
import QRCodeStyling from 'qr-code-styling';

interface QROptions {
  content: string;
  size: number;
  margin: number;
  colorDark: string;
  colorLight: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  dotType?: string;
  cornerSquareType?: string;
}

interface UseRealTimeQROptions {
  debounceDelay?: number;
  enableRealTime?: boolean;
  onGenerate?: (dataUrl: string) => void;
  onError?: (error: Error) => void;
}

export function useRealTimeQR(options: UseRealTimeQROptions = {}) {
  const {
    debounceDelay = 300,
    enableRealTime = true,
    onGenerate,
    onError
  } = options;

  const [isGenerating, setIsGenerating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);
  const [generationTime, setGenerationTime] = useState<number>(0);
  
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 初始化QR实例
  useEffect(() => {
    if (typeof window !== 'undefined' && !qrInstanceRef.current) {
      qrInstanceRef.current = new QRCodeStyling({
        width: 256,
        height: 256,
        type: 'svg',
        data: '',
        dotsOptions: {
          color: '#000000',
          type: 'rounded'
        },
        backgroundOptions: {
          color: '#ffffff',
        },
        cornersSquareOptions: {
          type: 'extra-rounded',
          color: '#000000'
        },
        cornersDotOptions: {
          type: 'dot',
          color: '#000000'
        },
        qrOptions: {
          errorCorrectionLevel: 'M'
        }
      });
    }
  }, []);

  // 生成QR码的核心函数
  const generateQR = useCallback(async (qrOptions: QROptions) => {
    if (!qrInstanceRef.current || !qrOptions.content.trim()) {
      setQrDataUrl('');
      return;
    }

    // 取消之前的生成任务
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsGenerating(true);
    setError(null);
    const startTime = performance.now();

    try {
      // 更新QR码配置
      qrInstanceRef.current.update({
        width: qrOptions.size,
        height: qrOptions.size,
        data: qrOptions.content,
        dotsOptions: {
          color: qrOptions.colorDark,
          type: qrOptions.dotType as any || 'rounded'
        },
        backgroundOptions: {
          color: qrOptions.colorLight,
        },
        cornersSquareOptions: {
          type: qrOptions.cornerSquareType as any || 'extra-rounded',
          color: qrOptions.colorDark
        },
        cornersDotOptions: {
          type: 'dot',
          color: qrOptions.colorDark
        },
        qrOptions: {
          errorCorrectionLevel: qrOptions.errorCorrectionLevel
        },
        margin: qrOptions.margin
      });

      // 渲染到容器
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        qrInstanceRef.current.append(containerRef.current);
      }

      // 生成数据URL
      const canvas = await qrInstanceRef.current.getRawData('png');
      if (canvas && !abortControllerRef.current.signal.aborted) {
        // Handle both Blob and Buffer types
        let blob: Blob;
        if (canvas instanceof Blob) {
          blob = canvas;
        } else {
          const uint8Array = new Uint8Array(canvas);
          blob = new Blob([uint8Array], { type: 'image/png' });
        }
        const dataUrl = URL.createObjectURL(blob);
        
        setQrDataUrl(dataUrl);
        onGenerate?.(dataUrl);
        
        const endTime = performance.now();
        setGenerationTime(endTime - startTime);
      }
    } catch (err) {
      if (!abortControllerRef.current.signal.aborted) {
        const error = err instanceof Error ? err : new Error('QR码生成失败');
        setError(error);
        onError?.(error);
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setIsGenerating(false);
      }
    }
  }, [onGenerate, onError]);

  // 防抖的生成函数
  const debouncedGenerate = useCallback(
    debounce(generateQR, debounceDelay),
    [generateQR, debounceDelay]
  );

  // 立即生成（不防抖）
  const generateImmediately = useCallback((qrOptions: QROptions) => {
    return generateQR(qrOptions);
  }, [generateQR]);

  // 实时生成（防抖）
  const generateRealTime = useCallback((qrOptions: QROptions) => {
    if (enableRealTime) {
      debouncedGenerate(qrOptions);
    }
  }, [debouncedGenerate, enableRealTime]);

  // 下载QR码
  const downloadQR = useCallback(async (filename?: string) => {
    if (!qrInstanceRef.current) {
      throw new Error('QR码实例未初始化');
    }

    const name = filename || `qrcode-${Date.now()}`;
    await qrInstanceRef.current.download({
      name,
      extension: 'png'
    });
  }, []);

  // 获取QR码数据
  const getQRData = useCallback(async (format: 'png' | 'svg' | 'jpeg' = 'png') => {
    if (!qrInstanceRef.current) {
      throw new Error('QR码实例未初始化');
    }

    return await qrInstanceRef.current.getRawData(format);
  }, []);

  // 清理函数
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (qrDataUrl) {
        URL.revokeObjectURL(qrDataUrl);
      }
    };
  }, [qrDataUrl]);

  return {
    // 状态
    isGenerating,
    qrDataUrl,
    error,
    generationTime,
    
    // 引用
    containerRef,
    
    // 方法
    generateRealTime,
    generateImmediately,
    downloadQR,
    getQRData,
    
    // 实例
    qrInstance: qrInstanceRef.current
  };
}

// 实时验证Hook
export function useRealTimeValidation<T>(
  value: T,
  validator: (value: T) => { isValid: boolean; error?: string },
  debounceDelay: number = 300
) {
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    error?: string;
    isValidating: boolean;
  }>({
    isValid: true,
    isValidating: false
  });

  const validateValue = useCallback((val: T) => {
    setValidationState(prev => ({ ...prev, isValidating: true }));
    
    try {
      const result = validator(val);
      setValidationState({
        isValid: result.isValid,
        error: result.error,
        isValidating: false
      });
    } catch (error) {
      setValidationState({
        isValid: false,
        error: error instanceof Error ? error.message : '验证失败',
        isValidating: false
      });
    }
  }, [validator]);

  const debouncedValidate = useCallback(
    debounce(validateValue, debounceDelay),
    [validateValue, debounceDelay]
  );

  useEffect(() => {
    debouncedValidate(value);
  }, [value, debouncedValidate]);

  return validationState;
}

// 实时字符计数Hook
export function useCharacterCount(
  text: string,
  maxLength?: number
) {
  const count = text.length;
  const remaining = maxLength ? maxLength - count : undefined;
  const isOverLimit = maxLength ? count > maxLength : false;
  const percentage = maxLength ? (count / maxLength) * 100 : 0;

  return {
    count,
    remaining,
    isOverLimit,
    percentage,
    maxLength
  };
}

// 实时性能监控Hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<{
    renderTime: number;
    updateCount: number;
    averageRenderTime: number;
  }>({
    renderTime: 0,
    updateCount: 0,
    averageRenderTime: 0
  });

  const renderStartTime = useRef<number>(0);
  const totalRenderTime = useRef<number>(0);

  const startMeasure = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endMeasure = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    totalRenderTime.current += renderTime;
    
    setMetrics(prev => {
      const newUpdateCount = prev.updateCount + 1;
      const averageRenderTime = totalRenderTime.current / newUpdateCount;
      
      return {
        renderTime,
        updateCount: newUpdateCount,
        averageRenderTime
      };
    });
  }, []);

  return {
    metrics,
    startMeasure,
    endMeasure
  };
}