/**
 * TOTP Service Tests
 * Tests for basic TOTP functionality validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TOTPServiceImpl } from './totpService';
import { TOTPConfig } from '../types';

describe('TOTPService Basic Functionality Tests', () => {
  let totpService: TOTPServiceImpl;
  let testConfig: TOTPConfig;

  beforeEach(() => {
    totpService = new TOTPServiceImpl();
    testConfig = {
      serviceName: 'TestService',
      accountName: 'test@example.com',
      secret: 'JBSWY3DPEHPK3PXP', // "Hello" in Base32
      algorithm: 'SHA1',
      digits: 6,
      period: 30
    };
  });

  describe('Secret Generation', () => {
    it('should generate a valid Base32 secret', () => {
      const secret = totpService.generateSecret();
      
      // Should be a string
      expect(typeof secret).toBe('string');
      
      // Should be 32 characters (160 bits / 5 bits per Base32 char)
      expect(secret.length).toBe(32);
      
      // Should only contain valid Base32 characters
      expect(secret).toMatch(/^[A-Z2-7]+$/);
    });

    it('should generate different secrets each time', () => {
      const secret1 = totpService.generateSecret();
      const secret2 = totpService.generateSecret();
      
      expect(secret1).not.toBe(secret2);
    });
  });

  describe('TOTP Code Generation', () => {
    it('should generate 6-digit codes by default', () => {
      const code = totpService.generateCode(testConfig.secret);
      
      expect(typeof code).toBe('string');
      expect(code.length).toBe(6);
      expect(code).toMatch(/^\d{6}$/);
    });

    it('should generate consistent codes for the same timestamp', () => {
      const timestamp = 1234567890; // Fixed timestamp
      
      const code1 = totpService.generateCode(testConfig.secret, timestamp);
      const code2 = totpService.generateCode(testConfig.secret, timestamp);
      
      expect(code1).toBe(code2);
    });

    it('should generate different codes for different timestamps', () => {
      const timestamp1 = 1234567890;
      const timestamp2 = 1234567920; // 30 seconds later
      
      const code1 = totpService.generateCode(testConfig.secret, timestamp1);
      const code2 = totpService.generateCode(testConfig.secret, timestamp2);
      
      expect(code1).not.toBe(code2);
    });

    it('should generate same codes within the same 30-second window', () => {
      const baseTime = 1234567890;
      
      // Test multiple timestamps within the same 30-second window
      const code1 = totpService.generateCode(testConfig.secret, baseTime);
      const code2 = totpService.generateCode(testConfig.secret, baseTime + 10);
      const code3 = totpService.generateCode(testConfig.secret, baseTime + 29);
      
      expect(code1).toBe(code2);
      expect(code2).toBe(code3);
    });

    it('should support different code lengths', () => {
      const config8Digits = { ...testConfig, digits: 8 };
      
      const code6 = totpService.generateCode(testConfig.secret, 1234567890, testConfig);
      const code8 = totpService.generateCode(testConfig.secret, 1234567890, config8Digits);
      
      expect(code6.length).toBe(6);
      expect(code8.length).toBe(8);
      expect(code6).toMatch(/^\d{6}$/);
      expect(code8).toMatch(/^\d{8}$/);
    });
  });

  describe('OTPAuth URI Generation', () => {
    it('should generate valid otpauth URI', () => {
      const uri = totpService.generateOtpauthUri(testConfig);
      
      expect(uri).toMatch(/^otpauth:\/\/totp\//);
      expect(uri).toContain(encodeURIComponent(testConfig.serviceName));
      expect(uri).toContain(encodeURIComponent(testConfig.accountName));
      expect(uri).toContain(`secret=${testConfig.secret}`);
      expect(uri).toContain(`issuer=${testConfig.serviceName}`);
    });

    it('should include custom parameters in URI', () => {
      const customConfig = {
        ...testConfig,
        algorithm: 'SHA256' as const,
        digits: 8,
        period: 60
      };
      
      const uri = totpService.generateOtpauthUri(customConfig);
      
      expect(uri).toContain('algorithm=SHA256');
      expect(uri).toContain('digits=8');
      expect(uri).toContain('period=60');
    });

    it('should omit default parameters from URI', () => {
      const uri = totpService.generateOtpauthUri(testConfig);
      
      // Default values should not appear in URI
      expect(uri).not.toContain('algorithm=SHA1');
      expect(uri).not.toContain('digits=6');
      expect(uri).not.toContain('period=30');
    });

    it('should handle special characters in service and account names', () => {
      const specialConfig = {
        ...testConfig,
        serviceName: 'Test Service & Co.',
        accountName: 'user+test@example.com'
      };
      
      const uri = totpService.generateOtpauthUri(specialConfig);
      
      expect(uri).toContain(encodeURIComponent(specialConfig.serviceName));
      expect(uri).toContain(encodeURIComponent(specialConfig.accountName));
    });
  });

  describe('Code Verification', () => {
    it('should verify correct codes', () => {
      const timestamp = 1234567890;
      const code = totpService.generateCode(testConfig.secret, timestamp);
      
      // Mock current time to match the timestamp
      const originalNow = Date.now;
      Date.now = () => timestamp * 1000;
      
      const isValid = totpService.verifyCode(testConfig.secret, code, 1, testConfig);
      
      // Restore original Date.now
      Date.now = originalNow;
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect codes', () => {
      const isValid = totpService.verifyCode(testConfig.secret, '000000', 1, testConfig);
      expect(isValid).toBe(false);
    });

    it('should verify codes within time window tolerance', () => {
      const baseTimestamp = 1234567890;
      const code = totpService.generateCode(testConfig.secret, baseTimestamp);
      
      // Test verification with different current times
      const originalNow = Date.now;
      
      // Current time (should work)
      Date.now = () => baseTimestamp * 1000;
      expect(totpService.verifyCode(testConfig.secret, code, 1, testConfig)).toBe(true);
      
      // Previous window (should work with window=1)
      Date.now = () => (baseTimestamp + 30) * 1000;
      expect(totpService.verifyCode(testConfig.secret, code, 1, testConfig)).toBe(true);
      
      // Next window (should work with window=1)
      Date.now = () => (baseTimestamp - 30) * 1000;
      expect(totpService.verifyCode(testConfig.secret, code, 1, testConfig)).toBe(true);
      
      // Too far in future (should not work)
      Date.now = () => (baseTimestamp + 90) * 1000;
      expect(totpService.verifyCode(testConfig.secret, code, 1, testConfig)).toBe(false);
      
      // Restore original Date.now
      Date.now = originalNow;
    });
  });

  describe('Time Calculations', () => {
    it('should calculate correct time steps', () => {
      const timestamp = 1234567890; // This is step 41152263
      const expectedStep = Math.floor(timestamp / 30);
      
      const step = totpService.getCurrentTimeStep(30, timestamp);
      expect(step).toBe(expectedStep);
    });

    it('should calculate correct remaining time', () => {
      const timestamp = 1234567890; // 0 seconds into the period
      const remaining = totpService.getTimeRemaining(30, timestamp);
      
      // Should be 30 - (1234567890 % 30) = 30 - 0 = 30
      expect(remaining).toBe(30);
      
      // Test with different timestamp
      const timestamp2 = 1234567900; // 10 seconds into the period
      const remaining2 = totpService.getTimeRemaining(30, timestamp2);
      expect(remaining2).toBe(20); // 30 - 10 = 20
    });
  });

  describe('Google Authenticator Compatibility', () => {
    it('should generate codes compatible with Google Authenticator test vectors', () => {
      // Test vector from RFC 6238
      const testSecret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'; // "12345678901234567890" in Base32
      
      // Known test vectors (timestamp -> expected code)
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
  });
});