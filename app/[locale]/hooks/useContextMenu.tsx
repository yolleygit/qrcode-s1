'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  disabled?: boolean;
  separator?: boolean;
  shortcut?: string;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export function useContextMenu() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });
  const [items, setItems] = useState<ContextMenuItem[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const showContextMenu = useCallback((
    event: React.MouseEvent,
    menuItems: ContextMenuItem[]
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const { clientX, clientY } = event;
    
    // 确保菜单不会超出视窗边界
    const menuWidth = 180;
    const menuHeight = menuItems.length * 40;
    
    let x = clientX;
    let y = clientY;
    
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }

    setPosition({ x, y });
    setItems(menuItems);
    setIsVisible(true);
  }, []);

  const hideContextMenu = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleItemClick = useCallback((item: ContextMenuItem) => {
    if (!item.disabled) {
      item.onClick();
    }
    hideContextMenu();
  }, [hideContextMenu]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        hideContextMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideContextMenu();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isVisible, hideContextMenu]);

  return {
    isVisible,
    position,
    items,
    showContextMenu,
    hideContextMenu,
    handleItemClick,
    menuRef
  };
}

function ContextMenu({
  isVisible,
  position,
  items,
  onItemClick,
  menuRef
}: {
  isVisible: boolean;
  position: ContextMenuPosition;
  items: ContextMenuItem[];
  onItemClick: (item: ContextMenuItem) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl py-1 min-w-[180px] backdrop-blur-sm"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      {items.map((item, index) => (
        <div key={item.id || index}>
          {item.separator ? (
            <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
          ) : (
            <button
              onClick={() => onItemClick(item)}
              disabled={item.disabled}
              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                item.disabled 
                  ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.icon && (
                <item.icon className="w-4 h-4" />
              )}
              <span>{item.label}</span>
              {item.shortcut && (
                <kbd className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                  {item.shortcut}
                </kbd>
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// 右键菜单容器组件
export function ContextMenuContainer({
  children,
  menuItems,
  className = ''
}: {
  children: React.ReactNode;
  menuItems: ContextMenuItem[];
  className?: string;
}) {
  const {
    isVisible,
    position,
    items,
    showContextMenu,
    handleItemClick,
    menuRef
  } = useContextMenu();

  const handleContextMenu = (event: React.MouseEvent) => {
    showContextMenu(event, menuItems);
  };

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        className={className}
      >
        {children}
      </div>
      <ContextMenu
        isVisible={isVisible}
        position={position}
        items={items}
        onItemClick={handleItemClick}
        menuRef={menuRef}
      />
    </>
  );
}