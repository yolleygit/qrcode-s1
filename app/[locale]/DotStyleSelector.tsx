'use client';

import { DotType } from 'qr-code-styling';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DotStyleSelectorProps {
    value: DotType;
    onChange: (value: DotType) => void;
}

// 码点样式配置 - 14种样式，使用本地图片
const dotStyles: { type: DotType; label: string; image: string }[] = [
    { type: 'square', label: '普通', image: '/images/dot/1.png' },
    { type: 'dots', label: '液化', image: '/images/dot/2.png' },
    { type: 'rounded', label: '圆液化', image: '/images/dot/16.png' },
    { type: 'extra-rounded', label: '条纹', image: '/images/dot/17.png' },
    { type: 'classy-rounded', label: '横条纹', image: '/images/dot/4.png' },
    { type: 'classy', label: '竖条纹', image: '/images/dot/5.png' },
    { type: 'square', label: '瓷砖', image: '/images/dot/15.png' },
    { type: 'dots', label: '大圆点', image: '/images/dot/6.png' },
    { type: 'dots', label: '小圆点', image: '/images/dot/7.png' },
    { type: 'classy', label: '粗星形', image: '/images/dot/9.png' },
    { type: 'classy-rounded', label: '细星形', image: '/images/dot/10.png' },
    { type: 'square', label: '网格', image: '/images/dot/3.png' },
    { type: 'extra-rounded', label: '菱形', image: '/images/dot/11.png' },
    { type: 'rounded', label: '小方点', image: '/images/dot/dot32.png' },
];

export default function DotStyleSelector({ value, onChange }: DotStyleSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentStyle = dotStyles[selectedIndex] || dotStyles[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (index: number) => {
        setSelectedIndex(index);
        onChange(dotStyles[index].type);
        setIsOpen(false);
    };

    return (
        <div className="space-y-3">
            <div className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                码点样式
                <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs text-slate-400">
                    i
                </div>
            </div>

            <div className="relative" ref={dropdownRef}>
                {/* 当前选中显示 */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded bg-white flex-shrink-0">
                            <img src={currentStyle.image} alt={currentStyle.label} className="w-8 h-8 object-contain" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{currentStyle.label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* 下拉面板 */}
                {isOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl">
                        <div className="grid grid-cols-4 gap-1.5">
                            {dotStyles.map((style, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(idx)}
                                    className={`flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-lg border-2 transition-all ${selectedIndex === idx
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                            : 'border-transparent hover:border-slate-200 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-700/50'
                                        }`}
                                >
                                    <div className="w-10 h-10 flex items-center justify-center overflow-hidden bg-white rounded">
                                        <img src={style.image} alt={style.label} className="w-10 h-10 object-contain" />
                                    </div>
                                    <span className="text-[10px] text-slate-600 dark:text-slate-400 whitespace-nowrap leading-tight">{style.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">选择码点的形状样式</div>
                    </div>
                )}
            </div>
        </div>
    );
}
