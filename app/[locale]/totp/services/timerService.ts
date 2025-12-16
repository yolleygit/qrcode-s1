/**
 * 定时器服务实现
 * 负责管理 TOTP 的定时更新和倒计时功能
 */

import { TimerService } from '../interfaces';
import { TIME_CONSTANTS, UI_CONSTANTS } from '../constants';

/**
 * 定时器服务实现类
 */
export class TimerServiceImpl implements TimerService {
  private intervalId: NodeJS.Timeout | null = null;
  private countdownIntervalId: NodeJS.Timeout | null = null;
  private currentPeriod: number = 30;
  private isActive: boolean = false;

  /**
   * 启动定时器
   * @param callback 回调函数
   * @param period 时间窗口（秒）
   */
  start(callback: () => void, period: number = 30): void {
    // 停止现有定时器
    this.stop();
    
    this.currentPeriod = period;
    this.isActive = true;
    
    // 立即执行一次回调
    callback();
    
    // 计算到下一个时间窗口的延迟
    const now = Date.now();
    const currentTimeSeconds = Math.floor(now / TIME_CONSTANTS.MS_TO_SECONDS);
    const timeToNextPeriod = period - (currentTimeSeconds % period);
    const delayToNextPeriod = timeToNextPeriod * TIME_CONSTANTS.MS_TO_SECONDS - (now % TIME_CONSTANTS.MS_TO_SECONDS);
    
    // 设置初始延迟定时器，确保在时间窗口边界触发
    setTimeout(() => {
      if (this.isActive) {
        callback();
        
        // 设置周期性定时器
        this.intervalId = setInterval(() => {
          if (this.isActive) {
            callback();
          }
        }, period * TIME_CONSTANTS.MS_TO_SECONDS);
      }
    }, delayToNextPeriod);
  }

  /**
   * 停止定时器
   */
  stop(): void {
    this.isActive = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = null;
    }
  }

  /**
   * 获取下次更新的剩余时间
   * @param period 时间窗口（秒）
   * @returns 剩余毫秒数
   */
  getTimeToNextUpdate(period: number = this.currentPeriod): number {
    const now = Date.now();
    const currentTimeSeconds = Math.floor(now / TIME_CONSTANTS.MS_TO_SECONDS);
    const timeToNextPeriod = period - (currentTimeSeconds % period);
    return timeToNextPeriod * TIME_CONSTANTS.MS_TO_SECONDS - (now % TIME_CONSTANTS.MS_TO_SECONDS);
  }

  /**
   * 检查是否正在运行
   * @returns 是否运行中
   */
  isRunning(): boolean {
    return this.isActive;
  }

  /**
   * 获取当前时间窗口的剩余秒数
   * @param period 时间窗口（秒）
   * @returns 剩余秒数
   */
  getTimeRemaining(period: number = this.currentPeriod): number {
    const currentTimeSeconds = Math.floor(Date.now() / TIME_CONSTANTS.MS_TO_SECONDS);
    return period - (currentTimeSeconds % period);
  }

  /**
   * 启动倒计时显示
   * @param callback 倒计时回调函数，参数为剩余秒数
   * @param period 时间窗口（秒）
   */
  startCountdown(callback: (remaining: number) => void, period: number = 30): void {
    // 停止现有倒计时
    this.stopCountdown();
    
    // 立即执行一次
    callback(this.getTimeRemaining(period));
    
    // 设置高频率更新以实现平滑倒计时
    this.countdownIntervalId = setInterval(() => {
      const remaining = this.getTimeRemaining(period);
      callback(remaining);
      
      // 如果倒计时结束，重新开始
      if (remaining === period) {
        callback(remaining);
      }
    }, UI_CONSTANTS.COUNTDOWN_UPDATE_INTERVAL);
  }

  /**
   * 停止倒计时显示
   */
  stopCountdown(): void {
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = null;
    }
  }

  /**
   * 获取当前时间步长
   * @param period 时间窗口（秒）
   * @returns 当前时间步长
   */
  getCurrentTimeStep(period: number = this.currentPeriod): number {
    const currentTimeSeconds = Math.floor(Date.now() / TIME_CONSTANTS.MS_TO_SECONDS);
    return Math.floor(currentTimeSeconds / period);
  }

  /**
   * 计算到指定时间步长的延迟
   * @param targetStep 目标时间步长
   * @param period 时间窗口（秒）
   * @returns 延迟毫秒数
   */
  getDelayToTimeStep(targetStep: number, period: number = this.currentPeriod): number {
    const currentTimeSeconds = Math.floor(Date.now() / TIME_CONSTANTS.MS_TO_SECONDS);
    const currentStep = Math.floor(currentTimeSeconds / period);
    
    if (targetStep <= currentStep) {
      // 目标步长已过，计算到下一个周期的延迟
      targetStep = currentStep + 1;
    }
    
    const targetTimeSeconds = targetStep * period;
    const delaySeconds = targetTimeSeconds - currentTimeSeconds;
    return delaySeconds * TIME_CONSTANTS.MS_TO_SECONDS;
  }

  /**
   * 同步到时间窗口边界
   * @param callback 同步完成后的回调
   * @param period 时间窗口（秒）
   */
  syncToTimeBoundary(callback: () => void, period: number = 30): void {
    const delay = this.getTimeToNextUpdate(period);
    
    setTimeout(() => {
      callback();
    }, delay);
  }

  /**
   * 获取当前时间窗口的进度百分比
   * @param period 时间窗口（秒）
   * @returns 进度百分比 (0-100)
   */
  getProgressPercentage(period: number = this.currentPeriod): number {
    const currentTimeSeconds = Math.floor(Date.now() / TIME_CONSTANTS.MS_TO_SECONDS);
    const elapsed = currentTimeSeconds % period;
    return (elapsed / period) * 100;
  }

  /**
   * 检查是否接近时间窗口结束
   * @param period 时间窗口（秒）
   * @param warningThreshold 警告阈值（秒），默认5秒
   * @returns 是否接近结束
   */
  isNearExpiry(period: number = this.currentPeriod, warningThreshold: number = 5): boolean {
    const remaining = this.getTimeRemaining(period);
    return remaining <= warningThreshold;
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.stop();
    this.stopCountdown();
  }
}

/**
 * 高精度定时器服务
 * 使用 requestAnimationFrame 实现更精确的倒计时
 */
export class HighPrecisionTimerService extends TimerServiceImpl {
  private animationFrameId: number | null = null;
  private lastUpdateTime: number = 0;

  /**
   * 启动高精度倒计时
   * @param callback 倒计时回调函数
   * @param period 时间窗口（秒）
   */
  startHighPrecisionCountdown(callback: (remaining: number, progress: number) => void, period: number = 30): void {
    this.stopHighPrecisionCountdown();
    
    const updateCountdown = (timestamp: number) => {
      if (timestamp - this.lastUpdateTime >= 50) { // 限制更新频率为20fps
        const remaining = this.getTimeRemaining(period);
        const progress = this.getProgressPercentage(period);
        callback(remaining, progress);
        this.lastUpdateTime = timestamp;
      }
      
      this.animationFrameId = requestAnimationFrame(updateCountdown);
    };
    
    this.animationFrameId = requestAnimationFrame(updateCountdown);
  }

  /**
   * 停止高精度倒计时
   */
  stopHighPrecisionCountdown(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    super.cleanup();
    this.stopHighPrecisionCountdown();
  }
}

// 导出单例实例
export const timerService = new TimerServiceImpl();
export const highPrecisionTimerService = new HighPrecisionTimerService();