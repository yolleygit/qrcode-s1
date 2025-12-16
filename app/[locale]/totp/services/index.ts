/**
 * TOTP 服务模块导出文件
 * 统一导出所有服务实现
 */

// TOTP 核心服务
export { TOTPServiceImpl, totpService } from './totpService';

// 密钥管理服务
export { SecretManagerImpl, secretManager } from './secretManager';

// 定时器服务
export { 
  TimerServiceImpl, 
  HighPrecisionTimerService,
  timerService, 
  highPrecisionTimerService 
} from './timerService';

// 便捷的服务集合
import { totpService } from './totpService';
import { secretManager } from './secretManager';
import { timerService, highPrecisionTimerService } from './timerService';

export const services = {
  totp: totpService,
  secret: secretManager,
  timer: timerService,
  highPrecisionTimer: highPrecisionTimerService,
} as const;