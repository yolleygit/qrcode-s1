/**
 * TOTP (Time-based One-Time Password) 类型定义
 * 基于 RFC 6238 标准实现
 */

/**
 * 支持的哈希算法类型
 */
export type HashAlgorithm = 'SHA1' | 'SHA256' | 'SHA512';

/**
 * TOTP 配置接口
 * 包含生成 TOTP 验证码所需的所有参数
 */
export interface TOTPConfig {
  /** 服务名称，如 "GitHub", "Google" */
  serviceName: string;
  /** 账户名称，通常是邮箱地址 */
  accountName: string;
  /** Base32 编码的密钥，32字符长度 */
  secret: string;
  /** 哈希算法，默认 SHA1 */
  algorithm: HashAlgorithm;
  /** 验证码位数，6位或8位 */
  digits: 6 | 8;
  /** 时间窗口（秒），默认30秒 */
  period: 15 | 30 | 60;
  /** 发行者（可选），通常与服务名称相同 */
  issuer?: string;
}

/**
 * TOTP 状态管理接口
 */
export interface TOTPState {
  /** 当前配置 */
  config: TOTPConfig | null;
  /** 当前验证码 */
  currentCode: string;
  /** 剩余时间（秒） */
  timeRemaining: number;
  /** 是否激活状态 */
  isActive: boolean;
  /** 最后更新时间戳 */
  lastUpdate: number;
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  /** 是否验证通过 */
  isValid: boolean;
  /** 错误消息（如果有） */
  errorMessage?: string;
  /** 建议修正方案 */
  suggestions?: string[];
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  INVALID_SERVICE_NAME = 'INVALID_SERVICE_NAME',
  INVALID_ACCOUNT_NAME = 'INVALID_ACCOUNT_NAME',
  INVALID_SECRET = 'INVALID_SECRET',
  INVALID_ALGORITHM = 'INVALID_ALGORITHM',
  INVALID_DIGITS = 'INVALID_DIGITS',
  INVALID_PERIOD = 'INVALID_PERIOD',
  TIME_SYNC_ERROR = 'TIME_SYNC_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  EXPORT_ERROR = 'EXPORT_ERROR'
}

/**
 * 导出格式类型
 */
export type ExportFormat = 'secret' | 'uri' | 'qr-png' | 'qr-svg';

/**
 * 导出选项接口
 */
export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  size?: number; // 仅用于二维码导出
}

/**
 * 时间同步状态接口
 */
export interface TimeSyncStatus {
  /** 是否同步 */
  isSynced: boolean;
  /** 时间偏差（毫秒） */
  offset: number;
  /** 检查时间戳 */
  checkedAt: number;
}