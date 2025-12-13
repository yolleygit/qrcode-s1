# QR Master - 二维码生成工具

这是一个基于 Next.js 和 qr-code-styling 开发的高级二维码生成工具，具有美化、自定义形状、颜色和 Logo 上传等功能。

## 功能特性

- **实时生成**：输入网址即可实时预览二维码。
- **高度定制**：
# QR Master - 免费在线二维码生成器

一个简单、快速、可定制的在线二维码生成工具。支持自定义颜色、Logo、码点样式等功能。

## ✨ 功能特性

- 🎨 **高度可定制** - 自定义颜色、边距、尺寸和样式
- 📥 **高清导出** - 支持 PNG 和 SVG 格式下载
- 🖼️ **Logo 支持** - 可在二维码中嵌入自定义 Logo
- 🎯 **实时预览** - 所见即所得的编辑体验
- 🌓 **暗黑模式** - 支持明亮/暗黑主题切换
- 🌍 **多语言支持** - 支持中文和英文界面
- 🔒 **隐私保护** - 完全在浏览器本地生成，不上传数据
- 💯 **完全免费** - 无需注册，即刻使用

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **样式**: Tailwind CSS v4
- **二维码生成**: qr-code-styling
- **图标**: Lucide React
- **主题**: next-themes
- **国际化**: next-intl

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看效果。

### 构建生产版本

```bash
npm run build
npm start
```

## 🌐 国际化

项目支持以下语言：

- 🇨🇳 简体中文 (zh)
- 🇺🇸 English (en)

### 访问不同语言版本

- 中文: `http://localhost:3000/zh`
- 英文: `http://localhost:3000/en`

默认语言为中文，访问根路径会自动重定向到 `/zh`。

### 添加新语言

1. 在 `messages/` 目录下创建新的语言文件（如 `ja.json`）
2. 在 `i18n.ts` 和 `middleware.ts` 中添加新语言代码
3. 在 `LanguageSwitcher.tsx` 中添加语言选项

## 📝 使用说明

1. 在输入框中输入您的网址
2. 点击"生成"按钮生成二维码
3. 点击"美化二维码"打开编辑器
4. 自定义颜色、样式、Logo 等
5. 点击"保存并下载"获取二维码图片

## 📄 License

MIT License

## 构建部署

```bash
npm run build
npm start
```


码点样式：
https://mhimg.clewm.net/cli/images/dot/1.png
https://mhimg.clewm.net/cli/images/dot/2.png
https://mhimg.clewm.net/cli/images/dot/16.png
https://mhimg.clewm.net/cli/images/dot/17.png
https://mhimg.clewm.net/cli/images/dot/4.png
https://mhimg.clewm.net/cli/images/dot/5.png
https://mhimg.clewm.net/cli/images/dot/15.png
https://mhimg.clewm.net/cli/images/dot/6.png
https://mhimg.clewm.net/cli/images/dot/7.png
https://mhimg.clewm.net/cli/images/dot/9.png
https://mhimg.clewm.net/cli/images/dot/10.png
https://mhimg.clewm.net/cli/images/dot/3.png
https://mhimg.clewm.net/cli/images/dot/11.png
https://mhimg.clewm.net/cli/images/dot/dot32.png


码眼样式：
https://mhimg.clewm.net/cli/images/eye/e1.png
https://mhimg.clewm.net/cli/images/eye/e3.png
https://mhimg.clewm.net/cli/images/eye/e2.png
https://mhimg.clewm.net/cli/images/eye/e20.png
https://mhimg.clewm.net/cli/images/eye/e19.png
https://mhimg.clewm.net/cli/images/eye/e4.png
https://mhimg.clewm.net/cli/images/eye/e18.png
https://mhimg.clewm.net/cli/images/eye/e16.png
https://mhimg.clewm.net/cli/images/eye/e5.png
https://mhimg.clewm.net/cli/images/eye/e6.png
https://mhimg.clewm.net/cli/images/eye/e8.png
https://mhimg.clewm.net/cli/images/eye/e7.png
https://mhimg.clewm.net/cli/images/eye/e22.png