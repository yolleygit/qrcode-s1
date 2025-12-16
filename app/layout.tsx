import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QR Master - 专业的二维码生成工具',
  description: '完全免费，无需登录。支持静态二维码、动态验证码、加密二维码生成。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}