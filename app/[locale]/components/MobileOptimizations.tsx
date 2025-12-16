'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 移动端键盘适配Hook
export function useMobileKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const viewport = window.visualViewport;
      if (viewport) {
        const keyboardHeight = window.innerHeight - viewport.height;
        setKeyboardHeight(keyboardHeight);
        setIsKeyboardOpen(keyboardHeight > 150); // 键盘高度阈值
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize);
      };
    }

    // 降级方案：监听窗口大小变化
    const handleWindowResize = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = window.screen.height - currentHeight;
      setIsKeyboardOpen(heightDiff > 150);
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  return {
    keyboardHeight,
    isKeyboardOpen
  };
}

// 移动端触摸优化Hook - Enhanced version
export function useMobileTouch() {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const point = { x: touch.clientX, y: touch.clientY };
    setTouchStart(point);
    setTouchEnd(null);
    setIsLongPress(false);

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
    }, 500);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });

    // Cancel long press on movement
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!touchStart || !touchEnd) return null;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // 最小滑动距离
    const minSwipeDistance = 50;

    if (Math.max(absDeltaX, absDeltaY) < minSwipeDistance) {
      return null;
    }

    if (absDeltaX > absDeltaY) {
      // 水平滑动
      return deltaX > 0 ? 'right' : 'left';
    } else {
      // 垂直滑动
      return deltaY > 0 ? 'down' : 'up';
    }
  }, [touchStart, touchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    getSwipeDirection: handleTouchEnd,
    isLongPress
  };
}

// 移动端安全区域Hook
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
      });
    };

    updateSafeArea();
    window.addEventListener('orientationchange', updateSafeArea);
    
    return () => {
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
}

// 移动端优化的输入框组件
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function MobileOptimizedInput({ 
  label, 
  error, 
  onFocus, 
  onBlur, 
  className = '',
  ...props 
}: MobileInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { isKeyboardOpen } = useMobileKeyboard();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    
    // 移动端聚焦时滚动到视图中
    if (inputRef.current && isKeyboardOpen) {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            w-full px-4 py-3 text-base border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200
            min-h-[44px] touch-manipulation
            ${isFocused ? 'transform scale-[1.02]' : ''}
            ${error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 dark:border-gray-600'
            }
            ${className}
          `}
          {...props}
        />
        
        {/* 移动端清除按钮 */}
        {isFocused && props.value && (
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.value = '';
                inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

// 移动端底部抽屉组件
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'auto' | 'half' | 'full';
}

export function MobileDrawer({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  height = 'auto' 
}: MobileDrawerProps) {
  const { touchHandlers, getSwipeDirection } = useMobileTouch();
  const { isKeyboardOpen } = useMobileKeyboard();
  const safeArea = useSafeArea();

  const heightClasses = {
    auto: 'max-h-[80vh]',
    half: 'h-[50vh]',
    full: 'h-full'
  };

  const handleTouchEnd = () => {
    const direction = getSwipeDirection();
    if (direction === 'down') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* 抽屉内容 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl z-50
              ${heightClasses[height]}
              ${isKeyboardOpen ? 'pb-0' : ''}
            `}
            style={{ 
              paddingBottom: isKeyboardOpen ? 0 : safeArea.bottom 
            }}
            {...touchHandlers}
            onTouchEnd={handleTouchEnd}
          >
            {/* 拖拽指示器 */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>
            
            {/* 头部 */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {/* 内容 */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// 移动端滚动优化组件
export function MobileScrollContainer({ 
  children, 
  className = '',
  showScrollIndicator = true 
}: {
  children: React.ReactNode;
  className?: string;
  showScrollIndicator?: boolean;
}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const progress = scrollTop / (scrollHeight - clientHeight);
    setScrollProgress(progress);

    setIsScrolling(true);
    
    // 清除之前的定时器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // 设置新的定时器
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`
          overflow-y-auto overscroll-behavior-y-contain
          -webkit-overflow-scrolling: touch
          ${className}
        `}
        style={{
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
        }}
      >
        {children}
      </div>
      
      {/* 滚动指示器 */}
      {showScrollIndicator && (
        <div className={`
          absolute right-1 top-2 bottom-2 w-1 bg-gray-200 dark:bg-gray-700 rounded-full
          transition-opacity duration-300
          ${isScrolling ? 'opacity-100' : 'opacity-0'}
        `}>
          <div
            className="bg-blue-500 rounded-full transition-all duration-150 ease-out"
            style={{
              height: `${Math.max(scrollProgress * 100, 10)}%`,
              transform: `translateY(${scrollProgress * 100}%)`
            }}
          />
        </div>
      )}
    </div>
  );
}

// 移动端快速操作按钮
export function MobileFAB({ 
  onClick, 
  icon, 
  label,
  position = 'bottom-right' 
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}) {
  const [isPressed, setIsPressed] = useState(false);
  const safeArea = useSafeArea();

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <motion.button
      onClick={onClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      whileTap={{ scale: 0.95 }}
      className={`
        fixed z-50 bg-blue-600 hover:bg-blue-700 text-white
        w-14 h-14 rounded-full shadow-lg
        flex items-center justify-center
        transition-all duration-200
        ${positionClasses[position]}
        ${isPressed ? 'shadow-xl scale-95' : ''}
      `}
      style={{
        bottom: `${16 + safeArea.bottom}px`
      }}
      aria-label={label}
    >
      {icon}
    </motion.button>
  );
}

// 移动端手势识别组件
export function MobileGestureArea({ 
  onSwipe, 
  children, 
  className = '' 
}: {
  onSwipe: (direction: 'up' | 'down' | 'left' | 'right') => void;
  children: React.ReactNode;
  className?: string;
}) {
  const { touchHandlers, getSwipeDirection } = useMobileTouch();

  const handleTouchEnd = () => {
    const direction = getSwipeDirection();
    if (direction) {
      onSwipe(direction);
    }
  };

  return (
    <div
      className={className}
      {...touchHandlers}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}