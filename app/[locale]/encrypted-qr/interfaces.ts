// 加密二维码功能的核心接口定义

// 加密配置接口
export interface EncryptionConfig {
  algorithm: 'AES-256-GCM';
  keyDerivation: 'PBKDF2' | 'Argon2id';
  iterations: number;
  saltLength: number;
  ivLength: number;
  memorySize: number; // Argon2内存成本(KB)，PBKDF2不使用
  parallelism: number; // Argon2并行度，PBKDF2不使用
}

// 二维码数据结构
export interface EncryptedQRData {
  version: string;
  algorithm: string;
  salt: string;
  iv: string;
  ciphertext: string;
  tag?: string;
  disguise: string; // 伪装文本
}

// 加密请求接口
export interface EncryptionRequest {
  plaintext: string;
  password: string;
  disguiseText: string;
  config: EncryptionConfig;
  qrStyle: QRStyleConfig;
}

// 解密请求接口
export interface DecryptionRequest {
  qrData: string;
  password: string;
}

// 内部加密数据结构
export interface EncryptedData {
  algorithm: string;
  salt: Uint8Array;
  iv: Uint8Array;
  ciphertext: Uint8Array;
  tag?: Uint8Array; // 用于认证加密
}

// 二维码样式配置
export interface QRStyleConfig {
  size: number;
  margin: number;
  colorDark: string;
  colorLight: string;
  logoUrl?: string;
  logoSize?: number;
  cornerStyle: 'square' | 'rounded' | 'dot';
  dotStyle: 'square' | 'rounded' | 'dot';
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

// 导出结果
export interface QRResult {
  qrCode: string; // Base64编码的图片
  format: 'PNG' | 'SVG' | 'PDF';
  metadata: {
    size: number;
    algorithm: string;
    created: Date;
  };
}

// 解密结果
export interface DecryptionResult {
  success: boolean;
  data?: string;
  disguiseText?: string;
  error?: EncryptedQRError;
  message?: string;
}

// 错误类型定义
export enum EncryptedQRError {
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  CORRUPTED_QR_DATA = 'CORRUPTED_QR_DATA',
  UNSUPPORTED_ALGORITHM = 'UNSUPPORTED_ALGORITHM',
  INTEGRITY_CHECK_FAILED = 'INTEGRITY_CHECK_FAILED',
  INVALID_QR_FORMAT = 'INVALID_QR_FORMAT',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  VERSION_INCOMPATIBLE = 'VERSION_INCOMPATIBLE',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  EMPTY_DATA = 'EMPTY_DATA'
}

// 错误结果接口
export interface ErrorResult {
  success: false;
  error: EncryptedQRError;
  message: string;
  details?: any;
}

// 密码强度验证结果
export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
  };
}

// 默认配置
export const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'AES-256-GCM',
  keyDerivation: 'PBKDF2',
  iterations: 12, // PBKDF2基础迭代次数（实际会乘以50000）
  saltLength: 32, // 32字节盐值
  ivLength: 16, // 16字节IV
  memorySize: 65536, // 保留字段（PBKDF2不使用）
  parallelism: 1 // 保留字段（PBKDF2不使用）
};

export const DEFAULT_QR_STYLE: QRStyleConfig = {
  size: 300,
  margin: 4,
  colorDark: '#000000',
  colorLight: '#ffffff',
  cornerStyle: 'square',
  dotStyle: 'square',
  errorCorrectionLevel: 'M'
};

export const DEFAULT_DISGUISE_TEXTS = [
  '欢迎访问我们的官方网站',
  '扫码关注我们的微信公众号',
  '获取更多产品信息请访问官网',
  '联系我们：service@example.com',
  '感谢您的关注和支持！'
];