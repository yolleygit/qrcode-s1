import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "../providers";
import { NextIntlClientProvider } from 'next-intl';
// import { getMessages } from 'next-intl/server';
// import { notFound } from 'next/navigation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { OfflineBanner } from './components/NetworkStatus';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: 'QR Master - 专业的二维码生成工具',
    description: '免费的在线二维码生成器，支持静态二维码、加密二维码和TOTP动态验证码',
    keywords: 'QR码,二维码,生成器,免费,在线,TOTP,加密',
  };
}

const locales = ['en', 'zh'];

export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  // Note: For static export, we skip the notFound() check
  // if (!locales.includes(locale as any)) {
  //   notFound();
  // }

  // Providing all messages to the client
  // side is the easiest way to get started
  // const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
          storageKey="theme"
        >
          {/* <NextIntlClientProvider locale={locale} messages={messages}> */}
            <ErrorBoundary>
              <ToastProvider>
                <OfflineBanner />
                {children}
              </ToastProvider>
            </ErrorBoundary>
          {/* </NextIntlClientProvider> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
