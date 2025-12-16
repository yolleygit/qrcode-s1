# 加密二维码 API 文档

## 概述

加密二维码模块为 QR Master 提供军用级数据保护功能，允许用户将敏感信息安全地嵌入到看似普通的二维码中。本文档详细描述了系统的 API 接口、数据结构和使用方法。

## 核心接口

### EncryptedQRSystem 加密二维码系统

加密二维码系统的主要入口类，提供完整的加密解密功能。

```typescript
interface EncryptedQRSystem {
  // 创建加密二维码
  createEncryptedQR(request: EncryptionRequest): Promise<EncryptionResult>;
  
  // 解密二维码
  decryptQR(request: DecryptionRequest): Promise<DecryptionResult>;
  
  // 验证二维码格式
  validateQRData(data: string): ValidationResult;
  
  // 获取支持的算法列表
  getSupportedAlgorithms(): AlgorithmInfo[];
}
```

### CryptoService 加密服务

负责核心的加密解密操作。

```typescript
interface CryptoService {
  // 加密数据
  encrypt(
    plaintext: string, 
    password: string, 
    config: EncryptionConfig
  ): Promise<EncryptedData>;
  
  // 解密数据
  decrypt(
    encryptedData: EncryptedData, 
    password: string
  ): Promise<string>;
  
  // 密钥派生
  deriveKey(
    password: string, 
    salt: Uint8Array, 
    config: KeyDerivationConfig
  ): Promise<CryptoKey>;
  
  // 生成随机数据
  generateSalt(length: number): Uint8Array;
  generateIV(length: number): Uint8Array;
  
  // 验证密码强度
  validatePasswordStrength(password: string): PasswordStrengthResult;
}
```

### QRCodeService 二维码服务

处理二维码的生成和解析。

```typescript
interface QRCodeService {
  // 生成二维码
  generateQR(
    data: EncryptedQRData, 
    style: QRStyleConfig
  ): Promise<QRResult>;
  
  // 解析二维码
  parseQR(input: File | string): Promise<EncryptedQRData>;
  
  // 应用样式
  applyStyle(qrCode: QRCode, style: QRStyleConfig): QRCode;
  
  // 验证二维码可读性
  validateReadability(qrCode: QRCode): ReadabilityResult;
}
```

## 数据结构

### 核心数据类型

#### EncryptionRequest 加密请求

```typescript
interface EncryptionRequest {
  // 要加密的明文数据
  plaintext: string;
  
  // 加密密码
  password: string;
  
  // 伪装文本（扫描时显示的内容）
  disguiseText: string;
  
  // 加密配置
  config: EncryptionConfig;
  
  // 二维码样式配置
  qrStyle: QRStyleConfig;
}
```

#### DecryptionRequest 解密请求

```typescript
interface DecryptionRequest {
  // 二维码数据（Base64编码或文件）
  qrData: string | File;
  
  // 解密密码
  password: string;
  
  // 可选的配置覆盖
  configOverride?: Partial<EncryptionConfig>;
}
```

#### EncryptionConfig 加密配置

```typescript
interface EncryptionConfig {
  // 加密算法
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  
  // 密钥派生配置
  keyDerivation: KeyDerivationConfig;
  
  // 数据压缩
  compression?: CompressionConfig;
  
  // 版本信息
  version: string;
}

interface KeyDerivationConfig {
  // 密钥派生算法
  algorithm: 'PBKDF2' | 'Argon2id'; // 当前实现：PBKDF2，计划升级：Argon2id
  
  // PBKDF2 参数（当前实现）
  pbkdf2?: {
    iterations: number;    // 迭代次数，推荐 100,000
    hashFunction: 'SHA-256' | 'SHA-512';
  };
  
  // Argon2 参数（计划实现）
  argon2?: {
    memoryCost: number;    // 内存成本 (KB)
    timeCost: number;      // 时间成本 (迭代次数)
    parallelism: number;   // 并行度
  };
  
  // 盐值长度
  saltLength: number;
  
  // 输出密钥长度
  keyLength: number;
}
```

#### EncryptedQRData 加密二维码数据

```typescript
interface EncryptedQRData {
  // 格式版本
  version: string;
  
  // 加密算法标识
  algorithm: string;
  
  // 密钥派生参数
  kdf: KeyDerivationParams;
  
  // 盐值 (Base64编码)
  salt: string;
  
  // 初始化向量 (Base64编码)
  iv: string;
  
  // 密文数据 (Base64编码)
  ciphertext: string;
  
  // 认证标签 (Base64编码)
  tag: string;
  
  // 伪装文本
  disguise: string;
  
  // 可选的元数据
  metadata?: {
    created: string;      // 创建时间
    description?: string; // 描述信息
  };
}
```

#### QRStyleConfig 二维码样式配置

```typescript
interface QRStyleConfig {
  // 基础设置
  size: number;                    // 二维码尺寸
  margin: number;                  // 边距
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  
  // 颜色设置
  colorDark: string;               // 前景色
  colorLight: string;              // 背景色
  
  // 样式设置
  dotStyle: DotStyle;              // 码点样式
  cornerStyle: CornerStyle;        // 码眼样式
  
  // Logo设置
  logo?: {
    url: string;                   // Logo图片URL
    size: number;                  // Logo大小比例 (0-0.3)
    margin: number;                // Logo边距
    cornerRadius: number;          // Logo圆角
  };
  
  // 渐变设置
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    direction?: number;            // 线性渐变角度
    center?: [number, number];     // 径向渐变中心
  };
}

type DotStyle = 'square' | 'rounded' | 'dot' | 'diamond' | 'star';
type CornerStyle = 'square' | 'rounded' | 'circle' | 'diamond';
```

### 结果类型

#### EncryptionResult 加密结果

```typescript
interface EncryptionResult {
  success: true;
  
  // 生成的二维码
  qrCode: QRResult;
  
  // 加密数据信息
  encryptionInfo: {
    algorithm: string;
    keyDerivationTime: number;     // 密钥派生耗时 (ms)
    encryptionTime: number;        // 加密耗时 (ms)
    dataSize: number;              // 原始数据大小 (bytes)
    compressedSize?: number;       // 压缩后大小 (bytes)
  };
  
  // 安全提醒
  securityNotes: string[];
}
```

#### DecryptionResult 解密结果

```typescript
interface DecryptionResult {
  success: true;
  
  // 解密后的明文数据
  plaintext: string;
  
  // 解密信息
  decryptionInfo: {
    algorithm: string;
    keyDerivationTime: number;     // 密钥派生耗时 (ms)
    decryptionTime: number;        // 解密耗时 (ms)
    dataIntegrityVerified: boolean; // 数据完整性验证结果
  };
  
  // 元数据信息
  metadata?: {
    created?: string;
    description?: string;
    version: string;
  };
}
```

#### ErrorResult 错误结果

```typescript
interface ErrorResult {
  success: false;
  error: EncryptedQRError;
  message: string;
  details?: any;
  suggestions?: string[];
}

enum EncryptedQRError {
  // 输入错误
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  EMPTY_DATA = 'EMPTY_DATA',
  DATA_TOO_LARGE = 'DATA_TOO_LARGE',
  
  // 格式错误
  INVALID_QR_FORMAT = 'INVALID_QR_FORMAT',
  CORRUPTED_QR_DATA = 'CORRUPTED_QR_DATA',
  UNSUPPORTED_VERSION = 'UNSUPPORTED_VERSION',
  UNSUPPORTED_ALGORITHM = 'UNSUPPORTED_ALGORITHM',
  
  // 安全错误
  INTEGRITY_CHECK_FAILED = 'INTEGRITY_CHECK_FAILED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  
  // 系统错误
  CRYPTO_NOT_SUPPORTED = 'CRYPTO_NOT_SUPPORTED',
  INSUFFICIENT_MEMORY = 'INSUFFICIENT_MEMORY',
  OPERATION_TIMEOUT = 'OPERATION_TIMEOUT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

## 算法支持

### 加密算法

#### AES-256-GCM
```typescript
interface AESGCMConfig {
  keyLength: 256;                  // 密钥长度 (bits)
  ivLength: 96;                    // IV长度 (bits)
  tagLength: 128;                  // 认证标签长度 (bits)
  
  // 性能特点
  performance: {
    hardwareAccelerated: boolean;  // 硬件加速支持
    encryptionSpeed: 'fast';       // 加密速度
    memoryUsage: 'low';           // 内存使用
  };
}
```

#### ChaCha20-Poly1305
```typescript
interface ChaCha20Poly1305Config {
  keyLength: 256;                  // 密钥长度 (bits)
  nonceLength: 96;                 // Nonce长度 (bits)
  tagLength: 128;                  // 认证标签长度 (bits)
  
  // 性能特点
  performance: {
    softwareOptimized: boolean;    // 软件优化
    encryptionSpeed: 'fast';       // 加密速度
    memoryUsage: 'low';           // 内存使用
    quantumResistant: boolean;     // 抗量子计算
  };
}
```

### 密钥派生算法

#### PBKDF2-SHA256 (当前实现)
```typescript
interface PBKDF2Config {
  // 当前参数
  iterations: 100000;              // 10万次迭代
  hashFunction: 'SHA-256';         // 哈希函数
  saltLength: 32;                  // 32字节盐值
  
  // 安全特性
  security: {
    widelySupported: true;         // 广泛支持
    standardCompliant: true;       // 标准兼容
    bruteForceResistant: true;     // 抗暴力破解
    estimatedCrackTime: '> 100 years'; // 预估破解时间
  };
}
```

#### Argon2id (计划升级)
```typescript
interface Argon2idConfig {
  // 推荐参数 (高安全级别)
  memoryCost: 65536;               // 64MB 内存成本
  timeCost: 3;                     // 3次迭代
  parallelism: 1;                  // 单线程
  
  // 安全特性
  security: {
    memoryHard: true;              // 内存困难函数
    sideChannelResistant: true;    // 抗侧信道攻击
    bruteForceResistant: true;     // 抗暴力破解
    estimatedCrackTime: '> 1000 years'; // 预估破解时间
  };
}
```

**🔧 实现说明：**
- 当前版本使用 PBKDF2-SHA256 作为密钥派生函数
- 这是由于 argon2-browser 依赖兼容性问题的临时解决方案
- PBKDF2 仍提供强大的安全保护，符合当前行业标准
- 正式版本将升级到 Argon2id 以获得更强的抗暴力破解能力
- **最新修复**：解决了 Web Crypto API 的 TypeScript 类型兼容性问题

## 使用示例

### 基础加密解密

```typescript
import { EncryptedQRSystem } from '@/lib/encrypted-qr';

// 初始化系统
const encryptedQR = new EncryptedQRSystem();

// 加密数据
const encryptionRequest: EncryptionRequest = {
  plaintext: 'my-secret-password-123',
  password: 'MyStrongPassword123!',
  disguiseText: 'https://example.com/contact',
  config: {
    algorithm: 'AES-256-GCM',
    keyDerivation: {
      algorithm: 'PBKDF2', // 当前实现
      pbkdf2: {
        iterations: 100000,
        hashFunction: 'SHA-256'
      },
      saltLength: 32,
      keyLength: 32
    },
    version: '1.0'
  },
  qrStyle: {
    size: 256,
    margin: 4,
    errorCorrectionLevel: 'M',
    colorDark: '#000000',
    colorLight: '#ffffff',
    dotStyle: 'square',
    cornerStyle: 'square'
  }
};

try {
  const result = await encryptedQR.createEncryptedQR(encryptionRequest);
  
  if (result.success) {
    console.log('加密成功！');
    console.log('密钥派生耗时:', result.encryptionInfo.keyDerivationTime, 'ms');
    console.log('二维码已生成:', result.qrCode.dataUrl);
    
    // 下载二维码
    downloadQRCode(result.qrCode);
  }
} catch (error) {
  console.error('加密失败:', error);
}

// 解密数据
const decryptionRequest: DecryptionRequest = {
  qrData: qrCodeFile, // File对象或Base64字符串
  password: 'MyStrongPassword123!'
};

try {
  const result = await encryptedQR.decryptQR(decryptionRequest);
  
  if (result.success) {
    console.log('解密成功！');
    console.log('原始数据:', result.plaintext);
    console.log('数据完整性:', result.decryptionInfo.dataIntegrityVerified);
  }
} catch (error) {
  console.error('解密失败:', error);
}
```

### 高级配置示例

```typescript
// 高安全级别配置（当前实现）
const highSecurityConfig: EncryptionConfig = {
  algorithm: 'ChaCha20-Poly1305',
  keyDerivation: {
    algorithm: 'PBKDF2',
    pbkdf2: {
      iterations: 200000,  // 20万次迭代（更高安全性）
      hashFunction: 'SHA-256'
    },
    saltLength: 32,
    keyLength: 32
  },
  compression: {
    enabled: true,
    algorithm: 'gzip',
    level: 6
  },
  version: '1.0'
};

// 计划的高安全级别配置（Argon2id 升级后）
const futureHighSecurityConfig: EncryptionConfig = {
  algorithm: 'ChaCha20-Poly1305',
  keyDerivation: {
    algorithm: 'Argon2id',
    argon2: {
      memoryCost: 131072,  // 128MB 内存
      timeCost: 5,         // 5次迭代
      parallelism: 1
    },
    saltLength: 32,
    keyLength: 32
  },
  compression: {
    enabled: true,
    algorithm: 'gzip',
    level: 6
  },
  version: '1.0'
};

// 自定义样式配置
const customStyle: QRStyleConfig = {
  size: 512,
  margin: 8,
  errorCorrectionLevel: 'H',
  colorDark: '#1a365d',
  colorLight: '#ffffff',
  dotStyle: 'rounded',
  cornerStyle: 'rounded',
  logo: {
    url: '/logo.png',
    size: 0.2,
    margin: 4,
    cornerRadius: 8
  },
  gradient: {
    type: 'linear',
    colors: ['#1a365d', '#2d5aa0'],
    direction: 45
  }
};
```

### 批量处理示例

```typescript
// 批量加密多个数据
async function batchEncrypt(dataList: string[], password: string) {
  const results: EncryptionResult[] = [];
  
  for (const data of dataList) {
    const request: EncryptionRequest = {
      plaintext: data,
      password: password,
      disguiseText: `Document ${results.length + 1}`,
      config: defaultEncryptionConfig,
      qrStyle: defaultQRStyle
    };
    
    try {
      const result = await encryptedQR.createEncryptedQR(request);
      if (result.success) {
        results.push(result);
      }
    } catch (error) {
      console.error(`加密第 ${results.length + 1} 项失败:`, error);
    }
  }
  
  return results;
}
```

### 密码强度验证

```typescript
// 验证密码强度
function validatePassword(password: string): PasswordStrengthResult {
  const result = cryptoService.validatePasswordStrength(password);
  
  return {
    isValid: result.score >= 3,
    score: result.score,        // 0-4 分
    feedback: result.feedback,  // 改进建议
    estimatedCrackTime: result.crackTime,
    requirements: {
      minLength: password.length >= 12,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      notCommon: !isCommonPassword(password)
    }
  };
}
```

## 错误处理

### 错误处理策略

```typescript
// 统一错误处理
async function handleEncryptionOperation<T>(
  operation: () => Promise<T>
): Promise<T | ErrorResult> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof EncryptedQRError) {
      return {
        success: false,
        error: error.type,
        message: error.message,
        details: error.details,
        suggestions: getErrorSuggestions(error.type)
      };
    }
    
    // 未知错误
    return {
      success: false,
      error: EncryptedQRError.UNKNOWN_ERROR,
      message: '发生未知错误',
      details: error,
      suggestions: ['请检查网络连接', '尝试刷新页面', '联系技术支持']
    };
  }
}

// 错误建议生成
function getErrorSuggestions(errorType: EncryptedQRError): string[] {
  const suggestions: Record<EncryptedQRError, string[]> = {
    [EncryptedQRError.WEAK_PASSWORD]: [
      '使用至少12位字符',
      '包含大小写字母、数字和特殊字符',
      '避免使用常见密码',
      '考虑使用密码管理器生成强密码'
    ],
    [EncryptedQRError.INVALID_PASSWORD]: [
      '检查密码是否正确',
      '注意大小写敏感',
      '确认没有多余的空格',
      '尝试重新输入密码'
    ],
    [EncryptedQRError.CORRUPTED_QR_DATA]: [
      '检查二维码图片是否清晰',
      '尝试重新扫描或上传',
      '确认二维码没有被修改',
      '联系发送方重新生成'
    ],
    // ... 其他错误类型的建议
  };
  
  return suggestions[errorType] || ['请联系技术支持'];
}
```

### 重试机制

```typescript
// 带重试的操作
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // 某些错误不应该重试
      if (error instanceof EncryptedQRError) {
        const nonRetryableErrors = [
          EncryptedQRError.INVALID_PASSWORD,
          EncryptedQRError.WEAK_PASSWORD,
          EncryptedQRError.CORRUPTED_QR_DATA
        ];
        
        if (nonRetryableErrors.includes(error.type)) {
          throw error;
        }
      }
      
      // 等待后重试
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
}
```

## 性能优化

### Web Workers 支持

```typescript
// 在 Web Worker 中执行加密操作
class EncryptionWorker {
  private worker: Worker;
  
  constructor() {
    this.worker = new Worker('/workers/encryption-worker.js');
  }
  
  async encrypt(request: EncryptionRequest): Promise<EncryptionResult> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36);
      
      const handleMessage = (event: MessageEvent) => {
        if (event.data.id === id) {
          this.worker.removeEventListener('message', handleMessage);
          
          if (event.data.success) {
            resolve(event.data.result);
          } else {
            reject(new Error(event.data.error));
          }
        }
      };
      
      this.worker.addEventListener('message', handleMessage);
      this.worker.postMessage({ id, type: 'encrypt', request });
    });
  }
  
  terminate() {
    this.worker.terminate();
  }
}
```

### 内存管理

```typescript
// 安全的内存清理
class SecureMemoryManager {
  private sensitiveData: Set<ArrayBuffer> = new Set();
  
  // 注册敏感数据
  register(buffer: ArrayBuffer): void {
    this.sensitiveData.add(buffer);
  }
  
  // 清理敏感数据
  clear(): void {
    for (const buffer of this.sensitiveData) {
      // 用随机数据覆盖
      const view = new Uint8Array(buffer);
      crypto.getRandomValues(view);
      
      // 再用零覆盖
      view.fill(0);
    }
    
    this.sensitiveData.clear();
  }
  
  // 自动清理
  setupAutoCleanup(): void {
    // 页面卸载时清理
    window.addEventListener('beforeunload', () => this.clear());
    
    // 定期清理（可选）
    setInterval(() => this.clear(), 5 * 60 * 1000); // 5分钟
  }
}
```

## 测试支持

### 单元测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { CryptoService } from '@/lib/encrypted-qr';

describe('CryptoService', () => {
  const cryptoService = new CryptoService();
  
  it('should encrypt and decrypt data correctly', async () => {
    const plaintext = 'test-secret-data';
    const password = 'TestPassword123!';
    const config = getDefaultEncryptionConfig();
    
    // 加密
    const encrypted = await cryptoService.encrypt(plaintext, password, config);
    expect(encrypted).toBeDefined();
    expect(encrypted.ciphertext).not.toBe(plaintext);
    
    // 解密
    const decrypted = await cryptoService.decrypt(encrypted, password);
    expect(decrypted).toBe(plaintext);
  });
  
  it('should reject weak passwords', () => {
    const weakPasswords = ['123456', 'password', 'qwerty'];
    
    for (const password of weakPasswords) {
      const result = cryptoService.validatePasswordStrength(password);
      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(3);
    }
  });
});
```

### 属性测试示例

```typescript
import fc from 'fast-check';

describe('Encryption Properties', () => {
  it('should maintain round-trip consistency', async () => {
    await fc.assert(fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 1000 }),
      fc.string({ minLength: 12, maxLength: 50 }),
      async (plaintext, password) => {
        const config = getDefaultEncryptionConfig();
        
        // 加密后解密应该得到原始数据
        const encrypted = await cryptoService.encrypt(plaintext, password, config);
        const decrypted = await cryptoService.decrypt(encrypted, password);
        
        expect(decrypted).toBe(plaintext);
      }
    ));
  });
  
  it('should produce different ciphertexts for same input', async () => {
    await fc.assert(fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 100 }),
      fc.string({ minLength: 12, maxLength: 50 }),
      async (plaintext, password) => {
        const config = getDefaultEncryptionConfig();
        
        // 相同输入应该产生不同密文（由于随机IV）
        const encrypted1 = await cryptoService.encrypt(plaintext, password, config);
        const encrypted2 = await cryptoService.encrypt(plaintext, password, config);
        
        expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
        expect(encrypted1.iv).not.toBe(encrypted2.iv);
      }
    ));
  });
});
```

## 浏览器兼容性

### 特性检测

```typescript
// 检测浏览器支持
class BrowserCompatibility {
  static checkSupport(): CompatibilityResult {
    const features = {
      webCrypto: typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined',
      webWorkers: typeof Worker !== 'undefined',
      fileAPI: typeof File !== 'undefined' && typeof FileReader !== 'undefined',
      canvas: typeof HTMLCanvasElement !== 'undefined',
      webAssembly: typeof WebAssembly !== 'undefined',
      // 新增：检测 ArrayBuffer 支持（用于类型转换）
      arrayBuffer: typeof ArrayBuffer !== 'undefined'
    };
    
    const isSupported = Object.values(features).every(Boolean);
    
    return {
      isSupported,
      features,
      recommendations: isSupported ? [] : this.getRecommendations(features)
    };
  }
  
  private static getRecommendations(features: Record<string, boolean>): string[] {
    const recommendations: string[] = [];
    
    if (!features.webCrypto) {
      recommendations.push('请使用支持 Web Crypto API 的现代浏览器');
    }
    
    if (!features.webWorkers) {
      recommendations.push('建议使用支持 Web Workers 的浏览器以获得更好性能');
    }
    
    if (!features.webAssembly) {
      recommendations.push('WebAssembly 支持将提供更好的加密性能');
    }
    
    return recommendations;
  }
}
```

### 降级方案

```typescript
// 提供降级方案
class FallbackCrypto {
  // 当 Web Crypto API 不可用时的降级实现
  static async encrypt(data: string, key: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      // 使用原生 Web Crypto API
      return this.nativeEncrypt(data, key);
    } else {
      // 使用 JavaScript 实现
      return this.jsEncrypt(data, key);
    }
  }
  
  private static async nativeEncrypt(data: string, key: string): Promise<string> {
    // Web Crypto API 实现
    // ...
  }
  
  private static async jsEncrypt(data: string, key: string): Promise<string> {
    // 纯 JavaScript 实现（性能较低但兼容性好）
    // ...
  }
}
```

---

*本 API 文档将随着功能开发进展持续更新。如有疑问或建议，欢迎联系开发团队。*