'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ExternalLink, Star } from 'lucide-react';

// 功能卡片数据类型
export interface FeatureCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  status: 'available' | 'beta';
  gradient: string;
  features: string[];
  isPopular?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
  quickAction?: {
    label: string;
    onClick: () => void;
  };
}

export function FeatureCard({
  id,
  title,
  description,
  icon: Icon,
  href,
  status,
  gradient,
  features,
  isPopular = false,
  onClick,
  disabled = false,
  badge,
  quickAction
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const CardContent = (
    <div className="group relative">
      {/* 热门标签 */}
      {isPopular && (
        <div className="absolute -top-3 -right-3 z-10">
          <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            热门
          </div>
        </div>
      )}
      
      {/* 卡片主体 */}
      <div 
        className={`relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 transition-all duration-300 overflow-hidden touch-manipulation ${
          disabled 
            ? 'opacity-60 cursor-not-allowed' 
            : 'hover:shadow-2xl md:hover:-translate-y-2 cursor-pointer active:scale-95 md:active:scale-100'
        }`}
        onClick={disabled ? undefined : handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        
        {/* 背景渐变 */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
        
        {/* 图标 */}
        <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        {/* 内容 */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              status === 'available' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {status === 'available' ? '立即可用' : '测试版'}
            </span>
          </div>
          
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {description}
          </p>
          
          {/* 功能特点 */}
          <div className="space-y-2 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          
          {/* 操作区域 */}
          <div className="space-y-3">
            {/* 快速操作按钮 */}
            {quickAction && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  quickAction.onClick();
                }}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium min-h-[44px] touch-manipulation"
              >
                {quickAction.label}
              </button>
            )}
            
            {/* 主操作提示 */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {disabled ? '即将推出' : '点击开始使用'}
              </span>
              {!disabled && (
                <div className="flex items-center gap-1">
                  {href.startsWith('http') ? (
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors duration-300" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 如果有href，使用Link包装
  if (href && !onClick) {
    return (
      <Link href={href}>
        {CardContent}
      </Link>
    );
  }

  // 否则直接返回卡片内容
  return CardContent;
}