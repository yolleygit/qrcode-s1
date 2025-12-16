'use client';

import React, { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  callback: () => void;
  description?: string;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
      const altMatch = !!shortcut.altKey === event.altKey;
      const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
      const metaMatch = !!shortcut.metaKey === event.metaKey;

      return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch;
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      matchingShortcut.callback();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
}

// 键盘快捷键帮助组件
export function KeyboardShortcutsHelp({ 
  shortcuts, 
  isVisible, 
  onClose 
}: { 
  shortcuts: KeyboardShortcut[]; 
  isVisible: boolean; 
  onClose: () => void; 
}) {
  useKeyboardShortcuts([
    {
      key: 'Escape',
      callback: onClose
    }
  ], isVisible);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            键盘快捷键
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {shortcuts
              .filter(shortcut => shortcut.description)
              .map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {shortcut.description?.split(':')[1]?.trim() || ''}
                  </span>
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded border border-slate-300 dark:border-slate-700 font-mono">
                    {shortcut.description?.split(':')[0] || ''}
                  </kbd>
                </div>
              ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 快捷键提示组件
export function ShortcutHint({ 
  shortcut, 
  className = "" 
}: { 
  shortcut: string; 
  className?: string; 
}) {
  return (
    <kbd className={`px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded border border-slate-300 dark:border-slate-700 font-mono ${className}`}>
      {shortcut}
    </kbd>
  );
}