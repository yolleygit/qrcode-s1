/**
 * 密钥管理服务实现
 * 负责密钥的生成、编码、解码和验证
 */

import CryptoJS from 'crypto-js';
import { SecretManager } from '../interfaces';
import { BASE32, TOTP_DEFAULTS, VALIDATION_RULES } from '../constants';

/**
 * 密钥管理服务实现类
 */
export class SecretManagerImpl implements SecretManager {
  /**
   * 生成加密安全的随机密钥
   * @param length 密钥长度（字节），默认20
   * @returns 原始字节数组
   */
  generateSecureSecret(length: number = TOTP_DEFAULTS.SECRET_LENGTH): Uint8Array {
    // 使用 crypto-js 生成加密安全的随机字节
    const randomWords = CryptoJS.lib.WordArray.random(length);
    
    // 转换为 Uint8Array
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = (randomWords.words[Math.floor(i / 4)] >>> (24 - (i % 4) * 8)) & 0xff;
    }
    
    return bytes;
  }

  /**
   * Base32 编码
   * @param buffer 要编码的字节数组
   * @returns Base32 编码字符串
   */
  encodeBase32(buffer: Uint8Array): string {
    const { ALPHABET, BITS_PER_CHAR } = BASE32;
    let result = '';
    let bits = 0;
    let value = 0;

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;

      while (bits >= BITS_PER_CHAR) {
        result += ALPHABET[(value >>> (bits - BITS_PER_CHAR)) & 31];
        bits -= BITS_PER_CHAR;
      }
    }

    // 处理剩余的位
    if (bits > 0) {
      result += ALPHABET[(value << (BITS_PER_CHAR - bits)) & 31];
    }

    return result;
  }

  /**
   * Base32 解码
   * @param encoded Base32 编码字符串
   * @returns 解码后的字节数组
   */
  decodeBase32(encoded: string): Uint8Array {
    const { ALPHABET, BITS_PER_CHAR } = BASE32;
    
    // 清理输入：移除填充、空白字符，转换为大写
    const cleanInput = encoded.replace(/[=\s]/g, '').toUpperCase();
    
    if (cleanInput.length === 0) {
      return new Uint8Array(0);
    }
    
    const result: number[] = [];
    let bits = 0;
    let value = 0;

    for (let i = 0; i < cleanInput.length; i++) {
      const char = cleanInput[i];
      const index = ALPHABET.indexOf(char);
      
      if (index === -1) {
        throw new Error(`Invalid Base32 character: ${char}`);
      }

      value = (value << BITS_PER_CHAR) | index;
      bits += BITS_PER_CHAR;

      if (bits >= 8) {
        result.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return new Uint8Array(result);
  }

  /**
   * 验证密钥格式
   * @param secret 要验证的密钥
   * @returns 验证是否通过
   */
  validateSecret(secret: string): boolean {
    if (!secret || typeof secret !== 'string') {
      return false;
    }

    // 检查长度
    const cleanSecret = secret.replace(/[=\s]/g, '');
    if (cleanSecret.length < VALIDATION_RULES.MIN_SECRET_LENGTH || 
        cleanSecret.length > VALIDATION_RULES.MAX_SECRET_LENGTH) {
      return false;
    }

    // 检查字符是否都是有效的 Base32 字符
    const validChars = new RegExp(`^[${BASE32.ALPHABET}=\\s]*$`, 'i');
    if (!validChars.test(secret)) {
      return false;
    }

    // 尝试解码以验证格式正确性
    try {
      this.decodeBase32(secret);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 清理内存中的敏感数据
   * @param data 要清理的数据
   */
  clearSensitiveData(data: Uint8Array | string): void {
    if (data instanceof Uint8Array) {
      // 用随机数据覆盖数组
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.floor(Math.random() * 256);
      }
      // 再用零覆盖
      data.fill(0);
    } else if (typeof data === 'string') {
      // 对于字符串，我们无法直接清理内存
      // 但可以提醒开发者不要保留引用
      console.warn('String data cannot be securely cleared from memory. Avoid keeping references.');
    }
  }

  /**
   * 生成带有校验和的密钥
   * @param length 密钥长度（字节）
   * @returns Base32 编码的密钥字符串
   */
  generateSecretWithChecksum(length: number = TOTP_DEFAULTS.SECRET_LENGTH): string {
    const secretBytes = this.generateSecureSecret(length);
    
    // 计算简单校验和（可选功能）
    let checksum = 0;
    for (let i = 0; i < secretBytes.length; i++) {
      checksum ^= secretBytes[i];
    }
    
    // 将校验和添加到密钥末尾
    const secretWithChecksum = new Uint8Array(length + 1);
    secretWithChecksum.set(secretBytes);
    secretWithChecksum[length] = checksum;
    
    const result = this.encodeBase32(secretWithChecksum);
    
    // 清理敏感数据
    this.clearSensitiveData(secretBytes);
    this.clearSensitiveData(secretWithChecksum);
    
    return result;
  }

  /**
   * 验证带校验和的密钥
   * @param secret Base32 编码的密钥
   * @returns 验证结果和清理后的密钥
   */
  validateSecretWithChecksum(secret: string): { isValid: boolean; cleanSecret?: string } {
    try {
      const decoded = this.decodeBase32(secret);
      
      if (decoded.length < 2) {
        return { isValid: false };
      }
      
      // 分离密钥和校验和
      const secretBytes = decoded.slice(0, -1);
      const providedChecksum = decoded[decoded.length - 1];
      
      // 计算期望的校验和
      let expectedChecksum = 0;
      for (let i = 0; i < secretBytes.length; i++) {
        expectedChecksum ^= secretBytes[i];
      }
      
      const isValid = providedChecksum === expectedChecksum;
      const cleanSecret = isValid ? this.encodeBase32(secretBytes) : undefined;
      
      // 清理敏感数据
      this.clearSensitiveData(decoded);
      this.clearSensitiveData(secretBytes);
      
      return { isValid, cleanSecret };
    } catch {
      return { isValid: false };
    }
  }

  /**
   * 格式化密钥显示（添加空格分隔）
   * @param secret Base32 编码的密钥
   * @param groupSize 每组字符数，默认4
   * @returns 格式化后的密钥字符串
   */
  formatSecretForDisplay(secret: string, groupSize: number = 4): string {
    const cleanSecret = secret.replace(/[=\s]/g, '');
    const groups: string[] = [];
    
    for (let i = 0; i < cleanSecret.length; i += groupSize) {
      groups.push(cleanSecret.slice(i, i + groupSize));
    }
    
    return groups.join(' ');
  }

  /**
   * 从格式化的密钥中移除空格
   * @param formattedSecret 格式化的密钥字符串
   * @returns 清理后的密钥字符串
   */
  cleanFormattedSecret(formattedSecret: string): string {
    return formattedSecret.replace(/\s/g, '');
  }
}

// 导出单例实例
export const secretManager = new SecretManagerImpl();