'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal,
  Settings,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useMobileGestures } from '../hooks/useMobileGestures';
import { useSafeArea } from './MobileOptimizations';

interface FoldingSection {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  priority: 'high' | 'medium' | 'low'; // High priority sections stay visible longer
  minHeight?: number;
  maxHeight?: number;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

interface MobileFoldingLayoutProps {
  sections: FoldingSection[];
  className?: string;
  singleHandMode?: boolean;
  compactMode?: boolean;
  onSectionToggle?: (sectionId: string, expanded: boolean) => void;
  floatingActions?: React.ReactNode;
}

export function MobileFoldingLayout({
  sections,
  className = '',
  singleHandMode = true,
  compactMode = false,
  onSectionToggle,
  floatingActions
}: MobileFoldingLayoutProps) {
  const { isMobile, isTablet } = useBreakpoint();
  const safeArea = useSafeArea();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.defaultExpanded !== false && s.priority === 'high').map(s => s.id))
  );
  const [focusedSection, setFocusedSection] = useState<string | null>(null);
  const [isCompactView, setIsCompactView] = useState(compactMode);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-collapse low priority sections in single-hand mode
  useEffect(() => {
    if (singleHandMode && isMobile) {
      const highPrioritySections = sections
        .filter(s => s.priority === 'high')
        .map(s => s.id);
      
      setExpandedSections(new Set(highPrioritySections));
    }
  }, [singleHandMode, isMobile, sections]);

  // Handle section toggle with smart collapsing
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      const isCurrentlyExpanded = newSet.has(sectionId);
      
      if (isCurrentlyExpanded) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
        
        // In single-hand mode, collapse other low-priority sections
        if (singleHandMode && isMobile) {
          const currentSection = sections.find(s => s.id === sectionId);
          if (currentSection?.priority === 'low') {
            // Collapse other low priority sections
            sections.forEach(section => {
              if (section.priority === 'low' && section.id !== sectionId) {
                newSet.delete(section.id);
              }
            });
          }
        }
      }
      
      onSectionToggle?.(sectionId, !isCurrentlyExpanded);
      return newSet;
    });
  };

  // Handle focus for better single-hand operation
  const handleSectionFocus = (sectionId: string) => {
    setFocusedSection(sectionId);
    
    // Auto-expand focused section
    if (!expandedSections.has(sectionId)) {
      toggleSection(sectionId);
    }
    
    // Scroll focused section into view
    setTimeout(() => {
      const sectionElement = document.getElementById(`section-${sectionId}`);
      if (sectionElement) {
        sectionElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  };

  // Gesture handlers for mobile interaction
  const { touchHandlers } = useMobileGestures({
    onSwipeUp: () => {
      // Expand next section or scroll up
      const currentIndex = sections.findIndex(s => s.id === focusedSection);
      if (currentIndex < sections.length - 1) {
        const nextSection = sections[currentIndex + 1];
        handleSectionFocus(nextSection.id);
      }
    },
    onSwipeDown: () => {
      // Expand previous section or scroll down
      const currentIndex = sections.findIndex(s => s.id === focusedSection);
      if (currentIndex > 0) {
        const prevSection = sections[currentIndex - 1];
        handleSectionFocus(prevSection.id);
      }
    },
    onTap: (point) => {
      // Remove focus when tapping outside sections
      setFocusedSection(null);
    }
  });

  // Calculate optimal section heights for single-hand operation
  const calculateSectionHeight = (section: FoldingSection, isExpanded: boolean) => {
    if (!isExpanded) return 'auto';
    
    const viewportHeight = window.innerHeight - safeArea.top - safeArea.bottom;
    const availableHeight = viewportHeight * (singleHandMode ? 0.7 : 0.8); // Reserve space for thumb reach
    
    if (section.maxHeight) {
      return Math.min(section.maxHeight, availableHeight);
    }
    
    // Default heights based on priority
    switch (section.priority) {
      case 'high':
        return Math.min(400, availableHeight * 0.6);
      case 'medium':
        return Math.min(300, availableHeight * 0.4);
      case 'low':
        return Math.min(200, availableHeight * 0.3);
      default:
        return 'auto';
    }
  };

  // Don't render on desktop unless explicitly needed
  if (!isMobile && !isTablet) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`
        relative min-h-screen bg-slate-50 dark:bg-slate-950
        ${singleHandMode ? 'pb-20' : 'pb-4'}
        ${className}
      `}
      style={{
        paddingTop: safeArea.top,
        paddingLeft: safeArea.left,
        paddingRight: safeArea.right
      }}
      {...touchHandlers}
    >
      {/* Compact mode toggle */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompactView(!isCompactView)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
              title={isCompactView ? '展开视图' : '紧凑视图'}
            >
              {isCompactView ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
            
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {isCompactView ? '紧凑模式' : '标准模式'}
            </span>
          </div>
          
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {singleHandMode ? '单手模式' : '双手模式'}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-2 p-4">
        {sections.map((section, index) => {
          const isExpanded = expandedSections.has(section.id);
          const isFocused = focusedSection === section.id;
          const Icon = section.icon;
          const sectionHeight = calculateSectionHeight(section, isExpanded);
          
          return (
            <motion.div
              key={section.id}
              id={`section-${section.id}`}
              layout
              className={`
                bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800
                ${isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                ${isCompactView ? 'shadow-sm' : 'shadow-md'}
                overflow-hidden
              `}
            >
              {/* Section Header */}
              <button
                onClick={() => {
                  if (section.collapsible !== false) {
                    toggleSection(section.id);
                  }
                  handleSectionFocus(section.id);
                }}
                className={`
                  w-full flex items-center justify-between p-4
                  ${isCompactView ? 'py-3' : 'py-4'}
                  hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors
                  min-h-[44px] touch-manipulation
                `}
              >
                <div className="flex items-center gap-3">
                  {Icon && (
                    <div className={`
                      p-2 rounded-lg
                      ${section.priority === 'high' 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : section.priority === 'medium'
                        ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                  )}
                  
                  <div className="text-left">
                    <h3 className={`
                      font-medium text-slate-900 dark:text-white
                      ${isCompactView ? 'text-sm' : 'text-base'}
                    `}>
                      {section.title}
                    </h3>
                    {section.priority === 'high' && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        重要
                      </span>
                    )}
                  </div>
                </div>
                
                {section.collapsible !== false && (
                  <div className="flex items-center gap-2">
                    {isFocused && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </motion.div>
                  </div>
                )}
              </button>
              
              {/* Section Content */}
              <AnimatePresence>
                {(isExpanded || section.collapsible === false) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: 'auto', 
                      opacity: 1,
                      maxHeight: typeof sectionHeight === 'number' ? `${sectionHeight}px` : sectionHeight
                    }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className={`
                      border-t border-slate-200 dark:border-slate-800
                      ${isCompactView ? 'p-3' : 'p-4'}
                      ${typeof sectionHeight === 'number' ? 'overflow-y-auto' : ''}
                    `}>
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Actions for Single-Hand Operation */}
      {singleHandMode && floatingActions && (
        <div 
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4"
          style={{ paddingBottom: safeArea.bottom }}
        >
          <div className="flex justify-center">
            {floatingActions}
          </div>
        </div>
      )}

      {/* Thumb reach indicator for single-hand mode */}
      {singleHandMode && (
        <div className="fixed bottom-20 right-4 text-xs text-slate-400 dark:text-slate-500">
          <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            拇指可达区域
          </div>
        </div>
      )}
    </div>
  );
}

// Utility function to create sections for QR Master
export function createQRMasterSections(
  inputContent: React.ReactNode,
  previewContent: React.ReactNode,
  optionsContent: React.ReactNode
): FoldingSection[] {
  return [
    {
      id: 'input',
      title: '输入内容',
      content: inputContent,
      priority: 'high',
      collapsible: false, // Always visible
      defaultExpanded: true
    },
    {
      id: 'preview',
      title: '实时预览',
      content: previewContent,
      priority: 'high',
      collapsible: false, // Always visible
      defaultExpanded: true
    },
    {
      id: 'options',
      title: '高级选项',
      content: optionsContent,
      priority: 'low',
      collapsible: true,
      defaultExpanded: false,
      maxHeight: 300
    }
  ];
}