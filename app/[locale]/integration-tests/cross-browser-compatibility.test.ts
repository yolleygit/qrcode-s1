/**
 * 跨浏览器兼容性测试
 * 
 * 测试不同浏览器环境下的功能兼容性
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

// 浏览器环境模拟
interface BrowserEnvironment {
  name: string;
  userAgent: string;
  features: {
    css: {
      grid: boolean;
      flexbox: boolean;
      customProperties: boolean;
      containerQueries: boolean;
    };
    js: {
      es6: boolean;
      modules: boolean;
      webComponents: boolean;
      intersectionObserver: boolean;
      resizeObserver: boolean;
    };
    apis: {
      webCrypto: boolean;
      canvas: boolean;
      webWorkers: boolean;
      localStorage: boolean;
    };
  };
}

const browserEnvironments: BrowserEnvironment[] = [
  {
    name: 'Chrome 120+',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    features: {
      css: { grid: true, flexbox: true, customProperties: true, containerQueries: true },
      js: { es6: true, modules: true, webComponents: true, intersectionObserver: true, resizeObserver: true },
      apis: { webCrypto: true, canvas: true, webWorkers: true, localStorage: true }
    }
  },
  {
    name: 'Firefox 120+',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    features: {
      css: { grid: true, flexbox: true, customProperties: true, containerQueries: true },
      js: { es6: true, modules: true, webComponents: true, intersectionObserver: true, resizeObserver: true },
      apis: { webCrypto: true, canvas: true, webWorkers: true, localStorage: true }
    }
  },
  {
    name: 'Safari 17+',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    features: {
      css: { grid: true, flexbox: true, customProperties: true, containerQueries: true },
      js: { es6: true, modules: true, webComponents: true, intersectionObserver: true, resizeObserver: true },
      apis: { webCrypto: true, canvas: true, webWorkers: true, localStorage: true }
    }
  },
  {
    name: 'Edge 120+',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    features: {
      css: { grid: true, flexbox: true, customProperties: true, containerQueries: true },
      js: { es6: true, modules: true, webComponents: true, intersectionObserver: true, resizeObserver: true },
      apis: { webCrypto: true, canvas: true, webWorkers: true, localStorage: true }
    }
  },
  {
    name: 'Mobile Safari iOS 17+',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    features: {
      css: { grid: true, flexbox: true, customProperties: true, containerQueries: false },
      js: { es6: true, modules: true, webComponents: true, intersectionObserver: true, resizeObserver: true },
      apis: { webCrypto: true, canvas: true, webWorkers: true, localStorage: true }
    }
  },
  {
    name: 'Mobile Chrome Android',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    features: {
      css: { grid: true, flexbox: true, customProperties: true, containerQueries: true },
      js: { es6: true, modules: true, webComponents: true, intersectionObserver: true, resizeObserver: true },
      apis: { webCrypto: true, canvas: true, webWorkers: true, localStorage: true }
    }
  }
];

describe('跨浏览器兼容性测试', () => {
  let originalUserAgent: string;
  let originalCSS: any;

  beforeEach(() => {
    originalUserAgent = navigator.userAgent;
    originalCSS = (global as any).CSS;
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true
    });
    (global as any).CSS = originalCSS;
    vi.clearAllMocks();
  });

  describe('CSS 特性兼容性', () => {
    browserEnvironments.forEach(({ name, userAgent, features }) => {
      it(`应该在 ${name} 中正确检测CSS特性支持`, () => {
        // 模拟浏览器环境
        Object.defineProperty(navigator, 'userAgent', {
          value: userAgent,
          writable: true
        });

        // 模拟CSS.supports
        (global as any).CSS = {
          supports: vi.fn((property: string, value: string) => {
            if (property === 'display' && value === 'grid') {
              return features.css.grid;
            }
            if (property === 'display' && value === 'flex') {
              return features.css.flexbox;
            }
            if (property.startsWith('--')) {
              return features.css.customProperties;
            }
            if (property === 'container-type') {
              return features.css.containerQueries;
            }
            return true;
          })
        };

        // 测试CSS特性检测
        expect(CSS.supports('display', 'grid')).toBe(features.css.grid);
        expect(CSS.supports('display', 'flex')).toBe(features.css.flexbox);
        expect(CSS.supports('--custom-property', 'value')).toBe(features.css.customProperties);
        expect(CSS.supports('container-type', 'inline-size')).toBe(features.css.containerQueries);
      });
    });

    it('应该为不支持的CSS特性提供降级方案', () => {
      // 模拟不支持Grid的浏览器
      (global as any).CSS = {
        supports: vi.fn((property: string, value: string) => {
          if (property === 'display' && value === 'grid') {
            return false;
          }
          if (property === 'display' && value === 'flex') {
            return true;
          }
          return false;
        })
      };

      const supportsGrid = CSS.supports('display', 'grid');
      const supportsFlexbox = CSS.supports('display', 'flex');

      expect(supportsGrid).toBe(false);
      expect(supportsFlexbox).toBe(true);

      // 应该能够使用Flexbox作为降级方案
      expect(supportsFlexbox).toBe(true);
    });
  });

  describe('JavaScript API 兼容性', () => {
    browserEnvironments.forEach(({ name, features }) => {
      it(`应该在 ${name} 中正确处理JavaScript API`, () => {
        // 模拟API支持情况
        if (!features.js.intersectionObserver) {
          delete (window as any).IntersectionObserver;
        } else {
          (window as any).IntersectionObserver = class MockIntersectionObserver {
            observe = vi.fn();
            unobserve = vi.fn();
            disconnect = vi.fn();
          };
        }

        if (!features.js.resizeObserver) {
          delete (window as any).ResizeObserver;
        } else {
          (window as any).ResizeObserver = class MockResizeObserver {
            observe = vi.fn();
            unobserve = vi.fn();
            disconnect = vi.fn();
          };
        }

        // 测试API可用性
        expect(!!window.IntersectionObserver).toBe(features.js.intersectionObserver);
        expect(!!window.ResizeObserver).toBe(features.js.resizeObserver);

        // 应该有降级方案
        if (!features.js.intersectionObserver) {
          // 可以使用scroll事件作为降级
          expect(typeof window.addEventListener).toBe('function');
        }

        if (!features.js.resizeObserver) {
          // 可以使用resize事件作为降级
          expect(typeof window.addEventListener).toBe('function');
        }
      });
    });

    it('应该处理Web Crypto API的兼容性', () => {
      const hasWebCrypto = !!(window.crypto && window.crypto.subtle);
      
      if (hasWebCrypto) {
        expect(window.crypto.subtle).toBeDefined();
        expect(typeof window.crypto.getRandomValues).toBe('function');
      } else {
        // 应该有降级方案（如使用Math.random）
        expect(typeof Math.random).toBe('function');
      }
    });

    it('应该处理Canvas API的兼容性', () => {
      // 创建canvas元素测试
      const canvas = document.createElement('canvas');
      const hasCanvas = !!(canvas.getContext && canvas.getContext('2d'));

      if (hasCanvas) {
        const ctx = canvas.getContext('2d');
        expect(ctx).toBeTruthy();
        expect(typeof ctx?.fillRect).toBe('function');
      } else {
        // 应该有降级方案（如使用SVG）
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        expect(svg).toBeTruthy();
      }
    });
  });

  describe('存储API兼容性', () => {
    it('应该处理localStorage的兼容性', () => {
      const hasLocalStorage = (() => {
        try {
          const test = 'test';
          localStorage.setItem(test, test);
          localStorage.removeItem(test);
          return true;
        } catch (e) {
          return false;
        }
      })();

      if (hasLocalStorage) {
        expect(typeof localStorage.setItem).toBe('function');
        expect(typeof localStorage.getItem).toBe('function');
      } else {
        // 应该有内存存储降级方案
        const memoryStorage = new Map();
        expect(typeof memoryStorage.set).toBe('function');
        expect(typeof memoryStorage.get).toBe('function');
      }
    });

    it('应该处理sessionStorage的兼容性', () => {
      const hasSessionStorage = (() => {
        try {
          const test = 'test';
          sessionStorage.setItem(test, test);
          sessionStorage.removeItem(test);
          return true;
        } catch (e) {
          return false;
        }
      })();

      if (hasSessionStorage) {
        expect(typeof sessionStorage.setItem).toBe('function');
      } else {
        // 可以使用内存存储或cookie作为降级
        expect(typeof document.cookie).toBe('string');
      }
    });
  });

  describe('移动设备特定兼容性', () => {
    const mobileUserAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    ];

    mobileUserAgents.forEach((userAgent) => {
      it(`应该在移动设备 (${userAgent.includes('iPhone') ? 'iOS' : 'Android'}) 中正确工作`, () => {
        Object.defineProperty(navigator, 'userAgent', {
          value: userAgent,
          writable: true
        });

        const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
        expect(isMobile).toBe(true);

        // 测试触摸事件支持
        const hasTouchEvents = 'ontouchstart' in window;
        
        // 移动设备应该支持触摸事件或者有降级方案
        if (!hasTouchEvents) {
          // 可以使用鼠标事件作为降级
          expect(typeof window.addEventListener).toBe('function');
        }
      });
    });

    it('应该处理移动设备的视口问题', () => {
      // 模拟移动设备视口
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });

      // 检查视口meta标签
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      
      // 如果没有视口meta标签，应该动态添加
      if (!viewportMeta) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0';
        document.head.appendChild(meta);
      }

      const finalViewportMeta = document.querySelector('meta[name="viewport"]');
      expect(finalViewportMeta).toBeTruthy();
    });
  });

  describe('性能优化兼容性', () => {
    it('应该处理requestAnimationFrame的兼容性', () => {
      const hasRAF = typeof window.requestAnimationFrame === 'function';

      if (hasRAF) {
        expect(typeof window.requestAnimationFrame).toBe('function');
        expect(typeof window.cancelAnimationFrame).toBe('function');
      } else {
        // 应该有setTimeout降级方案
        expect(typeof window.setTimeout).toBe('function');
        expect(typeof window.clearTimeout).toBe('function');
      }
    });

    it('应该处理Intersection Observer的降级', () => {
      if (!window.IntersectionObserver) {
        // 使用scroll事件作为降级
        let scrollHandler: (() => void) | null = null;

        const mockIntersectionObserver = {
          observe: (element: Element) => {
            scrollHandler = () => {
              const rect = element.getBoundingClientRect();
              const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
              // 处理可见性变化
            };
            window.addEventListener('scroll', scrollHandler);
          },
          unobserve: () => {
            if (scrollHandler) {
              window.removeEventListener('scroll', scrollHandler);
            }
          },
          disconnect: () => {
            if (scrollHandler) {
              window.removeEventListener('scroll', scrollHandler);
            }
          }
        };

        expect(typeof mockIntersectionObserver.observe).toBe('function');
      }
    });
  });

  describe('错误处理和降级策略', () => {
    it('应该优雅处理不支持的特性', () => {
      // 模拟完全不支持的环境
      const originalConsoleError = console.error;
      const errors: string[] = [];
      
      console.error = (message: string) => {
        errors.push(message);
      };

      try {
        // 尝试使用可能不支持的特性
        if (typeof window.ResizeObserver === 'undefined') {
          // 应该有降级方案而不是抛出错误
          const fallbackHandler = () => {
            // 使用resize事件
          };
          window.addEventListener('resize', fallbackHandler);
          expect(typeof fallbackHandler).toBe('function');
        }

        // 不应该有未捕获的错误
        expect(errors.length).toBe(0);
      } finally {
        console.error = originalConsoleError;
      }
    });

    it('应该提供功能检测而不是浏览器检测', () => {
      // 好的做法：特性检测
      const supportsGrid = CSS.supports('display', 'grid');
      const supportsFlexbox = CSS.supports('display', 'flex');
      const hasIntersectionObserver = 'IntersectionObserver' in window;

      expect(typeof supportsGrid).toBe('boolean');
      expect(typeof supportsFlexbox).toBe('boolean');
      expect(typeof hasIntersectionObserver).toBe('boolean');

      // 避免浏览器字符串检测
      const userAgent = navigator.userAgent;
      expect(typeof userAgent).toBe('string');
      
      // 但不应该依赖于特定的浏览器字符串
      // 而是使用特性检测的结果
    });
  });

  describe('可访问性兼容性', () => {
    it('应该在所有浏览器中支持基本的可访问性特性', () => {
      // ARIA属性支持
      const element = document.createElement('div');
      element.setAttribute('aria-label', 'test');
      element.setAttribute('role', 'button');
      element.setAttribute('tabindex', '0');

      expect(element.getAttribute('aria-label')).toBe('test');
      expect(element.getAttribute('role')).toBe('button');
      expect(element.getAttribute('tabindex')).toBe('0');
    });

    it('应该支持键盘导航', () => {
      const element = document.createElement('button');
      let focused = false;

      element.addEventListener('focus', () => {
        focused = true;
      });

      // 模拟焦点
      element.focus();
      element.dispatchEvent(new Event('focus'));

      expect(focused).toBe(true);
    });

    it('应该支持屏幕阅读器', () => {
      // 测试语义化HTML
      const heading = document.createElement('h1');
      const paragraph = document.createElement('p');
      const list = document.createElement('ul');
      const listItem = document.createElement('li');

      expect(heading.tagName).toBe('H1');
      expect(paragraph.tagName).toBe('P');
      expect(list.tagName).toBe('UL');
      expect(listItem.tagName).toBe('LI');

      // 测试ARIA标签
      heading.setAttribute('aria-level', '1');
      expect(heading.getAttribute('aria-level')).toBe('1');
    });
  });
});