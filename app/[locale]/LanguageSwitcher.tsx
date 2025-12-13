'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useState } from 'react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'en', name: 'English', flag: '🇺🇸' }
    ];

    const switchLanguage = (newLocale: string) => {
        // Remove current locale from pathname
        const segments = pathname.split('/');
        segments[1] = newLocale;
        const newPath = segments.join('/');

        router.push(newPath);
        setIsOpen(false);
    };

    const currentLang = languages.find(lang => lang.code === locale) || languages[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors flex items-center gap-2"
                aria-label="Switch Language"
            >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">{currentLang.flag}</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => switchLanguage(lang.code)}
                                className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 ${locale === lang.code ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
                                    }`}
                            >
                                <span className="text-2xl">{lang.flag}</span>
                                <span className="font-medium">{lang.name}</span>
                                {locale === lang.code && (
                                    <span className="ml-auto text-indigo-600 dark:text-indigo-400">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
