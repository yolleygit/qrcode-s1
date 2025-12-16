import { 
  EncryptionRequest, 
  DecryptionRequest, 
  QRResult, 
  DecryptionResult, 
  EncryptedQRData,
  EncryptedQRError,
  DEFAULT_ENCRYPTION_CONFIG,
  DEFAULT_QR_STYLE 
} from '../interfaces';
import { CryptoService } from './cryptoService';
import { QRCodeService } from './qrCodeService';
import { DisguiseService } from './disguiseService';
import { ContentSwitchService } from './contentSwitchService';
import { ConfigService } from './configService';

export class EncryptedQRService {
  private static instance: EncryptedQRService;
  private cryptoService: CryptoService;
  private qrCodeService: QRCodeService;
  private disguiseService: DisguiseService;
  private contentSwitchService: ContentSwitchService;
  private configService: ConfigService;

  private constructor() {
    this.cryptoService = CryptoService.getInstance();
    this.qrCodeService = QRCodeService.getInstance();
    this.disguiseService = DisguiseService.getInstance();
    this.contentSwitchService = ContentSwitchService.getInstance();
    this.configService = ConfigService.getInstance();
  }

  public static getInstance(): EncryptedQRService {
    if (!EncryptedQRService.instance) {
      EncryptedQRService.instance = new EncryptedQRService();
    }
    return EncryptedQRService.instance;
  }

  /**
   * 创建加密二维码
   */
  async createEncryptedQR(request: EncryptionRequest): Promise<QRResult> {
    try {
      // 输入验证
      const validation = this.validateEncryptionRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // 如果没有提供伪装文本，使用默认的
      const disguiseText = request.disguiseText || this.disguiseService.getDefaultDisguiseText();

      // 加密数据（使用配置服务的设置）
      const encryptionConfig = request.config || this.configService.getEncryptionConfig();
      const encryptedData = await this.cryptoService.encrypt(
        request.plaintext,
        request.password,
        encryptionConfig
      );

      // 序列化为JSON
      const serializedData = this.qrCodeService.serializeEncryptedData(
        encryptedData,
        disguiseText
      );

      // 检查数据大小是否适合二维码
      if (!this.qrCodeService.canFitInQR(serializedData, request.qrStyle.errorCorrectionLevel)) {
        throw new Error('数据过大，无法生成二维码。请尝试缩短内容或使用更低的纠错级别');
      }

      // 生成二维码（使用配置服务的样式设置）
      const qrStyle = request.qrStyle || this.configService.getQRStyleConfig();
      const qrResult = await this.qrCodeService.generateQR(
        serializedData,
        qrStyle
      );

      return qrResult;
    } catch (error) {
      throw new Error(`创建加密二维码失败: ${error}`);
    }
  }

  /**
   * 解密二维码
   */
  async decryptQR(request: DecryptionRequest): Promise<DecryptionResult> {
    try {
      // 输入验证
      const validation = this.validateDecryptionRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: EncryptedQRError.INVALID_QR_FORMAT,
          message: validation.message
        };
      }

      // 解析二维码数据
      let qrData: EncryptedQRData;
      try {
        qrData = this.qrCodeService.deserializeEncryptedData(request.qrData);
      } catch (error) {
        return {
          success: false,
          error: EncryptedQRError.CORRUPTED_QR_DATA,
          message: `二维码数据解析失败: ${error}`
        };
      }

      // 如果没有提供密码，只返回伪装文本
      if (!request.password) {
        return {
          success: true,
          data: qrData.disguise,
          disguiseText: qrData.disguise
        };
      }

      // 转换为加密数据格式
      const encryptedData = this.qrCodeService.qrDataToEncryptedData(qrData);

      // 解密数据
      try {
        const decryptedData = await this.cryptoService.decrypt(
          encryptedData,
          request.password,
          DEFAULT_ENCRYPTION_CONFIG
        );

        return {
          success: true,
          data: decryptedData,
          disguiseText: qrData.disguise
        };
      } catch (error) {
        return {
          success: false,
          error: EncryptedQRError.INVALID_PASSWORD,
          message: `解密失败: ${error}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: EncryptedQRError.DECRYPTION_FAILED,
        message: `解密过程出错: ${error}`
      };
    }
  }

  /**
   * 从文件解密二维码
   */
  async decryptQRFromFile(file: File, password?: string): Promise<DecryptionResult> {
    try {
      // 解析二维码文件
      const qrData = await this.qrCodeService.parseQRSmart(file);
      
      // 使用解析出的数据进行解密
      return await this.decryptQR({
        qrData: JSON.stringify(qrData),
        password: password || ''
      });
    } catch (error) {
      return {
        success: false,
        error: EncryptedQRError.INVALID_QR_FORMAT,
        message: `文件解析失败: ${error}`
      };
    }
  }

  /**
   * 验证二维码数据格式
   */
  validateQRData(data: EncryptedQRData): boolean {
    return this.qrCodeService.validateQRData(data);
  }

  /**
   * 检查是否为加密二维码
   */
  isEncryptedQR(rawData: string): boolean {
    return this.qrCodeService.isEncryptedQR(rawData);
  }

  /**
   * 获取二维码信息（不解密）
   */
  getQRInfo(rawData: string): {
    isEncrypted: boolean;
    version?: string;
    algorithm?: string;
    disguiseText?: string;
    dataSize: number;
  } {
    const dataSize = new TextEncoder().encode(rawData).length;
    
    if (!this.isEncryptedQR(rawData)) {
      return {
        isEncrypted: false,
        dataSize
      };
    }

    try {
      const qrData = this.qrCodeService.deserializeEncryptedData(rawData);
      return {
        isEncrypted: true,
        version: qrData.version,
        algorithm: qrData.algorithm,
        disguiseText: qrData.disguise,
        dataSize
      };
    } catch {
      return {
        isEncrypted: false,
        dataSize
      };
    }
  }

  /**
   * 验证加密请求
   */
  private validateEncryptionRequest(request: EncryptionRequest): { isValid: boolean; message?: string } {
    if (!request.plaintext || request.plaintext.trim().length === 0) {
      return { isValid: false, message: '明文数据不能为空' };
    }

    if (!request.password) {
      return { isValid: false, message: '密码不能为空' };
    }

    // 验证密码强度
    const passwordCheck = this.cryptoService.validatePasswordStrength(request.password);
    if (!passwordCheck.isValid) {
      return { 
        isValid: false, 
        message: `密码强度不足: ${passwordCheck.feedback.join(', ')}` 
      };
    }

    // 验证伪装文本
    if (request.disguiseText) {
      const disguiseCheck = this.disguiseService.validateDisguiseText(request.disguiseText);
      if (!disguiseCheck.isValid) {
        return { 
          isValid: false, 
          message: `伪装文本无效: ${disguiseCheck.message}` 
        };
      }
    }

    return { isValid: true };
  }

  /**
   * 验证解密请求
   */
  private validateDecryptionRequest(request: DecryptionRequest): { isValid: boolean; message?: string } {
    if (!request.qrData || request.qrData.trim().length === 0) {
      return { isValid: false, message: '二维码数据不能为空' };
    }

    return { isValid: true };
  }

  /**
   * 批量创建加密二维码
   */
  async createBatchEncryptedQR(
    requests: EncryptionRequest[]
  ): Promise<{ results: QRResult[]; errors: string[] }> {
    const results: QRResult[] = [];
    const errors: string[] = [];

    for (let i = 0; i < requests.length; i++) {
      try {
        const result = await this.createEncryptedQR(requests[i]);
        results.push(result);
      } catch (error) {
        errors.push(`第${i + 1}个请求失败: ${error}`);
      }
    }

    return { results, errors };
  }

  /**
   * 获取支持的算法列表
   */
  getSupportedAlgorithms(): string[] {
    return ['AES-256-GCM'];
  }

  /**
   * 获取支持的密钥派生函数列表
   */
  getSupportedKeyDerivationFunctions(): string[] {
    return ['Argon2id'];
  }

  /**
   * 估算加密后的数据大小
   */
  estimateEncryptedSize(plaintext: string, disguiseText?: string): number {
    // 输入验证
    const safePlaintext = plaintext || '';
    const actualDisguise = disguiseText || this.disguiseService.getDefaultDisguiseText();
    
    // 安全计算密文大小
    const plaintextLength = Math.max(0, safePlaintext.length);
    const ciphertextLength = Math.max(0, Math.ceil(plaintextLength * 4 / 3));
    
    // 估算JSON结构的大小
    const estimatedStructure = {
      version: '1.0',
      algorithm: 'AES-256-GCM',
      salt: 'x'.repeat(44), // 32字节Base64编码
      iv: 'x'.repeat(24),   // 16字节Base64编码
      ciphertext: 'x'.repeat(ciphertextLength), // 估算Base64大小
      tag: 'x'.repeat(24),  // 16字节认证标签
      disguise: actualDisguise || '默认伪装文本'
    };

    return JSON.stringify(estimatedStructure).length;
  }

  /**
   * 清理敏感数据
   */
  clearSensitiveData(): void {
    // 清理内容切换服务的状态
    this.contentSwitchService.clearAllContentStates();
  }
}