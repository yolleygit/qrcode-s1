'use client';

import { CornerSquareType } from 'qr-code-styling';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CornerStyleSelectorProps {
    value: CornerSquareType;
    onChange: (value: CornerSquareType) => void;
}

// 码眼样式配置 - 13种样式，使用本地图片
const cornerStyles: { type: CornerSquareType; translationKey: string; image: string }[] = [
    { type: 'square', translationKey: 'square', image: '/images/eye/e1.png' },
    { type: 'dot', translationKey: 'rounded', image: '/images/eye/e3.png' },
    { type: 'extra-rounded', translationKey: 'thickRounded', image: '/images/eye/e2.png' },
    { type: 'extra-rounded', translationKey: 'mediumRounded', image: '/images/eye/e20.png' },
    { type: 'square', translationKey: 'thinRounded', image: '/images/eye/e19.png' },
    { type: 'dot', translationKey: 'thickCircle', image: '/images/eye/e4.png' },
    { type: 'dot', translationKey: 'thinCircle', image: '/images/eye/e18.png' },
    { type: 'extra-rounded', translationKey: 'diamond', image: '/images/eye/e16.png' },
    { type: 'square', translationKey: 'star', image: '/images/eye/e5.png' },
    { type: 'extra-rounded', translationKey: 'bubble', image: '/images/eye/e6.png' },
    { type: 'square', translationKey: 'eye', image: '/images/eye/e8.png' },
    { type: 'extra-rounded', translationKey: 'singleRounded', image: '/images/eye/e7.png' },
    { type: 'square', translationKey: 'fourEyes', image: '/images/eye/e22.png' },
];

export default function CornerStyleSelector({ value, onChange }: CornerStyleSelectorProps) {
    const t = useTranslations('editor.cornerStyles');
    const tEditor = useTranslations('editor');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentStyle = cornerStyles[selectedIndex] || cornerStyles[0];

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
        onChange(cornerStyles[index].type);
        setIsOpen(false);
    };

    return (
        <div className="space-y-3">
            <div className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {tEditor('cornerStyle')}
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
                            <img src={currentStyle.image} alt={t(currentStyle.translationKey)} className="w-8 h-8 object-contain" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t(currentStyle.translationKey)}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* 下拉面板 */}
                {isOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl">
                        <div className="grid grid-cols-4 gap-1.5">
                            {cornerStyles.map((style, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(idx)}
                                    className={`flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-lg border-2 transition-all ${selectedIndex === idx
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-transparent hover:border-slate-200 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-700/50'
                                        }`}
                                >
                                    <div className="w-10 h-10 flex items-center justify-center overflow-hidden bg-white rounded">
                                        <img src={style.image} alt={t(style.translationKey)} className="w-10 h-10 object-contain" />
                                    </div>
                                    <span className="text-[10px] text-slate-600 dark:text-slate-400 whitespace-nowrap leading-tight">{t(style.translationKey)}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">{tEditor('cornerStyleDesc')}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
