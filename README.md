# QR Master - 二维码生成工具

这是一个基于 Next.js 和 qr-code-styling 开发的高级二维码生成工具，具有美化、自定义形状、颜色和 Logo 上传等功能。

## 功能特性

- **实时生成**：输入网址即可实时预览二维码。
- **高度定制**：
  - 自定义前景色和背景色。
  - 选择不同的码点形状 (Square, Dots, Rounded 等)。
  - 自定义码眼 (Corners) 样式。
  - 调整边距和容错率。
- **Logo 支持**：支持上传 Logo 并叠加在二维码中心。
- **高清导出**：支持下载 PNG 格式的高清图片。
- **完全免费**：纯前端实现，无服务器存储，隐私安全。

## 技术栈

- **框架**: [Next.js 15](https://nextjs.org/) (App Router)
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/)
- **图标**: [Lucide React](https://lucide.dev/)
- **核心库**: [qr-code-styling](https://www.npmjs.com/package/qr-code-styling)

## 开始使用

1. 安装依赖：

```bash
npm install
```

2. 启动开发服务器：

```bash
npm run dev
```

3. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

## 构建部署

```bash
npm run build
npm start
```
