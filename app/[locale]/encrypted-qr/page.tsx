'use client';

import React from 'react';
import { Shield } from 'lucide-react';

export default function EncryptedQRPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold">加密二维码</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            安全的二维码加密和解密工具
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
            <p className="text-amber-800 dark:text-amber-200">
              此功能正在开发中，将在后续版本中提供完整的加密二维码功能。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}