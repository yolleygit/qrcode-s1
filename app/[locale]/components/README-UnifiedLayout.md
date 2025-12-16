# 统一界面布局系统

本文档介绍了QR Master项目中的统一界面布局系统，确保三个核心功能（静态二维码、TOTP动态验证码、加密二维码）具有一致的界面布局和交互体验。

## 核心组件

### 1. UnifiedPageLayout - 统一页面布局

提供一致的页面结构，包括导航栏、标题区域、内容区域和侧边栏。

```tsx
import { UnifiedPageLayout } from '../components/UnifiedPageLayout';

<UnifiedPageLayout
  title="页面标题"
  subtitle="页面描述"
  activeTab="static" // 'static' | 'totp' | 'encrypted'
  showBackButton={true}
  statusBadge={{
    text: "状态标识",
    variant: "success", // 'success' | 'warning' | 'info' | 'beta'
    icon: <Icon className="w-4 h-4" />
  }}
  sidebar={<SidebarContent />}
>
  {/* 页面内容 */}
</UnifiedPageLayout>
```

**特性：**
- 自动适配移动端标签导航
- 响应式侧边栏（桌面端显示，移动端折叠）
- 统一的标题样式和状态徽章
- 无滚动模式支持

### 2. UnifiedContentLayout - 统一内容布局

提供一致的输入区、预览区、控制区布局。

```tsx
import { UnifiedContentLayout } from '../components/UnifiedContentLayout';

<UnifiedContentLayout
  inputTitle="输入配置"
  inputSubtitle="设置生成参数"
  previewTitle="实时预览"
  previewSubtitle="查看生成结果"
  previewActions={<ActionButtons />}
  inputArea={<InputForm />}
  previewArea={<PreviewComponent />}
  controlsArea={<AdvancedOptions />} // 可选
/>
```

**布局规则：**
- **桌面端 (≥1024px)**: 左右分栏布局
  - 有控制区：输入35% + 预览40% + 控制25%
  - 无控制区：输入45% + 预览55%
- **平板端 (768px-1023px)**: 上下分栏布局
- **移动端 (<768px)**: 折叠式布局

### 3. UnifiedActionButtons - 统一操作按钮

提供一致的操作按钮样式和行为。

```tsx
import { 
  UnifiedActionButtons, 
  createStandardQRActions 
} from '../components/UnifiedActionButtons';

// 使用预设的标准QR码操作
<UnifiedActionButtons
  buttons={createStandardQRActions({
    onDownload: handleDownload,
    onCopy: handleCopy,
    onShare: handleShare, // 可选
    disabled: !hasContent
  })}
  fullWidth={true}
  size="md"
/>

// 自定义按钮配置
<UnifiedActionButtons
  buttons={[
    {
      type: 'custom',
      label: '自定义操作',
      icon: <CustomIcon />,
      onClick: handleCustomAction,
      variant: 'primary'
    }
  ]}
/>
```

### 4. UnifiedStatusIndicator - 统一状态指示器

提供一致的状态反馈和进度指示。

```tsx
import { 
  UnifiedStatusIndicator, 
  RealTimeStatus 
} from '../components/UnifiedStatusIndicator';

// 实时状态指示器（用于所见即所得功能）
<RealTimeStatus
  isGenerating={isGenerating}
  hasContent={!!content}
  hasError={!!error}
  errorMessage={error}
  successMessage="生成成功"
  stats={{
    contentLength: content.length,
    quality: 'high'
  }}
/>

// 通用状态指示器
<UnifiedStatusIndicator
  status="success"
  message="操作成功"
  description="详细描述"
  showProgress={true}
  progress={75}
/>
```

## 设计系统

### 统一颜色方案

```tsx
import { unifiedColors, getFeatureColors } from '../lib/unifiedDesignSystem';

// 功能特色色彩
const staticColors = getFeatureColors('static');   // 蓝色系
const totpColors = getFeatureColors('totp');       // 绿色系
const encryptedColors = getFeatureColors('encrypted'); // 紫色系

// 语义色彩
const successColor = unifiedColors.semantic.success;
const warningColor = unifiedColors.semantic.warning;
```

### 统一间距系统

```tsx
import { unifiedSpacing } from '../lib/unifiedDesignSystem';

// 组件间距
const padding = unifiedSpacing.component.padding.md; // 16px
const margin = unifiedSpacing.component.margin.lg;   // 24px
const gap = unifiedSpacing.component.gap.md;         // 16px
```

### 统一组件样式

```tsx
import { unifiedComponentClasses } from '../lib/unifiedDesignSystem';

// 面板样式
<div className={unifiedComponentClasses.panel.base}>
  <div className={unifiedComponentClasses.panel.header}>
    标题
  </div>
  <div className={unifiedComponentClasses.panel.content}>
    内容
  </div>
</div>

// 按钮样式
<button className={cn(
  unifiedComponentClasses.button.base,
  unifiedComponentClasses.button.primary,
  unifiedComponentClasses.button.sizes.md
)}>
  按钮
</button>
```

## 实施指南

### 1. 页面结构标准化

所有功能页面应遵循以下结构：

```tsx
export default function FeaturePage() {
  return (
    <UnifiedPageLayout
      title="功能标题"
      subtitle="功能描述"
      activeTab="feature"
      statusBadge={{ /* 状态徽章 */ }}
      sidebar={ /* 侧边栏内容 */ }
    >
      <UnifiedContentLayout
        inputArea={ /* 输入区域 */ }
        previewArea={ /* 预览区域 */ }
        controlsArea={ /* 控制区域（可选） */ }
        previewActions={ /* 预览操作按钮 */ }
      />
    </UnifiedPageLayout>
  );
}
```

### 2. 视觉层次统一

- **标题层次**: 使用统一的字体大小和权重
- **间距规范**: 遵循设计系统的间距标准
- **颜色使用**: 使用功能特色色彩和语义色彩
- **圆角统一**: 使用统一的圆角规范

### 3. 交互反馈一致

- **状态指示**: 使用UnifiedStatusIndicator组件
- **操作按钮**: 使用UnifiedActionButtons组件
- **加载状态**: 统一的加载动画和进度指示
- **错误处理**: 一致的错误消息样式

### 4. 响应式适配

- **断点系统**: 使用统一的断点定义
- **布局切换**: 桌面端左右分栏，平板端上下分栏，移动端折叠式
- **触摸优化**: 移动端按钮最小44px高度
- **侧边栏处理**: 桌面端显示，移动端折叠

## 迁移指南

### 从现有布局迁移到统一布局

1. **替换页面容器**:
   ```tsx
   // 旧的
   <div className="min-h-screen">
     <UnifiedNavigation />
     <main>...</main>
   </div>
   
   // 新的
   <UnifiedPageLayout title="..." activeTab="...">
     ...
   </UnifiedPageLayout>
   ```

2. **替换内容布局**:
   ```tsx
   // 旧的
   <SmartLayout>
     <InputPanel>...</InputPanel>
     <PreviewPanel>...</PreviewPanel>
   </SmartLayout>
   
   // 新的
   <UnifiedContentLayout
     inputArea={...}
     previewArea={...}
   />
   ```

3. **替换操作按钮**:
   ```tsx
   // 旧的
   <button onClick={handleDownload}>下载</button>
   <button onClick={handleCopy}>复制</button>
   
   // 新的
   <UnifiedActionButtons
     buttons={createStandardQRActions({
       onDownload: handleDownload,
       onCopy: handleCopy
     })}
   />
   ```

4. **替换状态指示**:
   ```tsx
   // 旧的
   {error && <div className="error">{error}</div>}
   
   // 新的
   <RealTimeStatus
     hasError={!!error}
     errorMessage={error}
     isGenerating={isGenerating}
     hasContent={!!content}
   />
   ```

## 最佳实践

1. **保持一致性**: 所有功能页面使用相同的布局组件
2. **响应式优先**: 确保在所有设备上都有良好的体验
3. **无滚动体验**: 核心功能在单屏内完成
4. **实时反馈**: 使用统一的状态指示器提供即时反馈
5. **可访问性**: 遵循WCAG 2.1 AA标准
6. **性能优化**: 使用懒加载和代码分割

## 组件依赖关系

```
UnifiedPageLayout
├── UnifiedNavigation (已存在)
├── MobileTabNavigation (已存在)
└── UnifiedContentLayout
    ├── UnifiedActionButtons
    ├── UnifiedStatusIndicator
    └── RealTimeStatus

unifiedDesignSystem
├── unifiedColors
├── unifiedSpacing
├── unifiedTypography
├── unifiedBorderRadius
├── unifiedShadows
└── unifiedComponentClasses
```

通过使用这套统一布局系统，可以确保QR Master的三个核心功能具有一致的用户体验，同时提高开发效率和维护性。