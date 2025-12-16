'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// 焦点管理Hook
export function useFocusManagement() {
  const focusableElementsRef = useRef<HTMLElement[]>([]);
  const currentFocusIndex = useRef<number>(-1);

  const updateFocusableElements = useCallback((container?: HTMLElement) => {
    const root = container || document;
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    focusableElementsRef.current = Array.from(
      root.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }, []);

  const focusFirst = useCallback(() => {
    if (focusableElementsRef.current.length > 0) {
      focusableElementsRef.current[0].focus();
      currentFocusIndex.current = 0;
    }
  }, []);

  const focusLast = useCallback(() => {
    const elements = focusableElementsRef.current;
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
      currentFocusIndex.current = elements.length - 1;
    }
  }, []);

  const focusNext = useCallback(() => {
    const elements = focusableElementsRef.current;
    if (elements.length === 0) return;

    currentFocusIndex.current = (currentFocusIndex.current + 1) % elements.length;
    elements[currentFocusIndex.current].focus();
  }, []);

  const focusPrevious = useCallback(() => {
    const elements = focusableElementsRef.current;
    if (elements.length === 0) return;

    currentFocusIndex.current = currentFocusIndex.current <= 0 
      ? elements.length - 1 
      : currentFocusIndex.current - 1;
    elements[currentFocusIndex.current].focus();
  }, []);

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    event.preventDefault();
    
    if (event.shiftKey) {
      focusPrevious();
    } else {
      focusNext();
    }
  }, [focusNext, focusPrevious]);

  return {
    updateFocusableElements,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    trapFocus,
    focusableElements: focusableElementsRef.current
  };
}

// 键盘导航Hook
export function useKeyboardNavigation(
  onEscape?: () => void,
  onEnter?: () => void,
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onEscape?.();
          break;
        case 'Enter':
          if (event.target instanceof HTMLButtonElement || 
              (event.target instanceof HTMLElement && event.target.getAttribute('role') === 'button')) {
            onEnter?.();
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          onArrowKeys?.('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          onArrowKeys?.('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onArrowKeys?.('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          onArrowKeys?.('right');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onEnter, onArrowKeys]);
}

// 屏幕阅读器公告Hook
export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = useState<string>('');
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(message);
    
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      
      // 清除后重新设置，确保屏幕阅读器能够读取
      setTimeout(() => {
        setAnnouncement('');
        setTimeout(() => {
          setAnnouncement(message);
        }, 100);
      }, 100);
    }
  }, []);

  const AnnouncementRegion = useCallback(() => (
    <div
      ref={announcementRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  ), [announcement]);

  return {
    announce,
    AnnouncementRegion
  };
}

// 颜色对比度检查Hook
export function useColorContrast() {
  const checkContrast = useCallback((foreground: string, background: string): {
    ratio: number;
    level: 'AAA' | 'AA' | 'A' | 'FAIL';
    isAccessible: boolean;
  } => {
    // 将颜色转换为RGB
    const getRGB = (color: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return [r, g, b];
    };

    // 计算相对亮度
    const getLuminance = (rgb: number[]) => {
      const [r, g, b] = rgb.map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    try {
      const fgRGB = getRGB(foreground);
      const bgRGB = getRGB(background);
      
      const fgLuminance = getLuminance(fgRGB);
      const bgLuminance = getLuminance(bgRGB);
      
      const lighter = Math.max(fgLuminance, bgLuminance);
      const darker = Math.min(fgLuminance, bgLuminance);
      
      const ratio = (lighter + 0.05) / (darker + 0.05);
      
      let level: 'AAA' | 'AA' | 'A' | 'FAIL';
      if (ratio >= 7) level = 'AAA';
      else if (ratio >= 4.5) level = 'AA';
      else if (ratio >= 3) level = 'A';
      else level = 'FAIL';
      
      return {
        ratio,
        level,
        isAccessible: ratio >= 4.5
      };
    } catch (error) {
      return {
        ratio: 0,
        level: 'FAIL',
        isAccessible: false
      };
    }
  }, []);

  return { checkContrast };
}

// 可访问性检查Hook
export function useAccessibilityChecker() {
  const [issues, setIssues] = useState<Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    element?: HTMLElement;
    fix?: string;
  }>>([]);

  const checkAccessibility = useCallback((container?: HTMLElement) => {
    const root = container || document;
    const foundIssues: typeof issues = [];

    // 检查缺失的alt属性
    const images = root.querySelectorAll('img');
    images.forEach(img => {
      if (!img.getAttribute('alt') && img.getAttribute('alt') !== '') {
        foundIssues.push({
          type: 'error',
          message: '图片缺少alt属性',
          element: img,
          fix: '为图片添加描述性的alt属性'
        });
      }
    });

    // 检查缺失的标签
    const inputs = root.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');
      
      if (!ariaLabel && !ariaLabelledby && (!id || !root.querySelector(`label[for="${id}"]`))) {
        foundIssues.push({
          type: 'error',
          message: '表单控件缺少标签',
          element: input as HTMLElement,
          fix: '添加label元素或aria-label属性'
        });
      }
    });

    // 检查按钮文本
    const buttons = root.querySelectorAll('button');
    buttons.forEach(button => {
      const text = button.textContent?.trim();
      const ariaLabel = button.getAttribute('aria-label');
      
      if (!text && !ariaLabel) {
        foundIssues.push({
          type: 'error',
          message: '按钮缺少可访问的文本',
          element: button,
          fix: '添加按钮文本或aria-label属性'
        });
      }
    });

    // 检查标题层级
    const headings = Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let lastLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        foundIssues.push({
          type: 'warning',
          message: `标题层级跳跃：从h${lastLevel}跳到h${level}`,
          element: heading as HTMLElement,
          fix: '确保标题层级连续递增'
        });
      }
      lastLevel = level;
    });

    // 检查链接文本
    const links = root.querySelectorAll('a[href]');
    links.forEach(link => {
      const text = link.textContent?.trim();
      if (!text || text.length < 4) {
        foundIssues.push({
          type: 'warning',
          message: '链接文本过短或缺失',
          element: link as HTMLElement,
          fix: '提供描述性的链接文本'
        });
      }
    });

    setIssues(foundIssues);
    return foundIssues;
  }, []);

  return {
    issues,
    checkAccessibility
  };
}

// 跳转链接Hook
export function useSkipLinks() {
  const skipLinksRef = useRef<HTMLDivElement>(null);
  const [skipLinks] = useState([
    { href: '#main-content', label: '跳转到主要内容' },
    { href: '#navigation', label: '跳转到导航' },
    { href: '#footer', label: '跳转到页脚' }
  ]);

  const SkipLinks = useCallback(() => (
    <div
      ref={skipLinksRef}
      className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-0 focus-within:left-0 focus-within:z-50 focus-within:bg-white focus-within:p-4 focus-within:shadow-lg"
    >
      {skipLinks.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="block p-2 text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={(e) => {
            e.preventDefault();
            const target = document.querySelector(link.href);
            if (target) {
              (target as HTMLElement).focus();
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  ), [skipLinks]);

  return { SkipLinks };
}

// 减少动画Hook（尊重用户的动画偏好）
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}