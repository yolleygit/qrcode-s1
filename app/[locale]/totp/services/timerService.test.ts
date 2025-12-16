/**
 * Timer Service Tests
 * Tests for TOTP timer and countdown functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TimerServiceImpl } from './timerService';

describe('TimerService Basic Functionality Tests', () => {
  let timerService: TimerServiceImpl;
  let mockCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    timerService = new TimerServiceImpl();
    mockCallback = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    timerService.cleanup();
    vi.useRealTimers();
  });

  describe('Timer Control', () => {
    it('should start and stop timer correctly', () => {
      expect(timerService.isRunning()).toBe(false);
      
      timerService.start(mockCallback, 30);
      expect(timerService.isRunning()).toBe(true);
      
      timerService.stop();
      expect(timerService.isRunning()).toBe(false);
    });

    it('should call callback immediately on start', () => {
      timerService.start(mockCallback, 30);
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should call callback periodically', async () => {
      // Mock current time to be at the start of a 30-second window
      const baseTime = 1234567890000; // milliseconds
      vi.setSystemTime(baseTime);
      
      timerService.start(mockCallback, 30);
      
      // Initial call
      expect(mockCallback).toHaveBeenCalledTimes(1);
      
      // Advance to next 30-second boundary
      vi.advanceTimersByTime(30000);
      
      // Should have been called again
      expect(mockCallback).toHaveBeenCalledTimes(2);
    });

    it('should stop calling callback after stop', () => {
      timerService.start(mockCallback, 30);
      timerService.stop();
      
      const initialCallCount = mockCallback.mock.calls.length;
      
      // Advance time
      vi.advanceTimersByTime(60000);
      
      // Should not have been called again
      expect(mockCallback).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  describe('Time Calculations', () => {
    it('should calculate time remaining correctly', () => {
      // Mock time to be 10 seconds into a 30-second period
      const baseTime = 1234567890; // seconds
      const timeInPeriod = baseTime % 30; // Should be 0
      const testTime = baseTime + 10; // 10 seconds into period
      
      vi.setSystemTime(testTime * 1000);
      
      const remaining = timerService.getTimeRemaining(30);
      expect(remaining).toBe(20); // 30 - 10 = 20
    });

    it('should calculate current time step correctly', () => {
      const timestamp = 1234567890; // This should be step 41152263
      const expectedStep = Math.floor(timestamp / 30);
      
      vi.setSystemTime(timestamp * 1000);
      
      const step = timerService.getCurrentTimeStep(30);
      expect(step).toBe(expectedStep);
    });

    it('should calculate time to next update correctly', () => {
      // Set time to 10 seconds into a 30-second period
      const baseTime = Math.floor(Date.now() / 1000);
      const alignedTime = Math.floor(baseTime / 30) * 30; // Start of current period
      const testTime = alignedTime + 10; // 10 seconds into period
      
      vi.setSystemTime(testTime * 1000);
      
      const timeToNext = timerService.getTimeToNextUpdate(30);
      expect(timeToNext).toBeLessThanOrEqual(20000); // Should be around 20 seconds
      expect(timeToNext).toBeGreaterThan(19000); // Allow for small timing differences
    });

    it('should calculate progress percentage correctly', () => {
      // Set time to 15 seconds into a 30-second period (50%)
      const baseTime = Math.floor(Date.now() / 1000);
      const alignedTime = Math.floor(baseTime / 30) * 30;
      const testTime = alignedTime + 15;
      
      vi.setSystemTime(testTime * 1000);
      
      const progress = timerService.getProgressPercentage(30);
      expect(progress).toBe(50);
    });

    it('should detect near expiry correctly', () => {
      // Set time to 27 seconds into a 30-second period (3 seconds remaining)
      const baseTime = Math.floor(Date.now() / 1000);
      const alignedTime = Math.floor(baseTime / 30) * 30;
      const testTime = alignedTime + 27;
      
      vi.setSystemTime(testTime * 1000);
      
      expect(timerService.isNearExpiry(30, 5)).toBe(true);
      expect(timerService.isNearExpiry(30, 2)).toBe(false);
    });
  });

  describe('Countdown Functionality', () => {
    it('should start countdown with correct initial value', () => {
      const countdownCallback = vi.fn();
      
      // Set time to 10 seconds into a 30-second period
      const baseTime = Math.floor(Date.now() / 1000);
      const alignedTime = Math.floor(baseTime / 30) * 30;
      const testTime = alignedTime + 10;
      
      vi.setSystemTime(testTime * 1000);
      
      timerService.startCountdown(countdownCallback, 30);
      
      expect(countdownCallback).toHaveBeenCalledWith(20); // 30 - 10 = 20
    });

    it('should update countdown periodically', () => {
      const countdownCallback = vi.fn();
      
      timerService.startCountdown(countdownCallback, 30);
      
      // Clear initial call
      countdownCallback.mockClear();
      
      // Advance by countdown update interval
      vi.advanceTimersByTime(100); // Default update interval
      
      expect(countdownCallback).toHaveBeenCalled();
    });

    it('should stop countdown correctly', () => {
      const countdownCallback = vi.fn();
      
      timerService.startCountdown(countdownCallback, 30);
      timerService.stopCountdown();
      
      const initialCallCount = countdownCallback.mock.calls.length;
      
      // Advance time
      vi.advanceTimersByTime(1000);
      
      // Should not have been called again
      expect(countdownCallback).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  describe('Synchronization', () => {
    it('should sync to time boundary correctly', () => {
      const syncCallback = vi.fn();
      
      // Set time to 10 seconds into a 30-second period
      const baseTime = Math.floor(Date.now() / 1000);
      const alignedTime = Math.floor(baseTime / 30) * 30;
      const testTime = alignedTime + 10;
      
      vi.setSystemTime(testTime * 1000);
      
      timerService.syncToTimeBoundary(syncCallback, 30);
      
      // Should not be called immediately
      expect(syncCallback).not.toHaveBeenCalled();
      
      // Advance to next boundary (20 seconds)
      vi.advanceTimersByTime(20000);
      
      // Should be called now
      expect(syncCallback).toHaveBeenCalledTimes(1);
    });

    it('should calculate delay to specific time step', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const currentStep = Math.floor(currentTime / 30);
      const targetStep = currentStep + 2; // 2 steps in future
      
      vi.setSystemTime(currentTime * 1000);
      
      const delay = timerService.getDelayToTimeStep(targetStep, 30);
      
      // Should be approximately 60 seconds (2 * 30), but could be less depending on current position in time step
      expect(delay).toBeGreaterThan(30000); // At least 30 seconds
      expect(delay).toBeLessThanOrEqual(60000); // At most 60 seconds
    });
  });

  describe('Cleanup', () => {
    it('should cleanup all timers and intervals', () => {
      const callback = vi.fn();
      const countdownCallback = vi.fn();
      
      timerService.start(callback, 30);
      timerService.startCountdown(countdownCallback, 30);
      
      expect(timerService.isRunning()).toBe(true);
      
      timerService.cleanup();
      
      expect(timerService.isRunning()).toBe(false);
      
      // Advance time to ensure no callbacks are called
      vi.advanceTimersByTime(60000);
      
      // Should not have additional calls after cleanup
      const callCountAfterCleanup = callback.mock.calls.length + countdownCallback.mock.calls.length;
      
      vi.advanceTimersByTime(60000);
      
      const finalCallCount = callback.mock.calls.length + countdownCallback.mock.calls.length;
      expect(finalCallCount).toBe(callCountAfterCleanup);
    });
  });
});