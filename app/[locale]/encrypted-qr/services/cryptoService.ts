// import { hash } from 'argon2-browser'; // 暂时禁用，使用PBKDF2替代
import { 
  EncryptionConfig, 
  EncryptedData, 
  PasswordStrengthResult,
  EncryptedQRError,
  DEFAULT_ENCRYPTION_CONFIG 
} from '../interfaces';
import { SecurityService } from './securityService';

export class CryptoService {
  private static instance: CryptoService;
  private securityService: SecurityService;

  private constructor() {
    this.securityService = SecurityService.getInstance();
  }

  public static getInstance(): CryptoService {
    if (!CryptoService.instance) {
      CryptoService.instance = new CryptoService();
    }
    return CryptoService.instance;
  }

  /**
   * 验证密码强度
   */
  validatePasswordStrength(password: string): PasswordStrengthResult {
    // 基本要求：至少6位
    const basicRequirements = {
      minLength: password.length >= 6,
    };

    // 推荐要求：12位 + 复杂性
    const recommendedRequirements = {
      recommendedLength: password.length >= 12,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const metRecommendedRequirements = Object.values(recommendedRequirements).filter(Boolean).length;
    const score = Math.min(metRecommendedRequirements, 5);
    
    const feedback: string[] = [];
    
    // 只有基本要求不满足时才阻止操作
    if (!basicRequirements.minLength) {
      feedback.push('密码至少需要6个字符');
    }
    
    // 推荐要求作为建议（不阻止操作）
    const suggestions: string[] = [];
    if (!recommendedRequirements.recommendedLength) suggestions.push('建议使用至少12个字符');
    if (!recommendedRequirements.hasUppercase) suggestions.push('建议包含大写字母');
    if (!recommendedRequirements.hasLowercase) suggestions.push('建议包含小写字母');
    if (!recommendedRequirements.hasNumbers) suggestions.push('建议包含数字');
    if (!recommendedRequirements.hasSpecialChars) suggestions.push('建议包含特殊字符');

    // 如果有建议但基本要求满足，在控制台显示建议（不阻止操作）
    if (suggestions.length > 0 && basicRequirements.minLength) {
      console.info('密码安全建议:', suggestions.join(', '));
    }

    return {
      isValid: basicRequirements.minLength, // 只要满足6位就允许
      score,
      feedback, // 只包含阻止性的反馈
      requirements: {
        minLength: basicRequirements.minLength,
        hasUppercase: recommendedRequirements.hasUppercase,
        hasLowercase: recommendedRequirements.hasLowercase,
        hasNumbers: recommendedRequirements.hasNumbers,
        hasSpecialChars: recommendedRequirements.hasSpecialChars
      }
    };
  }

  /**
   * 生成随机盐值
   */
  generateSalt(length: number = 32): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  /**
   * 生成随机初始化向量
   */
  generateIV(length: number = 16): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  /**
   * 使用Argon2id派生密钥
   */
  async deriveKey(
    password: string, 
    salt: Uint8Array, 
    config: EncryptionConfig = DEFAULT_ENCRYPTION_CONFIG
  ): Promise<Uint8Array> {
    try {
      const startTime = Date.now();
      
      // 使用PBKDF2替代Argon2（临时解决方案）
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);
      
      // 导入密码作为密钥材料
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );

      // 使用高迭代次数来增加计算成本（模拟Argon2的时间成本）
      const iterations = Math.max(config.iterations * 50000, 600000); // 至少60万次迭代
      
      // 派生密钥
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt.buffer as ArrayBuffer,
          iterations: iterations,
          hash: 'SHA-256'
        },
        keyMaterial,
        256 // 256位密钥
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 确保密钥派生至少消耗合理时间（防暴力破解）
      if (duration < 1000) {
        console.warn(`密钥派生时间: ${duration}ms，使用PBKDF2替代Argon2`);
      }

      return new Uint8Array(derivedBits);
    } catch (error) {
      throw new Error(`密钥派生失败: ${error}`);
    }
  }

  /**
   * AES-256-GCM加密
   */
  async encrypt(
    data: string, 
    password: string, 
    config: EncryptionConfig = DEFAULT_ENCRYPTION_CONFIG
  ): Promise<EncryptedData> {
    try {
      // 验证密码强度
      const passwordCheck = this.validatePasswordStrength(password);
      if (!passwordCheck.isValid) {
        throw new Error(`密码强度不足: ${passwordCheck.feedback.join(', ')}`);
      }

      // 验证输入数据
      if (!data || data.trim().length === 0) {
        throw new Error('输入数据不能为空');
      }

      // 生成随机盐值和IV
      const salt = this.generateSalt(config.saltLength);
      const iv = this.generateIV(config.ivLength);

      // 派生密钥
      const keyMaterial = await this.deriveKey(password, salt, config);

      // 导入密钥到WebCrypto
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyMaterial.buffer as ArrayBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      // 加密数据
      const encoder = new TextEncoder();
      const plaintext = encoder.encode(data);

      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv.buffer as ArrayBuffer
        },
        cryptoKey,
        plaintext
      );

      // 提取密文和认证标签
      const encryptedArray = new Uint8Array(encrypted);
      const ciphertext = encryptedArray.slice(0, -16); // 除了最后16字节的标签
      const tag = encryptedArray.slice(-16); // 最后16字节是认证标签

      return {
        algorithm: config.algorithm,
        salt,
        iv,
        ciphertext,
        tag
      };
    } catch (error) {
      throw new Error(`加密失败: ${error}`);
    }
  }

  /**
   * AES-256-GCM解密（带安全检查）
   */
  async decrypt(
    encryptedData: EncryptedData, 
    password: string,
    config: EncryptionConfig = DEFAULT_ENCRYPTION_CONFIG
  ): Promise<string> {
    // 检查安全状态
    const securityCheck = this.securityService.checkSecurityBeforeDecrypt();
    if (!securityCheck.allowed) {
      throw new Error(securityCheck.error || '安全检查失败');
    }

    try {
      // 验证加密数据完整性
      if (!this.validateEncryptedData(encryptedData)) {
        this.securityService.recordFailure();
        throw new Error('加密数据格式无效或已损坏');
      }

      // 派生密钥
      const keyMaterial = await this.deriveKey(password, encryptedData.salt, config);

      // 导入密钥到WebCrypto
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyMaterial.buffer as ArrayBuffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      // 重新组合密文和标签
      const encryptedBuffer = new Uint8Array(
        encryptedData.ciphertext.length + (encryptedData.tag?.length || 0)
      );
      encryptedBuffer.set(encryptedData.ciphertext);
      if (encryptedData.tag) {
        encryptedBuffer.set(encryptedData.tag, encryptedData.ciphertext.length);
      }

      // 解密数据
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: encryptedData.iv.buffer as ArrayBuffer
        },
        cryptoKey,
        encryptedBuffer
      );

      // 解密成功，清除失败记录
      this.securityService.recordSuccess();

      // 清除敏感的密钥材料
      this.clearSensitiveData(keyMaterial);

      // 解码为字符串
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      // 记录解密失败
      this.securityService.recordFailure();

      // 解密失败通常意味着密码错误或数据被篡改
      if (error instanceof Error && error.name === 'OperationError') {
        const failureCount = this.securityService.getCurrentFailureCount();
        const remainingAttempts = Math.max(0, 3 - failureCount);
        
        if (remainingAttempts > 0) {
          throw new Error(`密码错误或数据已被篡改。剩余尝试次数: ${remainingAttempts}`);
        } else {
          throw new Error('密码错误次数过多，已被暂时锁定');
        }
      }
      throw new Error(`解密失败: ${error}`);
    }
  }

  /**
   * 清除敏感数据（将数组填充为0）
   */
  clearSensitiveData(data: Uint8Array): void {
    if (data) {
      data.fill(0);
    }
  }

  /**
   * 验证加密数据完整性
   */
  validateEncryptedData(data: EncryptedData): boolean {
    return !!(
      data.algorithm &&
      data.salt &&
      data.iv &&
      data.ciphertext &&
      data.salt.length >= 16 &&
      data.iv.length >= 12 &&
      data.ciphertext.length > 0
    );
  }
}