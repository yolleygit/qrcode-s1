'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
    const t = useTranslations('notFound');

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 max-w-md w-full animate-in fade-in zoom-in duration-300">
                <h2 className="text-6xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-4">404</h2>
                <p className="text-xl text-slate-700 dark:text-slate-300 font-semibold mb-2">{t('title')}</p>
                <p className="text-slate-500 dark:text-slate-400 mb-8">{t('description')}</p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors w-full"
                >
                    {t('backHome')}
                </Link>
            </div>
        </div>
    );
}
