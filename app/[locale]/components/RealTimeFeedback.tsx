'use client';

import { useState, useEffect } from 'react';
import { Check, AlertCircle, Clock, Zap, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ValidationFeedbackProps {
  isValid: boolean;
  error?: string;
  isValidating: boolean;
  successMessage?: string;
}

export function ValidationFeedback({ 
  isValid, 
  error, 
  isValidating, 
  successMessage = '输入有效' 
}: ValidationFeedbackProps) {
  return (
    <AnimatePresence mode="wait">
      {isValidating && (
        <motion.div
          key="validating"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"
        >
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>验证中...</span>
        </motion.div>
      )}
      
      {!isValidating && !isValid && error && (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </motion.div>
      )}
      
      {!isValidating && isValid && (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
        >
          <Check className="w-4 h-4" />
          <span>{successMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface CharacterCounterProps {
  count: number;
  maxLength?: number;
  remaining?: number;
  isOverLimit: boolean;
  showPercentage?: boolean;
}

export function CharacterCounter({ 
  count, 
  maxLength, 
  remaining, 
  isOverLimit, 
  showPercentage = false 
}: CharacterCounterProps) {
  const percentage = maxLength ? (count / maxLength) * 100 : 0;
  
  const getColorClass = () => {
    if (isOverLimit) return 'text-red-600 dark:text-red-400';
    if (percentage > 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className={`text-sm ${getColorClass()} transition-colors`}>
      <div className="flex items-center gap-2">
        <span>
          {count}
          {maxLength && ` / ${maxLength}`}
          {remaining !== undefined && ` (剩余 ${remaining})`}
        </span>
        
        {showPercentage && maxLength && (
          <span className="text-xs">
            ({percentage.toFixed(0)}%)
          </span>
        )}
      </div>
      
      {maxLength && (
        <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
          <motion.div
            className={`h-1 rounded-full transition-colors ${
              isOverLimit 
                ? 'bg-red-500' 
                : percentage > 80 
                ? 'bg-yellow-500' 
                : 'bg-green-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
}

interface GenerationStatusProps {
  isGenerating: boolean;
  generationTime?: number;
  error?: Error | null;
  successMessage?: string;
}

export function GenerationStatus({ 
  isGenerating, 
  generationTime, 
  error, 
  successMessage = '生成成功' 
}: GenerationStatusProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isGenerating && !error && generationTime) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, error, generationTime]);

  return (
    <AnimatePresence mode="wait">
      {isGenerating && (
        <motion.div
          key="generating"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"
        >
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>生成中...</span>
        </motion.div>
      )}
      
      {error && (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error.message}</span>
        </motion.div>
      )}
      
      {showSuccess && generationTime && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
        >
          <Check className="w-4 h-4" />
          <span>{successMessage} ({generationTime.toFixed(0)}ms)</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface PerformanceIndicatorProps {
  renderTime: number;
  updateCount: number;
  averageRenderTime: number;
  showDetails?: boolean;
}

export function PerformanceIndicator({ 
  renderTime, 
  updateCount, 
  averageRenderTime, 
  showDetails = false 
}: PerformanceIndicatorProps) {
  const getPerformanceLevel = (time: number) => {
    if (time < 16) return { level: 'excellent', color: 'text-green-600', label: '优秀' };
    if (time < 33) return { level: 'good', color: 'text-blue-600', label: '良好' };
    if (time < 50) return { level: 'fair', color: 'text-yellow-600', label: '一般' };
    return { level: 'poor', color: 'text-red-600', label: '较慢' };
  };

  const performance = getPerformanceLevel(averageRenderTime);

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-1 text-xs ${performance.color}`}>
        <TrendingUp className="w-3 h-3" />
        <span>{performance.label}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-gray-600 dark:text-gray-400">性能指标</span>
        <span className={performance.color}>{performance.label}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-gray-500 dark:text-gray-400">当前渲染</div>
          <div className="font-mono">{renderTime.toFixed(1)}ms</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">平均渲染</div>
          <div className="font-mono">{averageRenderTime.toFixed(1)}ms</div>
        </div>
      </div>
      
      <div>
        <div className="text-gray-500 dark:text-gray-400">更新次数</div>
        <div className="font-mono">{updateCount}</div>
      </div>
    </div>
  );
}

interface ProgressiveDisclosureProps {
  isExpanded: boolean;
  onToggle: () => void;
  summary: string;
  children: React.ReactNode;
  level?: 'basic' | 'advanced' | 'expert';
}

export function ProgressiveDisclosure({ 
  isExpanded, 
  onToggle, 
  summary, 
  children, 
  level = 'basic' 
}: ProgressiveDisclosureProps) {
  const levelStyles = {
    basic: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20',
    advanced: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20',
    expert: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
  };

  const levelLabels = {
    basic: '基础',
    advanced: '高级',
    expert: '专家'
  };

  return (
    <div className={`border rounded-lg ${levelStyles[level]}`}>
      <button
        onClick={onToggle}
        className="w-full p-4 text-left flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium">{summary}</span>
          <span className="text-xs px-2 py-1 bg-white/50 dark:bg-black/20 rounded-full">
            {levelLabels[level]}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-black/10 dark:border-white/10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface RealTimePreviewProps {
  isLoading: boolean;
  error?: string;
  children: React.ReactNode;
  loadingText?: string;
  emptyText?: string;
}

export function RealTimePreview({ 
  isLoading, 
  error, 
  children, 
  loadingText = '生成中...',
  emptyText = '输入内容开始生成'
}: RealTimePreviewProps) {
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10"
          >
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span>{loadingText}</span>
            </div>
          </motion.div>
        )}
        
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20 z-10"
          >
            <div className="text-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-6">
        {children || (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            <Clock className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">{emptyText}</p>
          </div>
        )}
      </div>
    </div>
  );
}