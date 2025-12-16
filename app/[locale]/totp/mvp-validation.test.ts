/**
 * MVP Functionality Validation Tests
 * Specific tests for task 5.1 requirements:
 * - 验证能生成有效的 TOTP 二维码
 * - 验证验证码每 30 秒正确更新
 * - 验证二维码能被 Google Authenticator 扫描
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TOTPServiceImpl } from './services/totpService';
import { SecretManagerImpl } from './services/secretManager';
import { TimerServiceImpl } from './services/timerService';
import { TOTPConfig } from './types';

describe('MVP Functionality Validation - Task 5.1', () => {
  let totpService: TOTPServiceImpl;
  let secretManager: SecretManagerImpl;
  let timerService: TimerServiceImpl;

  beforeEach(() => {
    totpService = new TOTPServiceImpl();
    secretManager = new SecretManagerImpl();
    timerService = new TimerServiceImpl();
  });

  describe('Requirement 1.3, 2.1, 2.2: Generate Valid TOTP QR Code', () => {
    it('should generate a complete, valid TOTP configuration for QR code', () => {
      // Generate a secure secret
      const secret = totpService.generateSecret();
      
      // Create a complete TOTP configuration
      const config: TOTPConfig = {
        serviceName: 'Test App',
        accountName: 'user@example.com',
        secret: secret,
        algorithm: 'SHA1',
        digits: 6,
        period: 30
      };

      // Generate OTPAuth URI (this is what goes in the QR code)
      const otpauthUri = totpService.generateOtpauthUri(config);

      // Validate the URI format
      expect(otpauthUri).toMatch(/^otpauth:\/\/totp\//);
      expect(otpauthUri).toContain('secret=' + secret);
      expect(otpauthUri).toContain('issuer=Test+App');
      
      // Validate the secret is properly formatted
      expect(secret).toMatch(/^[A-Z2-7]{32}$/);
      expect(secretManager.validateSecret(secret)).toBe(true);

      // Validate we can generate a code from this configuration
      const code = totpService.generateCode(secret);
      expect(code).toMatch(/^\d{6}$/);
      
      // Validate the code can be verified
      expect(totpService.verifyCode(secret, code)).toBe(true);
    });

    it('should generate QR code data compatible with Google Authenticator', () => {
      const config: TOTPConfig = {
        serviceName: 'GitHub',
        accountName: 'testuser@example.com',
        secret: 'JBSWY3DPEHPK3PXP',
        algorithm: 'SHA1',
        digits: 6,
        period: 30
      };

      const uri = totpService.generateOtpauthUri(config);
      
      // Google Authenticator expects this exact format
      expect(uri).toMatch(/^otpauth:\/\/totp\/GitHub%3Atestuser%40example\.com\?/);
      expect(uri).toContain('secret=JBSWY3DPEHPK3PXP');
      expect(uri).toContain('issuer=GitHub');
      
      // Should not contain default parameters (Google Authenticator assumes defaults)
      expect(uri).not.toContain('algorithm=SHA1');
      expect(uri).not.toContain('digits=6');
      expect(uri).not.toContain('period=30');
      
      // Should be a valid URI that can be parsed
      expect(() => new URL(uri)).not.toThrow();
    });
  });

  describe('Requirement 2.1, 2.2: Verify Codes Update Every 30 Seconds', () => {
    it('should generate different codes every 30 seconds', () => {
      const secret = totpService.generateSecret();
      
      // Test at different 30-second intervals
      const timestamps = [
        1234567890,      // Base time
        1234567890 + 30, // 30 seconds later
        1234567890 + 60, // 60 seconds later
        1234567890 + 90  // 90 seconds later
      ];
      
      const codes = timestamps.map(ts => totpService.generateCode(secret, ts));
      
      // All codes should be different
      expect(codes[0]).not.toBe(codes[1]);
      expect(codes[1]).not.toBe(codes[2]);
      expect(codes[2]).not.toBe(codes[3]);
      expect(codes[0]).not.toBe(codes[2]);
      expect(codes[0]).not.toBe(codes[3]);
      expect(codes[1]).not.toBe(codes[3]);
    });

    it('should generate same code within the same 30-second window', () => {
      const secret = totpService.generateSecret();
      const baseTime = 1234567890;
      
      // Generate codes at different points within the same 30-second window
      const timesInSameWindow = [
        baseTime,
        baseTime + 5,
        baseTime + 15,
        baseTime + 29
      ];
      
      const codes = timesInSameWindow.map(ts => totpService.generateCode(secret, ts));
      
      // All codes should be the same within the same window
      expect(codes[0]).toBe(codes[1]);
      expect(codes[1]).toBe(codes[2]);
      expect(codes[2]).toBe(codes[3]);
    });

    it('should provide accurate countdown timer for code expiration', () => {
      // Test countdown at various points in a 30-second period
      const testCases = [
        { secondsInPeriod: 0, expectedRemaining: 30 },
        { secondsInPeriod: 10, expectedRemaining: 20 },
        { secondsInPeriod: 20, expectedRemaining: 10 },
        { secondsInPeriod: 29, expectedRemaining: 1 }
      ];
      
      testCases.forEach(({ secondsInPeriod, expectedRemaining }) => {
        // Create a timestamp at a specific point in the 30-second period
        const baseTimestamp = Math.floor(1234567890 / 30) * 30; // Align to period start
        const testTimestamp = baseTimestamp + secondsInPeriod;
        
        const remaining = totpService.getTimeRemaining(30, testTimestamp);
        expect(remaining).toBe(expectedRemaining);
      });
    });
  });

  describe('Requirement 1.3: Google Authenticator Compatibility', () => {
    it('should generate codes that match RFC 6238 test vectors', () => {
      // Use the standard test key from RFC 6238
      const testKey = '12345678901234567890';
      const testSecret = secretManager.encodeBase32(new TextEncoder().encode(testKey));
      
      // RFC 6238 test vectors
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

    it('should handle special characters in service and account names', () => {
      const config: TOTPConfig = {
        serviceName: 'My Service & Co.',
        accountName: 'user+test@example.com',
        secret: 'JBSWY3DPEHPK3PXP',
        algorithm: 'SHA1',
        digits: 6,
        period: 30
      };

      const uri = totpService.generateOtpauthUri(config);
      
      // Should properly encode special characters for URL safety
      expect(uri).toContain('My%20Service%20%26%20Co.');
      expect(uri).toContain('user%2Btest%40example.com');
      
      // Should still be a valid, parseable URI
      expect(() => new URL(uri)).not.toThrow();
    });

    it('should support custom TOTP parameters in URI', () => {
      const config: TOTPConfig = {
        serviceName: 'Custom App',
        accountName: 'user@example.com',
        secret: 'JBSWY3DPEHPK3PXP',
        algorithm: 'SHA256',
        digits: 8,
        period: 60
      };

      const uri = totpService.generateOtpauthUri(config);
      
      // Should include non-default parameters
      expect(uri).toContain('algorithm=SHA256');
      expect(uri).toContain('digits=8');
      expect(uri).toContain('period=60');
      
      // Should generate codes with the custom parameters
      const code = totpService.generateCode(config.secret, 1234567890, config);
      expect(code).toMatch(/^\d{8}$/); // 8 digits
    });
  });

  describe('End-to-End MVP Workflow', () => {
    it('should complete the full TOTP setup workflow', () => {
      // Step 1: Generate a new secret
      const secret = totpService.generateSecret();
      expect(secret).toBeDefined();
      expect(secret.length).toBe(32);

      // Step 2: Create configuration
      const config: TOTPConfig = {
        serviceName: 'MVP Test App',
        accountName: 'mvp-user@example.com',
        secret: secret,
        algorithm: 'SHA1',
        digits: 6,
        period: 30
      };

      // Step 3: Generate QR code URI
      const qrCodeUri = totpService.generateOtpauthUri(config);
      expect(qrCodeUri).toMatch(/^otpauth:\/\/totp\//);

      // Step 4: Generate current TOTP code
      const currentCode = totpService.generateCode(secret);
      expect(currentCode).toMatch(/^\d{6}$/);

      // Step 5: Verify the code works
      expect(totpService.verifyCode(secret, currentCode)).toBe(true);

      // Step 6: Verify countdown timer works
      const timeRemaining = totpService.getTimeRemaining(30);
      expect(timeRemaining).toBeGreaterThan(0);
      expect(timeRemaining).toBeLessThanOrEqual(30);

      // Step 7: Verify code changes after 30 seconds
      const futureCode = totpService.generateCode(secret, Math.floor(Date.now() / 1000) + 30);
      expect(futureCode).not.toBe(currentCode);
    });

    it('should maintain security and validation throughout workflow', () => {
      const secret = totpService.generateSecret();
      
      // Secret should be cryptographically secure
      expect(secretManager.validateSecret(secret)).toBe(true);
      
      // Should reject invalid codes
      expect(totpService.verifyCode(secret, '000000')).toBe(false);
      expect(totpService.verifyCode(secret, '999999')).toBe(false);
      
      // Should handle edge cases gracefully
      expect(() => totpService.generateOtpauthUri({
        serviceName: '',
        accountName: '',
        secret: secret,
        algorithm: 'SHA1',
        digits: 6,
        period: 30
      })).not.toThrow();
    });
  });
});