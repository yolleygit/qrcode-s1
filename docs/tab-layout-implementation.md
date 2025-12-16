# QR Master 布局系统说明

## 概述

项目支持两种布局模式，可根据需求灵活选择：

1. **单页Landing Page模式** - 高转化率设计，专注静态二维码生成
2. **Tab切换多功能模式** - 支持静态二维码、TOTP验证码、加密二维码三大功能

## 当前架构 (2024年12月16日更新)

### TabBasedLayout 组件已恢复 ✅

`TabBasedLayout.tsx` 组件已重新添加到项目中，提供完整的多功能切换体验。

## 布局模式对比

### 模式一：单页Landing Page（主页默认）
- 页面只做一件事：**生成静态二维码**
- 无功能切换，用户直接开始操作
- 适合快速生成场景

### 模式二：Tab切换多功能布局
- 支持三大功能切换：静态二维码 / TOTP验证码 / 加密二维码
- 左右双栏布局，信息展示与操作区分离
- 适合需要多种二维码功能的用户

## TabBasedLayout 组件结构

```
┌─────────────────────────────────────────────────────┐
│                    TabBasedLayout                    │
├──────────────────┬──────────────────────────────────┤
│   左侧信息卡片    │         右侧功能操作区            │
│   (300px固定)    │         (自适应宽度)              │
├──────────────────┼──────────────────────────────────┤
│  ┌─────────────┐ │  ┌────────────────────────────┐  │
│  │ Tab导航栏   │ │  │                            │  │
│  │ 静态|TOTP|加密│ │  │   StaticQRGenerator       │  │
│  ├─────────────┤ │  │   或 TOTPGenerator         │  │
│  │ 功能图标    │ │  │   或 EncryptedQRGenerator  │  │
│  │ 功能标题    │ │  │                            │  │
│  │ 功能描述    │ │  │   (根据选中Tab切换)         │  │
│  │ 核心特性    │ │  │                            │  │
│  │ 使用提示    │ │  └────────────────────────────┘  │
│  └─────────────┘ │                                  │
└──────────────────┴──────────────────────────────────┘
```

## Tab 配置详情

| Tab ID | 标题 | 状态 | 核心功能 |
|--------|------|------|----------|
| `static` | 静态二维码 | 可用 | 实时预览、高清导出、样式定制 |
| `totp` | 动态验证码 | 测试 | Google兼容、实时更新、安全可靠 |
| `encrypted` | 加密二维码 | 测试 | AES-256加密、伪装保护、本地处理 |

## 技术实现

### 核心文件
- `app/[locale]/components/TabBasedLayout.tsx` - Tab切换布局组件
- `app/[locale]/page.tsx` - 主页（单页Landing Page模式）
- `app/[locale]/components/StaticQRGenerator.tsx` - 静态二维码生成器
- `app/[locale]/components/TOTPGenerator.tsx` - TOTP验证码生成器
- `app/[locale]/components/EncryptedQRGenerator.tsx` - 加密二维码生成器

### 布局特性
- **固定高度容器**: 520px，确保无滚动体验
- **响应式设计**: 移动端垂直堆叠，桌面端左右分栏
- **平滑过渡**: Tab切换使用opacity过渡动画（150ms）
- **状态保持**: 切换Tab时保持各功能组件状态

### 使用方式

```tsx
import { TabBasedLayout } from './components/TabBasedLayout';

// 在页面中使用
<TabBasedLayout
  onSelectRecentConfig={(config) => console.log('选中配置:', config)}
  onShowPreferences={() => setShowPreferences(true)}
/>
```

## 构建状态

✅ 构建通过 - TabBasedLayout 组件已恢复并可用