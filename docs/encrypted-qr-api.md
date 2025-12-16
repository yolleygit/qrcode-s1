# 加密二维码 API 文档

## 📋 概述

加密二维码功能提供军用级 AES 加密算法，将敏感数据安全地嵌入到二维码中。支持多种加密级别和伪装模式，确保数据的安全性和隐蔽性。

**最新更新** (2024年12月16日): 核心依赖包已导入，功能实现正在进行中。

## 🔧 技术栈

### 核心依赖
- **crypto-js**: 军用级加密算法库
- **qrcode**: 高性能二维码生成库
- **React Hooks**: useCallback, useEffect 用于性能优化和自动化

### 加密算法支持
- **AES-128**: 快速加密，适合一般数据保护
- **AES-256**: 推荐级别，平衡安全性和性能
- **AES-256-GCM**: 最高安全级别，提供完整性验证

## 📱 组件接口

### EncryptedQRGenerator 组件

```typescript
interface EncryptedQRGeneratorProps {
  onSelectRecentConfig?: (config: any) => void;
  onShowPreferences?: () => void;
  isEmbedded?: boolean;
}
```

### 状态管理

```typescript
interface EncryptedQRState {
  content: string;           // 待加密内容
  password: string;          // 加密密码
  showPassword: boolean;     // 密码显示状态
  encryptionLevel: string;   // 加密级别
  disguiseMode: boolean;     // 伪装模式开关
  qrCodeDataUrl: string;     // 二维码数据URL
  encryptedData: string;     // 加密后的数据
  isGenerating: boolean;     // 生成状态
  error: string;             // 错误信息
}
```

## 🔐 加密功能 API

### 加密级别配置

```typescript
type EncryptionLevel = 'aes-128' | 'aes-256' | 'aes-256-gcm';

interface EncryptionConfig {
  level: EncryptionLevel;
  keySize?: number;          // 密钥长度
  mode?: CryptoJS.Mode;      // 加密模式
  padding?: CryptoJS.Padding; // 填充方式
}
```

### 加密函数 (预期实现)

```typescript
const encryptContent = useCallback(async (
  content: string,
  password: string,
  level: EncryptionLevel
): Promise<string> => {
  try {
    let encrypted: string;
    
    switch (level) {
      case 'aes-128':
        encrypted = CryptoJS.AES.encrypt(content, password, {
          keySize: 128/32
        }).toString();
        break;
        
      case 'aes-256':
        encrypted = CryptoJS.AES.encrypt(content, password, {
          keySize: 256/32
        }).toString();
        break;
        
      case 'aes-256-gcm':
        encrypted = CryptoJS.AES.encrypt(content, password, {
          mode: CryptoJS.mode.GCM,
          keySize: 256/32
        }).toString();
        break;
    }
    
    return encrypted;
  } catch (error) {
    throw new Error(`加密失败: ${error.message}`);
  }
}, []);
```

### 解密函数 (预期实现)

```typescript
const decryptContent = useCallback(async (
  encryptedData: string,
  password: string,
  level: EncryptionLevel
): Promise<string> => {
  try {
    let decrypted: CryptoJS.lib.WordArray;
    
    switch (level) {
      case 'aes-128':
        decrypted = CryptoJS.AES.decrypt(encryptedData, password, {
          keySize: 128/32
        });
        break;
        
      case 'aes-256':
        decrypted = CryptoJS.AES.decrypt(encryptedData, password, {
          keySize: 256/32
        });
        break;
        
      case 'aes-256-gcm':
        decrypted = CryptoJS.AES.decrypt(encryptedData, password, {
          mode: CryptoJS.mode.GCM,
          keySize: 256/32
        });
        break;
    }
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error(`解密失败: ${error.message}`);
  }
}, []);
```

## 📊 二维码生成 API

### 二维码配置

```typescript
interface QRCodeConfig {
  width: number;             // 二维码宽度
  margin: number;            // 边距
  color: {
    dark: string;            // 前景色
    light: string;           // 背景色
  };
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'; // 容错级别
}
```

### 二维码生成函数 (预期实现)

```typescript
const generateQRCode = useCallback(async (
  data: string,
  config: QRCodeConfig = {
    width: 256,
    margin: 2,
    color: {
      dark: '#7c3aed',        // 紫色主题
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H' // 高容错率
  }
): Promise<string> => {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, config);
    return qrDataUrl;
  } catch (error) {
    throw new Error(`二维码生成失败: ${error.message}`);
  }
}, []);
```

## 🎭 伪装模式 API

### 伪装类型

```typescript
type DisguiseType = 'url' | 'contact' | 'meeting' | 'text' | 'custom';

interface DisguiseConfig {
  type: DisguiseType;
  template?: string;         // 自定义模板
  randomize?: boolean;       // 随机化内容
}
```

### 伪装函数 (预期实现)

```typescript
const disguiseData = useCallback((
  encryptedData: string,
  config: DisguiseConfig
): string => {
  switch (config.type) {
    case 'url':
      return `https://example.com/share?data=${btoa(encryptedData)}`;
      
    case 'contact':
      return `Contact: John Doe\nPhone: ${encryptedData.slice(0, 10)}\nEmail: user@example.com`;
      
    case 'meeting':
      return `Meeting: ${new Date().toLocaleDateString()}\nLocation: Conference Room\nNotes: ${encryptedData}`;
      
    case 'text':
      return `Document ID: ${encryptedData.slice(0, 8)}\nGenerated: ${new Date().toISOString()}`;
      
    case 'custom':
      return config.template?.replace('{{data}}', encryptedData) || encryptedData;
      
    default:
      return encryptedData;
  }
}, []);
```

## 🔄 自动化工作流 API

### 内容监听 (预期实现)

```typescript
// 监听内容变化，自动触发加密
useEffect(() => {
  if (content.trim() && password.trim()) {
    const timeoutId = setTimeout(async () => {
      try {
        setIsGenerating(true);
        const encrypted = await encryptContent(content, password, encryptionLevel);
        
        // 应用伪装模式
        const finalData = disguiseMode ? 
          disguiseData(encrypted, { type: 'url' }) : 
          encrypted;
          
        setEncryptedData(finalData);
        setError('');
      } catch (error) {
        setError(error.message);
      } finally {
        setIsGenerating(false);
      }
    }, 500); // 防抖延迟
    
    return () => clearTimeout(timeoutId);
  } else {
    setEncryptedData('');
    setQrCodeDataUrl('');
  }
}, [content, password, encryptionLevel, disguiseMode]);
```

### 二维码自动生成 (预期实现)

```typescript
// 监听加密数据变化，自动生成二维码
useEffect(() => {
  if (encryptedData) {
    const generateQR = async () => {
      try {
        const qrDataUrl = await generateQRCode(encryptedData);
        setQrCodeDataUrl(qrDataUrl);
      } catch (error) {
        setError(`二维码生成失败: ${error.message}`);
      }
    };
    
    generateQR();
  }
}, [encryptedData]);
```

## 🛡️ 安全特性

### 密码强度验证

```typescript
interface PasswordStrength {
  score: number;             // 强度评分 (0-4)
  feedback: string[];        // 改进建议
  isStrong: boolean;         // 是否足够强
}

const validatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const feedback: string[] = [];
  
  // 长度检查
  if (password.length >= 12) score++;
  else feedback.push('密码长度至少12位');
  
  // 复杂度检查
  if (/[a-z]/.test(password)) score++;
  else feedback.push('包含小写字母');
  
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('包含大写字母');
  
  if (/\d/.test(password)) score++;
  else feedback.push('包含数字');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  else feedback.push('包含特殊字符');
  
  return {
    score,
    feedback,
    isStrong: score >= 4
  };
};
```

### 数据清理

```typescript
// 组件卸载时清理敏感数据
useEffect(() => {
  return () => {
    setPassword('');
    setContent('');
    setEncryptedData('');
    setError('');
  };
}, []);
```

## 📱 用户界面 API

### 操作按钮状态

```typescript
interface ButtonState {
  disabled: boolean;
  loading: boolean;
  text: string;
  icon?: React.ComponentType;
}

const getGenerateButtonState = (): ButtonState => ({
  disabled: !content.trim() || !password.trim() || isGenerating,
  loading: isGenerating,
  text: isGenerating ? '加密中...' : '生成加密二维码',
  icon: isGenerating ? RefreshCw : undefined
});
```

### 错误处理

```typescript
interface ErrorState {
  type: 'encryption' | 'qrcode' | 'validation' | 'network';
  message: string;
  recoverable: boolean;
  action?: () => void;
}

const handleError = (error: Error, type: ErrorState['type']) => {
  const errorState: ErrorState = {
    type,
    message: getUserFriendlyMessage(error, type),
    recoverable: isRecoverableError(error),
    action: type === 'network' ? () => window.location.reload() : undefined
  };
  
  setError(errorState.message);
  
  // 显示用户友好的错误提示
  toast.error(errorState.message, {
    action: errorState.action ? {
      label: '重试',
      onClick: errorState.action
    } : undefined
  });
};
```

## 🔧 配置选项

### 默认配置

```typescript
const DEFAULT_CONFIG = {
  encryption: {
    level: 'aes-256' as EncryptionLevel,
    keyDerivation: 'PBKDF2',
    iterations: 10000
  },
  qrcode: {
    width: 256,
    margin: 2,
    errorCorrectionLevel: 'H' as const,
    color: {
      dark: '#7c3aed',
      light: '#ffffff'
    }
  },
  disguise: {
    enabled: false,
    type: 'url' as DisguiseType
  }
};
```

### 高级配置

```typescript
interface AdvancedConfig {
  encryption: {
    saltLength: number;        // 盐值长度
    ivLength: number;          // 初始化向量长度
    tagLength: number;         // 认证标签长度 (GCM模式)
  };
  qrcode: {
    customLogo?: string;       // 自定义Logo
    gradientColors?: string[]; // 渐变色
    animation?: boolean;       // 动画效果
  };
  security: {
    maxAttempts: number;       // 最大尝试次数
    lockoutTime: number;       // 锁定时间
    clearOnClose: boolean;     // 关闭时清理数据
  };
}
```

## 📊 性能优化

### 内存管理

```typescript
// 使用 useCallback 优化函数性能
const memoizedEncrypt = useCallback(encryptContent, []);
const memoizedGenerate = useCallback(generateQRCode, []);
const memoizedDisguise = useCallback(disguiseData, []);

// 使用 useMemo 优化计算结果
const passwordStrength = useMemo(() => 
  validatePasswordStrength(password), [password]
);

const qrCodeConfig = useMemo(() => ({
  width: 256,
  margin: 2,
  color: { dark: '#7c3aed', light: '#ffffff' },
  errorCorrectionLevel: 'H' as const
}), []);
```

### 防抖处理

```typescript
const debouncedEncrypt = useCallback(
  debounce(async (content: string, password: string) => {
    if (content.trim() && password.trim()) {
      await encryptContent(content, password, encryptionLevel);
    }
  }, 500),
  [encryptionLevel]
);
```

## 🧪 测试 API

### 单元测试示例

```typescript
describe('EncryptedQRGenerator', () => {
  test('should encrypt and decrypt data correctly', async () => {
    const originalData = 'sensitive information';
    const password = 'strongPassword123!';
    
    const encrypted = await encryptContent(originalData, password, 'aes-256');
    expect(encrypted).not.toBe(originalData);
    
    const decrypted = await decryptContent(encrypted, password, 'aes-256');
    expect(decrypted).toBe(originalData);
  });
  
  test('should generate QR code from encrypted data', async () => {
    const encryptedData = 'U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K14=';
    const qrDataUrl = await generateQRCode(encryptedData);
    
    expect(qrDataUrl).toMatch(/^data:image\/png;base64,/);
  });
});
```

## 📚 使用示例

### 基础使用

```typescript
import { EncryptedQRGenerator } from '@/components/EncryptedQRGenerator';

function App() {
  return (
    <EncryptedQRGenerator
      onSelectRecentConfig={(config) => console.log('Selected config:', config)}
      onShowPreferences={() => console.log('Show preferences')}
      isEmbedded={false}
    />
  );
}
```

### 高级配置

```typescript
const advancedConfig = {
  encryption: { level: 'aes-256-gcm' },
  disguise: { enabled: true, type: 'contact' },
  qrcode: { width: 512, errorCorrectionLevel: 'H' }
};

<EncryptedQRGenerator {...advancedConfig} />
```

---

**文档版本**: 1.0  
**最后更新**: 2024年12月16日  
**状态**: 依赖包已导入，功能实现进行中  
**预计完成**: 1-2周内完成核心功能

*此 API 文档基于最新的依赖包更新和预期功能实现编写，将随着功能开发进度持续更新。*