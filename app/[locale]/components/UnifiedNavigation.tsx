'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from "next-themes";
import { useTranslations } from 'next-intl';
import { 
  QrCode, 
  Moon, 
  Sun, 
  ArrowLeft, 
  Menu, 
  X,
  Home,
  Shield,
  Lock
} from 'lucide-react';
import LanguageSwitcher from '../LanguageSwitcher';

interface NavigationProps {
  showBackButton?: boolean;
  title?: string;
  subtitle?: string;
}

export function UnifiedNavigation({ 
  showBackButton = false, 
  title,
  subtitle 
}: NavigationProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 导航菜单项
  const navigationItems = [
    {
      name: '首页',
      href: '/',
      icon: Home,
      current: pathname === '/' || pathname.endsWith('/')
    },
    {
      name: '动态验证码',
      href: '/totp',
      icon: Shield,
      current: pathname.includes('/totp')
    },
    {
      name: '加密二维码',
      href: '/encrypted-qr',
      icon: Lock,
      current: pathname.includes('/encrypted-qr')
    }
  ];

  return (
    <nav className="fixed w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* 左侧：品牌标识和页面信息 */}
          <div className="flex items-center gap-4">
            {/* 返回按钮 */}
            {showBackButton && (
              <Link 
                href="/"
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">返回首页</span>
              </Link>
            )}
            
            {/* 品牌标识 */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100">
                QR Master
              </span>
            </Link>
            
            {/* 页面标题（仅在子页面显示） */}
            {title && (
              <>
                <div className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span>/</span>
                  <span className="text-slate-700 dark:text-slate-300">{title}</span>
                </div>
              </>
            )}
          </div>

          {/* 右侧：导航菜单和控制 */}
          <div className="flex items-center gap-4">
            
            {/* 桌面端导航菜单 */}
            <div className="hidden md:flex items-center gap-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    item.current
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* 语言切换 */}
            <LanguageSwitcher />

            {/* 主题切换 */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                aria-label="切换主题"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              aria-label="打开菜单"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 移动端下拉菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    item.current
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}