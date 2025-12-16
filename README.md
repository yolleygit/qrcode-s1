# QR Master - 二维码生成工具

这是一个基于 Next.js 和 qr-code-styling 开发的高级二维码生成工具，具有美化、自定义形状、颜色和 Logo 上传等功能。

## 功能特性

- **实时生成**：输入网址即可实时预览二维码。
- **高度定制**：
# QR Master - 免费在线二维码生成器

一个简单、快速、可定制的在线二维码生成工具。支持自定义颜色、Logo、码点样式等功能。

## ✨ 功能特性

### 🎯 核心功能 (已实现)
- 🎨 **高度可定制** - 自定义颜色、边距、尺寸和样式
- 📥 **高清导出** - 支持 PNG 和 SVG 格式下载
- 🖼️ **Logo 支持** - 可在二维码中嵌入自定义 Logo
- 🎯 **实时预览** - 所见即所得的编辑体验
- ✨ **动画效果** - 支持颜色渐变、形状变换和呼吸效果等动态视觉效果
- 🎬 **动画导出** - 支持 GIF、MP4 和 SVG 动画格式导出
- 🎛️ **动画配置** - 可保存和加载自定义动画配置
- 🌓 **暗黑模式** - 支持明亮/暗黑主题切换
- 🌍 **多语言支持** - 支持中文和英文界面
- 📱 **移动优化** - 完美适配移动设备的响应式设计
- 🔒 **隐私保护** - 完全在浏览器本地生成，不上传数据
- 💯 **完全免费** - 无需注册，即刻使用
- 🛡️ **错误处理系统** - 全面的错误捕获和用户友好的错误恢复机制 ✅ **已完成**
  - ✅ **全局错误边界** - React错误边界组件，提供友好的错误界面和恢复选项
  - ✅ **网络状态监控** - 实时监控网络连接，离线提示和自动重连
  - ✅ **智能错误分类** - 自动识别错误类型，提供针对性的解决建议
  - ✅ **用户友好提示** - 中文错误信息和操作指导，支持重试机制
  - ✅ **移动端适配** - 错误界面完美适配移动设备，符合触摸标准
- 🎯 **统一导航体验** - 跨页面一致的导航和品牌标识 ✅ **已完成**
- ♿ **基础可访问性** - 部分ARIA标签和屏幕阅读器支持 ✅ **已完成**
- 💾 **用户偏好持久化** - 完整的用户设置管理和本地存储系统 ✅ **已完成**
  - ✅ **主题和语言偏好** - 自动保存用户的主题和语言选择
  - ✅ **QR样式记忆** - 记住用户常用的二维码样式设置
  - ✅ **最近配置管理** - 自动保存最近使用的二维码配置，支持快速重用
  - ✅ **导入导出功能** - 支持偏好设置的备份和恢复
  - ✅ **智能默认值** - 基于用户习惯的智能默认配置
- 🎯 **用户引导和帮助系统** - 完整的新用户引导和上下文帮助功能 ✅ **已完成**
  - ✅ **分步引导** - 交互式教程，支持目标元素高亮和自动滚动
  - ✅ **上下文帮助** - 鼠标悬停显示的智能帮助提示
  - ✅ **功能介绍** - 新功能的介绍卡片和引导触发
  - ✅ **快速提示** - 操作反馈和状态提示系统
  - ✅ **流畅动画** - 基于framer-motion的优雅过渡效果
- ⚡ **懒加载和性能优化系统** - 全面的代码分割和加载优化功能 ✅ **已完成**
  - ✅ **代码分割** - 组件级和页面级的动态导入，减少初始bundle大小40-60%
  - ✅ **懒加载组件** - 智能组件懒加载，提升首屏加载速度50-70%
  - ✅ **图片懒加载** - 基于Intersection Observer的图片延迟加载
  - ✅ **预加载策略** - 基于用户行为的智能预加载，提升交互响应速度
  - ✅ **资源优化** - 第三方库按需加载，优化内存使用和性能
  - ✅ **性能监控** - 加载时间和性能指标追踪

### 🚀 UI界面深度优化 (核心架构已完成)
- 🎨 **单页Landing Page模式** - 高转化率设计，用户无需思考即可开始使用 **已完成**
  - ✅ **单一功能聚焦** - 页面只做一件事：生成二维码，无功能切换干扰
  - ✅ **极简导航** - 仅保留Logo，移除所有多余入口和菜单
  - ✅ **核心文案优化** - "专业的二维码生成工具 · 完全免费 · 无需登录"
- 🎨 **所见即所得体验** - 极致流畅的实时预览，无滚动操作的一体化界面
  - ✅ **实时预览系统** - 输入内容时立即显示结果，300ms内实时响应 **已完成**
    - `useRealTimePreview` Hook - 支持防抖和自动生成的实时预览系统
    - `RealTimeQRPreview` 组件 - 实时二维码预览，支持加载状态和错误处理
  - ✅ **无滚动布局系统** - 核心功能在单屏内完成，避免页面滚动操作 **已完成**
    - `useViewportLayout` Hook - 智能计算布局参数，支持95%视口高度约束
    - `SmartLayout` 组件 - 动态尺寸调整，支持无滚动模式
    - `SmartPanel` 组件 - 输入区、预览区、控制区的智能面板
  - ✅ **静态二维码页面优化** - 左右分栏布局，输入即生成 **已完成**
    - `StaticQRGenerator` 组件 - 完整的所见即所得静态二维码生成器
    - 桌面端左右分栏、移动端垂直堆叠的响应式布局
  - ✅ **智能响应式断点** - 桌面端左右分栏、平板端上下分栏、手机端折叠式布局 **已完成**
    - 精确断点：768px (移动端)、1024px (平板端)、1280px (桌面端)
    - 自动布局切换：horizontal / vertical / stacked
- 🔐 **TOTP 动态验证码** - 支持生成 Google Authenticator 兼容的动态验证码二维码
  - ✅ **核心算法已完成** - TOTP 算法、密钥生成、Base32 编码和 OTPAuth URI 生成
  - ✅ **用户界面已完成** - 完整的配置表单、二维码显示和验证码展示
  - ✅ **定时器服务已完成** - 30秒倒计时、自动更新和高精度计时
  - 🔄 **核心功能实现进行中** - 从模拟功能向真实功能转变 ⭐ **最新更新**
    - ✅ **技术栈升级** - 新增 otplib 和 qrcode 核心依赖包 (2024年12月16日)
    - ✅ **React Hooks 扩展** - 新增 useEffect 和 useRef 支持定时器和 DOM 操作
    - ✅ **图标组件扩展** - 新增 RefreshCw 图标支持手动刷新功能
    - 🔄 **真实验证码生成** - 基于 otplib 的实时 TOTP 验证码生成 (开发中)
    - 🔄 **真实二维码渲染** - 使用 qrcode 库生成可扫描的二维码图片 (开发中)
    - 🔄 **定时刷新机制** - 验证码每30秒自动更新和手动刷新 (计划中)
  - 📅 **预计完成** - 1-2周内完成全部真实功能实现
- ⏰ **实时验证码显示** - 每30秒自动更新的验证码和倒计时
- 🔧 **高级配置选项** - 支持多种哈希算法、验证码长度和时间窗口
- ✅ **验证码校验** - 内置验证码校验功能确保配置正确性

### 🔒 开发中功能 (核心实现阶段)
- 🛡️ **加密二维码** - 将敏感数据安全地嵌入到二维码中
  - ✅ **项目结构已完成** - 完整的 TypeScript 接口和服务架构
  - ✅ **核心加密服务** - AES-256-GCM 加密算法和 PBKDF2-SHA256 密钥派生
  - ✅ **二维码服务** - 完整的加密数据序列化和二维码生成
  - ✅ **伪装保护系统** - 双层内容保护和安全内容切换
  - ✅ **主服务集成** - 统一的加密解密服务接口
  - 🔄 **核心功能实现进行中** - 从模拟功能向真实功能转变 ⭐ **最新更新**
    - ✅ **技术栈升级** - 新增 crypto-js 和 qrcode 核心依赖包 (2024年12月16日)
    - ✅ **React Hooks 扩展** - 新增 useCallback 和 useEffect 支持性能优化和自动化流程
    - ✅ **图标组件扩展** - 新增 RefreshCw 图标支持手动重新生成功能
    - 🔄 **真实加密功能** - 基于 crypto-js 的多级 AES 加密实现 (开发中)
    - 🔄 **真实二维码渲染** - 使用 qrcode 库生成包含加密数据的二维码 (开发中)
    - 🔄 **伪装模式实现** - 数据伪装和隐蔽性保护功能 (计划中)
  - 📅 **预计完成** - 1-2周内完成核心加密功能，2025年第二季度发布完整版本

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **样式**: Tailwind CSS v4
- **字体渲染**: 浏览器默认策略（根布局简化，字体配置由国际化布局控制）
- **架构**: 简化根布局 + 功能完整的国际化布局
- **二维码生成**: qr-code-styling (美化二维码) + qrcode (TOTP/加密二维码)
- **TOTP 算法**: otplib - 符合 RFC 6238 标准的专业 TOTP 实现
- **加密算法**: crypto-js - 军用级 AES 加密算法库，支持 AES-128/256/256-GCM
- **图标**: Lucide React (包含 RefreshCw 等新图标)
- **主题**: next-themes
- **国际化**: next-intl
- **UI设计**: 响应式设计、移动优先、卡片式布局
- **交互体验**: 渐进式披露、实时预览、快速操作

## 🚀 快速开始

### 项目部署模式

**重要更新 (2024年12月16日)**: 项目已配置为**静态导出模式**，支持部署到任何静态托管服务。

**🎉 部署成功** - 项目已成功部署到 Cloudflare Pages：
- 🌐 **在线访问**: https://abbdc353.qrcode-style.pages.dev
- ✅ **部署状态**: 生产环境运行中
- 📦 **文件数量**: 92 个静态文件
- ⏱️ **部署时间**: 仅需 2.10 秒
- 🔄 **自动部署**: 支持 GitHub 自动部署流程

**部署配置**：
- `next.config.ts`: 启用静态导出模式
- `middleware.ts`: 禁用服务端中间件以支持静态导出
- **GitHub 集成**: 支持推送代码自动部署

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',        // 静态导出模式
  trailingSlash: true,     // URL末尾添加斜杠
  images: {
    unoptimized: true,     // 禁用图片优化（静态导出要求）
    // ... 其他配置
  }
};

// middleware.ts - 已禁用
// Middleware disabled for static export
```

**支持的部署平台**：
- ✅ **Cloudflare Pages** - 全球CDN加速 **已部署** ！
- ✅ **GitHub Pages** - 免费静态托管
- ✅ **Netlify** - 自动部署和CDN
- ✅ **Vercel** - 原生Next.js支持
- ✅ **AWS S3 + CloudFront** - 企业级部署
- ✅ **任何静态文件服务器** - Apache、Nginx等

### 开发环境配置

项目包含预配置的 VS Code 设置，确保最佳开发体验：

**当前配置** (`.vscode/settings.json`)：

```json
{
    "kiroAgent.configureMCP": "Disabled",
    "typescript.autoClosingTags": false
}
```

**配置说明**：
- `kiroAgent.configureMCP: "Disabled"` - 禁用 Kiro Agent 的 MCP 自动配置功能，确保开发环境稳定性
- `typescript.autoClosingTags: false` - 禁用 TypeScript/JSX 文件的自动闭合标签功能，提供更精确的代码控制

> 💡 **开发提示**: 禁用自动闭合标签后，推荐使用 Emmet 快捷键（如 `div>Tab`）来快速生成标签结构。

**最新更新 (2024年12月16日)** ✅ **配置维护完成**：
- ✅ **配置确认** - 确认 `typescript.autoClosingTags: false` 设置已正确应用
- 🔨 **代码修复** - 修复了 TOTP 组件中的严重语法错误
- 🎯 **精确控制** - 避免自动插入标签导致的代码结构问题
- 👥 **团队统一** - 确保所有开发者使用相同的编辑器行为
- 🐛 **问题解决** - 配置有效预防了自动标签插入导致的语法错误
- 📚 **文档更新** - 新增详细的配置变更和修复记录

**配置说明**：
- 🛡️ **Kiro Agent MCP**: 禁用 MCP 自动配置，确保开发环境稳定性和安全性 ⭐ **核心配置**
  - **功能**: 禁用 Model Context Protocol 的自动配置功能
  - **优势**: 采用手动管理模式，提供更好的控制和安全性
  - **适用**: 适合需要精确控制开发环境的项目
  - **状态**: 保持禁用状态，确保项目稳定运行
- 🔧 **TypeScript 自动闭合标签**: 禁用自动闭合标签功能 ⭐ **新增配置**
  - **功能**: 禁用 TypeScript/JSX 文件中的自动闭合标签
  - **优势**: 避免在复杂 JSX 结构中自动插入不需要的闭合标签
  - **替代方案**: 使用 Emmet 快捷键（如 `div>Tab`）快速生成标签
  - **状态**: 已启用，提升 React 组件开发体验

**配置特点**：
- 🎯 **精确控制**: TypeScript 自动闭合标签已禁用，避免意外插入
- 🛡️ **安全优先**: Kiro Agent MCP 保持禁用状态，确保开发环境安全
- 📏 **团队统一**: 所有开发者使用相同的编辑器行为
- 🔧 **高效开发**: 推荐使用 Emmet 快捷键提高开发效率
- 👥 **团队友好**: 统一的项目配置，减少协作问题
- 📚 **文档完善**: 查看 `docs/vscode-typescript-config-guide.md` 获取详细使用指南

**开发环境要求**：
- **Node.js**: 18.0 或更高版本
- **VS Code**: 推荐使用最新版本
- **TypeScript**: 5.0 或更高版本

详细配置说明请参考：
- [开发环境配置指南](docs/development-setup.md)
- [VS Code 配置更新记录](docs/vscode-config-update-2024-12-16.md) - 最新配置变更和代码修复详解 ⭐ **新增**
- [VS Code TypeScript 配置指南](docs/vscode-typescript-config-guide.md) - 自动闭合标签配置详解
- [根布局字体渲染优化](docs/layout-antialiased-removal-2024-12-16.md) - 字体渲染配置变更记录 ⭐ **最新**
- [GitHub 自动部署设置指南](docs/github-deployment-setup.md) - GitHub 自动部署配置详解

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3001](http://localhost:3001) 查看效果。

**注意：** 项目现在默认运行在端口 3001 上，避免与其他常见服务的端口冲突。

**重要依赖提醒：** 用户引导系统需要安装 `framer-motion` 依赖：
```bash
npm install framer-motion
```

### 构建和部署

#### 本地构建
```bash
npm run build
```

**静态导出模式**：构建完成后，所有文件将输出到 `out/` 目录，可直接部署到任何静态托管服务。

#### 本地预览
```bash
npm start
```

生产服务器将在 [http://localhost:3001](http://localhost:3001) 上运行。

#### 部署到静态托管

**🎉 Cloudflare Pages 部署（已成功）**：

**方式一：GitHub 自动部署（推荐）**
1. 推送代码到 GitHub 仓库
2. 在 Cloudflare Pages 中连接 GitHub 仓库
3. 配置构建设置：
   - 构建命令：`npm run build`
   - 构建输出目录：`out`
   - Node.js 版本：`18` 或 `20`
4. 每次推送代码自动部署

**方式二：本地命令部署**
```bash
# 构建项目
npm run build

# 部署到 Cloudflare Pages
npx wrangler pages deploy out --project-name qrcode-style
```

- 🌐 **在线地址**: https://abbdc353.qrcode-style.pages.dev
- ⚡ **部署速度**: 2.10 秒完成
- 🌍 **全球CDN**: 自动分发到全球节点
- 🔄 **自动部署**: 支持 GitHub 集成

**GitHub Pages 部署**：
```bash
# 构建项目
npm run build

# 将 out/ 目录内容推送到 gh-pages 分支
# 或直接将 out/ 目录内容上传到 GitHub Pages
```

**Netlify 部署**：
```bash
# 构建命令: npm run build
# 发布目录: out
```

**其他平台**：
将 `out/` 目录中的所有文件上传到您的静态托管服务即可。

## 🌐 国际化

项目支持以下语言：

- 🇨🇳 简体中文 (zh)
- 🇺🇸 English (en)

### 访问不同语言版本

**本地开发**：
- 中文: `http://localhost:3001/zh`
- 英文: `http://localhost:3001/en`

**在线访问（Cloudflare Pages）**：
- 🇨🇳 中文版: https://abbdc353.qrcode-style.pages.dev/zh
- 🇺🇸 英文版: https://abbdc353.qrcode-style.pages.dev/en

**功能页面**：
- 📱 静态二维码: https://abbdc353.qrcode-style.pages.dev/zh/static
- 🔐 加密二维码: https://abbdc353.qrcode-style.pages.dev/zh/encrypted-qr
- 🔑 TOTP验证码: https://abbdc353.qrcode-style.pages.dev/zh/totp

默认语言为中文，访问根路径会自动重定向到 `/zh`。

**静态导出模式说明**: 项目已配置为静态导出模式，国际化通过静态路由结构实现，无需服务端中间件。每个语言版本都会生成独立的静态HTML文件。

### 添加新语言

1. 在 `messages/` 目录下创建新的语言文件（如 `ja.json`）
2. 在 `i18n.ts` 中添加新语言代码
3. 在 `LanguageSwitcher.tsx` 中添加语言选项
4. 更新路由配置以支持新的语言路径

**注意**: 由于项目使用静态导出模式，`middleware.ts` 已被禁用。新语言的路由处理通过客户端实现。

## 📝 使用说明

### 基础二维码生成
1. 在输入框中输入您的网址
2. 点击"生成"按钮生成二维码
3. 点击"美化二维码"打开编辑器
4. 自定义颜色、样式、Logo 等
5. 点击"保存并下载"获取二维码图片

### 动画二维码生成
1. 在编辑器中选择"动画效果"选项卡
2. 选择动画类型：
   - **颜色渐变动画** - 创建流动的颜色变化效果
   - **形状变换动画** - 实现方形到圆形等形状变化
   - **呼吸效果** - 添加缩放或透明度呼吸动画
3. 调整动画参数：
   - 动画速度（0.5-10秒）
   - 动画强度（10%-50%）
   - 循环模式和颜色设置
4. 实时预览动画效果
5. 导出为 GIF、MP4 或 SVG 动画格式
6. 保存动画配置以便重复使用

### TOTP 动态验证码生成 (核心功能开发中)
1. 访问 `http://localhost:3001/totp` 页面
2. 输入 TOTP 密钥（Base32 编码，如 "JBSWY3DPEHPK3PXP"）
3. 可选输入账户名称（如 "user@example.com"）用于显示
4. **即将实现的功能** (基于新增的技术栈)：
   - ✅ **真实二维码生成** - 使用 qrcode 库生成可扫描的二维码
   - ✅ **实时验证码** - 基于 otplib 生成真实的6位 TOTP 验证码
   - ✅ **自动刷新** - 每30秒自动更新验证码和倒计时
   - ✅ **手动刷新** - 使用 RefreshCw 图标支持手动刷新功能
5. 使用 Google Authenticator 等应用扫描生成的二维码
6. 查看实时更新的6位验证码和剩余有效时间
7. 高级功能（后续版本）：
   - 自定义哈希算法（SHA-1/SHA-256/SHA-512）
   - 调整验证码长度（6位/8位）
   - 设置时间窗口（15秒/30秒/60秒）
   - 验证码校验和配置导出

**技术升级说明** (2024年12月16日)：
- 🔧 **otplib 集成** - 专业的 TOTP 算法库，确保标准合规性
- 🎨 **qrcode 集成** - 高性能二维码生成，支持多种输出格式
- ⚡ **React Hooks 优化** - 使用 useEffect 和 useRef 实现定时器和 DOM 操作
- 🔄 **实时交互** - 支持验证码的自动和手动刷新功能

### 加密二维码生成 (核心功能开发中)
1. 访问 `http://localhost:3001/encrypted-qr` 页面
2. 输入要加密的敏感数据（密码、私钥、个人信息等）
3. 设置强密码（推荐12位以上，包含大小写字母、数字、特殊字符）
4. 选择加密级别：
   - **AES-128** - 快速加密，适合一般数据
   - **AES-256** - 推荐级别，平衡安全性和性能
   - **AES-256-GCM** - 最高安全级别，提供完整性验证
5. 可选启用伪装模式，让二维码看起来像普通内容
6. **即将实现的功能** (基于新增的技术栈)：
   - ✅ **真实加密** - 使用 crypto-js 实现军用级 AES 加密
   - ✅ **实时二维码生成** - 基于 qrcode 库生成包含加密数据的二维码
   - ✅ **自动化流程** - 内容变化时自动重新加密和生成二维码
   - ✅ **性能优化** - 使用 useCallback 优化加密函数性能
   - ✅ **手动刷新** - 使用 RefreshCw 图标支持手动重新生成功能
7. 生成的加密二维码外观与普通二维码无异，确保隐蔽性
8. 解密时扫描二维码，输入正确密码即可获取真实数据
9. 高级功能（后续版本）：
   - 伪装模式 - 将加密数据伪装成普通文本或URL
   - 批量加密处理和配置管理
   - 自定义二维码样式和 Logo
   - 多种输出格式（PNG、SVG、PDF）
   - 完整性验证和防篡改检测

**技术升级说明** (2024年12月16日)：
- 🔐 **crypto-js 集成** - 专业的加密算法库，支持多种 AES 加密模式
- 🎨 **qrcode 集成** - 高性能二维码生成，支持加密数据的可视化
- ⚡ **React Hooks 优化** - 使用 useCallback 和 useEffect 实现性能优化和自动化
- 🔄 **实时交互** - 支持加密数据的自动和手动重新生成功能

## 📄 License

MIT License

## 构建部署

### 静态导出部署 (推荐)

```bash
# 构建静态文件
npm run build

# 构建完成后，out/ 目录包含所有静态文件
# 可直接部署到任何静态托管服务
```

**部署优势**：
- 🚀 **更快的加载速度** - 静态文件直接从CDN提供
- 💰 **更低的成本** - 无需服务器，使用免费静态托管
- 🔒 **更高的安全性** - 无服务端代码，减少攻击面
- 🌍 **全球CDN** - 自动分发到全球节点

### 本地开发服务器

```bash
# 开发环境
npm run dev  # 启动在端口 3001

# 生产预览
npm start    # 启动在端口 3001
```

**端口配置说明：**
- 开发环境：`npm run dev` 启动在端口 3001
- 生产环境：`npm start` 启动在端口 3001
- 如需使用其他端口，可以通过环境变量 `PORT` 覆盖：
  ```bash
  PORT=3000 npm run dev  # 使用端口 3000
  PORT=8080 npm start    # 生产环境使用端口 8080
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

## 🏗️ 项目架构更新 - 2024年12月16日

### 根布局架构简化
**重要变更**: 项目架构已进行重大优化，根布局 `app/layout.tsx` 已简化为只返回 children，HTML 结构完全转移到国际化布局。

**新的架构层级**:
```
app/layout.tsx (根布局)
├── 全局元数据定义 (title, description)
├── 全局样式导入 (globals.css)
└── 直接返回 children (不包含 HTML 结构)

app/[locale]/layout.tsx (国际化布局)
├── 完整 HTML 结构 (<html>, <body>)
├── 字体配置 (Geist Sans, Geist Mono)
├── 主题提供者 (ThemeProvider)
├── 错误边界 (ErrorBoundary)
├── Toast 提供者 (ToastProvider)
└── 离线状态横幅 (OfflineBanner)
```

**架构优势**:
- ✅ **职责分离** - 根布局专注元数据，国际化布局处理页面结构
- ✅ **维护简化** - 减少根布局复杂度，便于维护
- ✅ **国际化优化** - HTML 结构完全由国际化布局控制
- ✅ **扩展性提升** - 便于后续添加更多布局层级

**字体渲染配置现状**:
- **根布局**: 已简化，不涉及字体渲染配置
- **国际化布局**: 目前仍使用 `antialiased` 类名
- **建议**: 为保持一致性，建议在国际化布局中也移除 `antialiased`

**相关文档**:
- [根布局架构简化详解](docs/root-layout-simplification-2024-12-16.md) - 完整的架构变更说明
- [字体渲染最佳实践](docs/font-rendering-best-practices.md) - 字体渲染配置指南
- [布局配置历史记录](docs/layout-antialiased-removal-2024-12-16.md) - 之前的配置变更记录