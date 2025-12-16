# UI界面优化设计文档

## 概述

本文档详细描述了QR Master UI界面深度优化的技术设计方案，专注于实现所见即所得的极致用户体验。设计目标是让用户在单个页面内完成所有操作，无需跳转，甚至无需滚动，通过智能布局和实时反馈机制，为三个核心功能提供一致且流畅的交互体验。

## 技术架构

### 整体架构

```
QR Master UI优化架构
├── 设计系统层 (Design System)
│   ├── 设计令牌 (Design Tokens)
│   ├── 组件库 (Component Library)
│   └── 主题系统 (Theme System)
├── 布局系统层 (Layout System)
│   ├── 响应式网格 (Responsive Grid)
│   ├── 容器组件 (Container Components)
│   └── 布局模板 (Layout Templates)
├── 交互系统层 (Interaction System)
│   ├── 状态管理 (State Management)
│   ├── 事件处理 (Event Handling)
│   └── 动画系统 (Animation System)
└── 性能优化层 (Performance Layer)
    ├── 代码分割 (Code Splitting)
    ├── 资源优化 (Asset Optimization)
    └── 缓存策略 (Caching Strategy)
```

### 技术选型

#### 核心技术栈
- **Next.js 16**: App Router, 服务端渲染, 静态生成
- **React 18**: 并发特性, Suspense, 错误边界
- **TypeScript**: 严格类型检查, 接口定义
- **Tailwind CSS v4**: 原子化CSS, JIT编译

#### 开发环境配置
- **VS Code**: 推荐 IDE，包含预配置设置
  - `kiroAgent.configureMCP: "Disabled"` - 禁用 MCP 自动配置
  - `typescript.autoClosingTags: false` - 禁用自动标签闭合
- **扩展推荐**: TypeScript, Tailwind CSS, Prettier, ESLint
- **配置文件**: `.vscode/settings.json`, `.vscode/extensions.json`

#### 辅助技术
- **Framer Motion**: 动画和过渡效果
- **React Hook Form**: 表单处理和验证
- **Zustand**: 轻量级状态管理
- **React Query**: 数据获取和缓存

## 设计系统

### 设计令牌 (Design Tokens)

```typescript
// tokens/index.ts
export const designTokens = {
  // 颜色系统
  colors: {
    // 品牌色
    brand: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6', // 主品牌色
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554'
      }
    },
    // 语义色
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    // 中性色
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712'
    }
  },
  
  // 间距系统
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem'      // 96px
  },
  
  // 字体系统
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace']
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }]
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  
  // 阴影系统
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  },
  
  // 圆角系统
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  
  // 断点系统
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};
```

### 主题系统

```typescript
// themes/index.ts
export interface Theme {
  name: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
  };
}

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(222.2 84% 4.9%)',
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(222.2 84% 4.9%)',
    primary: 'hsl(221.2 83.2% 53.3%)',
    primaryForeground: 'hsl(210 40% 98%)',
    secondary: 'hsl(210 40% 96%)',
    secondaryForeground: 'hsl(222.2 47.4% 11.2%)',
    muted: 'hsl(210 40% 96%)',
    mutedForeground: 'hsl(215.4 16.3% 46.9%)',
    accent: 'hsl(210 40% 96%)',
    accentForeground: 'hsl(222.2 47.4% 11.2%)',
    destructive: 'hsl(0 84.2% 60.2%)',
    destructiveForeground: 'hsl(210 40% 98%)',
    border: 'hsl(214.3 31.8% 91.4%)',
    input: 'hsl(214.3 31.8% 91.4%)',
    ring: 'hsl(221.2 83.2% 53.3%)'
  }
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: 'hsl(222.2 84% 4.9%)',
    foreground: 'hsl(210 40% 98%)',
    card: 'hsl(222.2 84% 4.9%)',
    cardForeground: 'hsl(210 40% 98%)',
    primary: 'hsl(217.2 91.2% 59.8%)',
    primaryForeground: 'hsl(222.2 84% 4.9%)',
    secondary: 'hsl(217.2 32.6% 17.5%)',
    secondaryForeground: 'hsl(210 40% 98%)',
    muted: 'hsl(217.2 32.6% 17.5%)',
    mutedForeground: 'hsl(215 20.2% 65.1%)',
    accent: 'hsl(217.2 32.6% 17.5%)',
    accentForeground: 'hsl(210 40% 98%)',
    destructive: 'hsl(0 62.8% 30.6%)',
    destructiveForeground: 'hsl(210 40% 98%)',
    border: 'hsl(217.2 32.6% 17.5%)',
    input: 'hsl(217.2 32.6% 17.5%)',
    ring: 'hsl(224.3 76.3% 94.1%)'
  }
};
```

## 组件设计

### 基础组件

#### Button 组件

```typescript
// components/ui/Button.tsx
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // 基础样式
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary'
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

#### Card 组件

```typescript
// components/ui/Card.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Card = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

## 所见即所得架构设计

### 实时预览系统

```typescript
// hooks/useRealTimePreview.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

interface PreviewConfig {
  content: string;
  style: QRStyleConfig;
  type: 'static' | 'totp' | 'encrypted';
}

export function useRealTimePreview() {
  const [config, setConfig] = useState<PreviewConfig>({
    content: '',
    style: DEFAULT_QR_STYLE,
    type: 'static'
  });
  
  const [previewData, setPreviewData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 防抖的二维码生成函数
  const debouncedGenerate = useMemo(
    () => debounce(async (config: PreviewConfig) => {
      if (!config.content.trim()) {
        setPreviewData(null);
        return;
      }
      
      setIsGenerating(true);
      try {
        const qrCode = await generateQRCode(config);
        setPreviewData(qrCode);
      } catch (error) {
        console.error('QR generation failed:', error);
        setPreviewData(null);
      } finally {
        setIsGenerating(false);
      }
    }, 300),
    []
  );
  
  // 当配置变化时自动生成预览
  useEffect(() => {
    debouncedGenerate(config);
    return () => debouncedGenerate.cancel();
  }, [config, debouncedGenerate]);
  
  const updateContent = useCallback((content: string) => {
    setConfig(prev => ({ ...prev, content }));
  }, []);
  
  const updateStyle = useCallback((style: Partial<QRStyleConfig>) => {
    setConfig(prev => ({ 
      ...prev, 
      style: { ...prev.style, ...style } 
    }));
  }, []);
  
  const updateType = useCallback((type: PreviewConfig['type']) => {
    setConfig(prev => ({ ...prev, type }));
  }, []);
  
  return {
    config,
    previewData,
    isGenerating,
    updateContent,
    updateStyle,
    updateType
  };
}
```

### 无滚动布局系统

```typescript
// hooks/useViewportLayout.ts
import { useState, useEffect } from 'react';

interface ViewportDimensions {
  width: number;
  height: number;
  availableHeight: number; // 减去导航栏等固定元素的可用高度
}

interface LayoutConfig {
  orientation: 'horizontal' | 'vertical' | 'stacked';
  panelSizes: {
    input: number;
    preview: number;
    controls: number;
  };
  showSidebar: boolean;
  compactMode: boolean;
}

export function useViewportLayout() {
  const [viewport, setViewport] = useState<ViewportDimensions>({
    width: 0,
    height: 0,
    availableHeight: 0
  });
  
  const [layout, setLayout] = useState<LayoutConfig>({
    orientation: 'horizontal',
    panelSizes: { input: 40, preview: 40, controls: 20 },
    showSidebar: true,
    compactMode: false
  });
  
  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const navHeight = 64; // 导航栏高度
      const footerHeight = 0; // 页脚高度
      const availableHeight = height - navHeight - footerHeight;
      
      setViewport({ width, height, availableHeight });
      
      // 根据视口尺寸自动调整布局
      if (width >= 1280) {
        // 大屏幕：左右分栏 + 侧边栏
        setLayout({
          orientation: 'horizontal',
          panelSizes: { input: 35, preview: 45, controls: 20 },
          showSidebar: true,
          compactMode: false
        });
      } else if (width >= 768) {
        // 中等屏幕：左右分栏，无侧边栏
        setLayout({
          orientation: 'horizontal',
          panelSizes: { input: 45, preview: 55, controls: 0 },
          showSidebar: false,
          compactMode: false
        });
      } else {
        // 小屏幕：垂直堆叠，紧凑模式
        setLayout({
          orientation: 'stacked',
          panelSizes: { input: 100, preview: 100, controls: 100 },
          showSidebar: false,
          compactMode: true
        });
      }
    };
    
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);
  
  return { viewport, layout };
}
```

### 智能面板组件

```typescript
// components/layout/SmartPanel.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useViewportLayout } from '@/hooks/useViewportLayout';

interface SmartPanelProps {
  children: React.ReactNode;
  type: 'input' | 'preview' | 'controls';
  className?: string;
  minHeight?: number;
  maxHeight?: number;
}

export const SmartPanel = forwardRef<HTMLDivElement, SmartPanelProps>(
  ({ children, type, className, minHeight = 300, maxHeight }, ref) => {
    const { viewport, layout } = useViewportLayout();
    
    const getPanelStyle = () => {
      const baseHeight = viewport.availableHeight;
      const percentage = layout.panelSizes[type];
      
      if (layout.orientation === 'horizontal') {
        return {
          width: `${percentage}%`,
          height: `${baseHeight}px`,
          minHeight: `${minHeight}px`,
          maxHeight: maxHeight ? `${maxHeight}px` : undefined
        };
      } else if (layout.orientation === 'vertical') {
        return {
          width: '100%',
          height: `${(baseHeight * percentage) / 100}px`,
          minHeight: `${minHeight}px`,
          maxHeight: maxHeight ? `${maxHeight}px` : undefined
        };
      } else {
        // stacked mode
        return {
          width: '100%',
          height: 'auto',
          minHeight: layout.compactMode ? `${minHeight * 0.8}px` : `${minHeight}px`
        };
      }
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col overflow-hidden',
          layout.orientation === 'horizontal' && 'border-r border-slate-200 dark:border-slate-800 last:border-r-0',
          layout.orientation === 'vertical' && 'border-b border-slate-200 dark:border-slate-800 last:border-b-0',
          layout.compactMode && 'p-2',
          !layout.compactMode && 'p-4',
          className
        )}
        style={getPanelStyle()}
      >
        {children}
      </div>
    );
  }
);

SmartPanel.displayName = 'SmartPanel';
```

### 布局组件

#### Container 组件

```typescript
// components/layout/Container.tsx
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const containerSizes = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full'
};

export function Container({ 
  children, 
  className, 
  size = 'lg' 
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        containerSizes[size],
        className
      )}
    >
      {children}
    </div>
  );
}
```

#### Grid 组件

```typescript
// components/layout/Grid.tsx
import { cn } from '@/lib/utils';

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

export function Grid({ 
  children, 
  className, 
  cols = { default: 1, md: 2, lg: 3 },
  gap = 6 
}: GridProps) {
  const gridClasses = cn(
    'grid',
    `gap-${gap}`,
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}
```

## 响应式设计

### 断点策略

```typescript
// hooks/useBreakpoint.ts
import { useState, useEffect } from 'react';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('sm');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md');
      } else {
        setCurrentBreakpoint('sm');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    currentBreakpoint,
    isMobile: currentBreakpoint === 'sm',
    isTablet: currentBreakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(currentBreakpoint),
    isLargeDesktop: ['xl', '2xl'].includes(currentBreakpoint)
  };
}
```

### 自适应布局

```typescript
// components/layout/AdaptiveLayout.tsx
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Container } from './Container';
import { Grid } from './Grid';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

export function AdaptiveLayout({ 
  children, 
  sidebar, 
  header 
}: AdaptiveLayoutProps) {
  const { isMobile, isDesktop } = useBreakpoint();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {header && (
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
            <Container size="full">
              {header}
            </Container>
          </header>
        )}
        <main className="pb-16">
          <Container>
            {children}
          </Container>
        </main>
        {sidebar && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
            {sidebar}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {header && (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
          <Container size="full">
            {header}
          </Container>
        </header>
      )}
      <div className="flex">
        {sidebar && isDesktop && (
          <aside className="w-80 border-r bg-muted/10 p-6">
            {sidebar}
          </aside>
        )}
        <main className="flex-1">
          <Container>
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
}
```

## 状态管理

### 全局状态

```typescript
// store/useAppStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // 主题状态
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // 语言状态
  locale: 'zh' | 'en';
  setLocale: (locale: 'zh' | 'en') => void;
  
  // UI状态
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // 用户偏好
  preferences: {
    autoSave: boolean;
    showTips: boolean;
    defaultQRSize: number;
  };
  updatePreferences: (preferences: Partial<AppState['preferences']>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      
      locale: 'zh',
      setLocale: (locale) => set({ locale }),
      
      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      
      preferences: {
        autoSave: true,
        showTips: true,
        defaultQRSize: 256
      },
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences }
        }))
    }),
    {
      name: 'qr-master-app-store',
      partialize: (state) => ({
        theme: state.theme,
        locale: state.locale,
        preferences: state.preferences
      })
    }
  )
);
```

### QR码状态管理

```typescript
// store/useQRStore.ts
import { create } from 'zustand';

interface QRState {
  // 当前QR码数据
  currentQR: {
    content: string;
    type: 'url' | 'text' | 'totp' | 'encrypted';
    style: QRStyleConfig;
    generated: boolean;
  };
  
  // 历史记录
  history: QRHistoryItem[];
  
  // 收藏夹
  favorites: QRHistoryItem[];
  
  // 操作方法
  setQRContent: (content: string, type: QRState['currentQR']['type']) => void;
  updateQRStyle: (style: Partial<QRStyleConfig>) => void;
  addToHistory: (item: QRHistoryItem) => void;
  addToFavorites: (item: QRHistoryItem) => void;
  removeFromFavorites: (id: string) => void;
  clearHistory: () => void;
}

interface QRHistoryItem {
  id: string;
  content: string;
  type: 'url' | 'text' | 'totp' | 'encrypted';
  style: QRStyleConfig;
  createdAt: Date;
  thumbnail?: string;
}

interface QRStyleConfig {
  size: number;
  margin: number;
  colorDark: string;
  colorLight: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  // ... 其他样式配置
}

export const useQRStore = create<QRState>((set, get) => ({
  currentQR: {
    content: '',
    type: 'url',
    style: {
      size: 256,
      margin: 4,
      colorDark: '#000000',
      colorLight: '#ffffff',
      errorCorrectionLevel: 'M'
    },
    generated: false
  },
  
  history: [],
  favorites: [],
  
  setQRContent: (content, type) =>
    set((state) => ({
      currentQR: { ...state.currentQR, content, type, generated: false }
    })),
    
  updateQRStyle: (style) =>
    set((state) => ({
      currentQR: {
        ...state.currentQR,
        style: { ...state.currentQR.style, ...style }
      }
    })),
    
  addToHistory: (item) =>
    set((state) => ({
      history: [item, ...state.history.slice(0, 49)] // 保留最近50条
    })),
    
  addToFavorites: (item) =>
    set((state) => ({
      favorites: [...state.favorites, item]
    })),
    
  removeFromFavorites: (id) =>
    set((state) => ({
      favorites: state.favorites.filter((item) => item.id !== id)
    })),
    
  clearHistory: () => set({ history: [] })
}));
```

## 性能优化

### 代码分割

```typescript
// 路由级别的代码分割
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// 懒加载页面组件
const HomePage = lazy(() => import('@/pages/HomePage'));
const TOTPPage = lazy(() => import('@/pages/TOTPPage'));
const EncryptedQRPage = lazy(() => import('@/pages/EncryptedQRPage'));

// 路由配置
export const routes = [
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <HomePage />
      </Suspense>
    )
  },
  {
    path: '/totp',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <TOTPPage />
      </Suspense>
    )
  },
  {
    path: '/encrypted',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <EncryptedQRPage />
      </Suspense>
    )
  }
];
```

### 组件级优化

```typescript
// components/QRPreview.tsx
import { memo, useMemo } from 'react';
import { useQRStore } from '@/store/useQRStore';

interface QRPreviewProps {
  content: string;
  style: QRStyleConfig;
}

export const QRPreview = memo<QRPreviewProps>(({ content, style }) => {
  // 使用 useMemo 缓存QR码生成结果
  const qrCodeDataURL = useMemo(() => {
    if (!content) return null;
    
    // QR码生成逻辑
    return generateQRCode(content, style);
  }, [content, style]);

  if (!qrCodeDataURL) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <p className="text-muted-foreground">请输入内容生成二维码</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm">
      <img
        src={qrCodeDataURL}
        alt="QR Code"
        className="max-w-full h-auto"
        style={{ width: style.size, height: style.size }}
      />
    </div>
  );
});

QRPreview.displayName = 'QRPreview';
```

### 虚拟滚动

```typescript
// components/VirtualList.tsx
import { FixedSizeList as List } from 'react-window';
import { memo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; data: T[] }) => React.ReactElement;
}

export function VirtualList<T>({ 
  items, 
  height, 
  itemHeight, 
  renderItem 
}: VirtualListProps<T>) {
  const ItemRenderer = memo(({ index, style }: { index: number; style: React.CSSProperties }) => 
    renderItem({ index, style, data: items })
  );

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      itemData={items}
    >
      {ItemRenderer}
    </List>
  );
}
```

## 动画系统

### 页面过渡

```typescript
// components/PageTransition.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

const pageVariants = {
  initial: {
    opacity: 0,
    x: -20
  },
  in: {
    opacity: 1,
    x: 0
  },
  out: {
    opacity: 0,
    x: 20
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={router.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### 微交互动画

```typescript
// components/ui/AnimatedButton.tsx
import { motion } from 'framer-motion';
import { Button, ButtonProps } from './Button';

export function AnimatedButton(props: ButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Button {...props} />
    </motion.div>
  );
}
```

## 错误处理

### 错误边界

```typescript
// components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">出现错误</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                抱歉，页面出现了错误。请尝试刷新页面或联系技术支持。
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs bg-muted p-2 rounded">
                  <summary>错误详情</summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <div className="flex gap-2">
                <Button onClick={this.handleReset} variant="outline">
                  重试
                </Button>
                <Button onClick={() => window.location.reload()}>
                  刷新页面
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 全局错误处理

```typescript
// hooks/useErrorHandler.ts
import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

export function useErrorHandler() {
  const handleError = useCallback((error: Error, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    // 根据错误类型显示不同的提示
    if (error.name === 'NetworkError') {
      toast({
        title: '网络错误',
        description: '请检查网络连接后重试',
        variant: 'destructive'
      });
    } else if (error.name === 'ValidationError') {
      toast({
        title: '输入错误',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: '操作失败',
        description: '请稍后重试，如问题持续请联系技术支持',
        variant: 'destructive'
      });
    }
  }, []);

  return { handleError };
}
```

## 测试策略

### 组件测试

```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveClass('opacity-50');
  });

  it('applies variant styles correctly', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
    
    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');
  });
});
```

### 集成测试

```typescript
// __tests__/integration/QRGeneration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QRGeneratorPage } from '@/pages/QRGeneratorPage';

describe('QR Code Generation Integration', () => {
  it('generates QR code when user inputs URL', async () => {
    const user = userEvent.setup();
    render(<QRGeneratorPage />);
    
    // 输入URL
    const input = screen.getByPlaceholderText('请输入您的网址');
    await user.type(input, 'https://example.com');
    
    // 点击生成按钮
    const generateButton = screen.getByText('生成');
    await user.click(generateButton);
    
    // 等待QR码生成
    await waitFor(() => {
      expect(screen.getByAltText('QR Code')).toBeInTheDocument();
    });
    
    // 验证下载按钮可用
    expect(screen.getByText('下载 PNG')).not.toBeDisabled();
  });
});
```

## 部署和监控

### 构建优化

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用实验性功能
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['qr-code-styling']
  },
  
  // 图片优化
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif']
  },
  
  // 压缩配置
  compress: true,
  
  // PWA配置
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true
  },
  
  // 分析包大小
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      };
    }
    
    return config;
  }
};

module.exports = nextConfig;
```

### 性能监控

```typescript
// lib/analytics.ts
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_location: url
    });
  }
}

export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
}

// 性能指标收集
export function collectWebVitals() {
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }
}
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

基于前面的预工作分析，以下是从验收标准转换而来的可测试属性：

### 属性 1: 实时预览响应性
*对于任何*输入内容变化，二维码预览应该在300毫秒内更新，无需用户手动触发
**验证需求: 8.1, 8.2, 10.1**

### 属性 2: 单屏布局约束
*对于任何*标准屏幕尺寸（1920x1080, 1366x768, 1024x768），核心功能区域的高度应该不超过视口可用高度的95%
**验证需求: 8.3, 8.5**

### 属性 3: 响应式布局一致性
*对于任何*屏幕宽度变化，布局应该在指定断点（768px, 1024px, 1280px）自动切换到对应的布局模式
**验证需求: 9.1, 9.2, 9.3, 9.4**

### 属性 4: 主要功能可见性
*对于任何*设备类型和屏幕尺寸，主要功能控件应该在首屏可见且可操作，无需滚动
**验证需求: 9.5**

### 属性 5: 加密解密实时反馈
*对于任何*有效的加密或解密操作，结果应该在操作完成后立即显示在当前视图中
**验证需求: 10.3**

### 属性 6: 界面布局一致性
*对于任何*功能页面（静态、TOTP、加密），核心布局结构（输入区、预览区、控制区）应该保持相同的相对位置和比例
**验证需求: 10.4**

### 属性 7: 操作选项统一性
*对于任何*二维码生成结果，应该提供相同的操作选项集合（下载、复制、分享），且位置和样式保持一致
**验证需求: 10.5**

## 总结

本设计文档详细描述了QR Master UI界面深度优化的技术实现方案，包括：

1. **所见即所得架构**: 实时预览系统和无滚动布局系统
2. **智能响应式设计**: 基于视口的自适应布局和智能面板组件
3. **设计系统**: 统一的设计令牌、主题系统和组件库
4. **状态管理**: 全局状态和业务状态的分离管理
5. **性能优化**: 代码分割、组件优化和虚拟滚动
6. **动画系统**: 页面过渡和微交互动画
7. **错误处理**: 错误边界和全局错误处理机制
8. **正确性属性**: 7个核心属性确保用户体验质量
9. **测试策略**: 组件测试和集成测试
10. **部署监控**: 构建优化和性能监控

通过这些技术方案的实施，将为用户提供极致流畅、所见即所得的二维码生成工具体验。

---

*本文档将随着开发进展持续更新和完善。*