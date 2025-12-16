'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  X, 
  ChevronUp, 
  ChevronDown, 
  Settings, 
  Palette,
  Download,
  Share,
  Copy,
  MoreVertical,
  Grip
} from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useMobileTouch, useSafeArea } from './MobileOptimizations';

interface DrawerSection {
  id: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

interface MobileDrawerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sections: DrawerSection[];
  height?: 'auto' | 'half' | 'full' | number; // number for custom height percentage
  showHandle?: boolean;
  swipeToClose?: boolean;
  className?: string;
  actions?: React.ReactNode;
}

export function MobileDrawerPanel({
  isOpen,
  onClose,
  title,
  sections,
  height = 'auto',
  showHandle = true,
  swipeToClose = true,
  className = '',
  actions
}: MobileDrawerPanelProps) {
  const { isMobile, isTablet } = useBreakpoint();
  const safeArea = useSafeArea();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.defaultExpanded !== false).map(s => s.id))
  );
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Calculate drawer height
  const getDrawerHeight = () => {
    const viewportHeight = window.innerHeight;
    const availableHeight = viewportHeight - safeArea.top - safeArea.bottom;
    
    switch (height) {
      case 'full':
        return availableHeight;
      case 'half':
        return availableHeight * 0.5;
      case 'auto':
        return Math.min(availableHeight * 0.8, 600);
      default:
        return typeof height === 'number' ? availableHeight * (height / 100) : availableHeight * 0.8;
    }
  };

  // Handle section toggle
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Handle drag to close
  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!swipeToClose) return;
    
    setDragY(info.offset.y);
    setIsDragging(true);
  }, [swipeToClose]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!swipeToClose) return;
    
    setIsDragging(false);
    setDragY(0);
    
    // Close if dragged down more than 100px or with sufficient velocity
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  }, [swipeToClose, onClose]);

  // Don't render on desktop unless explicitly needed
  if (!isMobile && !isTablet) {
    return null;
  }

  const drawerHeight = getDrawerHeight();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            ref={constraintsRef}
            initial={{ y: '100%' }}
            animate={{ y: isDragging ? dragY : 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              duration: isDragging ? 0 : undefined
            }}
            drag={swipeToClose ? 'y' : false}
            dragConstraints={{ top: 0, bottom: drawerHeight }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className={`
              fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 
              rounded-t-2xl shadow-2xl z-50 flex flex-col
              ${className}
            `}
            style={{ 
              height: `${drawerHeight}px`,
              paddingBottom: safeArea.bottom
            }}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
              </div>
            )}
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {title}
                </h2>
                {isDragging && (
                  <Grip className="w-4 h-4 text-slate-400" />
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {actions}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-behavior-contain">
              <div className="p-6 space-y-6">
                {sections.map((section) => {
                  const isExpanded = expandedSections.has(section.id);
                  const Icon = section.icon;
                  
                  return (
                    <div key={section.id} className="space-y-3">
                      {/* Section Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
                          <h3 className="font-medium text-slate-900 dark:text-white">
                            {section.title}
                          </h3>
                        </div>
                        
                        {section.collapsible !== false && (
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                        )}
                      </div>
                      
                      {/* Section Content */}
                      <AnimatePresence>
                        {(isExpanded || section.collapsible === false) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2">
                              {section.content}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Quick action buttons for common drawer actions
export function DrawerQuickActions({
  onDownload,
  onShare,
  onCopy,
  onSettings,
  className = ''
}: {
  onDownload?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onSettings?: () => void;
  className?: string;
}) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {onDownload && (
        <button
          onClick={onDownload}
          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
          title="下载"
        >
          <Download className="w-4 h-4" />
        </button>
      )}
      
      {onShare && (
        <button
          onClick={onShare}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
          title="分享"
        >
          <Share className="w-4 h-4" />
        </button>
      )}
      
      {onCopy && (
        <button
          onClick={onCopy}
          className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
          title="复制"
        >
          <Copy className="w-4 h-4" />
        </button>
      )}
      
      {onSettings && (
        <button
          onClick={onSettings}
          className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
          title="设置"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Predefined drawer sections for QR Master
export function createQRStyleSection(
  currentStyle: any,
  onStyleChange: (style: any) => void
): DrawerSection {
  return {
    id: 'qr-style',
    title: '二维码样式',
    icon: Palette,
    collapsible: true,
    defaultExpanded: false,
    content: (
      <div className="space-y-4">
        {/* Size Slider */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            尺寸: {currentStyle.size}px
          </label>
          <input
            type="range"
            min="128"
            max="512"
            step="32"
            value={currentStyle.size}
            onChange={(e) => onStyleChange({ ...currentStyle, size: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        {/* Color Pickers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              前景色
            </label>
            <input
              type="color"
              value={currentStyle.colorDark}
              onChange={(e) => onStyleChange({ ...currentStyle, colorDark: e.target.value })}
              className="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              背景色
            </label>
            <input
              type="color"
              value={currentStyle.colorLight}
              onChange={(e) => onStyleChange({ ...currentStyle, colorLight: e.target.value })}
              className="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
            />
          </div>
        </div>
        
        {/* Error Correction Level */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            错误纠正级别
          </label>
          <select
            value={currentStyle.errorCorrectionLevel}
            onChange={(e) => onStyleChange({ ...currentStyle, errorCorrectionLevel: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[44px] touch-manipulation"
          >
            <option value="L">低 (L) - 7%</option>
            <option value="M">中 (M) - 15%</option>
            <option value="Q">高 (Q) - 25%</option>
            <option value="H">最高 (H) - 30%</option>
          </select>
        </div>
      </div>
    )
  };
}