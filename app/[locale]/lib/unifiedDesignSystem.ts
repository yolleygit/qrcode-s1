/**
 * 统一设计系统 - 确保三个功能页面的视觉一致性
 */

// 统一颜色方案
export const unifiedColors = {
  // 品牌色系
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
      900: '#1e3a8a'
    }
  },
  
  // 功能色系 - 每个功能页面的特色色
  features: {
    static: {
      primary: '#3b82f6', // 蓝色 - 静态二维码
      light: '#eff6ff',
      dark: '#1e40af'
    },
    totp: {
      primary: '#10b981', // 绿色 - TOTP动态验证码
      light: '#ecfdf5',
      dark: '#047857'
    },
    encrypted: {
      primary: '#8b5cf6', // 紫色 - 加密二维码
      light: '#f3e8ff',
      dark: '#7c3aed'
    }
  },
  
  // 语义色系
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },
  
  // 中性色系
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  }
} as const;

// 统一间距系统
export const unifiedSpacing = {
  // 基础间距单位 (4px)
  unit: 4,
  
  // 预设间距值
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  
  // 组件间距
  component: {
    padding: {
      sm: '0.75rem',   // 12px - 紧凑模式
      md: '1rem',      // 16px - 标准模式
      lg: '1.5rem'     // 24px - 宽松模式
    },
    margin: {
      sm: '0.5rem',    // 8px
      md: '1rem',      // 16px
      lg: '1.5rem'     // 24px
    },
    gap: {
      sm: '0.75rem',   // 12px
      md: '1rem',      // 16px
      lg: '1.5rem'     // 24px
    }
  },
  
  // 布局间距
  layout: {
    section: '2rem',     // 32px - 区块间距
    container: '1.5rem', // 24px - 容器内边距
    panel: '1rem'        // 16px - 面板内边距
  }
} as const;

// 统一字体系统
export const unifiedTypography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace']
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }] // 30px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
} as const;

// 统一圆角系统
export const unifiedBorderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px'
} as const;

// 统一阴影系统
export const unifiedShadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
} as const;

// 统一动画系统
export const unifiedAnimations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms'
  },
  
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  // 预设动画
  presets: {
    fadeIn: 'fadeIn 200ms ease-out',
    slideUp: 'slideUp 200ms ease-out',
    scaleIn: 'scaleIn 150ms ease-out',
    bounce: 'bounce 300ms ease-in-out'
  }
} as const;

// 统一断点系统
export const unifiedBreakpoints = {
  sm: '640px',   // 手机横屏
  md: '768px',   // 平板竖屏
  lg: '1024px',  // 平板横屏/小笔记本
  xl: '1280px',  // 桌面
  '2xl': '1536px' // 大屏桌面
} as const;

// 统一组件样式类
export const unifiedComponentClasses = {
  // 面板样式
  panel: {
    base: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm',
    header: 'border-b border-slate-200 dark:border-slate-800 px-6 py-4',
    content: 'p-6',
    compact: 'p-4'
  },
  
  // 按钮样式
  button: {
    base: 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation',
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-slate-600 hover:bg-slate-700 text-white shadow-sm hover:shadow-md',
    outline: 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
    sizes: {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-2.5 text-sm min-h-[44px]',
      lg: 'px-6 py-3 text-base min-h-[48px]'
    }
  },
  
  // 输入框样式
  input: {
    base: 'block w-full px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-shadow',
    error: 'border-red-300 dark:border-red-700 focus:ring-red-500',
    success: 'border-green-300 dark:border-green-700 focus:ring-green-500'
  },
  
  // 状态徽章样式
  badge: {
    base: 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border',
    variants: {
      success: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800',
      warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
      info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
      beta: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800'
    }
  }
} as const;

// 获取功能特色色彩的工具函数
export const getFeatureColors = (feature: 'static' | 'totp' | 'encrypted') => {
  return unifiedColors.features[feature];
};

// 获取语义色彩的工具函数
export const getSemanticColor = (type: 'success' | 'warning' | 'error' | 'info') => {
  return unifiedColors.semantic[type];
};

// CSS 变量生成器（用于动态主题）
export const generateCSSVariables = (feature: 'static' | 'totp' | 'encrypted') => {
  const featureColors = getFeatureColors(feature);
  
  return {
    '--feature-primary': featureColors.primary,
    '--feature-light': featureColors.light,
    '--feature-dark': featureColors.dark
  };
};