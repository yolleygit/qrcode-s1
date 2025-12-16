import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { debounce } from 'lodash';
import QRCodeStyling, { ErrorCorrectionLevel, DotType, CornerSquareType } from 'qr-code-styling';
import { smartDebounce, withCache, performanceMonitor } from '../lib/utils';

export interface QRStyleConfig {
  size: number;
  margin: number;
  colorDark: string;
  colorLight: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  dotType?: DotType;
  cornerSquareType?: CornerSquareType;
}

export interface PreviewConfig {
  content: string;
  style: QRStyleConfig;
  type: 'static' | 'totp' | 'encrypted';
}

export const DEFAULT_QR_STYLE: QRStyleConfig = {
  size: 256,
  margin: 4,
  colorDark: '#000000',
  colorLight: '#ffffff',
  errorCorrectionLevel: 'M',
  dotType: 'rounded',
  cornerSquareType: 'extra-rounded'
};

export interface GenerationProgress {
  stage: 'preparing' | 'generating' | 'encoding' | 'complete';
  progress: number; // 0-100
  message: string;
}

export function useRealTimePreview(initialConfig?: Partial<PreviewConfig>) {
  const [config, setConfig] = useState<PreviewConfig>({
    content: '',
    style: DEFAULT_QR_STYLE,
    type: 'static',
    ...initialConfig
  });
  
  const [previewData, setPreviewData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [generationTime, setGenerationTime] = useState<number>(0);
  
  // 缓存和性能监控
  const cacheRef = useRef(new Map<string, { data: string; timestamp: number }>());
  const lastConfigRef = useRef<string>('');
  const generationCountRef = useRef(0);
  
  // 生成缓存键
  const getCacheKey = useCallback((config: PreviewConfig): string => {
    return JSON.stringify({
      content: config.content,
      style: config.style,
      type: config.type
    });
  }, []);
  
  // 检查缓存
  const checkCache = useCallback((key: string): string | null => {
    const cached = cacheRef.current.get(key);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      // 缓存5分钟
      if (age < 5 * 60 * 1000) {
        return cached.data;
      } else {
        cacheRef.current.delete(key);
      }
    }
    return null;
  }, []);
  
  // 更新缓存
  const updateCache = useCallback((key: string, data: string) => {
    // 限制缓存大小为50个条目
    if (cacheRef.current.size >= 50) {
      const entries = Array.from(cacheRef.current.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      // 删除最旧的10个条目
      for (let i = 0; i < 10; i++) {
        cacheRef.current.delete(entries[i][0]);
      }
    }
    
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);
  
  // 优化的二维码生成函数
  const generateQRCode = useCallback(async (config: PreviewConfig): Promise<string> => {
    if (!config.content.trim()) {
      throw new Error('内容不能为空');
    }
    
    const endMeasure = performanceMonitor.start('qr-generation');
    
    try {
      // 更新进度
      setProgress({ stage: 'preparing', progress: 10, message: '准备生成...' });
      
      const qrCode = new QRCodeStyling({
        width: config.style.size,
        height: config.style.size,
        type: 'svg',
        data: config.content,
        dotsOptions: {
          color: config.style.colorDark,
          type: config.style.dotType || 'rounded'
        },
        backgroundOptions: {
          color: config.style.colorLight,
        },
        cornersSquareOptions: {
          type: config.style.cornerSquareType || 'extra-rounded',
          color: config.style.colorDark
        },
        cornersDotOptions: {
          type: 'dot',
          color: config.style.colorDark
        },
        qrOptions: {
          errorCorrectionLevel: config.style.errorCorrectionLevel
        },
        margin: config.style.margin
      });
      
      setProgress({ stage: 'generating', progress: 50, message: '生成二维码...' });
      
      return new Promise((resolve, reject) => {
        qrCode.getRawData('svg').then((data) => {
          setProgress({ stage: 'encoding', progress: 80, message: '编码数据...' });
          
          if (data) {
            // Handle both Blob and Buffer types
            let blob: Blob;
            if (data instanceof Blob) {
              blob = data;
            } else {
              const uint8Array = new Uint8Array(data);
              blob = new Blob([uint8Array], { type: 'image/svg+xml' });
            }
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const duration = endMeasure();
              setGenerationTime(duration);
              setProgress({ stage: 'complete', progress: 100, message: '完成' });
              
              // 短暂显示完成状态后清除进度
              setTimeout(() => setProgress(null), 500);
              
              resolve(result);
            };
            reader.onerror = () => {
              endMeasure();
              reject(new Error('生成二维码失败'));
            };
            reader.readAsDataURL(blob);
          } else {
            endMeasure();
            reject(new Error('生成二维码失败'));
          }
        }).catch((err) => {
          endMeasure();
          reject(err);
        });
      });
    } catch (error) {
      endMeasure();
      throw error;
    }
  }, []);
  
  // 智能防抖生成函数 - 根据使用频率动态调整延迟
  const debouncedGenerate = useMemo(
    () => smartDebounce(async (config: PreviewConfig) => {
      if (!config.content.trim()) {
        setPreviewData(null);
        setError(null);
        setProgress(null);
        return;
      }
      
      const cacheKey = getCacheKey(config);
      
      // 检查缓存
      const cachedData = checkCache(cacheKey);
      if (cachedData) {
        setPreviewData(cachedData);
        setError(null);
        setProgress(null);
        return;
      }
      
      // 避免重复生成相同配置
      if (lastConfigRef.current === cacheKey) {
        return;
      }
      
      lastConfigRef.current = cacheKey;
      setIsGenerating(true);
      setError(null);
      generationCountRef.current++;
      
      try {
        const qrCode = await generateQRCode(config);
        setPreviewData(qrCode);
        
        // 更新缓存
        updateCache(cacheKey, qrCode);
      } catch (error) {
        console.error('QR generation failed:', error);
        setError(error instanceof Error ? error.message : '生成失败');
        setPreviewData(null);
        setProgress(null);
      } finally {
        setIsGenerating(false);
      }
    }, 150, 400), // 最小150ms，最大400ms延迟
    [generateQRCode, getCacheKey, checkCache, updateCache]
  );
  
  // 当配置变化时自动生成预览
  useEffect(() => {
    debouncedGenerate(config);
    return () => debouncedGenerate.cancel();
  }, [config, debouncedGenerate]);
  
  // 更新内容
  const updateContent = useCallback((content: string) => {
    setConfig(prev => ({ ...prev, content }));
  }, []);
  
  // 更新样式
  const updateStyle = useCallback((style: Partial<QRStyleConfig>) => {
    setConfig(prev => ({ 
      ...prev, 
      style: { ...prev.style, ...style } 
    }));
  }, []);
  
  // 更新类型
  const updateType = useCallback((type: PreviewConfig['type']) => {
    setConfig(prev => ({ ...prev, type }));
  }, []);
  
  // 重置配置
  const resetConfig = useCallback(() => {
    setConfig({
      content: '',
      style: DEFAULT_QR_STYLE,
      type: 'static'
    });
  }, []);
  
  // 立即生成（跳过防抖）
  const generateImmediately = useCallback(async () => {
    debouncedGenerate.cancel();
    await debouncedGenerate(config);
  }, [config, debouncedGenerate]);
  
  // 清理缓存
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    performanceMonitor.clear('qr-generation');
  }, []);
  
  // 获取性能统计
  const getPerformanceStats = useCallback(() => {
    return {
      generationCount: generationCountRef.current,
      cacheSize: cacheRef.current.size,
      lastGenerationTime: generationTime,
      stats: performanceMonitor.getStats('qr-generation')
    };
  }, [generationTime]);
  
  return {
    // 状态
    config,
    previewData,
    isGenerating,
    error,
    progress,
    generationTime,
    
    // 操作方法
    updateContent,
    updateStyle,
    updateType,
    resetConfig,
    generateImmediately,
    clearCache,
    
    // 工具方法
    generateQRCode: () => generateQRCode(config),
    getPerformanceStats
  };
}