# 变化二维码 API 文档

## 概述

变化二维码模块为 QR Master 提供动态视觉效果功能，支持颜色渐变动画、形状变换动画和呼吸效果等，同时保持二维码的可扫描性。

## 核心组件

### AnimatedQRSystem 变化二维码系统

变化二维码系统的核心类，负责管理所有动画效果的生成和渲染。

```typescript
interface AnimatedQRSystem {
  // 创建动画配置
  createAnimationConfig(type: AnimationType, options: AnimationOptions): AnimationConfig;
  
  // 生成动画二维码
  generateAnimatedQR(qrData: string, config: AnimationConfig): Promise<AnimatedQRResult>;
  
  // 导出动画
  exportAnimation(format: ExportFormat, quality: QualityLevel): Promise<Blob>;
  
  // 预览控制
  startPreview(): void;
  pausePreview(): void;
  resetPreview(): void;
}
```

### AnimationConfig 动画配置

定义动画类型、持续时间、循环方式等参数的配置对象。

```typescript
interface AnimationConfig {
  // 动画类型
  type: 'gradient' | 'shape-transform' | 'breathing';
  
  // 动画持续时间（秒）
  duration: number; // 0.5 - 10
  
  // 动画强度（百分比）
  intensity: number; // 10 - 50
  
  // 循环模式
  loop: boolean;
  
  // 颜色设置（渐变动画）
  colors?: {
    start: string;
    end: string;
    mode: 'linear' | 'radial' | 'conic';
  };
  
  // 形状设置（变换动画）
  shapes?: {
    from: ShapeType;
    to: ShapeType;
    transition: 'smooth' | 'elastic' | 'bounce';
  };
  
  // 呼吸设置
  breathing?: {
    mode: 'scale' | 'opacity';
    range: [number, number]; // [最小值, 最大值]
  };
}
```

### RenderEngine 渲染引擎

负责将静态二维码转换为动态效果的渲染系统。

```typescript
interface RenderEngine {
  // 渲染动画帧
  renderFrame(timestamp: number): void;
  
  // 设置渲染质量
  setQuality(quality: 'high' | 'medium' | 'low'): void;
  
  // 优化性能
  optimizeForMobile(): void;
  
  // 验证可扫描性
  validateScanability(): boolean;
}
```

### PreviewComponent 预览组件

实时显示动画效果的用户界面组件。

```typescript
interface PreviewComponentProps {
  config: AnimationConfig;
  qrData: string;
  size?: number;
  onConfigChange?: (config: AnimationConfig) => void;
}

interface PreviewComponent {
  // 播放控制
  play(): void;
  pause(): void;
  reset(): void;
  
  // 进度控制
  seekTo(progress: number): void;
  getCurrentProgress(): number;
  
  // 性能监控
  getFrameRate(): number;
  getPerformanceMetrics(): PerformanceMetrics;
}
```

### ExportModule 导出模块

将动画二维码导出为各种格式的功能模块。

```typescript
interface ExportModule {
  // 导出为 GIF
  exportAsGIF(config: GIFExportConfig): Promise<Blob>;
  
  // 导出为 MP4
  exportAsMP4(config: MP4ExportConfig): Promise<Blob>;
  
  // 导出为 SVG 动画
  exportAsSVG(config: SVGExportConfig): Promise<Blob>;
  
  // 获取导出进度
  getExportProgress(): ExportProgress;
}

interface ExportProgress {
  percentage: number;
  estimatedTimeRemaining: number;
  currentStep: string;
}
```

## 动画类型详解

### 1. 颜色渐变动画 (Gradient Animation)

创建流动的颜色变化效果，支持多种渐变模式。

```typescript
interface GradientAnimationOptions {
  // 渐变模式
  mode: 'linear' | 'radial' | 'conic';
  
  // 起始颜色
  startColor: string;
  
  // 结束颜色
  endColor: string;
  
  // 渐变方向（线性渐变）
  direction?: number; // 角度，0-360
  
  // 渐变中心（径向渐变）
  center?: [number, number]; // [x, y] 百分比
  
  // 动画速度
  speed: number; // 0.5-5秒
}
```

**使用示例：**
```typescript
const gradientConfig = {
  type: 'gradient',
  duration: 2,
  loop: true,
  colors: {
    start: '#ff6b6b',
    end: '#4ecdc4',
    mode: 'linear'
  }
};
```

### 2. 形状变换动画 (Shape Transform Animation)

实现二维码元素的形状变化，如方形到圆形的转换。

```typescript
interface ShapeTransformOptions {
  // 起始形状
  fromShape: 'square' | 'circle' | 'rounded' | 'diamond';
  
  // 目标形状
  toShape: 'square' | 'circle' | 'rounded' | 'diamond';
  
  // 变换周期
  period: number; // 1-10秒
  
  // 过渡效果
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
  
  // 是否保持结构完整性
  maintainStructure: boolean;
}
```

**使用示例：**
```typescript
const shapeConfig = {
  type: 'shape-transform',
  duration: 3,
  loop: true,
  shapes: {
    from: 'square',
    to: 'circle',
    transition: 'smooth'
  }
};
```

### 3. 呼吸效果 (Breathing Effect)

添加缩放或透明度变化的呼吸动画。

```typescript
interface BreathingOptions {
  // 呼吸模式
  mode: 'scale' | 'opacity' | 'both';
  
  // 缩放范围
  scaleRange: [number, number]; // [最小, 最大] 如 [0.9, 1.1]
  
  // 透明度范围
  opacityRange: [number, number]; // [最小, 最大] 如 [0.7, 1.0]
  
  // 呼吸周期
  period: number; // 1-8秒
  
  // 中心固定
  centerFixed: boolean;
}
```

**使用示例：**
```typescript
const breathingConfig = {
  type: 'breathing',
  duration: 4,
  loop: true,
  breathing: {
    mode: 'scale',
    range: [0.95, 1.05]
  }
};
```

## 导出格式

### GIF 导出

```typescript
interface GIFExportConfig {
  // 质量设置
  quality: 'high' | 'medium' | 'low';
  
  // 帧率
  frameRate: number; // 10-30 fps
  
  // 循环次数
  loopCount: number; // 0 = 无限循环
  
  // 文件大小限制
  maxFileSize?: number; // MB
}
```

### MP4 导出

```typescript
interface MP4ExportConfig {
  // 视频质量
  quality: 'high' | 'medium' | 'low';
  
  // 比特率
  bitrate: number; // kbps
  
  // 帧率
  frameRate: number; // 24-60 fps
  
  // 持续时间
  duration: number; // 秒
}
```

### SVG 动画导出

```typescript
interface SVGExportConfig {
  // 动画持续时间
  duration: number;
  
  // 是否包含交互控制
  includeControls: boolean;
  
  // 优化选项
  optimize: boolean;
  
  // 兼容性模式
  compatibility: 'modern' | 'legacy';
}
```

## 配置管理

### 保存配置

```typescript
interface ConfigManager {
  // 保存配置到本地存储
  saveConfig(name: string, config: AnimationConfig): Promise<void>;
  
  // 加载配置
  loadConfig(name: string): Promise<AnimationConfig>;
  
  // 获取所有配置
  getAllConfigs(): Promise<ConfigItem[]>;
  
  // 删除配置
  deleteConfig(name: string): Promise<void>;
  
  // 导入配置文件
  importConfig(file: File): Promise<AnimationConfig>;
  
  // 导出配置文件
  exportConfig(config: AnimationConfig): Promise<Blob>;
}

interface ConfigItem {
  name: string;
  config: AnimationConfig;
  createdAt: Date;
  thumbnail?: string;
}
```

## 性能优化

### 移动端优化

```typescript
interface MobileOptimization {
  // 检测设备性能
  detectDeviceCapability(): DeviceCapability;
  
  // 自动调整质量
  autoAdjustQuality(): void;
  
  // 优化渲染
  optimizeRendering(): void;
  
  // 内存管理
  manageMemory(): void;
}

interface DeviceCapability {
  isLowEnd: boolean;
  supportedFormats: ExportFormat[];
  maxResolution: [number, number];
  recommendedFrameRate: number;
}
```

### 性能监控

```typescript
interface PerformanceMetrics {
  // 帧率
  frameRate: number;
  
  // 内存使用
  memoryUsage: number; // MB
  
  // 渲染时间
  renderTime: number; // ms
  
  // CPU 使用率
  cpuUsage: number; // %
}
```

## 错误处理

### 常见错误类型

```typescript
enum AnimationErrorType {
  INVALID_CONFIG = 'invalid_config',
  RENDER_FAILED = 'render_failed',
  EXPORT_FAILED = 'export_failed',
  PERFORMANCE_WARNING = 'performance_warning',
  COMPATIBILITY_ERROR = 'compatibility_error'
}

interface AnimationError {
  type: AnimationErrorType;
  message: string;
  details?: any;
  suggestions?: string[];
}
```

### 错误处理策略

```typescript
interface ErrorHandler {
  // 处理配置错误
  handleConfigError(error: AnimationError): void;
  
  // 处理渲染错误
  handleRenderError(error: AnimationError): void;
  
  // 处理导出错误
  handleExportError(error: AnimationError): void;
  
  // 显示用户友好的错误信息
  showUserMessage(error: AnimationError): void;
}
```

## 浏览器兼容性

### 支持的浏览器

- **Chrome**: 88+
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 88+
- **移动浏览器**: iOS Safari 14+, Chrome Mobile 88+

### 功能降级

```typescript
interface CompatibilityManager {
  // 检测浏览器支持
  checkBrowserSupport(): BrowserSupport;
  
  // 启用降级模式
  enableFallbackMode(): void;
  
  // 获取支持的功能
  getSupportedFeatures(): Feature[];
}

interface BrowserSupport {
  webGL: boolean;
  canvas2D: boolean;
  webWorkers: boolean;
  fileAPI: boolean;
  animations: boolean;
}
```

## 使用示例

### 完整的动画二维码生成流程

```typescript
import { AnimatedQRSystem, AnimationConfig } from '@/lib/animated-qr';

// 1. 创建动画配置
const config: AnimationConfig = {
  type: 'gradient',
  duration: 3,
  intensity: 30,
  loop: true,
  colors: {
    start: '#ff6b6b',
    end: '#4ecdc4',
    mode: 'linear'
  }
};

// 2. 初始化系统
const animatedQR = new AnimatedQRSystem();

// 3. 生成动画二维码
const result = await animatedQR.generateAnimatedQR('https://example.com', config);

// 4. 开始预览
animatedQR.startPreview();

// 5. 导出为 GIF
const gifBlob = await animatedQR.exportAnimation('gif', 'high');

// 6. 保存配置
await configManager.saveConfig('我的渐变动画', config);
```

## 最佳实践

### 性能优化建议

1. **合理设置动画参数**
   - 移动设备建议使用较低的帧率（15-20 fps）
   - 避免过于复杂的动画效果
   - 适当限制动画持续时间

2. **内存管理**
   - 及时清理不使用的动画实例
   - 避免同时运行多个高强度动画
   - 使用对象池复用动画对象

3. **用户体验**
   - 提供动画预览功能
   - 显示导出进度和预估时间
   - 支持动画暂停和重置

4. **兼容性处理**
   - 检测设备性能并自动调整质量
   - 为低端设备提供简化版本
   - 优雅降级到静态二维码

### 安全考虑

1. **文件大小限制**
   - 限制导出文件的最大大小
   - 警告用户大文件可能的性能影响

2. **内存泄漏防护**
   - 正确清理动画定时器
   - 释放 Canvas 和 WebGL 资源

3. **用户数据保护**
   - 所有处理在客户端完成
   - 不上传用户的二维码数据
   - 本地存储配置加密保护