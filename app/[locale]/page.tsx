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
  const faqs = [
    {
      question: "生成的二维码是永久有效的吗？",
      answer: "是的，只要您输入的网址是有效的，生成的二维码就会一直有效。我们不会对二维码设置任何过期时间。"
    },
    {
      question: "我可以将生成的二维码用于商业用途吗？",
      answer: "当然可以。本工具生成的二维码完全免费，您可以将其用于任何个人或商业项目，无需注明出处。"
    },
    {
      question: "你们会存储我的数据吗？",
      answer: "不会。我们非常重视您的隐私。您输入的网址仅用于实时生成二维码，我们不会在服务器上存储任何信息。"
    },
    {
      question: "如何提高二维码的扫描成功率？",
      answer: "建议保持二维码的前景色和背景色有足够的对比度（例如黑白）。同时，避免将二维码做得太小或太复杂。"
    }
  ];

  // Testimonials Data
  const testimonials = [
    {
      name: "张伟",
      role: "市场营销经理",
      content: "这是我用过最简单、最快速的二维码生成工具。自定义颜色功能让我们的营销材料看起来更专业。",
      avatar: "https://i.pravatar.cc/150?u=zhangwei"
    },
    {
      name: "李娜",
      role: "独立设计师",
      content: "作为设计师，我对细节要求很高。这个工具生成的高清PNG完全满足了我的印刷需求，强烈推荐！",
      avatar: "https://i.pravatar.cc/150?u=lina"
    },
    {
      name: "王强",
      role: "小型企业主",
      content: "无需登录，免费使用，而且生成的二维码扫描速度很快。对于我们这样的小企业来说，简直太棒了。",
      avatar: "https://i.pravatar.cc/150?u=wangqiang"
    }
  ];

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
                完全免费 · 无需登录
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                为您的链接生成 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  完美的二维码
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                简单、快速、可定制。只需输入您的网址，即可生成高质量的二维码。适用于营销活动、个人名片或任何分享场景。
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
                  placeholder="请输入您的网址 (例如: https://example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <button
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200 dark:shadow-none transform hover:-translate-y-0.5 cursor-pointer flex-shrink-0"
              >
                生成
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>永久有效</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>高清下载</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>支持个性化</span></div>
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
                  下载 PNG
                </button>
                <button onClick={() => setIsModalOpen(true)}
                  disabled={!url}
                  className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium active:scale-95 cursor-pointer"
                >
                  <Wand2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  美化二维码
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
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">核心优势</span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">为什么选择 QR Master？</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">不仅仅是生成，我们提供更优质、更专业的二维码解决方案。</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, title: "高度可定制", desc: "自定义颜色、边距和尺寸，让二维码完美融入您的品牌设计风格，提升品牌形象。" },
              { icon: <Download className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, title: "高清导出", desc: "支持高清 PNG 格式下载，像素完美，满足从网络展示到大幅面印刷的各种需求。" },
              { icon: <Share2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, title: "跨平台兼容", desc: "生成的二维码经过优化，可在所有主流智能手机和扫描应用中快速、准确地识别。" },
              { icon: <Check className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, title: "永久有效", desc: "生成的静态二维码不依赖于我们的服务器，只要您的链接有效，二维码就永久有效。" },
              { icon: <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, title: "无需注册", desc: "告别繁琐的注册流程，打开页面即可使用，保护您的隐私，提高工作效率。" },
              { icon: <Wand2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, title: "实时预览", desc: "所见即所得。在您调整设置时，二维码会实时更新，确保您获得满意的结果。" },
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
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">用户评价</span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">深受用户信赖</h2>
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
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">常见问题</span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">解答您的疑问</h2>
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
              为您提供简单、快速、专业的二维码生成服务。无需登录，即刻使用。
            </p>
          </div>
          <div className="col-span-2 grid grid-cols-2">
            <div>
              <h3 className="font-semibold text-lg mb-4">快速链接</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer">首页</button></li>
                <li><button onClick={() => scrollToSection(featuresRef)} className="hover:text-white transition-colors cursor-pointer">产品功能</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">联系我们</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="mailto:support@qrmaster.com" className="hover:text-white transition-colors">support@qrmaster.com</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} QR Master. All rights reserved.</p>
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
                二维码样式编辑器
              </h2>
              <div className="flex items-center gap-3">
                <button className="text-sm text-green-600 dark:text-green-400 font-medium border border-green-200 dark:border-green-900/50 px-3 py-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer">
                  更换样式
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
                    <div className="text-xs font-semibold text-slate-400 mb-2">当前样式</div>
                    <div className="text-base font-bold text-slate-800 dark:text-white">基本样式</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">0-17字符，可打印20mm直径内，建议1米外扫描</div>
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-3">
                    <div className="text-sm font-bold text-slate-800 dark:text-white">Logo</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      <button onClick={() => fileInputRef.current?.click()} className="py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-600 dark:text-slate-300 hover:border-indigo-500 transition-colors flex items-center justify-center gap-2 bg-white dark:bg-slate-800 cursor-pointer">
                        <Upload className="w-4 h-4" /> 上传Logo
                      </button>
                      <button onClick={() => setLogo(null)} className="py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-600 dark:text-slate-300 hover:border-red-500 hover:text-red-600 transition-colors flex items-center justify-center gap-2 bg-white dark:bg-slate-800 cursor-pointer">
                        Logo选择
                      </button>
                    </div>
                  </div>

                  {/* Color Settings */}
                  <div className="space-y-3">
                    <div className="text-sm font-bold text-slate-800 dark:text-white">码点颜色</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-500 dark:text-slate-400">码颜色</label>
                        <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-md p-2 bg-white dark:bg-slate-800">
                          <div className="w-8 h-8 rounded border border-slate-200 dark:border-slate-600 overflow-hidden relative cursor-pointer" style={{ backgroundColor: fgColor }}>
                            <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                          </div>
                          <span className="text-xs font-mono text-slate-600 dark:text-slate-300">黑色</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-500 dark:text-slate-400">背景颜色</label>
                        <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-md p-2 bg-white dark:bg-slate-800">
                          <div className="w-8 h-8 rounded border border-slate-200 dark:border-slate-600 overflow-hidden relative cursor-pointer" style={{ backgroundColor: bgColor }}>
                            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                          </div>
                          <span className="text-xs font-mono text-slate-600 dark:text-slate-300">白色</span>
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
                    <div className="text-sm font-bold text-slate-800 dark:text-white">更多</div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-500 dark:text-slate-400">码边距 ⓘ</label>
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
                      <label className="text-xs text-slate-500 dark:text-slate-400">容错率 ⓘ</label>
                      <select
                        value={ecc}
                        onChange={(e) => setEcc(e.target.value as ErrorCorrectionLevel)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="L">L (7%)</option>
                        <option value="M">M (15%)</option>
                        <option value="Q">Q (25%)</option>
                        <option value="H">H (30%)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-500 dark:text-slate-400">码版本 ⓘ</label>
                      <input
                        type="text"
                        value="自动"
                        readOnly
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm rounded-md py-2 px-3"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-500 dark:text-slate-400">码尺寸 ⓘ</label>
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
                    + 添加文字
                  </button>
                </div>
              </div>

              {/* Center Preview Area */}
              <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                <div className="text-center mb-4">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    当前样式: <span className="font-semibold text-slate-700 dark:text-slate-200">基本样式</span>
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
                    保存并下载
                  </button>
                  <button className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer">
                    清除样式
                  </button>
                  <button className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium cursor-pointer">
                    下载打印
                  </button>
                </div>
              </div>

              {/* Right Sidebar - Style Gallery */}
              <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto transition-colors">
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">样式库</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">选择预设样式快速应用</p>

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
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">经典黑白</span>
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
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">圆点蓝</span>
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
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">圆角绿</span>
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
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">典雅红</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">使用提示</h3>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>保持前景色和背景色有足够对比度</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Logo 建议使用透明背景的 PNG 格式</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>容错率越高，二维码越复杂但容错能力越强</span>
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
