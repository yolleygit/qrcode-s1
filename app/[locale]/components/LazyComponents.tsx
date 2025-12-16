'use client';

import { lazy, Suspense, ComponentType, useRef, useEffect, useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// 懒加载组件的高阶组件
export function withLazyLoading<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner size="lg" text="加载中..." />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// 懒加载的偏好设置模态框
export const LazyPreferencesModal = lazy(() => 
  import('./PreferencesModal').then(module => ({ default: module.PreferencesModal }))
);

// 懒加载的用户引导组件  
export const LazyUserGuide = lazy(() => 
  import('./UserGuide').then(module => ({ default: module.UserGuide }))
);

// 懒加载的最近配置组件
export const LazyRecentConfigs = lazy(() => 
  import('./RecentConfigs').then(module => ({ default: module.RecentConfigs }))
);

// 懒加载的错误边界组件
export const LazyErrorBoundary = lazy(() => 
  import('./ErrorBoundary').then(module => ({ default: module.SimpleErrorBoundary }))
);

// 代码分割的页面组件
export const LazyTOTPPage = lazy(() => 
  import('../totp/page').then(module => ({ default: module.default }))
);

export const LazyEncryptedQRPage = lazy(() => 
  import('../encrypted-qr/page').then(module => ({ default: module.default }))
);

// 带有错误边界的懒加载组件
export function LazyComponentWithErrorBoundary<T extends object>({
  importFunc,
  fallback,
  errorFallback,
  ...props
}: {
  importFunc: () => Promise<{ default: ComponentType<T> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
} & T) {
  const LazyComponent = lazy(importFunc);
  
  return (
    <Suspense 
      fallback={fallback || <LoadingSpinner size="lg" text="加载中..." />}
    >
      <LazyComponent {...(props as T)} />
    </Suspense>
  );
}

// 预加载函数
export const preloadComponent = (importFunc: () => Promise<any>) => {
  // 在空闲时间预加载组件
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      importFunc();
    });
  } else {
    // 降级方案：使用setTimeout
    setTimeout(() => {
      importFunc();
    }, 100);
  }
};

// 预加载关键组件
export const preloadCriticalComponents = () => {
  // 预加载可能很快会用到的组件
  preloadComponent(() => import('./PreferencesModal'));
  preloadComponent(() => import('./UserGuide'));
  
  // 根据用户行为预加载
  const preloadOnHover = (selector: string, importFunc: () => Promise<any>) => {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener('mouseenter', () => {
        preloadComponent(importFunc);
      }, { once: true });
    }
  };

  // 当用户悬停在TOTP链接上时预加载TOTP页面
  preloadOnHover('a[href="/totp"]', () => import('../totp/page'));
  
  // 当用户悬停在加密QR链接上时预加载加密QR页面
  preloadOnHover('a[href="/encrypted-qr"]', () => import('../encrypted-qr/page'));
};

// 动态导入工具函数
export const dynamicImport = {
  // QR码生成库
  qrCodeStyling: () => import('qr-code-styling'),
  
  // 动画库
  framerMotion: () => import('framer-motion')
};

// 资源预加载Hook
export function useResourcePreloader() {
  const preloadResource = (url: string, type: 'script' | 'style' | 'image' = 'script') => {
    if (typeof window === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'image':
        link.as = 'image';
        break;
    }
    
    document.head.appendChild(link);
  };

  const preloadFont = (fontUrl: string) => {
    if (typeof window === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = fontUrl;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    
    document.head.appendChild(link);
  };

  return {
    preloadResource,
    preloadFont
  };
}

// 组件可见性检测Hook（用于懒加载）
export function useIntersectionObserver(
  callback: (isIntersecting: boolean) => void,
  options: IntersectionObserverInit = {}
) {
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [callback, options]);

  return targetRef;
}

// 懒加载图片组件
export function LazyImage({
  src,
  alt,
  className = '',
  placeholder = '/placeholder.svg',
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  placeholder?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useIntersectionObserver((inView) => {
    if (inView && !isInView) {
      setIsInView(true);
    }
  }) as React.RefObject<HTMLDivElement>;

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
      
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
}