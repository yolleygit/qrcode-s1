import { EncryptedQRError } from '../interfaces';

interface FailureRecord {
  count: number;
  lastFailure: number;
  lockedUntil?: number;
}

export class SecurityService {
  private static instance: SecurityService;
  private failureRecords = new Map<string, FailureRecord>();
  private readonly MAX_FAILURES = 3;
  private readonly LOCKOUT_DURATION = 30000; // 30秒

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * 生成用户标识（基于IP或会话）
   */
  private getUserIdentifier(): string {
    // 在实际应用中，这里应该使用真实的用户标识
    // 现在使用简单的会话标识
    return 'current-session';
  }

  /**
   * 检查是否被锁定
   */
  isLocked(): boolean {
    const userId = this.getUserIdentifier();
    const record = this.failureRecords.get(userId);
    
    if (!record || !record.lockedUntil) {
      return false;
    }

    const now = Date.now();
    if (now >= record.lockedUntil) {
      // 锁定期已过，清除锁定状态
      record.lockedUntil = undefined;
      record.count = 0;
      return false;
    }

    return true;
  }

  /**
   * 获取剩余锁定时间（秒）
   */
  getRemainingLockTime(): number {
    const userId = this.getUserIdentifier();
    const record = this.failureRecords.get(userId);
    
    if (!record || !record.lockedUntil) {
      return 0;
    }

    const remaining = Math.max(0, record.lockedUntil - Date.now());
    return Math.ceil(remaining / 1000);
  }

  /**
   * 记录解密失败
   */
  recordFailure(): void {
    const userId = this.getUserIdentifier();
    const now = Date.now();
    
    let record = this.failureRecords.get(userId);
    if (!record) {
      record = { count: 0, lastFailure: now };
      this.failureRecords.set(userId, record);
    }

    record.count++;
    record.lastFailure = now;

    // 如果失败次数达到上限，启动锁定
    if (record.count >= this.MAX_FAILURES) {
      record.lockedUntil = now + this.LOCKOUT_DURATION;
      console.warn(`用户 ${userId} 因连续失败 ${record.count} 次被锁定 ${this.LOCKOUT_DURATION/1000} 秒`);
    }
  }

  /**
   * 记录解密成功（清除失败记录）
   */
  recordSuccess(): void {
    const userId = this.getUserIdentifier();
    this.failureRecords.delete(userId);
  }

  /**
   * 检查解密前的安全状态
   */
  checkSecurityBeforeDecrypt(): { allowed: boolean; error?: string } {
    if (this.isLocked()) {
      const remaining = this.getRemainingLockTime();
      return {
        allowed: false,
        error: `由于连续失败次数过多，请等待 ${remaining} 秒后重试`
      };
    }

    return { allowed: true };
  }

  /**
   * 清除所有失败记录（用于测试或管理员重置）
   */
  clearAllRecords(): void {
    this.failureRecords.clear();
  }

  /**
   * 获取当前失败次数
   */
  getCurrentFailureCount(): number {
    const userId = this.getUserIdentifier();
    const record = this.failureRecords.get(userId);
    return record?.count || 0;
  }
}