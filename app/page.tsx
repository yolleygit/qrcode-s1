'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Download, Wand2, Settings, Share2, Link as LinkIcon, Check, X, QrCode, Star,
  HelpCircle, ChevronDown, Users, Upload, RefreshCw, Type
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

// 定义类型
type TabType = 'style' | 'logo' | 'color' | 'more';

export default function Home() {
  const [url, setUrl] = useState('https://www.google.com');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

    // Simple Render Logic: Render to both locations if they exist
    // We need to clear previous content slightly to avoid duplication if append logic is naive,
    // but qr-code-styling append doesn't clear.
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCodeInstance.current.append(qrRef.current);
    }

    if (isModalOpen && modalQrRef.current) {
      // Need a slight delay or separate instance for modal to ensure it renders correctly after modal animation
      setTimeout(() => {
        if (modalQrRef.current) {
          modalQrRef.current.innerHTML = '';
          // Create a new instance or append existing one. Appending moves the node.
          // To show in two places, we might need two instances or just move it.
          // For this App, "Hero" preview and "Modal" preview are exclusive usually, or we move it.
          // Let's create a secondary instance for the modal to be safe and independent?
          // Actually, moving the node is fine as the modal covers the hero section.
          qrCodeInstance.current?.append(modalQrRef.current);
        }
      }, 100);
    } else if (!isModalOpen && qrRef.current) {
      // When modal closes, move back to hero
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="bg-indigo-600 p-2 rounded-lg">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">QR Master</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <button onClick={() => scrollToSection(featuresRef)} className="hover:text-indigo-600 transition-colors cursor-pointer">产品功能</button>
              <button onClick={() => scrollToSection(testimonialsRef)} className="hover:text-indigo-600 transition-colors cursor-pointer">用户评价</button>
              <button onClick={() => scrollToSection(faqRef)} className="hover:text-indigo-600 transition-colors cursor-pointer">常见问题</button>
            </div>
            <button className="text-sm font-semibold bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer">
              联系合作
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Column */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold border border-indigo-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                完全免费 · 无需登录
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                为您的链接生成 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  完美的二维码
                </span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                简单、快速、可定制。只需输入您的网址，即可生成高质量的二维码。适用于营销活动、个人名片或任何分享场景。
              </p>
            </div>

            <div className="bg-white p-2 rounded-2xl shadow-xl shadow-indigo-100 border border-slate-200 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 bg-transparent text-lg"
                  placeholder="请输入您的网址 (例如: https://example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5 cursor-pointer"
              >
                生成
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>永久有效</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>高清下载</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /><span>支持个性化</span></div>
            </div>
          </div>

          {/* Right Column: QR Preview */}
          <div className="relative lg:h-[500px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-purple-50 rounded-3xl transform rotate-3 scale-95 opacity-70"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-blue-50 to-indigo-50 rounded-3xl transform -rotate-2 scale-95 opacity-70"></div>

            <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-200/50 p-8 w-full max-w-sm border border-slate-100 backdrop-blur-sm transition-all duration-500">
              <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center relative group bg-white">
                <div ref={qrRef} className="w-full h-full flex items-center justify-center [&>svg]:w-[100%] [&>svg]:h-[100%]"></div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <button onClick={() => handleDownload('png')} disabled={!url}
                  className="flex items-center justify-center gap-2 bg-slate-900 text-white py-3 px-4 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium active:scale-95 cursor-pointer">
                  <Download className="w-4 h-4" />
                  下载 PNG
                </button>
                <button onClick={() => setIsModalOpen(true)}
                  disabled={!url}
                  className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 py-3 px-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium active:scale-95 cursor-pointer"
                >
                  <Wand2 className="w-4 h-4 text-indigo-500" />
                  美化二维码
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section ref={featuresRef} className="bg-white py-24 border-t border-slate-100 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">核心优势</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">为什么选择 QR Master？</h2>
            <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">不仅仅是生成，我们提供更优质、更专业的二维码解决方案。</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Settings className="w-6 h-6 text-indigo-600" />, title: "高度可定制", desc: "自定义颜色、边距和尺寸，让二维码完美融入您的品牌设计风格，提升品牌形象。" },
              { icon: <Download className="w-6 h-6 text-indigo-600" />, title: "高清导出", desc: "支持高清 PNG 格式下载，像素完美，满足从网络展示到大幅面印刷的各种需求。" },
              { icon: <Share2 className="w-6 h-6 text-indigo-600" />, title: "跨平台兼容", desc: "生成的二维码经过优化，可在所有主流智能手机和扫描应用中快速、准确地识别。" },
              { icon: <Check className="w-6 h-6 text-indigo-600" />, title: "永久有效", desc: "生成的静态二维码不依赖于我们的服务器，只要您的链接有效，二维码就永久有效。" },
              { icon: <Users className="w-6 h-6 text-indigo-600" />, title: "无需注册", desc: "告别繁琐的注册流程，打开页面即可使用，保护您的隐私，提高工作效率。" },
              { icon: <Wand2 className="w-6 h-6 text-indigo-600" />, title: "实时预览", desc: "所见即所得。在您调整设置时，二维码会实时更新，确保您获得满意的结果。" },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="bg-slate-50 py-24 border-t border-slate-200 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">用户评价</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">深受用户信赖</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
                <div className="flex items-center gap-1 text-yellow-400 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-slate-700 text-lg leading-relaxed mb-8">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full bg-slate-200" />
                  <div>
                    <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={faqRef} className="bg-white py-24 border-t border-slate-100 scroll-mt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">常见问题</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">解答您的疑问</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 hover:border-indigo-200 bg-slate-50">
                <button onClick={() => toggleFaq(idx)} className="flex justify-between items-center w-full p-6 text-left focus:outline-none cursor-pointer">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    {faq.question}
                  </h3>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaqIndex === idx ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200/50">
            {/* Editor Header */}
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white flex-shrink-0">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-indigo-600" />
                二维码样式编辑器
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-80 md:w-96 border-r border-slate-200 bg-white overflow-y-auto p-6 space-y-8">
                {/* Current Style */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">当前样式</div>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-medium text-slate-700">自定义样式</span>
                    <button
                      onClick={() => {
                        setFgColor('#000000');
                        setBgColor('#ffffff');
                        setDotType('square');
                        setCornerSquareType('square');
                        setCornerDotType('square');
                        setLogo(null);
                      }}
                      className="text-xs text-red-600 font-medium border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      重置
                    </button>
                  </div>
                </div>

                {/* Logo Section */}
                <div className="space-y-3">
                  <div className="text-sm font-bold text-slate-800">Logo</div>
                  <div className="flex gap-3">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-2 px-3 border border-slate-300 rounded-md text-sm text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 bg-white cursor-pointer">
                      <Upload className="w-4 h-4" /> 上传Logo
                    </button>
                    <button onClick={() => setLogo(null)} className="flex-1 py-2 px-3 border border-slate-300 rounded-md text-sm text-slate-600 hover:border-red-500 hover:text-red-600 transition-colors flex items-center justify-center gap-2 bg-white cursor-pointer">
                      <X className="w-4 h-4" /> 清除
                    </button>
                  </div>
                </div>

                {/* Code Settings */}
                <div className="space-y-6">
                  <div className="text-sm font-bold text-slate-800">颜色设置</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-500">码颜色</label>
                      <div className="flex items-center gap-2 border border-slate-300 rounded-md p-1.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 hover:border-slate-400 transition-colors bg-white">
                        <div className="w-6 h-6 rounded border border-slate-200 flex-shrink-0 overflow-hidden relative">
                          <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 p-0 border-0 cursor-pointer" />
                        </div>
                        <span className="text-xs font-mono text-slate-600 flex-1">{fgColor}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-500">背景色</label>
                      <div className="flex items-center gap-2 border border-slate-300 rounded-md p-1.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 hover:border-slate-400 transition-colors bg-white">
                        <div className="w-6 h-6 rounded border border-slate-200 flex-shrink-0 overflow-hidden relative">
                          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 p-0 border-0 cursor-pointer" />
                        </div>
                        <span className="text-xs font-mono text-slate-600 flex-1">{bgColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm font-bold text-slate-800 pt-2">形状设置</div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-500">码点形状 (Dots)</label>
                      <select
                        value={dotType}
                        onChange={(e) => setDotType(e.target.value as DotType)}
                        className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="square">方块 (Square)</option>
                        <option value="dots">圆点 (Dots)</option>
                        <option value="rounded">圆角 (Rounded)</option>
                        <option value="classy">典雅 (Classy)</option>
                        <option value="classy-rounded">典雅圆角 (Classy Rounded)</option>
                        <option value="extra-rounded">超大圆角 (Extra Rounded)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-500">码眼外框</label>
                        <select
                          value={cornerSquareType}
                          onChange={(e) => setCornerSquareType(e.target.value as CornerSquareType)}
                          className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="square">方块 (Square)</option>
                          <option value="dot">圆点 (Dot)</option>
                          <option value="extra-rounded">圆角 (Rounded)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-500">码眼内点</label>
                        <select
                          value={cornerDotType}
                          onChange={(e) => setCornerDotType(e.target.value as CornerDotType)}
                          className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="square">方块 (Square)</option>
                          <option value="dot">圆点 (Dot)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm font-bold text-slate-800 pt-2">高级设置</div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-slate-600">容错率 (ECC)</label>
                      <select value={ecc} onChange={(e) => setEcc(e.target.value as ErrorCorrectionLevel)}
                        className="bg-slate-50 border border-slate-200 text-sm rounded px-2 py-1 text-slate-700 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="L">L (7%)</option>
                        <option value="M">M (15%)</option>
                        <option value="Q">Q (25%)</option>
                        <option value="H">H (30%)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-600">编码内容</label>
                      <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Preview Area */}
              <div className="flex-1 bg-slate-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                <div className="bg-white p-6 rounded-xl shadow-xl shadow-slate-200/50 mb-8 transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="w-80 h-80 relative flex items-center justify-center bg-white">
                    <div ref={modalQrRef} className="w-full h-full flex items-center justify-center [&>svg]:w-[100%] [&>svg]:h-[100%]"></div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <button onClick={() => setIsModalOpen(false)}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-12 rounded-lg shadow-lg shadow-green-600/20 transition-all active:scale-95 cursor-pointer"
                  >
                    完成编辑
                  </button>
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <button onClick={() => handleDownload('png')} className="hover:text-indigo-600 transition-colors font-medium cursor-pointer">
                      下载 PNG
                    </button>
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
