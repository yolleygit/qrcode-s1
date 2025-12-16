import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { 
  EncryptedQRData, 
  QRStyleConfig, 
  QRResult, 
  EncryptedData,
  DEFAULT_QR_STYLE 
} from '../interfaces';

export class QRCodeService {
  private static instance: QRCodeService;
  private readonly VERSION = '1.0';

  public static getInstance(): QRCodeService {
    if (!QRCodeService.instance) {
      QRCodeService.instance = new QRCodeService();
    }
    return QRCodeService.instance;
  }

  /**
   * 将加密数据序列化为JSON字符串
   */
  serializeEncryptedData(
    encryptedData: EncryptedData, 
    disguiseText: string
  ): string {
    const qrData: EncryptedQRData = {
      version: this.VERSION,
      algorithm: encryptedData.algorithm,
      salt: this.arrayBufferToBase64(encryptedData.salt),
      iv: this.arrayBufferToBase64(encryptedData.iv),
      ciphertext: this.arrayBufferToBase64(encryptedData.ciphertext),
      tag: encryptedData.tag ? this.arrayBufferToBase64(encryptedData.tag) : undefined,
      disguise: disguiseText
    };

    return JSON.stringify(qrData);
  }

  /**
   * 从JSON字符串反序列化加密数据
   */
  deserializeEncryptedData(jsonData: string): EncryptedQRData {
    try {
      const qrData: EncryptedQRData = JSON.parse(jsonData);
      
      // 验证必需字段
      if (!qrData.version || !qrData.algorithm || !qrData.salt || 
          !qrData.iv || !qrData.ciphertext || !qrData.disguise) {
        throw new Error('二维码数据格式不完整，缺少必需字段');
      }

      // 验证版本兼容性
      if (!this.isVersionCompatible(qrData.version)) {
        throw new Error(`不支持的数据格式版本: ${qrData.version}，请升级应用或使用兼容版本`);
      }

      // 验证算法支持
      if (!this.isSupportedAlgorithm(qrData.algorithm)) {
        throw new Error(`不支持的加密算法: ${qrData.algorithm}`);
      }

      // 验证数据完整性
      if (!this.validateQRData(qrData)) {
        throw new Error('二维码数据验证失败，可能已损坏');
      }

      return qrData;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('二维码数据格式无效，不是有效的JSON格式');
      }
      throw new Error(`二维码数据解析失败: ${error}`);
    }
  }

  /**
   * 将EncryptedQRData转换为EncryptedData
   */
  qrDataToEncryptedData(qrData: EncryptedQRData): EncryptedData {
    return {
      algorithm: qrData.algorithm,
      salt: this.base64ToArrayBuffer(qrData.salt),
      iv: this.base64ToArrayBuffer(qrData.iv),
      ciphertext: this.base64ToArrayBuffer(qrData.ciphertext),
      tag: qrData.tag ? this.base64ToArrayBuffer(qrData.tag) : undefined
    };
  }

  /**
   * 生成二维码（带自动纠错级别调整）
   */
  async generateQR(
    data: string, 
    style: QRStyleConfig = DEFAULT_QR_STYLE
  ): Promise<QRResult> {
    try {
      // 自动调整纠错级别以确保数据能够适合
      const optimalErrorLevel = this.getOptimalErrorCorrectionLevel(data);
      const finalErrorLevel = this.shouldUseHigherErrorLevel(data) ? 
        optimalErrorLevel : style.errorCorrectionLevel;

      const options = {
        errorCorrectionLevel: finalErrorLevel,
        type: 'image/png' as const,
        quality: 0.92,
        margin: style.margin,
        color: {
          dark: style.colorDark,
          light: style.colorLight,
        },
        width: style.size,
      };

      const qrCodeDataURL = await QRCode.toDataURL(data, options);
      
      return {
        qrCode: qrCodeDataURL,
        format: 'PNG',
        metadata: {
          size: style.size,
          algorithm: 'AES-256-GCM',
          created: new Date()
        }
      };
    } catch (error) {
      throw new Error(`二维码生成失败: ${error}`);
    }
  }

  /**
   * 生成带Logo的二维码
   */
  async generateQRWithLogo(
    data: string, 
    style: QRStyleConfig,
    logoFile?: File
  ): Promise<QRResult> {
    try {
      // 首先生成基础二维码
      const baseQR = await this.generateQR(data, style);
      
      if (!logoFile || !style.logoUrl) {
        return baseQR;
      }

      // 如果有Logo，使用Canvas合成
      return await this.embedLogoInQR(baseQR.qrCode, logoFile, style);
    } catch (error) {
      throw new Error(`带Logo二维码生成失败: ${error}`);
    }
  }

  /**
   * 解析二维码图片
   */
  async parseQR(imageData: ImageData): Promise<string> {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (!code) {
        throw new Error('无法识别二维码，请确保图片清晰且包含有效的二维码');
      }

      return code.data;
    } catch (error) {
      throw new Error(`二维码解析失败: ${error}`);
    }
  }

  /**
   * 从文件解析二维码
   */
  async parseQRFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = async () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);

          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          if (!imageData) {
            reject(new Error('无法读取图片数据'));
            return;
          }

          const qrData = await this.parseQR(imageData);
          resolve(qrData);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * 验证二维码数据格式
   */
  validateQRData(data: EncryptedQRData): boolean {
    const requiredFields = ['version', 'algorithm', 'salt', 'iv', 'ciphertext', 'disguise'];
    
    for (const field of requiredFields) {
      if (!(field in data) || !data[field as keyof EncryptedQRData]) {
        return false;
      }
    }

    // 验证Base64格式
    try {
      this.base64ToArrayBuffer(data.salt);
      this.base64ToArrayBuffer(data.iv);
      this.base64ToArrayBuffer(data.ciphertext);
      if (data.tag) {
        this.base64ToArrayBuffer(data.tag);
      }
    } catch {
      return false;
    }

    return true;
  }

  /**
   * 检查版本兼容性
   */
  private isVersionCompatible(version: string): boolean {
    const supportedVersions = ['1.0'];
    return supportedVersions.includes(version);
  }

  /**
   * 检查算法支持
   */
  private isSupportedAlgorithm(algorithm: string): boolean {
    const supportedAlgorithms = ['AES-256-GCM'];
    return supportedAlgorithms.includes(algorithm);
  }

  /**
   * 智能解析二维码（尝试多种方法）
   */
  async parseQRSmart(file: File): Promise<EncryptedQRData> {
    try {
      // 首先尝试直接解析
      const rawData = await this.parseQRFromFile(file);
      
      // 尝试解析为加密二维码数据
      const qrData = this.deserializeEncryptedData(rawData);
      
      return qrData;
    } catch (error) {
      // 如果解析失败，提供更详细的错误信息
      if (error instanceof Error) {
        if (error.message.includes('无法识别二维码')) {
          throw new Error('无法识别二维码。请确保：\n1. 图片清晰且包含完整的二维码\n2. 二维码没有被遮挡或损坏\n3. 图片格式正确（支持PNG、JPG等）');
        } else if (error.message.includes('JSON格式')) {
          throw new Error('这不是一个加密二维码，或者数据格式已损坏');
        } else if (error.message.includes('版本')) {
          throw new Error('二维码版本不兼容，请使用最新版本的应用');
        }
      }
      throw error;
    }
  }

  /**
   * 验证二维码是否为加密二维码
   */
  isEncryptedQR(rawData: string): boolean {
    try {
      const parsed = JSON.parse(rawData);
      return !!(parsed.version && parsed.algorithm && parsed.salt && 
               parsed.iv && parsed.ciphertext && parsed.disguise);
    } catch {
      return false;
    }
  }

  /**
   * ArrayBuffer转Base64
   */
  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Base64转ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): Uint8Array {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch (error) {
      throw new Error(`Base64解码失败: ${error}`);
    }
  }

  /**
   * 获取二维码容量信息
   */
  getQRCapacity(errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M'): number {
    // 不同纠错级别的大致容量（字节）
    const capacities = {
      'L': 2953, // 低纠错
      'M': 2331, // 中纠错
      'Q': 1663, // 高纠错
      'H': 1273  // 最高纠错
    };
    
    return capacities[errorCorrectionLevel];
  }

  /**
   * 估算数据大小
   */
  estimateDataSize(data: string): number {
    return new TextEncoder().encode(data).length;
  }

  /**
   * 检查数据是否适合二维码
   */
  canFitInQR(data: string, errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M'): boolean {
    const dataSize = this.estimateDataSize(data);
    const capacity = this.getQRCapacity(errorCorrectionLevel);
    return dataSize <= capacity;
  }

  /**
   * 获取最优纠错级别
   */
  private getOptimalErrorCorrectionLevel(data: string): 'L' | 'M' | 'Q' | 'H' {
    const levels: ('L' | 'M' | 'Q' | 'H')[] = ['H', 'Q', 'M', 'L'];
    
    for (const level of levels) {
      if (this.canFitInQR(data, level)) {
        return level;
      }
    }
    
    // 如果都不适合，返回最低纠错级别
    return 'L';
  }

  /**
   * 判断是否应该使用更高的纠错级别
   */
  private shouldUseHigherErrorLevel(data: string): boolean {
    const dataSize = this.estimateDataSize(data);
    // 如果数据较小，可以使用更高的纠错级别
    return dataSize < 1000;
  }

  /**
   * 在二维码中嵌入Logo
   */
  private async embedLogoInQR(
    qrDataURL: string, 
    logoFile: File, 
    style: QRStyleConfig
  ): Promise<QRResult> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const qrImg = new Image();
      const logoImg = new Image();

      qrImg.onload = () => {
        canvas.width = qrImg.width;
        canvas.height = qrImg.height;
        ctx?.drawImage(qrImg, 0, 0);

        const reader = new FileReader();
        reader.onload = (e) => {
          logoImg.onload = () => {
            try {
              // 计算Logo大小和位置
              const logoSize = style.logoSize || Math.min(qrImg.width, qrImg.height) * 0.2;
              const x = (qrImg.width - logoSize) / 2;
              const y = (qrImg.height - logoSize) / 2;

              // 绘制白色背景（确保Logo清晰可见）
              if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
                
                // 绘制Logo
                ctx.drawImage(logoImg, x, y, logoSize, logoSize);
              }

              const finalDataURL = canvas.toDataURL('image/png');
              resolve({
                qrCode: finalDataURL,
                format: 'PNG',
                metadata: {
                  size: style.size,
                  algorithm: 'AES-256-GCM',
                  created: new Date()
                }
              });
            } catch (error) {
              reject(new Error(`Logo嵌入失败: ${error}`));
            }
          };
          logoImg.src = e.target?.result as string;
        };
        reader.readAsDataURL(logoFile);
      };

      qrImg.onerror = () => reject(new Error('二维码图片加载失败'));
      qrImg.src = qrDataURL;
    });
  }
}