'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Shield, 
  Lock, 
  ChevronDown,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useMobileTouch } from './MobileOptimizations';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  badge?: string;
  isActive?: boolean;
}

interface MobileTabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  showMoreOptions?: boolean;
  moreOptions?: TabItem[];
}

export function MobileTabNavigation({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  showMoreOptions = false,
  moreOptions = []
}: MobileTabNavigationProps) {
  const { isMobile, isTablet } = useBreakpoint();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { touchHandlers, getSwipeDirection } = useMobileTouch();
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll state
  const checkScrollState = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollState();
    const handleResize = () => checkScrollState();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tabs]);

  // Handle swipe gestures for tab switching
  const handleSwipe = () => {
    const direction = getSwipeDirection();
    if (!direction) return;

    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    
    if (direction === 'left' && currentIndex < tabs.length - 1) {
      // Swipe left to go to next tab
      onTabChange(tabs[currentIndex + 1].id);
    } else if (direction === 'right' && currentIndex > 0) {
      // Swipe right to go to previous tab
      onTabChange(tabs[currentIndex - 1].id);
    }
  };

  // Scroll active tab into view
  const scrollToActiveTab = () => {
    if (tabsRef.current) {
      const activeTabElement = tabsRef.current.querySelector(`[data-tab-id="${activeTab}"]`);
      if (activeTabElement) {
        activeTabElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  };

  useEffect(() => {
    scrollToActiveTab();
  }, [activeTab]);

  // Don't render on desktop unless explicitly needed
  if (!isMobile && !isTablet) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 ${className}`}>
      {/* Tab Navigation */}
      <div className="relative">
        {/* Horizontal scrollable tabs */}
        <div
          ref={tabsRef}
          className="flex overflow-x-auto scrollbar-hide px-4 py-2"
          onScroll={checkScrollState}
          {...touchHandlers}
          onTouchEnd={handleSwipe}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => {
                  if (tab.onClick) {
                    tab.onClick();
                  } else {
                    onTabChange(tab.id);
                  }
                }}
                className={`
                  relative flex-shrink-0 flex items-center gap-2 px-4 py-3 mx-1 rounded-lg
                  font-medium text-sm transition-all duration-200 min-h-[44px] touch-manipulation
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
                
                {/* Badge */}
                {tab.badge && (
                  <span className={`
                    px-1.5 py-0.5 text-xs font-semibold rounded-full
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    }
                  `}>
                    {tab.badge}
                  </span>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-600 rounded-lg -z-10"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
          
          {/* More options button */}
          {showMoreOptions && moreOptions.length > 0 && (
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-3 mx-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] touch-manipulation"
            >
              <MoreHorizontal className="w-4 h-4" />
              <span className="whitespace-nowrap">更多</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showMoreMenu ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
        
        {/* Scroll indicators */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-900 to-transparent pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none" />
        )}
      </div>
      
      {/* More options dropdown */}
      <AnimatePresence>
        {showMoreMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
          >
            <div className="px-4 py-2 space-y-1">
              {moreOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      if (option.onClick) {
                        option.onClick();
                      } else {
                        onTabChange(option.id);
                      }
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors min-h-[44px] touch-manipulation"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{option.label}</span>
                    {option.badge && (
                      <span className="ml-auto px-1.5 py-0.5 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
                        {option.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Swipe hint for first-time users */}
      <div className="px-4 py-1">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          左右滑动切换功能
        </p>
      </div>
    </div>
  );
}

// Predefined tab configurations for common use cases
export const QR_MASTER_TABS: TabItem[] = [
  {
    id: 'static',
    label: '静态二维码',
    icon: QrCode,
    href: '/'
  },
  {
    id: 'totp',
    label: '动态验证码',
    icon: Shield,
    href: '/totp',
    badge: 'Beta'
  },
  {
    id: 'encrypted',
    label: '加密二维码',
    icon: Lock,
    href: '/encrypted-qr',
    badge: 'Beta'
  }
];

export const MORE_OPTIONS: TabItem[] = [
  {
    id: 'settings',
    label: '设置',
    icon: Settings
  }
];