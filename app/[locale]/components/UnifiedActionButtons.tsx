'use client';

import { ReactNode, useState, useCallback } from 'react';
import { Download, Copy, Share2, Check, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useOneClickOperations, OneClickOperationConfig } from '../hooks/useOneClickOperations';
import { InlineShortcutHint } from './KeyboardShortcutHints';
import { KeyboardShortcut } from '../hooks/useKeyboardShortcuts';

export interface ActionButtonConfig {
  /** 按钮类型 */
  type: 'download' | 'copy' | 'share' | 'save' | 'print' | 'custom';
  /** 按钮文本 */
  label: string;
  /** 按钮图标 */
  icon?: ReactNode;
  /** 点击处理函数（传统方式） */
  onClick?: () => void | Promise<void>;
  /** 一键操作配置（新方式） */
  oneClickConfig?: OneClickOperationConfig;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 按钮样式变体 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** 自定义类名 */
  className?: string;
  /** 工具提示 */
  tooltip?: string;
  /** 键盘快捷键 */
  shortcut?: KeyboardShortcut;
  /** 是否显示快捷键提示 */
  showShortcutHint?: boolean;
}

export interface UnifiedActionButtonsProps {
  /** 按钮配置数组 */
  buttons: ActionButtonConfig[];
  /** 布局方向 */
  direction?: 'horizontal' | 'vertical';
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否全宽显示 */
  fullWidth?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 是否显示分隔符 */
  showDivider?: boolean;
}

export function UnifiedActionButtons({
  buttons,
  direction = 'horizontal',
  size = 'md',
  fullWidth = false,
  className,
  showDivider = false
}: UnifiedActionButtonsProps) {
  const [feedbackStates, setFeedbackStates] = useState<Record<string, boolean>>({});
  const { executeOperation, getOperationState } = useOneClickOperations();

  // 按钮尺寸样式
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  };

  // 按钮变体样式
  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-slate-600 hover:bg-slate-700 text-white shadow-sm hover:shadow-md',
    outline: 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
  };

  // 默认图标映射
  const defaultIcons = {
    download: <Download className="w-4 h-4" />,
    copy: <Copy className="w-4 h-4" />,
    share: <Share2 className="w-4 h-4" />,
    save: <Download className="w-4 h-4" />,
    print: <ExternalLink className="w-4 h-4" />,
    custom: <ExternalLink className="w-4 h-4" />
  };

  // 处理按钮点击
  const handleButtonClick = useCallback(async (button: ActionButtonConfig, index: number) => {
    if (button.disabled || button.loading) return;

    const operationId = `button-${index}-${button.type}`;

    try {
      if (button.oneClickConfig) {
        // 使用一键操作系统
        await executeOperation(operationId, button.oneClickConfig);
      } else if (button.onClick) {
        // 使用传统点击处理
        await button.onClick();
        
        // 显示成功反馈（仅对复制和分享操作）
        if (button.type === 'copy' || button.type === 'share') {
          setFeedbackStates(prev => ({ ...prev, [index]: true }));
          setTimeout(() => {
            setFeedbackStates(prev => ({ ...prev, [index]: false }));
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Action button error:', error);
    }
  }, [executeOperation]);

  return (
    <div className={cn(
      'flex gap-3',
      direction === 'vertical' && 'flex-col',
      direction === 'horizontal' && 'flex-row flex-wrap',
      fullWidth && 'w-full',
      className
    )}>
      {buttons.map((button, index) => {
        const operationId = `button-${index}-${button.type}`;
        const operationState = getOperationState(operationId);
        const isShowingFeedback = feedbackStates[index];
        const isOperationLoading = operationState.isLoading;
        const isLoading = button.loading || isOperationLoading;
        const buttonIcon = button.icon || defaultIcons[button.type];
        
        return (
          <div key={index} className={cn(
            fullWidth && direction === 'horizontal' && 'flex-1',
            showDivider && index > 0 && direction === 'horizontal' && 'border-l border-slate-200 dark:border-slate-700 pl-3 ml-0'
          )}>
            <div className="relative">
              <button
                onClick={() => handleButtonClick(button, index)}
                disabled={button.disabled || isLoading}
                className={cn(
                  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation',
                  sizeStyles[size],
                  variantStyles[button.variant || 'outline'],
                  fullWidth && 'w-full',
                  // 悬停和激活效果
                  !button.disabled && !isLoading && 'hover:scale-[1.02] active:scale-[0.98]',
                  // 加载状态
                  isLoading && 'cursor-wait',
                  // 成功反馈状态
                  isShowingFeedback && button.type === 'copy' && 'bg-green-600 text-white border-green-600',
                  isShowingFeedback && button.type === 'share' && 'bg-blue-600 text-white border-blue-600',
                  // 操作成功状态
                  operationState.lastResult?.success && 'ring-2 ring-green-500/20',
                  button.className
                )}
                title={button.tooltip}
              >
                {/* 图标 */}
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isShowingFeedback ? (
                  <Check className="w-4 h-4" />
                ) : (
                  buttonIcon
                )}
                
                {/* 文本 */}
                <span>
                  {isLoading 
                    ? '处理中...' 
                    : isShowingFeedback 
                      ? (button.type === 'copy' ? '已复制' : button.type === 'share' ? '已分享' : button.label)
                      : button.label
                  }
                </span>
                
                {/* 快捷键提示 */}
                {button.shortcut && button.showShortcutHint && !isLoading && (
                  <InlineShortcutHint 
                    shortcut={button.shortcut}
                    size="sm"
                  />
                )}
              </button>
              
              {/* 操作结果指示器 */}
              {operationState.lastResult && (
                <div className={cn(
                  'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900',
                  operationState.lastResult.success ? 'bg-green-500' : 'bg-red-500'
                )} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 预设的常用按钮配置
export const createDownloadButton = (
  data: string | Blob | File,
  filename?: string,
  options?: Partial<ActionButtonConfig>
): ActionButtonConfig => ({
  type: 'download',
  label: '下载',
  oneClickConfig: {
    type: 'download',
    data,
    filename,
    showSuccessToast: true,
    showErrorToast: true,
    retryConfig: { maxRetries: 3, delay: 500 }
  },
  variant: 'primary',
  shortcut: {
    key: 's',
    ctrlKey: true,
    callback: () => {},
    description: 'Ctrl+S: 下载文件'
  },
  showShortcutHint: true,
  ...options
});

export const createCopyButton = (
  data: string | Blob | File,
  options?: Partial<ActionButtonConfig>
): ActionButtonConfig => ({
  type: 'copy',
  label: '复制',
  oneClickConfig: {
    type: 'copy',
    data,
    showSuccessToast: true,
    showErrorToast: true,
    retryConfig: { maxRetries: 2, delay: 300 }
  },
  variant: 'outline',
  shortcut: {
    key: 'c',
    ctrlKey: true,
    shiftKey: true,
    callback: () => {},
    description: 'Ctrl+Shift+C: 复制内容'
  },
  showShortcutHint: true,
  ...options
});

export const createShareButton = (
  data: string | Blob | File,
  filename?: string,
  options?: Partial<ActionButtonConfig>
): ActionButtonConfig => ({
  type: 'share',
  label: '分享',
  oneClickConfig: {
    type: 'share',
    data,
    filename,
    showSuccessToast: true,
    showErrorToast: true,
    retryConfig: { maxRetries: 1 }
  },
  variant: 'outline',
  shortcut: {
    key: 'u',
    ctrlKey: true,
    callback: () => {},
    description: 'Ctrl+U: 分享内容'
  },
  showShortcutHint: true,
  ...options
});

export const createSaveButton = (
  data: string | Blob | File,
  filename?: string,
  options?: Partial<ActionButtonConfig>
): ActionButtonConfig => ({
  type: 'save',
  label: '另存为',
  oneClickConfig: {
    type: 'save',
    data,
    filename,
    showSuccessToast: true,
    showErrorToast: true,
    retryConfig: { maxRetries: 2, delay: 500 }
  },
  variant: 'outline',
  shortcut: {
    key: 's',
    ctrlKey: true,
    shiftKey: true,
    callback: () => {},
    description: 'Ctrl+Shift+S: 另存为'
  },
  showShortcutHint: true,
  ...options
});

export const createPrintButton = (
  data: string | Blob | File,
  options?: Partial<ActionButtonConfig>
): ActionButtonConfig => ({
  type: 'print',
  label: '打印',
  oneClickConfig: {
    type: 'print',
    data,
    showSuccessToast: true,
    showErrorToast: true,
    retryConfig: { maxRetries: 1 }
  },
  variant: 'ghost',
  shortcut: {
    key: 'p',
    ctrlKey: true,
    callback: () => {},
    description: 'Ctrl+P: 打印'
  },
  showShortcutHint: true,
  ...options
});

// 预设的按钮组合
export const createStandardQRActions = (config: {
  data: string | Blob | File;
  filename?: string;
  includeShare?: boolean;
  includeSave?: boolean;
  includePrint?: boolean;
  disabled?: boolean;
}): ActionButtonConfig[] => {
  const buttons = [
    createDownloadButton(config.data, config.filename, { disabled: config.disabled }),
    createCopyButton(config.data, { disabled: config.disabled })
  ];

  if (config.includeShare) {
    buttons.push(createShareButton(config.data, config.filename, { disabled: config.disabled }));
  }

  if (config.includeSave) {
    buttons.push(createSaveButton(config.data, config.filename, { disabled: config.disabled }));
  }

  if (config.includePrint) {
    buttons.push(createPrintButton(config.data, { disabled: config.disabled }));
  }

  return buttons;
};

// 扩展的操作按钮组合 - 支持更多操作类型
export const createExtendedQRActions = (config: {
  data: string | Blob | File;
  filename?: string;
  operations?: ('download' | 'copy' | 'share' | 'save' | 'print')[];
  disabled?: boolean;
  customActions?: ActionButtonConfig[];
}): ActionButtonConfig[] => {
  const buttons: ActionButtonConfig[] = [];
  const operations = config.operations || ['download', 'copy'];

  // 根据配置添加操作
  operations.forEach(operation => {
    switch (operation) {
      case 'download':
        buttons.push(createDownloadButton(config.data, config.filename, { disabled: config.disabled }));
        break;
      case 'copy':
        buttons.push(createCopyButton(config.data, { disabled: config.disabled }));
        break;
      case 'share':
        buttons.push(createShareButton(config.data, config.filename, { disabled: config.disabled }));
        break;
      case 'save':
        buttons.push(createSaveButton(config.data, config.filename, { disabled: config.disabled }));
        break;
      case 'print':
        buttons.push(createPrintButton(config.data, { disabled: config.disabled }));
        break;
    }
  });

  // 自定义操作
  if (config.customActions) {
    buttons.push(...config.customActions);
  }

  return buttons;
};