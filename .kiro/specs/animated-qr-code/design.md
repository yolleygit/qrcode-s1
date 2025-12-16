# 动态验证码二维码模块设计文档

## 概述

本设计文档描述了为 QR Master 应用添加 TOTP（Time-based One-Time Password）动态验证码功能的技术实现方案。该功能将允许用户生成符合 Google Authenticator 标准的二维码，并实时显示每30秒更新的验证码，为用户提供完整的双因素认证设置体验。

## 架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    TOTP 二维码模块                           │
├─────────────────────────────────────────────────────────────┤
│  UI Layer                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   TOTP Form     │  │  QR Display     │  │ Countdown   │  │
│  │   Component     │  │   Component     │  │ Component   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ TOTP Generator  │  │  QR Generator   │  │   Timer     │  │
│  │    Service      │  │    Service      │  │  Service    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ Secret Manager  │  │ Config Storage  │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

- **前端框架**: React 18 with TypeScript
- **TOTP算法**: RFC 6238 标准实现
- **加密库**: Web Crypto API / crypto-js
- **二维码生成**: qr-code-styling (现有)
- **状态管理**: React Hooks (useState, useEffect, useRef)
- **样式**: Tailwind CSS (现有)
- **时间处理**: 原生 JavaScript Date API

## 组件和接口

### 核心组件

#### 1. TOTPGenerator 组件
```typescript
interface TOTPGeneratorProps {
  onConfigChange?: (config: TOTPConfig) => void;
  initialConfig?: Partial<TOTPConfig>;
}

interface TOTPConfig {
  serviceName: string;
  accountName: string;
  secret: string;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: 6 | 8;
  period: 15 | 30 | 60;
}
```

#### 2. TOTPDisplay 组件
```typescript
interface TOTPDisplayProps {
  config: TOTPConfig;
  currentCode: string;
  timeRemaining: number;
  onVerify?: (code: string) => boolean;
}
```

#### 3. QRCodeDisplay 组件
```typescript
interface QRCodeDisplayProps {
  otpauthUri: string;
  size?: number;
  style?: QRCodeStyle;
}
```

### 服务接口

#### TOTP Service
```typescript
interface TOTPService {
  generateSecret(): string;
  generateCode(secret: string, timestamp?: number): string;
  verifyCode(secret: string, code: string, window?: number): boolean;
  generateOtpauthUri(config: TOTPConfig): string;
  getCurrentTimeStep(period: number): number;
  getTimeRemaining(period: number): number;
}
```

#### Secret Manager
```typescript
interface SecretManager {
  generateSecureSecret(): string;
  encodeBase32(buffer: Uint8Array): string;
  decodeBase32(encoded: string): Uint8Array;
  validateSecret(secret: string): boolean;
}
```

## 数据模型

### TOTP配置模型
```typescript
interface TOTPConfig {
  serviceName: string;        // 服务名称，如 "GitHub"
  accountName: string;        // 账户名称，如 "user@example.com"
  secret: string;            // Base32编码的密钥
  algorithm: HashAlgorithm;   // 哈希算法
  digits: number;            // 验证码位数
  period: number;            // 时间窗口（秒）
  issuer?: string;           // 发行者（可选）
}

type HashAlgorithm = 'SHA1' | 'SHA256' | 'SHA512';
```

### OTPAuth URI 格式
```
otpauth://totp/{issuer}:{accountName}?secret={secret}&issuer={issuer}&algorithm={algorithm}&digits={digits}&period={period}
```

### 状态管理模型
```typescript
interface TOTPState {
  config: TOTPConfig | null;
  currentCode: string;
  timeRemaining: number;
  isActive: boolean;
  lastUpdate: number;
}
```

## 正确性属性

*属性是应该在系统所有有效执行中保持为真的特征或行为——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*
### 属性反思

在完成初始 prework 分析后，我识别出以下可以合并或优化的属性：

**冗余识别：**
- 属性 1.3 和 4.5 都测试二维码包含正确参数，可以合并为一个综合属性
- 属性 2.1 和 2.5 都测试 TOTP 生成的正确性，可以合并
- 属性 5.1 和 5.2 都测试导出格式，可以合并为导出功能综合测试

**合并后的优化属性：**
- 将 TOTP 生成相关属性合并为一个综合的"TOTP 算法正确性"属性
- 将配置和二维码生成合并为"配置到二维码转换"属性
- 将验证相关功能合并为"验证码校验"属性

### 正确性属性

**属性 1: TOTP 配置生成正确性**
*对于任何* 有效的服务名称和账户名输入，生成的 TOTP 配置应该包含这些信息并具有有效的 32 字符 Base32 密钥
**验证需求: 1.1, 1.2**

**属性 2: OTPAuth URI 格式正确性**
*对于任何* 有效的 TOTP 配置，生成的 otpauth URI 应该符合标准格式并包含所有必需的参数
**验证需求: 1.3, 1.4, 4.5**

**属性 3: TOTP 算法正确性**
*对于任何* 有效的密钥和时间戳，TOTP 生成器应该生成指定位数的数字验证码，并且相同输入产生相同输出
**验证需求: 2.1, 2.5**

**属性 4: 时间窗口一致性**
*对于任何* 时间窗口内的不同时间点，生成的验证码应该保持相同，窗口边界处应该产生不同的验证码
**验证需求: 2.2, 2.3**

**属性 5: 倒计时计算正确性**
*对于任何* 给定的时间窗口，剩余时间计算应该准确反映当前验证码的剩余有效秒数
**验证需求: 3.1, 3.3**

**属性 6: 参数配置支持性**
*对于任何* 支持的时间窗口（15/30/60秒）、验证码长度（6/8位）和哈希算法（SHA-1/SHA-256/SHA-512），系统应该正确生成相应的验证码
**验证需求: 4.1, 4.2, 4.3**

**属性 7: 配置变更响应性**
*对于任何* 参数修改，系统应该立即重新生成对应的二维码和验证码
**验证需求: 4.4**

**属性 8: 导出格式正确性**
*对于任何* 有效配置，导出的密钥应该是有效的 Base32 格式，导出的 URI 应该是完整的 otpauth 字符串
**验证需求: 5.1, 5.2, 5.3**

**属性 9: 验证码校验正确性**
*对于任何* 有效的密钥和验证码，校验功能应该正确验证当前时间窗口和相邻时间窗口的验证码
**验证需求: 6.1, 6.2**

**属性 10: 时间同步检测**
*对于任何* 时间偏差情况，系统应该能够检测并报告时间同步状态
**验证需求: 6.5**

## 错误处理

### 输入验证错误
- **无效服务名称**: 空字符串或包含特殊字符
- **无效账户名**: 格式不正确的邮箱或用户名
- **无效密钥**: 非 Base32 格式或长度不正确
- **无效参数**: 不支持的时间窗口、验证码长度或哈希算法

### 运行时错误
- **时间同步错误**: 系统时间与标准时间偏差过大
- **计算错误**: TOTP 算法计算失败
- **存储错误**: 本地存储访问失败
- **导出错误**: 文件生成或下载失败

### 错误处理策略
```typescript
interface ErrorHandler {
  handleValidationError(field: string, value: any): ValidationResult;
  handleRuntimeError(error: Error): void;
  showUserFriendlyMessage(errorType: ErrorType): void;
}

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  suggestions?: string[];
}
```

## 测试策略

### 双重测试方法

本设计采用单元测试和基于属性的测试相结合的方法：

**单元测试**覆盖：
- 特定的 TOTP 算法实现验证
- 边界条件和错误情况
- UI 组件的基本功能
- 集成点验证

**基于属性的测试**覆盖：
- TOTP 算法在各种输入下的正确性
- 配置生成和验证的通用规则
- 时间窗口和倒计时的数学正确性
- 导出和校验功能的一致性

### 基于属性的测试要求

- 使用 **fast-check** 作为 TypeScript 的属性测试库
- 每个属性测试运行最少 **100 次迭代**
- 每个属性测试必须用注释明确标记对应的设计文档属性
- 使用格式：`**Feature: animated-qr-code, Property {number}: {property_text}**`
- 每个正确性属性必须由单个属性测试实现

### 测试数据生成

```typescript
// 智能生成器示例
const totpConfigGenerator = fc.record({
  serviceName: fc.string({ minLength: 1, maxLength: 50 }),
  accountName: fc.emailAddress(),
  secret: fc.string({ minLength: 32, maxLength: 32 }).map(s => 
    s.replace(/[^A-Z2-7]/g, 'A') // 确保 Base32 格式
  ),
  algorithm: fc.constantFrom('SHA1', 'SHA256', 'SHA512'),
  digits: fc.constantFrom(6, 8),
  period: fc.constantFrom(15, 30, 60)
});
```

### 性能测试

- TOTP 生成应在 10ms 内完成
- 二维码生成应在 100ms 内完成
- UI 更新应保持 60fps 流畅度
- 内存使用应保持在合理范围内

## 安全考虑

### 密钥安全
- 密钥生成使用加密安全的随机数生成器
- 密钥在内存中的存储时间最小化
- 提供密钥清除功能
- 避免密钥在日志中泄露

### 时间安全
- 实现时间偏差检测和警告
- 支持网络时间同步检查
- 防止时间攻击

### 数据保护
- 本地存储数据加密
- 敏感信息不在 URL 中传递
- 实现安全的配置导入/导出

## 集成方案

### 与现有 QR Master 集成

1. **导航集成**: 在主界面添加"动态验证码"选项卡
2. **样式一致性**: 复用现有的 Tailwind CSS 样式系统
3. **组件复用**: 利用现有的二维码生成和显示组件
4. **国际化**: 扩展现有的 next-intl 配置

### 新增依赖
```json
{
  "dependencies": {
    "crypto-js": "^4.1.1",
    "fast-check": "^3.15.0"
  }
}
```

### 文件结构
```
app/[locale]/
├── totp/
│   ├── page.tsx                 // TOTP 主页面
│   ├── components/
│   │   ├── TOTPGenerator.tsx    // TOTP 生成器组件
│   │   ├── TOTPDisplay.tsx      // 验证码显示组件
│   │   ├── CountdownTimer.tsx   // 倒计时组件
│   │   └── ConfigManager.tsx    // 配置管理组件
│   └── services/
│       ├── totpService.ts       // TOTP 核心服务
│       ├── secretManager.ts     // 密钥管理服务
│       └── timerService.ts      // 定时器服务
```

## 部署考虑

### 浏览器兼容性
- 支持现代浏览器的 Web Crypto API
- 提供 crypto-js 作为降级方案
- 测试移动浏览器兼容性

### 性能优化
- 懒加载 TOTP 相关组件
- 优化定时器使用，避免不必要的重渲染
- 实现组件级别的 React.memo 优化

### 监控和分析
- 添加 TOTP 功能使用统计
- 监控错误率和性能指标
- 收集用户反馈和使用模式