/**
 * TOTP 服务接口定义
 * 定义各个服务模块的契约
 */

import { TOTPConfig, ValidationResult, ErrorType, TimeSyncStatus } from './types';

/**
 * TOTP 核心服务接口
 * 负责 TOTP 算法的核心实现
 */
export interface TOTPService {
  /**
   * 生成安全的随机密钥
   * @returns Base32 编码的32字符密钥
   */
  generateSecret(): string;

  /**
   * 生成 TOTP 验证码
   * @param secret Base32 编码的密钥
   * @param timestamp 可选的时间戳，默认使用当前时间
   * @param config 可选的配置参数
   * @returns 生成的验证码字符串
   */
  generateCode(secret: string, timestamp?: number, config?: Partial<TOTPConfig>): string;

  /**
   * 验证 TOTP 验证码
   * @param secret Base32 编码的密钥
   * @param code 要验证的验证码
   * @param window 时间窗口容错范围，默认1（允许前后各1个窗口）
   * @param config 可选的配置参数
   * @returns 验证是否通过
   */
  verifyCode(secret: string, code: string, window?: number, config?: Partial<TOTPConfig>): boolean;

  /**
   * 生成 OTPAuth URI
   * @param config TOTP 配置
   * @returns 标准的 otpauth:// URI 字符串
   */
  generateOtpauthUri(config: TOTPConfig): string;

  /**
   * 获取当前时间步长
   * @param period 时间窗口（秒）
   * @param timestamp 可选的时间戳
   * @returns 当前时间步长
   */
  getCurrentTimeStep(period: number, timestamp?: number): number;

  /**
   * 获取当前验证码剩余有效时间
   * @param period 时间窗口（秒）
   * @param timestamp 可选的时间戳
   * @returns 剩余秒数
   */
  getTimeRemaining(period: number, timestamp?: number): number;
}

/**
 * 密钥管理服务接口
 * 负责密钥的生成、编码和验证
 */
export interface SecretManager {
  /**
   * 生成加密安全的随机密钥
   * @param length 密钥长度（字节），默认20
   * @returns 原始字节数组
   */
  generateSecureSecret(length?: number): Uint8Array;

  /**
   * Base32 编码
   * @param buffer 要编码的字节数组
   * @returns Base32 编码字符串
   */
  encodeBase32(buffer: Uint8Array): string;

  /**
   * Base32 解码
   * @param encoded Base32 编码字符串
   * @returns 解码后的字节数组
   */
  decodeBase32(encoded: string): Uint8Array;

  /**
   * 验证密钥格式
   * @param secret 要验证的密钥
   * @returns 验证是否通过
   */
  validateSecret(secret: string): boolean;

  /**
   * 清理内存中的敏感数据
   * @param data 要清理的数据
   */
  clearSensitiveData(data: Uint8Array | string): void;
}

/**
 * 定时器服务接口
 * 负责管理 TOTP 的定时更新
 */
export interface TimerService {
  /**
   * 启动定时器
   * @param callback 回调函数
   * @param period 时间窗口（秒）
   */
  start(callback: () => void, period: number): void;

  /**
   * 停止定时器
   */
  stop(): void;

  /**
   * 获取下次更新的剩余时间
   * @param period 时间窗口（秒）
   * @returns 剩余毫秒数
   */
  getTimeToNextUpdate(period: number): number;

  /**
   * 检查是否正在运行
   * @returns 是否运行中
   */
  isRunning(): boolean;
}

/**
 * 错误处理服务接口
 * 负责统一的错误处理和用户提示
 */
export interface ErrorHandler {
  /**
   * 处理验证错误
   * @param field 字段名
   * @param value 字段值
   * @returns 验证结果
   */
  handleValidationError(field: string, value: any): ValidationResult;

  /**
   * 处理运行时错误
   * @param error 错误对象
   */
  handleRuntimeError(error: Error): void;

  /**
   * 显示用户友好的错误消息
   * @param errorType 错误类型
   * @param details 错误详情
   */
  showUserFriendlyMessage(errorType: ErrorType, details?: any): void;

  /**
   * 记录错误日志
   * @param error 错误对象
   * @param context 上下文信息
   */
  logError(error: Error, context?: any): void;
}

/**
 * 配置存储服务接口
 * 负责 TOTP 配置的本地存储管理
 */
export interface ConfigStorage {
  /**
   * 保存配置
   * @param key 配置键
   * @param config 配置对象
   */
  saveConfig(key: string, config: TOTPConfig): Promise<void>;

  /**
   * 加载配置
   * @param key 配置键
   * @returns 配置对象或 null
   */
  loadConfig(key: string): Promise<TOTPConfig | null>;

  /**
   * 删除配置
   * @param key 配置键
   */
  deleteConfig(key: string): Promise<void>;

  /**
   * 获取所有配置键
   * @returns 配置键数组
   */
  getAllConfigKeys(): Promise<string[]>;

  /**
   * 清空所有配置
   */
  clearAllConfigs(): Promise<void>;
}

/**
 * 时间同步服务接口
 * 负责检测和处理时间同步问题
 */
export interface TimeSyncService {
  /**
   * 检查时间同步状态
   * @returns 时间同步状态
   */
  checkTimeSync(): Promise<TimeSyncStatus>;

  /**
   * 获取网络时间
   * @returns 网络时间戳
   */
  getNetworkTime(): Promise<number>;

  /**
   * 计算时间偏差
   * @param networkTime 网络时间
   * @param localTime 本地时间
   * @returns 偏差毫秒数
   */
  calculateOffset(networkTime: number, localTime: number): number;
}