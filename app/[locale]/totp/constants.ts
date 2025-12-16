/**
 * TOTP 相关常量定义
 */

import { HashAlgorithm } from './types';

/**
 * 默认 TOTP 配置常量
 */
export const TOTP_DEFAULTS = {
  /** 默认哈希算法 */
  ALGORITHM: 'SHA1' as HashAlgorithm,
  /** 默认验证码位数 */
  DIGITS: 6 as const,
  /** 默认时间窗口（秒） */
  PERIOD: 30 as const,
  /** 默认密钥长度（字节） */
  SECRET_LENGTH: 20,
  /** 默认时间窗口容错范围 */
  WINDOW: 1,
} as const;

/**
 * 支持的配置选项
 */
export const SUPPORTED_OPTIONS = {
  /** 支持的哈希算法 */
  ALGORITHMS: ['SHA1', 'SHA256', 'SHA512'] as const,
  /** 支持的验证码位数 */
  DIGITS: [6, 8] as const,
  /** 支持的时间窗口（秒） */
  PERIODS: [15, 30, 60] as const,
} as const;

/**
 * Base32 编码相关常量
 */
export const BASE32 = {
  /** Base32 字符集 */
  ALPHABET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
  /** 填充字符 */
  PADDING: '=',
  /** 每组位数 */
  BITS_PER_CHAR: 5,
  /** 每组字节数 */
  BYTES_PER_GROUP: 5,
} as const;

/**
 * 验证规则常量
 */
export const VALIDATION_RULES = {
  /** 服务名称最大长度 */
  MAX_SERVICE_NAME_LENGTH: 50,
  /** 账户名称最大长度 */
  MAX_ACCOUNT_NAME_LENGTH: 100,
  /** 密钥最小长度（Base32字符） */
  MIN_SECRET_LENGTH: 16,
  /** 密钥最大长度（Base32字符） */
  MAX_SECRET_LENGTH: 128,
  /** 邮箱格式正则表达式 */
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

/**
 * 时间相关常量
 */
export const TIME_CONSTANTS = {
  /** Unix 时间戳起始时间（1970-01-01 00:00:00 UTC） */
  UNIX_EPOCH: 0,
  /** 毫秒转秒的除数 */
  MS_TO_SECONDS: 1000,
  /** 时间同步检查间隔（毫秒） */
  SYNC_CHECK_INTERVAL: 5 * 60 * 1000, // 5分钟
  /** 时间偏差警告阈值（毫秒） */
  TIME_DRIFT_WARNING_THRESHOLD: 30 * 1000, // 30秒
  /** 时间偏差错误阈值（毫秒） */
  TIME_DRIFT_ERROR_THRESHOLD: 60 * 1000, // 60秒
} as const;

/**
 * UI 相关常量
 */
export const UI_CONSTANTS = {
  /** 二维码默认尺寸 */
  DEFAULT_QR_SIZE: 256,
  /** 二维码最小尺寸 */
  MIN_QR_SIZE: 128,
  /** 二维码最大尺寸 */
  MAX_QR_SIZE: 512,
  /** 倒计时更新间隔（毫秒） */
  COUNTDOWN_UPDATE_INTERVAL: 100,
  /** 验证码显示动画持续时间（毫秒） */
  CODE_ANIMATION_DURATION: 300,
} as const;

/**
 * 存储相关常量
 */
export const STORAGE_KEYS = {
  /** TOTP 配置存储前缀 */
  CONFIG_PREFIX: 'totp_config_',
  /** 用户偏好设置 */
  USER_PREFERENCES: 'totp_preferences',
  /** 最后使用的配置 */
  LAST_CONFIG: 'totp_last_config',
} as const;

/**
 * 错误消息常量
 */
export const ERROR_MESSAGES = {
  INVALID_SERVICE_NAME: '服务名称不能为空且长度不能超过50个字符',
  INVALID_ACCOUNT_NAME: '账户名称格式不正确',
  INVALID_SECRET: '密钥格式不正确，必须是有效的Base32编码',
  INVALID_ALGORITHM: '不支持的哈希算法',
  INVALID_DIGITS: '验证码位数必须是6位或8位',
  INVALID_PERIOD: '时间窗口必须是15秒、30秒或60秒',
  TIME_SYNC_ERROR: '系统时间可能不同步，请检查时间设置',
  CALCULATION_ERROR: '验证码计算失败',
  STORAGE_ERROR: '本地存储操作失败',
  EXPORT_ERROR: '导出操作失败',
  NETWORK_ERROR: '网络连接失败',
  UNKNOWN_ERROR: '未知错误',
} as const;

/**
 * OTPAuth URI 相关常量
 */
export const OTPAUTH = {
  /** URI 协议 */
  PROTOCOL: 'otpauth',
  /** TOTP 类型 */
  TYPE: 'totp',
  /** 参数名称 */
  PARAMS: {
    SECRET: 'secret',
    ISSUER: 'issuer',
    ALGORITHM: 'algorithm',
    DIGITS: 'digits',
    PERIOD: 'period',
  },
} as const;