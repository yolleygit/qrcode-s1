/**
 * TOTP 核心服务实现
 * 基于 RFC 6238 标准实现 Time-based One-Time Password 算法
 */

import CryptoJS from 'crypto-js';
import { TOTPService } from '../interfaces';
import { TOTPConfig } from '../types';
import { TOTP_DEFAULTS, BASE32, OTPAUTH } from '../constants';

/**
 * TOTP 服务实现类
 * 提供 TOTP 算法的核心功能
 */
export class TOTPServiceImpl implements TOTPService {
  /**
   * 生成安全的随机密钥
   * @returns Base32 编码的32字符密钥
   */
  generateSecret(): string {
    // 生成 20 字节（160位）的随机密钥
    const randomBytes = CryptoJS.lib.WordArray.random(TOTP_DEFAULTS.SECRET_LENGTH);
    
    // 转换为 Uint8Array
    const bytes = new Uint8Array(TOTP_DEFAULTS.SECRET_LENGTH);
    for (let i = 0; i < TOTP_DEFAULTS.SECRET_LENGTH; i++) {
      bytes[i] = (randomBytes.words[Math.floor(i / 4)] >>> (24 - (i % 4) * 8)) & 0xff;
    }
    
    // Base32 编码
    return this.encodeBase32(bytes);
  }

  /**
   * 生成 TOTP 验证码
   * @param secret Base32 编码的密钥
   * @param timestamp 可选的时间戳，默认使用当前时间
   * @param config 可选的配置参数
   * @returns 生成的验证码字符串
   */
  generateCode(secret: string, timestamp?: number, config?: Partial<TOTPConfig>): string {
    const currentTime = timestamp || Math.floor(Date.now() / 1000);
    const period = config?.period || TOTP_DEFAULTS.PERIOD;
    const digits = config?.digits || TOTP_DEFAULTS.DIGITS;
    const algorithm = config?.algorithm || TOTP_DEFAULTS.ALGORITHM;

    // 计算时间步长
    const timeStep = Math.floor(currentTime / period);
    
    // 将时间步长转换为8字节的大端序字节数组
    const timeBytes = new ArrayBuffer(8);
    const timeView = new DataView(timeBytes);
    // 设置高32位为0，低32位为timeStep（大端序）
    timeView.setUint32(0, 0, false);
    timeView.setUint32(4, timeStep, false);
    
    // 解码 Base32 密钥
    const keyBytes = this.decodeBase32(secret);
    
    // 使用 HMAC 计算哈希
    const hmac = this.computeHMAC(keyBytes, new Uint8Array(timeBytes), algorithm);
    
    // 动态截取
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = ((hmac[offset] & 0x7f) << 24) |
                 ((hmac[offset + 1] & 0xff) << 16) |
                 ((hmac[offset + 2] & 0xff) << 8) |
                 (hmac[offset + 3] & 0xff);
    
    // 取模并格式化
    const otp = code % Math.pow(10, digits);
    return otp.toString().padStart(digits, '0');
  }

  /**
   * 验证 TOTP 验证码
   * @param secret Base32 编码的密钥
   * @param code 要验证的验证码
   * @param window 时间窗口容错范围，默认1（允许前后各1个窗口）
   * @param config 可选的配置参数
   * @returns 验证是否通过
   */
  verifyCode(secret: string, code: string, window: number = 1, config?: Partial<TOTPConfig>): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    const period = config?.period || TOTP_DEFAULTS.PERIOD;
    
    // 检查当前时间窗口和前后窗口
    for (let i = -window; i <= window; i++) {
      const testTime = currentTime + (i * period);
      const expectedCode = this.generateCode(secret, testTime, config);
      if (expectedCode === code) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 生成 OTPAuth URI
   * @param config TOTP 配置
   * @returns 标准的 otpauth:// URI 字符串
   */
  generateOtpauthUri(config: TOTPConfig): string {
    const { serviceName, accountName, secret, algorithm, digits, period, issuer } = config;
    
    // 构建标签：issuer:accountName 或 serviceName:accountName
    const label = issuer ? `${issuer}:${accountName}` : `${serviceName}:${accountName}`;
    
    // 构建基础 URI
    let uri = `${OTPAUTH.PROTOCOL}://${OTPAUTH.TYPE}/${encodeURIComponent(label)}`;
    
    // 添加参数
    const params = new URLSearchParams();
    params.set(OTPAUTH.PARAMS.SECRET, secret);
    params.set(OTPAUTH.PARAMS.ISSUER, issuer || serviceName);
    
    // 只有非默认值才添加到 URI 中
    if (algorithm !== TOTP_DEFAULTS.ALGORITHM) {
      params.set(OTPAUTH.PARAMS.ALGORITHM, algorithm);
    }
    if (digits !== TOTP_DEFAULTS.DIGITS) {
      params.set(OTPAUTH.PARAMS.DIGITS, digits.toString());
    }
    if (period !== TOTP_DEFAULTS.PERIOD) {
      params.set(OTPAUTH.PARAMS.PERIOD, period.toString());
    }
    
    return `${uri}?${params.toString()}`;
  }

  /**
   * 获取当前时间步长
   * @param period 时间窗口（秒）
   * @param timestamp 可选的时间戳
   * @returns 当前时间步长
   */
  getCurrentTimeStep(period: number, timestamp?: number): number {
    const currentTime = timestamp || Math.floor(Date.now() / 1000);
    return Math.floor(currentTime / period);
  }

  /**
   * 获取当前验证码剩余有效时间
   * @param period 时间窗口（秒）
   * @param timestamp 可选的时间戳
   * @returns 剩余秒数
   */
  getTimeRemaining(period: number, timestamp?: number): number {
    const currentTime = timestamp || Math.floor(Date.now() / 1000);
    return period - (currentTime % period);
  }

  /**
   * Base32 编码
   * @param buffer 要编码的字节数组
   * @returns Base32 编码字符串
   */
  private encodeBase32(buffer: Uint8Array): string {
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
  private decodeBase32(encoded: string): Uint8Array {
    const { ALPHABET, BITS_PER_CHAR } = BASE32;
    
    // 移除填充和空白字符
    const cleanInput = encoded.replace(/[=\s]/g, '').toUpperCase();
    
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
   * 计算 HMAC
   * @param key 密钥字节数组
   * @param data 数据字节数组
   * @param algorithm 哈希算法
   * @returns HMAC 结果字节数组
   */
  private computeHMAC(key: Uint8Array, data: Uint8Array, algorithm: string): Uint8Array {
    // 将 Uint8Array 转换为十六进制字符串，然后创建 WordArray
    const keyHex = Array.from(key).map(b => b.toString(16).padStart(2, '0')).join('');
    const dataHex = Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
    
    const keyWords = CryptoJS.enc.Hex.parse(keyHex);
    const dataWords = CryptoJS.enc.Hex.parse(dataHex);
    
    let hmac: CryptoJS.lib.WordArray;
    
    switch (algorithm) {
      case 'SHA1':
        hmac = CryptoJS.HmacSHA1(dataWords, keyWords);
        break;
      case 'SHA256':
        hmac = CryptoJS.HmacSHA256(dataWords, keyWords);
        break;
      case 'SHA512':
        hmac = CryptoJS.HmacSHA512(dataWords, keyWords);
        break;
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
    
    // 转换回 Uint8Array
    const hexString = hmac.toString(CryptoJS.enc.Hex);
    const result = new Uint8Array(hexString.length / 2);
    
    for (let i = 0; i < hexString.length; i += 2) {
      result[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    
    return result;
  }
}

// 导出单例实例
export const totpService = new TOTPServiceImpl();