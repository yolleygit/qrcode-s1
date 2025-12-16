'use client';

import { useEffect, useCallback } from 'react';
import { KeyboardShortcut } from './useKeyboardShortcuts';

// 统一的键盘快捷键定义
export interface UnifiedShortcuts {
  // 通用操作
  download?: () => void;
  copy?: () => void;
  share?: () => void;
  save?: () => void;
  print?: () => void;
  
  // 导航操作
  goHome?: () => void;
  goBack?: () => void;
  
  // 功能切换
  toggleMode?: () => void;
  toggleTheme?: () => void;
  
  // 清理操作
  clear?: () => void;
  reset?: () => void;
  
  // 帮助
  showHelp?: () => void;
  
  // 自定义快捷键
  custom?: KeyboardShortcut[];
}

// 标准快捷键映射
const STANDARD_SHORTCUTS: Record<keyof Omit<UnifiedShortcuts, 'custom'>, KeyboardShortcut> = {
  download: {
    key: 's',
    ctrlKey: true,
    callback: () => {},
    description: 'Ctrl+S: 下载/保存'
  },
  copy: {
    key: 'c',
    ctrlKey: true,
    shiftKey: true,
    callback: () => {},
    description: 'Ctrl+Shift+C: 复制内容'
  },
  share: {
    key: 'u',
    ctrlKey: true,
    callback: () => {},
    description: 'Ctrl+U: 分享'
  },
  save: {
    key: 's',
    ctrlKey: true,
    shiftKey: true,
    callback: () => {},
    description: 'Ctrl+Shift+S: 另存为'
  },
  print: {
    key: 'p',
    ctrlKey: true,
    callback: () => {},
    description: 'Ctrl+P: 打印'
  },
  goHome: {
    key: 'h',
    ctrlKey: true,
    callback: () => {},
    description: 'Ctrl+H: 返回首页'
  },
  goBack: {
    key: 'ArrowLeft',
    altKey: true,
    callback: () => {},
    description: 'Alt+←: 返回上一页'
  },
  toggleMode: {
    key: 'm',
    ctrlKey: true,
    callback: () => {},
    description: 'Ctrl+M: 切换模式'
  },
  toggleTheme: {
    key: 'd',
    ctrlKey: true,
    shiftKey: true,
    callback: () => {},
    description: 'Ctrl+Shift+D: 切换主题'
  },
  clear: {
    key: 'Delete',
    ctrlKey: true,
    callback: () => {},
    description: 'Ctrl+Delete: 清空内容'
  },
  reset: {
    key: 'r',
    ctrlKey: true,
    shiftKey: true,
    callback: () => {},
    description: 'Ctrl+Shift+R: 重置所有'
  },
  showHelp: {
    key: '?',
    shiftKey: true,
    callback: () => {},
    description: 'Shift+?: 显示帮助'
  }
};

export function useUnifiedKeyboardShortcuts(
  shortcuts: UnifiedShortcuts,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // 检查是否在输入框中
    const target = event.target as HTMLElement;
    const isInputElement = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.contentEditable === 'true';

    // 在输入框中时，只允许特定快捷键
    if (isInputElement) {
      const allowedInInput = ['showHelp', 'toggleTheme'];
      const matchedShortcut = Object.entries(STANDARD_SHORTCUTS).find(([key, shortcut]) => {
        if (!allowedInInput.includes(key)) return false;
        
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
        const altMatch = !!shortcut.altKey === event.altKey;
        const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
        const metaMatch = !!shortcut.metaKey === event.metaKey;

        return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch;
      });

      if (matchedShortcut) {
        const [actionKey] = matchedShortcut;
        const handler = shortcuts[actionKey as keyof UnifiedShortcuts];
        if (handler && typeof handler === 'function') {
          event.preventDefault();
          handler();
        }
      }
      return;
    }

    // 检查标准快捷键
    for (const [actionKey, standardShortcut] of Object.entries(STANDARD_SHORTCUTS)) {
      const keyMatch = standardShortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = !!standardShortcut.ctrlKey === event.ctrlKey;
      const altMatch = !!standardShortcut.altKey === event.altKey;
      const shiftMatch = !!standardShortcut.shiftKey === event.shiftKey;
      const metaMatch = !!standardShortcut.metaKey === event.metaKey;

      if (keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch) {
        const handler = shortcuts[actionKey as keyof UnifiedShortcuts];
        if (handler && typeof handler === 'function') {
          event.preventDefault();
          handler();
          return;
        }
      }
    }

    // 检查自定义快捷键
    if (shortcuts.custom) {
      for (const customShortcut of shortcuts.custom) {
        const keyMatch = customShortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = !!customShortcut.ctrlKey === event.ctrlKey;
        const altMatch = !!customShortcut.altKey === event.altKey;
        const shiftMatch = !!customShortcut.shiftKey === event.shiftKey;
        const metaMatch = !!customShortcut.metaKey === event.metaKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch) {
          if (customShortcut.preventDefault !== false) {
            event.preventDefault();
          }
          customShortcut.callback();
          return;
        }
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  // 返回可用的快捷键列表（用于帮助显示）
  const getAvailableShortcuts = useCallback((): KeyboardShortcut[] => {
    const availableShortcuts: KeyboardShortcut[] = [];

    // 添加已定义的标准快捷键
    for (const [actionKey, standardShortcut] of Object.entries(STANDARD_SHORTCUTS)) {
      const handler = shortcuts[actionKey as keyof UnifiedShortcuts];
      if (handler && typeof handler === 'function') {
        availableShortcuts.push({
          ...standardShortcut,
          callback: handler
        });
      }
    }

    // 添加自定义快捷键
    if (shortcuts.custom) {
      availableShortcuts.push(...shortcuts.custom);
    }

    return availableShortcuts;
  }, [shortcuts]);

  return {
    availableShortcuts: getAvailableShortcuts()
  };
}

// 预设的快捷键组合
export const createQRPageShortcuts = (handlers: {
  onDownload?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  onClear?: () => void;
  onToggleMode?: () => void;
  onShowHelp?: () => void;
  onGoHome?: () => void;
}): UnifiedShortcuts => ({
  download: handlers.onDownload,
  copy: handlers.onCopy,
  share: handlers.onShare,
  clear: handlers.onClear,
  toggleMode: handlers.onToggleMode,
  showHelp: handlers.onShowHelp,
  goHome: handlers.onGoHome
});

// 获取快捷键的显示文本
export const getShortcutDisplayText = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.metaKey) parts.push('Cmd');
  
  // 特殊键名映射
  const keyMap: Record<string, string> = {
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'Delete': 'Del',
    'Escape': 'Esc',
    ' ': 'Space'
  };
  
  const keyName = keyMap[shortcut.key] || shortcut.key.toUpperCase();
  parts.push(keyName);
  
  return parts.join('+');
};