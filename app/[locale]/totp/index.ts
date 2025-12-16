/**
 * TOTP 模块导出文件
 * 统一导出所有类型、接口和常量
 */

// 类型定义
export type {
  HashAlgorithm,
  TOTPConfig,
  TOTPState,
  ValidationResult,
  ExportFormat,
  ExportOptions,
  TimeSyncStatus,
} from './types';

export { ErrorType } from './types';

// 服务接口
export type {
  TOTPService,
  SecretManager,
  TimerService,
  ErrorHandler,
  ConfigStorage,
  TimeSyncService,
} from './interfaces';

// 常量
export {
  TOTP_DEFAULTS,
  SUPPORTED_OPTIONS,
  BASE32,
  VALIDATION_RULES,
  TIME_CONSTANTS,
  UI_CONSTANTS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  OTPAUTH,
} from './constants';

// 服务实现
export {
  TOTPServiceImpl,
  SecretManagerImpl,
  TimerServiceImpl,
  HighPrecisionTimerService,
  totpService,
  secretManager,
  timerService,
  highPrecisionTimerService,
  services,
} from './services';