/**
 * Secret Manager Tests
 * Tests for secret generation, encoding, and validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SecretManagerImpl } from './secretManager';

describe('SecretManager Basic Functionality Tests', () => {
  let secretManager: SecretManagerImpl;

  beforeEach(() => {
    secretManager = new SecretManagerImpl();
  });

  describe('Secret Generation', () => {
    it('should generate secure random secrets', () => {
      const secret1 = secretManager.generateSecureSecret();
      const secret2 = secretManager.generateSecureSecret();
      
      expect(secret1).toBeInstanceOf(Uint8Array);
      expect(secret2).toBeInstanceOf(Uint8Array);
      expect(secret1.length).toBe(20); // Default length
      expect(secret2.length).toBe(20);
      
      // Should be different
      expect(secret1).not.toEqual(secret2);
    });

    it('should generate secrets of specified length', () => {
      const secret16 = secretManager.generateSecureSecret(16);
      const secret32 = secretManager.generateSecureSecret(32);
      
      expect(secret16.length).toBe(16);
      expect(secret32.length).toBe(32);
    });
  });

  describe('Base32 Encoding/Decoding', () => {
    it('should encode and decode Base32 correctly', () => {
      const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const encoded = secretManager.encodeBase32(testData);
      const decoded = secretManager.decodeBase32(encoded);
      
      expect(encoded).toBe('JBSWY3DP');
      expect(decoded).toEqual(testData);
    });

    it('should handle empty arrays', () => {
      const empty = new Uint8Array(0);
      const encoded = secretManager.encodeBase32(empty);
      const decoded = secretManager.decodeBase32(encoded);
      
      expect(encoded).toBe('');
      expect(decoded).toEqual(empty);
    });

    it('should handle various byte patterns', () => {
      const testCases = [
        new Uint8Array([0]),
        new Uint8Array([255]),
        new Uint8Array([0, 255, 128, 64]),
        new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      ];
      
      testCases.forEach(testData => {
        const encoded = secretManager.encodeBase32(testData);
        const decoded = secretManager.decodeBase32(encoded);
        expect(decoded).toEqual(testData);
      });
    });

    it('should ignore padding and whitespace in decoding', () => {
      const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const encoded = 'JBSWY3DP';
      
      // Test with padding and whitespace
      const withPadding = 'JBSWY3DP====';
      const withSpaces = 'JBS WY3 DP';
      const withBoth = 'JBS WY3 DP====';
      
      expect(secretManager.decodeBase32(withPadding)).toEqual(testData);
      expect(secretManager.decodeBase32(withSpaces)).toEqual(testData);
      expect(secretManager.decodeBase32(withBoth)).toEqual(testData);
    });

    it('should throw error for invalid Base32 characters', () => {
      expect(() => secretManager.decodeBase32('INVALID1')).toThrow('Invalid Base32 character: 1');
      expect(() => secretManager.decodeBase32('INVALID8')).toThrow('Invalid Base32 character: 8');
      expect(() => secretManager.decodeBase32('INVALID9')).toThrow('Invalid Base32 character: 9');
    });
  });

  describe('Secret Validation', () => {
    it('should validate correct Base32 secrets', () => {
      const validSecrets = [
        'JBSWY3DPEHPK3PXP',
        'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',
        'MFRGG43FMZQW4ZZPO5SW45DFMQQGC3TEMU======',
        'jbswy3dpehpk3pxp', // lowercase should work
        'JBS WY3 DP EHP K3P XP' // with spaces
      ];
      
      validSecrets.forEach(secret => {
        expect(secretManager.validateSecret(secret)).toBe(true);
      });
    });

    it('should reject invalid secrets', () => {
      const invalidSecrets = [
        '', // empty
        'INVALID1', // contains '1'
        'INVALID8', // contains '8'
        'INVALID9', // contains '9'
        'TOO_SHORT', // too short
        'A'.repeat(200), // too long
        null as any,
        undefined as any,
        123 as any
      ];
      
      invalidSecrets.forEach(secret => {
        expect(secretManager.validateSecret(secret)).toBe(false);
      });
    });
  });

  describe('Secret Formatting', () => {
    it('should format secrets for display', () => {
      const secret = 'JBSWY3DPEHPK3PXPMFRGG43F';
      const formatted = secretManager.formatSecretForDisplay(secret, 4);
      
      expect(formatted).toBe('JBSW Y3DP EHPK 3PXP MFRG G43F');
    });

    it('should clean formatted secrets', () => {
      const formatted = 'JBSW Y3DP EHPK 3PXP';
      const cleaned = secretManager.cleanFormattedSecret(formatted);
      
      expect(cleaned).toBe('JBSWY3DPEHPK3PXP');
    });

    it('should handle different group sizes', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      
      const groups2 = secretManager.formatSecretForDisplay(secret, 2);
      expect(groups2).toBe('JB SW Y3 DP EH PK 3P XP');
      
      const groups8 = secretManager.formatSecretForDisplay(secret, 8);
      expect(groups8).toBe('JBSWY3DP EHPK3PXP');
    });
  });

  describe('Secret with Checksum', () => {
    it('should generate and validate secrets with checksum', () => {
      const secretWithChecksum = secretManager.generateSecretWithChecksum(20);
      const validation = secretManager.validateSecretWithChecksum(secretWithChecksum);
      
      expect(validation.isValid).toBe(true);
      expect(validation.cleanSecret).toBeDefined();
      expect(validation.cleanSecret!.length).toBe(32); // 20 bytes = 32 Base32 chars
    });

    it('should detect corrupted checksums', () => {
      const secretWithChecksum = secretManager.generateSecretWithChecksum(20);
      
      // Corrupt multiple characters to ensure checksum fails
      const corrupted = secretWithChecksum.slice(0, -3) + 'XYZ';
      const validation = secretManager.validateSecretWithChecksum(corrupted);
      
      expect(validation.isValid).toBe(false);
      expect(validation.cleanSecret).toBeUndefined();
    });

    it('should handle invalid checksum format', () => {
      const validation = secretManager.validateSecretWithChecksum('INVALID');
      expect(validation.isValid).toBe(false);
    });
  });

  describe('Memory Security', () => {
    it('should clear sensitive data from Uint8Array', () => {
      const sensitiveData = new Uint8Array([1, 2, 3, 4, 5]);
      const originalData = new Uint8Array(sensitiveData);
      
      secretManager.clearSensitiveData(sensitiveData);
      
      // Data should be zeroed out
      expect(sensitiveData).not.toEqual(originalData);
      expect(sensitiveData.every(byte => byte === 0)).toBe(true);
    });

    it('should handle string data clearing gracefully', () => {
      // Should not throw error
      expect(() => secretManager.clearSensitiveData('sensitive string')).not.toThrow();
    });
  });
});