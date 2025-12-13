'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Download, Wand2, Settings, Share2, Link as LinkIcon, Check, X, QrCode, Star,
  HelpCircle, ChevronDown, Users, Upload, RefreshCw, Type, Moon, Sun, Monitor, Globe
} from 'lucide-react';
import QRCodeStyling, {
  Options,
  CornerDotType,
  CornerSquareType,
  DotType,
  DrawType,
  ErrorCorrectionLevel,
  ShapeType
} from 'qr-code-styling';
import { useTheme } from "next-themes";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import DotStyleSelector from './DotStyleSelector';
import CornerStyleSelector from './CornerStyleSelector';

// 定义类型
type TabType = 'style' | 'logo' | 'color' | 'more';

export default function Home() {
  const t = useTranslations();
  const [url, setUrl] = useState('https://www.google.com');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Theme
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Customization State
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(300);
  const [margin, setMargin] = useState(0);
  const [ecc, setEcc] = useState<ErrorCorrectionLevel>('Q');
  const [logo, setLogo] = useState<string | null>(null);

  // Shape Styles
  const [dotType, setDotType] = useState<DotType>('square');
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>('square');
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>('square');

  // Refs
  const qrRef = useRef<HTMLDivElement>(null);
  const modalQrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sections Refs
  const featuresRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize and Update QR Code
  useEffect(() => {
    // 仅在客户端初始化
    if (typeof window !== 'undefined' && !qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling({
        width: size,
        height: size,
        type: 'svg',
        data: url,
        image: logo || undefined,
        dotsOptions: {
          color: fgColor,
          type: dotType
        },
        backgroundOptions: {
          color: bgColor,
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 10
        },
        cornersSquareOptions: {
          type: cornerSquareType,
          color: fgColor
        },
        cornersDotOptions: {
          type: cornerDotType,
          color: fgColor
        }
      });
    }
  }, []);

  // Update QR Code when state changes
  useEffect(() => {
    if (!qrCodeInstance.current) return;

    qrCodeInstance.current.update({
      data: url,
      image: logo || undefined,
      dotsOptions: {
        color: fgColor,
        type: dotType
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        type: cornerSquareType,
        color: fgColor
      },
      cornersDotOptions: {
        type: cornerDotType,
        color: fgColor
      },
      imageOptions: {
        margin: 10
      },
      qrOptions: {
        errorCorrectionLevel: ecc
      },
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCodeInstance.current.append(qrRef.current);
    }

    if (isModalOpen && modalQrRef.current) {
      setTimeout(() => {
        if (modalQrRef.current) {
          modalQrRef.current.innerHTML = '';
          qrCodeInstance.current?.append(modalQrRef.current);
        }
      }, 100);
    } else if (!isModalOpen && qrRef.current) {
      qrCodeInstance.current.append(qrRef.current);
    }

  }, [url, fgColor, bgColor, size, margin, ecc, logo, dotType, cornerSquareType, cornerDotType, isModalOpen]);


  const handleDownload = async (ext: 'png' | 'svg' = 'png') => {
    if (!qrCodeInstance.current) return;
    await qrCodeInstance.current.download({
      name: `qrcode-${Date.now()}`,
      extension: ext
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // FAQ Data
  // FAQ Data
  const faqs = (t.raw('faq.items') as any[]).map(item => ({
    question: item.question,
    answer: item.answer
  }));

  // Testimonials Data
  // Testimonials Data
  const testimonials = (t.raw('testimonials.items') as any[]).map(item => ({
    name: item.name,
    role: item.role,
    content: item.content,
    avatar: `https://i.pravatar.cc/150?u=${item.avatar}`
  }));

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-700 transition-colors duration-300">

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="bg-indigo-600 p-2 rounded-lg">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100">QR Master</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                <button onClick={() => scrollToSection(featuresRef)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">{t('nav.features')}</button>
                <button onClick={() => scrollToSection(testimonialsRef)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">{t('nav.testimonials')}</button>
                <button onClick={() => scrollToSection(faqRef)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">{t('nav.faq')}</button>
              </div>

              <LanguageSwitcher />

              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}

              <button className="text-sm font-semibold bg-slate-900 dark:bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors cursor-pointer hidden sm:block">
                {t('nav.contact')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Column */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold border border-indigo-100 dark:border-indigo-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                {t('hero.badge')}
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {t('hero.title')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  {t('hero.titleHighlight')}
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                {t('hero.description')}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2 transition-colors">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0 bg-transparent text-lg"
                  placeholder={t('hero.placeholder')}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <button
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200 dark:shadow-none transform hover:-translate-y-0.5 cursor-pointer flex-shrink-0"
              >
                {t('hero.generate')}
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>{t('hero.permanent')}</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>{t('hero.highQuality')}</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>{t('hero.customizable')}</span></div>
            </div>
          </div>

          {/* Right Column: QR Preview */}
          <div className="relative lg:h-[500px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl transform rotate-3 scale-95 opacity-70"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl transform -rotate-2 scale-95 opacity-70"></div>

            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 p-8 w-full max-w-sm border border-slate-100 dark:border-slate-800 backdrop-blur-sm transition-all duration-500">
              <div className="aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 flex items-center justify-center relative group bg-white">
                <div ref={qrRef} className="w-full h-full flex items-center justify-center [&>svg]:w-[100%] [&>svg]:h-[100%]"></div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <button onClick={() => handleDownload('png')} disabled={!url}
                  className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 px-4 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium active:scale-95 cursor-pointer">
                  <Download className="w-4 h-4" />
                  {t('hero.downloadPng')}
                </button>
                <button onClick={() => setIsModalOpen(true)}
                  disabled={!url}
                  className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium active:scale-95 cursor-pointer"
                >
                  <Wand2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  {t('hero.beautify')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section ref={featuresRef} className="bg-white dark:bg-slate-900 py-24 border-t border-slate-100 dark:border-slate-800 scroll-mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">{t('features.title')}</span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{t('features.subtitle')}</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">{t('features.description')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, title: t('features.customizable.title'), desc: t('features.customizable.desc') },
              { icon: <Download className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, title: t('features.highQuality.title'), desc: t('features.highQuality.desc') },
              { icon: <Share2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, title: t('features.compatible.title'), desc: t('features.compatible.desc') },
              { icon: <Check className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, title: t('features.permanent.title'), desc: t('features.permanent.desc') },
              { icon: <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, title: t('features.noRegistration.title'), desc: t('features.noRegistration.desc') },
              { icon: <Wand2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, title: t('features.realtime.title'), desc: t('features.realtime.desc') },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="bg-slate-50 dark:bg-slate-950 py-24 border-t border-slate-200 dark:border-slate-800 scroll-mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">{t('testimonials.title')}</span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{t('testimonials.subtitle')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative">
                <div className="flex items-center gap-1 text-yellow-400 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mb-8">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={faqRef} className="bg-white dark:bg-slate-900 py-24 border-t border-slate-100 dark:border-slate-800 scroll-mt-16 transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">{t('faq.title')}</span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{t('faq.subtitle')}</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden transition-all duration-200 hover:border-indigo-200 dark:hover:border-indigo-800 bg-slate-50 dark:bg-slate-800/50">
                <button onClick={() => toggleFaq(idx)} className="flex justify-between items-center w-full p-6 text-left focus:outline-none cursor-pointer">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                    {faq.question}
                  </h3>
                  <ChevronDown className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaqIndex === idx ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="p-6 pt-0 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-black text-white py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">QR Master</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {t('footer.description')}
            </p>
          </div>
          <div className="col-span-2 grid grid-cols-2">
            <div>
              <h3 className="font-semibold text-lg mb-4">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer">{t('footer.home')}</button></li>
                <li><button onClick={() => scrollToSection(featuresRef)} className="hover:text-white transition-colors cursor-pointer">{t('nav.features')}</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">{t('footer.contact')}</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="mailto:support@qrmaster.com" className="hover:text-white transition-colors">support@qrmaster.com</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </footer>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200/50 dark:border-slate-800">

            {/* Editor Header */}
            <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900 flex-shrink-0 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {t('editor.title')}
              </h2>
              <div className="flex items-center gap-3">
                <button className="text-sm text-green-600 dark:text-green-400 font-medium border border-green-200 dark:border-green-900/50 px-3 py-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer">
                  {t('editor.changeStyle')}
                </button>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Left Sidebar */}
              <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto overflow-x-hidden transition-colors">
                <div className="p-6 space-y-6">
                  {/* Current Style Header */}
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-semibold text-slate-400 mb-2">{t('editor.currentStyle')}</div>
                    <div className="text-base font-bold text-slate-800 dark:text-white">{t('editor.basicStyle')}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('editor.styleDescription')}</div>
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-3">
                    <div className="text-sm font-bold text-slate-800 dark:text-white">{t('editor.logo')}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      <button onClick={() => fileInputRef.current?.click()} className="py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-600 dark:text-slate-300 hover:border-indigo-500 transition-colors flex items-center justify-center gap-2 bg-white dark:bg-slate-800 cursor-pointer">
                        <Upload className="w-4 h-4" /> {t('editor.uploadLogo')}
                      </button>
                      <button onClick={() => setLogo(null)} className="py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-600 dark:text-slate-300 hover:border-red-500 hover:text-red-600 transition-colors flex items-center justify-center gap-2 bg-white dark:bg-slate-800 cursor-pointer">
                        {t('editor.logoSelect')}
                      </button>
                    </div>
                  </div>

                  {/* Color Settings */}
                  <div className="space-y-3">
                    <div className="text-sm font-bold text-slate-800 dark:text-white">{t('editor.colorSettings')}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-500 dark:text-slate-400">{t('editor.codeColor')}</label>
                        <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-md p-2 bg-white dark:bg-slate-800">
                          <div className="w-8 h-8 rounded border border-slate-200 dark:border-slate-600 overflow-hidden relative cursor-pointer" style={{ backgroundColor: fgColor }}>
                            <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                          </div>
                          <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{t('editor.black')}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-500 dark:text-slate-400">{t('editor.bgColor')}</label>
                        <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-md p-2 bg-white dark:bg-slate-800">
                          <div className="w-8 h-8 rounded border border-slate-200 dark:border-slate-600 overflow-hidden relative cursor-pointer" style={{ backgroundColor: bgColor }}>
                            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                          </div>
                          <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{t('editor.white')}</span>
                        </div>
                      </div>
                    </div>
                  </div>


                  {/* Dot Style Selector */}
                  <DotStyleSelector value={dotType} onChange={setDotType} />

                  {/* Corner Style Selector */}
                  <CornerStyleSelector value={cornerSquareType} onChange={setCornerSquareType} />


                  {/* Advanced Settings */}
                  <div className="space-y-3">
                    <div className="text-sm font-bold text-slate-800 dark:text-white">{t('editor.more')}</div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-500 dark:text-slate-400">{t('editor.margin')} ⓘ</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={margin}
                          onChange={(e) => setMargin(Number(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-300 w-12 text-right">{margin}px</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-500 dark:text-slate-400">{t('editor.errorCorrection')} ⓘ</label>
                      <select
                        value={ecc}
                        onChange={(e) => setEcc(e.target.value as ErrorCorrectionLevel)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="L">{t('editor.eccLevels.L')}</option>
                        <option value="M">{t('editor.eccLevels.M')}</option>
                        <option value="Q">{t('editor.eccLevels.Q')}</option>
                        <option value="H">{t('editor.eccLevels.H')}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-500 dark:text-slate-400">{t('editor.version')} ⓘ</label>
                      <input
                        type="text"
                        value={t('editor.auto')}
                        readOnly
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm rounded-md py-2 px-3"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-500 dark:text-slate-400">{t('editor.size')} ⓘ</label>
                      <input
                        type="text"
                        value="300x300mm"
                        readOnly
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm rounded-md py-2 px-3"
                      />
                    </div>
                  </div>

                  {/* Add Text Button */}
                  <button className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-md text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2 text-sm font-medium cursor-pointer">
                    <Type className="w-4 h-4" />
                    {t('editor.addText')}
                  </button>
                </div>
              </div>

              {/* Center Preview Area */}
              <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                <div className="text-center mb-4">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {t('editor.currentStyleLabel')} <span className="font-semibold text-slate-700 dark:text-slate-200">{t('editor.basicStyle')}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 mb-6 transition-all duration-300 border border-slate-200 dark:border-slate-800">
                  <div className="w-96 h-96 relative flex items-center justify-center bg-white dark:bg-slate-900">
                    <div ref={modalQrRef} className="w-full h-full flex items-center justify-center [&>svg]:w-[100%] [&>svg]:h-[100%]"></div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleDownload('png')}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-8 rounded-lg shadow-lg shadow-green-600/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {t('editor.saveAndDownload')}
                  </button>
                  <button className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer">
                    {t('editor.clearStyle')}
                  </button>
                  <button className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium cursor-pointer">
                    {t('editor.downloadPrint')}
                  </button>
                </div>
              </div>

              {/* Right Sidebar - Style Gallery */}
              <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto transition-colors">
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">{t('editor.styleLibrary')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t('editor.styleLibraryDesc')}</p>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Style presets */}
                      <button
                        onClick={() => {
                          setDotType('square');
                          setCornerSquareType('square');
                          setFgColor('#000000');
                          setBgColor('#ffffff');
                        }}
                        className="aspect-square border-2 border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer bg-white dark:bg-slate-800 flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-full h-16 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                          <div className="w-12 h-12 grid grid-cols-3 gap-0.5">
                            {[...Array(9)].map((_, i) => (
                              <div key={i} className="bg-slate-800 dark:bg-slate-300 rounded-sm"></div>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('editor.classicBW')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setDotType('dots');
                          setCornerSquareType('dot');
                          setFgColor('#4f46e5');
                          setBgColor('#ffffff');
                        }}
                        className="aspect-square border-2 border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer bg-white dark:bg-slate-800 flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-full h-16 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                          <div className="w-12 h-12 grid grid-cols-3 gap-1">
                            {[...Array(9)].map((_, i) => (
                              <div key={i} className="bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('editor.dotBlue')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setDotType('rounded');
                          setCornerSquareType('extra-rounded');
                          setFgColor('#16a34a');
                          setBgColor('#ffffff');
                        }}
                        className="aspect-square border-2 border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer bg-white dark:bg-slate-800 flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-full h-16 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                          <div className="w-12 h-12 grid grid-cols-3 gap-0.5">
                            {[...Array(9)].map((_, i) => (
                              <div key={i} className="bg-green-600 dark:bg-green-400 rounded"></div>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('editor.roundedGreen')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setDotType('classy');
                          setCornerSquareType('square');
                          setFgColor('#dc2626');
                          setBgColor('#ffffff');
                        }}
                        className="aspect-square border-2 border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer bg-white dark:bg-slate-800 flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-full h-16 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                          <div className="w-12 h-12 grid grid-cols-3 gap-0.5">
                            {[...Array(9)].map((_, i) => (
                              <div key={i} className="bg-red-600 dark:bg-red-400"></div>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('editor.classyRed')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">{t('editor.tips')}</h3>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{t('editor.tip1')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{t('editor.tip2')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{t('editor.tip3')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
