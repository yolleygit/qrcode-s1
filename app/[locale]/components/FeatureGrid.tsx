'use client';

import React from 'react';
import { FeatureCard, FeatureCardProps } from './FeatureCard';

interface FeatureGridProps {
  title?: string;
  subtitle?: string;
  cards: FeatureCardProps[];
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
  className?: string;
}

export function FeatureGrid({
  title,
  subtitle,
  cards,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 8,
  className = ''
}: FeatureGridProps) {
  const gridClasses = [
    'grid',
    `gap-${gap}`,
    `grid-cols-${columns.mobile}`,
    `md:grid-cols-${columns.tablet}`,
    `lg:grid-cols-${columns.desktop}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 标题区域 */}
        {(title || subtitle) && (
          <div className="text-center mb-16">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        {/* 功能卡片网格 */}
        <div className={gridClasses}>
          {cards.map((card) => (
            <FeatureCard key={card.id} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}