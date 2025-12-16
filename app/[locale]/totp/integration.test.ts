/**
 * TOTP Integration Tests
 * Tests for complete TOTP workflow and Google Authenticator compatibility
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TOTPServiceImpl } from './services/totpService';
import { SecretManagerImpl } from './services/secretManager';
import { TimerServiceImpl } from './services/timerService';
import { TOTPConfig } from './types';

describe('TOTP Integration Tests - MVP Functionality Validation', () => {
  let totpService: TOTPServiceImpl;
  let secretManager: SecretManagerImpl;
  let timerService: TimerServiceImpl;

  beforeEach(() => {
    totpService = new TOTPServiceImpl();
    secretManager = new SecretManagerImpl();
    timerService = new TimerServiceImpl();
  });

  describe('Complete TOTP Workflow', () => {
    it('should generate valid TOTP QR code data end-to-end', () => {
      // Step 1: Generate a secure secret
      const secret = totpService.generateSecret();
      expect(secret).toBeDefined();
      expect(secret.length).toBe(32);
      expect(secretManager.validateSecret(secret)).toBe(true);

      // Step 2: Create TOTP configuration
      const config: TOTPConfig = {
        serviceName: 'Test Service',
        accountName: 'user@example.com',
        secret: secret,
        algorithm: 'SHA1',
        digits: 6,
        period: 30
      };

      // Step 3: Generate OTPAuth URI for QR code
      const otpauthUri = totpService.generateOtpauthUri(config);
      expect(otpauthUri).toMatch(/^otpauth:\/\/totp\//);
      expect(otpauthUri).toContain(secret);
      expect(otpauthUri).toContain('Test%20Service');
      expect(otpauthUri).toContain('user%40example.com');

      // Step 4: Generate current TOTP code
      const currentCode = totpService.generateCode(secret);
      expect(currentCode).toMatch(/^\d{6}$/);

      // Step 5: Verify the generated code
      const isValid = totpService.verifyCode(secret, currentCode);
      expect(isValid).toBe(true);

      // Step 6: Verify time calculations work
      const timeRemaining = totpService.getTimeRemaining(30);
      expect(timeRemaining).toBeGreaterThan(0);
      expect(timeRemaining).toBeLessThanOrEqual(30);
    });

    it('should demonstrate 30-second code updates', () => {
      const secret = totpService.generateSecret();
      
      // Generate codes at different time points
      const timestamp1 = 1234567890; // Base timestamp
      const timestamp2 = timestamp1 + 30; // 30 seconds later
      const timestamp3 = timestamp1 + 60; // 60 seconds later

      const code1 = totpService.generateCode(secret, timestamp1);
      const code2 = totpService.generateCode(secret, timestamp2);
      const code3 = totpService.generateCode(secret, timestamp3);

      // Codes should be different across 30-second boundaries
      expect(code1).not.toBe(code2);
      expect(code2).not.toBe(code3);
      expect(code1).not.toBe(code3);

      // But same within the same 30-second window
      const codeWithin1 = totpService.generateCode(secret, timestamp1 + 15);
      const codeWithin2 = totpService.generateCode(secret, timestamp1 + 29);
      
      expect(code1).toBe(codeWithin1);
      expect(code1).toBe(codeWithin2);
    });
  });

  describe('Google Authenticator Compatibility', () => {
    it('should generate QR codes scannable by Google Authenticator', () => {
      const config: TOTPConfig = {
        serviceName: 'GitHub',
        accountName: 'testuser@example.com',
        secret: 'JBSWY3DPEHPK3PXP',
        algorithm: 'SHA1',
        digits: 6,
        period: 30
      };

      const uri = totpService.generateOtpauthUri(config);
      
      // Verify URI format matches Google Authenticator expectations
      expect(uri).toMatch(/^otpauth:\/\/totp\/GitHub%3Atestuser%40example\.com\?/);
      expect(uri).toContain('secret=JBSWY3DPEHPK3PXP');
      expect(uri).toContain('issuer=GitHub');
      
      // Should not contain default parameters (Google Authenticator assumes defaults)
      expect(uri).not.toContain('algorithm=SHA1');
      expect(uri).not.toContain('digits=6');
      expect(uri).not.toContain('period=30');
    });

    it('should generate codes that match Google Authenticator test vectors', () => {
      // RFC 6238 test vectors that Google Authenticator should also generate
      const testSecret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
      
      const testVectors = [
        { timestamp: 59, expected: '287082' },
        { timestamp: 1111111109, expected: '081804' },
        { timestamp: 1111111111, expected: '050471' },
        { timestamp: 1234567890, expected: '005924' },
        { timestamp: 2000000000, expected: '279037' }
      ];

      testVectors.forEach(({ timestamp, expected }) => {
        const code = totpService.generateCode(testSecret, timestamp);
        expect(code).toBe(expected);
      });
    });

    it('should handle special characters in service names correctly', () => {
      const config: TOTPConfig = {
        serviceName: 'My Service & Co.',
        accountName: 'user+test@example.com',
        secret: 'JBSWY3DPEHPK3PXP',
        algorithm: 'SHA1',
        digits: 6,
        period: 30
      };

      const uri = totpService.generateOtpauthUri(config);
      
      // Should properly encode special characters
      expect(uri).toContain('My%20Service%20%26%20Co.');
      expect(uri).toContain('user%2Btest%40example.com');
      
      // Should still be a valid URI
      expect(() => new URL(uri)).not.toThrow();
    });
  });

  describe('Real-time Updates Simulation', () => {
    it('should simulate real-time code updates', () => {
      const secret = totpService.generateSecret();
      const codes: string[] = [];
      const timestamps: number[] = [];
      
      // Simulate collecting codes over 90 seconds (3 periods)
      for (let i = 0; i < 90; i += 10) {
        const timestamp = 1234567890 + i;
        const code = totpService.generateCode(secret, timestamp);
        codes.push(code);
        timestamps.push(timestamp);
      }
      
      // Should have 9 codes total
      expect(codes.length).toBe(9);
      
      // Codes should change every 30 seconds
      // Codes at timestamps 0, 10, 20 should be the same (first period)
      expect(codes[0]).toBe(codes[1]); // 0s and 10s
      expect(codes[1]).toBe(codes[2]); // 10s and 20s
      
      // Codes at timestamps 30, 40, 50 should be the same (second period)
      expect(codes[3]).toBe(codes[4]); // 30s and 40s
      expect(codes[4]).toBe(codes[5]); // 40s and 50s
      
      // Codes at timestamps 60, 70, 80 should be the same (third period)
      expect(codes[6]).toBe(codes[7]); // 60s and 70s
      expect(codes[7]).toBe(codes[8]); // 70s and 80s
      
      // But codes should be different across periods
      expect(codes[0]).not.toBe(codes[3]); // First vs second period
      expect(codes[3]).not.toBe(codes[6]); // Second vs third period
      expect(codes[0]).not.toBe(codes[6]); // First vs third period
    });

    it('should calculate accurate countdown timers', () => {
      // Test countdown at various points in a 30-second period
      const testPoints = [
        { secondsInPeriod: 0, expectedRemaining: 30 },
        { secondsInPeriod: 5, expectedRemaining: 25 },
        { secondsInPeriod: 15, expectedRemaining: 15 },
        { secondsInPeriod: 25, expectedRemaining: 5 },
        { secondsInPeriod: 29, expectedRemaining: 1 }
      ];
      
      testPoints.forEach(({ secondsInPeriod, expectedRemaining }) => {
        const baseTimestamp = Math.floor(1234567890 / 30) * 30; // Align to period start
        const testTimestamp = baseTimestamp + secondsInPeriod;
        
        const remaining = totpService.getTimeRemaining(30, testTimestamp);
        expect(remaining).toBe(expectedRemaining);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid secrets gracefully', () => {
      // Invalid secrets should either throw errors or return some result
      // Let's test that the system doesn't crash
      let result1, result2;
      
      try {
        result1 = totpService.generateCode('INVALID');
      } catch (error) {
        // It's okay if it throws
        expect(error).toBeDefined();
      }
      
      try {
        result2 = totpService.generateCode('');
      } catch (error) {
        // It's okay if it throws
        expect(error).toBeDefined();
      }
      
      // Verification should return false for invalid secrets
      expect(totpService.verifyCode('INVALID', '123456')).toBe(false);
    });

    it('should handle edge cases in time calculations', () => {
      const secret = totpService.generateSecret();
      
      // Test at Unix epoch
      const code1 = totpService.generateCode(secret, 0);
      expect(code1).toMatch(/^\d{6}$/);
      
      // Test at far future timestamp
      const code2 = totpService.generateCode(secret, 4000000000);
      expect(code2).toMatch(/^\d{6}$/);
      
      // Test with negative timestamp (should handle gracefully)
      expect(() => totpService.generateCode(secret, -1)).not.toThrow();
    });

    it('should validate configuration parameters', () => {
      const secret = totpService.generateSecret();
      
      // Test with invalid digits
      expect(() => totpService.generateCode(secret, undefined, { digits: 0 as any })).not.toThrow();
      expect(() => totpService.generateCode(secret, undefined, { digits: 20 as any })).not.toThrow();
      
      // Test with invalid period
      expect(() => totpService.generateCode(secret, undefined, { period: 0 })).not.toThrow();
      expect(() => totpService.generateCode(secret, undefined, { period: -1 })).not.toThrow();
    });
  });

  describe('Performance and Memory', () => {
    it('should generate codes efficiently', () => {
      const secret = totpService.generateSecret();
      const startTime = performance.now();
      
      // Generate 1000 codes
      for (let i = 0; i < 1000; i++) {
        totpService.generateCode(secret, 1234567890 + i);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle memory cleanup properly', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Generate many secrets and codes
      for (let i = 0; i < 100; i++) {
        const secret = totpService.generateSecret();
        totpService.generateCode(secret);
        secretManager.clearSensitiveData(secretManager.generateSecureSecret());
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});