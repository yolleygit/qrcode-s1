'use client';

import { useState, useEffect } from 'react';
import { Keyboard, X, Command } from 'lucide-react';
import { KeyboardShortcut } from '../hooks/useKeyboardShortcuts';
import { getShortcutDisplayText } from '../hooks/useUnifiedKeyboardShortcuts';

export interface KeyboardShortcutHintsProps {
  /** 可用的快捷键列表 */
  shortcuts: KeyboardShortcut[];
  /** 是否显示提示 */
  visible?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 显示位置 */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  /** 是否紧凑模式 */
  compact?: boolean;
  /** 自定义类名 */
  className?: string;
}

export function KeyboardShortcutHints({
  shortcuts,
  visible = false,
  onClose,
  position = 'bottom-right',
  compact = false,
  className
}: KeyboardShortcutHintsProps) {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  if (!isVisible || shortcuts.length === 0) {
    return null;
  }

  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'center': 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <div className={`
      ${positionClasses[position]}
      z-50 max-w-sm w-full
      bg-white dark:bg-slate-900 
      border border-slate-200 dark:border-slate-700
      rounded-xl shadow-lg backdrop-blur-sm
      animate-in fade-in slide-in-from-bottom-2 duration-300
      ${className}
    `}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h3 className="text-sm font-medium text-slate-900 dark:text-white">
            键盘快捷键
          </h3>
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      {/* 快捷键列表 */}
      <div className={`p-4 space-y-3 max-h-80 overflow-y-auto ${compact ? 'space-y-2' : ''}`}>
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3"
          >
            <span className={`
              text-slate-700 dark:text-slate-300 flex-1
              ${compact ? 'text-xs' : 'text-sm'}
            `}>
              {shortcut.description || '未知操作'}
            </span>
            <KeyboardShortcutBadge 
              shortcut={shortcut} 
              compact={compact}
            />
          </div>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          按 <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">Shift + ?</kbd> 再次显示此帮助
        </p>
      </div>
    </div>
  );
}

// 快捷键徽章组件
interface KeyboardShortcutBadgeProps {
  shortcut: KeyboardShortcut;
  compact?: boolean;
}

function KeyboardShortcutBadge({ shortcut, compact = false }: KeyboardShortcutBadgeProps) {
  const keys = [];
  
  // 修饰键
  if (shortcut.ctrlKey) keys.push('Ctrl');
  if (shortcut.altKey) keys.push('Alt');
  if (shortcut.shiftKey) keys.push('Shift');
  if (shortcut.metaKey) keys.push('Cmd');
  
  // 主键
  const keyMap: Record<string, string> = {
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'Delete': 'Del',
    'Escape': 'Esc',
    ' ': 'Space'
  };
  
  const mainKey = keyMap[shortcut.key] || shortcut.key.toUpperCase();
  keys.push(mainKey);

  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <span key={index} className="flex items-center gap-1">
          <kbd className={`
            inline-flex items-center justify-center
            bg-slate-200 dark:bg-slate-700 
            text-slate-700 dark:text-slate-300
            border border-slate-300 dark:border-slate-600
            rounded font-mono font-medium
            ${compact ? 'px-1.5 py-0.5 text-xs min-w-[20px] h-5' : 'px-2 py-1 text-xs min-w-[24px] h-6'}
          `}>
            {key === 'Cmd' && <Command className="w-3 h-3" />}
            {!['Cmd'].includes(key) && key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="text-slate-400 dark:text-slate-500 text-xs">+</span>
          )}
        </span>
      ))}
    </div>
  );
}

// 浮动快捷键提示组件
export interface FloatingShortcutHintProps {
  /** 快捷键 */
  shortcut: KeyboardShortcut;
  /** 是否显示 */
  visible: boolean;
  /** 触发元素的位置 */
  targetRect?: DOMRect;
  /** 提示文本 */
  hint?: string;
}

export function FloatingShortcutHint({
  shortcut,
  visible,
  targetRect,
  hint
}: FloatingShortcutHintProps) {
  if (!visible || !targetRect) {
    return null;
  }

  const shortcutText = getShortcutDisplayText(shortcut);

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        top: targetRect.bottom + 8,
        left: targetRect.left + targetRect.width / 2,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="
        bg-slate-900 dark:bg-slate-800 text-white text-xs
        px-2 py-1 rounded-md shadow-lg
        animate-in fade-in slide-in-from-top-1 duration-200
      ">
        {hint && (
          <div className="text-slate-300 mb-1">{hint}</div>
        )}
        <div className="font-mono">{shortcutText}</div>
        {/* 箭头 */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45" />
      </div>
    </div>
  );
}

// 内联快捷键提示组件
export interface InlineShortcutHintProps {
  /** 快捷键 */
  shortcut: KeyboardShortcut;
  /** 是否显示 */
  visible?: boolean;
  /** 尺寸 */
  size?: 'sm' | 'md';
}

export function InlineShortcutHint({
  shortcut,
  visible = true,
  size = 'sm'
}: InlineShortcutHintProps) {
  if (!visible) {
    return null;
  }

  const shortcutText = getShortcutDisplayText(shortcut);
  
  return (
    <span className={`
      inline-flex items-center gap-1 
      text-slate-500 dark:text-slate-400
      ${size === 'sm' ? 'text-xs' : 'text-sm'}
    `}>
      <kbd className={`
        px-1 py-0.5 
        bg-slate-100 dark:bg-slate-800 
        border border-slate-200 dark:border-slate-700
        rounded font-mono
        ${size === 'sm' ? 'text-xs' : 'text-sm'}
      `}>
        {shortcutText}
      </kbd>
    </span>
  );
}

// 快捷键帮助触发器
export interface ShortcutHelpTriggerProps {
  /** 快捷键列表 */
  shortcuts: KeyboardShortcut[];
  /** 触发器文本 */
  children?: React.ReactNode;
  /** 是否紧凑模式 */
  compact?: boolean;
}

export function ShortcutHelpTrigger({
  shortcuts,
  children,
  compact = false
}: ShortcutHelpTriggerProps) {
  const [showHints, setShowHints] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowHints(true)}
        className="
          inline-flex items-center gap-2 
          px-2 py-1 
          text-slate-500 dark:text-slate-400 
          hover:text-slate-700 dark:hover:text-slate-300
          hover:bg-slate-100 dark:hover:bg-slate-800
          rounded-md transition-colors
          text-xs
        "
        title="显示键盘快捷键 (Shift + ?)"
      >
        <Keyboard className="w-3 h-3" />
        {children || '快捷键'}
      </button>

      <KeyboardShortcutHints
        shortcuts={shortcuts}
        visible={showHints}
        onClose={() => setShowHints(false)}
        compact={compact}
      />
    </>
  );
}