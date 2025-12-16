import { 
  EncryptionConfig, 
  QRStyleConfig, 
  DEFAULT_ENCRYPTION_CONFIG, 
  DEFAULT_QR_STYLE 
} from '../interfaces';

export interface AppConfig {
  encryption: EncryptionConfig;
  qrStyle: QRStyleConfig;
  security: SecurityConfig;
  ui: UIConfig;
}

export interface SecurityConfig {
  enforceStrongPasswords: boolean;
  maxFailureAttempts: number;
  lockoutDurationMs: number;
  autoLockTimeoutMs: number;
  clearClipboardAfterMs: number;
  enableSecurityLogging: boolean;
}

export interface UIConfig {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh' | 'en';
  showAdvancedOptions: boolean;
  enableAnimations: boolean;
  autoSaveSettings: boolean;
}

export class ConfigService {
  private static instance: ConfigService;
  private readonly STORAGE_KEY = 'encrypted-qr-config';
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): AppConfig {
    return {
      encryption: { ...DEFAULT_ENCRYPTION_CONFIG },
      qrStyle: { ...DEFAULT_QR_STYLE },
      security: {
        enforceStrongPasswords: true,
        maxFailureAttempts: 3,
        lockoutDurationMs: 30000,
        autoLockTimeoutMs: 300000, // 5分钟
        clearClipboardAfterMs: 60000, // 1分钟
        enableSecurityLogging: true
      },
      ui: {
        theme: 'auto',
        language: 'zh',
        showAdvancedOptions: false,
        enableAnimations: true,
        autoSaveSettings: true
      }
    };
  }

  /**
   * 加载配置
   */
  private loadConfig(): AppConfig {
    try {
      // 检查是否在浏览器环境中
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsedConfig = JSON.parse(stored);
          return this.mergeWithDefaults(parsedConfig);
        }
      }
    } catch (error) {
      console.warn('配置加载失败，使用默认配置:', error);
    }
    return this.getDefaultConfig();
  }

  /**
   * 合并配置与默认值
   */
  private mergeWithDefaults(userConfig: Partial<AppConfig>): AppConfig {
    const defaultConfig = this.getDefaultConfig();
    return {
      encryption: { ...defaultConfig.encryption, ...userConfig.encryption },
      qrStyle: { ...defaultConfig.qrStyle, ...userConfig.qrStyle },
      security: { ...defaultConfig.security, ...userConfig.security },
      ui: { ...defaultConfig.ui, ...userConfig.ui }
    };
  }

  /**
   * 保存配置
   */
  private saveConfig(): boolean {
    try {
      // 检查是否在浏览器环境中
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
        return true;
      }
      return false; // 服务器端无法保存到localStorage
    } catch (error) {
      console.error('配置保存失败:', error);
      return false;
    }
  }

  /**
   * 获取完整配置
   */
  getConfig(): AppConfig {
    return { ...this.config };
  }

  /**
   * 获取加密配置
   */
  getEncryptionConfig(): EncryptionConfig {
    return { ...this.config.encryption };
  }

  /**
   * 获取二维码样式配置
   */
  getQRStyleConfig(): QRStyleConfig {
    return { ...this.config.qrStyle };
  }

  /**
   * 获取安全配置
   */
  getSecurityConfig(): SecurityConfig {
    return { ...this.config.security };
  }

  /**
   * 获取UI配置
   */
  getUIConfig(): UIConfig {
    return { ...this.config.ui };
  }

  /**
   * 更新加密配置
   */
  updateEncryptionConfig(config: Partial<EncryptionConfig>): boolean {
    const validation = this.validateEncryptionConfig({ ...this.config.encryption, ...config });
    if (!validation.isValid) {
      throw new Error(`加密配置无效: ${validation.message}`);
    }

    this.config.encryption = { ...this.config.encryption, ...config };
    return this.config.ui.autoSaveSettings ? this.saveConfig() : true;
  }

  /**
   * 更新二维码样式配置
   */
  updateQRStyleConfig(config: Partial<QRStyleConfig>): boolean {
    const validation = this.validateQRStyleConfig({ ...this.config.qrStyle, ...config });
    if (!validation.isValid) {
      throw new Error(`二维码样式配置无效: ${validation.message}`);
    }

    this.config.qrStyle = { ...this.config.qrStyle, ...config };
    return this.config.ui.autoSaveSettings ? this.saveConfig() : true;
  }

  /**
   * 更新安全配置
   */
  updateSecurityConfig(config: Partial<SecurityConfig>): boolean {
    const validation = this.validateSecurityConfig({ ...this.config.security, ...config });
    if (!validation.isValid) {
      throw new Error(`安全配置无效: ${validation.message}`);
    }

    this.config.security = { ...this.config.security, ...config };
    return this.config.ui.autoSaveSettings ? this.saveConfig() : true;
  }

  /**
   * 更新UI配置
   */
  updateUIConfig(config: Partial<UIConfig>): boolean {
    const validation = this.validateUIConfig({ ...this.config.ui, ...config });
    if (!validation.isValid) {
      throw new Error(`UI配置无效: ${validation.message}`);
    }

    this.config.ui = { ...this.config.ui, ...config };
    return this.config.ui.autoSaveSettings ? this.saveConfig() : true;
  }

  /**
   * 验证加密配置
   */
  validateEncryptionConfig(config: EncryptionConfig): { isValid: boolean; message?: string } {
    if (!config.algorithm || !['AES-256-GCM'].includes(config.algorithm)) {
      return { isValid: false, message: '不支持的加密算法' };
    }

    if (!config.keyDerivation || !['PBKDF2', 'Argon2id'].includes(config.keyDerivation)) {
      return { isValid: false, message: '不支持的密钥派生函数' };
    }

    if (config.iterations < 1) {
      return { isValid: false, message: '迭代次数必须大于0' };
    }

    if (config.saltLength < 16) {
      return { isValid: false, message: '盐值长度至少需要16字节' };
    }

    if (config.ivLength < 12) {
      return { isValid: false, message: 'IV长度至少需要12字节' };
    }

    if (config.memorySize < 1024) {
      return { isValid: false, message: '内存成本至少需要1MB' };
    }

    if (config.parallelism < 1) {
      return { isValid: false, message: '并行度至少为1' };
    }

    return { isValid: true };
  }

  /**
   * 验证二维码样式配置
   */
  validateQRStyleConfig(config: QRStyleConfig): { isValid: boolean; message?: string } {
    if (config.size < 100 || config.size > 2000) {
      return { isValid: false, message: '二维码大小必须在100-2000像素之间' };
    }

    if (config.margin < 0 || config.margin > 20) {
      return { isValid: false, message: '边距必须在0-20之间' };
    }

    if (!this.isValidColor(config.colorDark)) {
      return { isValid: false, message: '深色颜色格式无效' };
    }

    if (!this.isValidColor(config.colorLight)) {
      return { isValid: false, message: '浅色颜色格式无效' };
    }

    if (!['L', 'M', 'Q', 'H'].includes(config.errorCorrectionLevel)) {
      return { isValid: false, message: '无效的纠错级别' };
    }

    if (config.logoSize && (config.logoSize < 10 || config.logoSize > config.size * 0.3)) {
      return { isValid: false, message: 'Logo大小必须在10像素到二维码大小30%之间' };
    }

    return { isValid: true };
  }

  /**
   * 验证安全配置
   */
  validateSecurityConfig(config: SecurityConfig): { isValid: boolean; message?: string } {
    if (config.maxFailureAttempts < 1 || config.maxFailureAttempts > 10) {
      return { isValid: false, message: '最大失败次数必须在1-10之间' };
    }

    if (config.lockoutDurationMs < 1000 || config.lockoutDurationMs > 3600000) {
      return { isValid: false, message: '锁定时间必须在1秒-1小时之间' };
    }

    if (config.autoLockTimeoutMs < 60000 || config.autoLockTimeoutMs > 86400000) {
      return { isValid: false, message: '自动锁定时间必须在1分钟-24小时之间' };
    }

    if (config.clearClipboardAfterMs < 5000 || config.clearClipboardAfterMs > 600000) {
      return { isValid: false, message: '剪贴板清理时间必须在5秒-10分钟之间' };
    }

    return { isValid: true };
  }

  /**
   * 验证UI配置
   */
  validateUIConfig(config: UIConfig): { isValid: boolean; message?: string } {
    if (!['light', 'dark', 'auto'].includes(config.theme)) {
      return { isValid: false, message: '无效的主题设置' };
    }

    if (!['zh', 'en'].includes(config.language)) {
      return { isValid: false, message: '不支持的语言' };
    }

    return { isValid: true };
  }

  /**
   * 验证颜色格式
   */
  private isValidColor(color: string): boolean {
    // 简单的颜色格式验证（十六进制）
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  /**
   * 重置为默认配置
   */
  resetToDefaults(): boolean {
    this.config = this.getDefaultConfig();
    return this.saveConfig();
  }

  /**
   * 导出配置
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * 导入配置
   */
  importConfig(configJson: string): { success: boolean; message: string } {
    try {
      const importedConfig = JSON.parse(configJson);
      
      // 验证导入的配置
      const mergedConfig = this.mergeWithDefaults(importedConfig);
      
      // 验证各个部分
      const encryptionValidation = this.validateEncryptionConfig(mergedConfig.encryption);
      if (!encryptionValidation.isValid) {
        return { success: false, message: `加密配置无效: ${encryptionValidation.message}` };
      }

      const qrStyleValidation = this.validateQRStyleConfig(mergedConfig.qrStyle);
      if (!qrStyleValidation.isValid) {
        return { success: false, message: `二维码样式配置无效: ${qrStyleValidation.message}` };
      }

      const securityValidation = this.validateSecurityConfig(mergedConfig.security);
      if (!securityValidation.isValid) {
        return { success: false, message: `安全配置无效: ${securityValidation.message}` };
      }

      const uiValidation = this.validateUIConfig(mergedConfig.ui);
      if (!uiValidation.isValid) {
        return { success: false, message: `UI配置无效: ${uiValidation.message}` };
      }

      // 应用配置
      this.config = mergedConfig;
      const saved = this.saveConfig();
      
      return { 
        success: saved, 
        message: saved ? '配置导入成功' : '配置导入成功但保存失败' 
      };
    } catch (error) {
      return { success: false, message: `配置导入失败: ${error}` };
    }
  }

  /**
   * 手动保存配置
   */
  saveConfigManually(): boolean {
    return this.saveConfig();
  }

  /**
   * 获取推荐的安全配置
   */
  getRecommendedSecurityConfig(): SecurityConfig {
    return {
      enforceStrongPasswords: true,
      maxFailureAttempts: 3,
      lockoutDurationMs: 30000,
      autoLockTimeoutMs: 300000,
      clearClipboardAfterMs: 60000,
      enableSecurityLogging: true
    };
  }

  /**
   * 获取高性能配置
   */
  getHighPerformanceConfig(): EncryptionConfig {
    return {
      algorithm: 'AES-256-GCM',
      keyDerivation: 'Argon2id',
      iterations: 2, // 较低的迭代次数以提高性能
      saltLength: 32,
      ivLength: 16,
      memorySize: 32768, // 32MB内存成本
      parallelism: 1
    };
  }

  /**
   * 获取高安全配置
   */
  getHighSecurityConfig(): EncryptionConfig {
    return {
      algorithm: 'AES-256-GCM',
      keyDerivation: 'Argon2id',
      iterations: 5, // 更高的迭代次数
      saltLength: 32,
      ivLength: 16,
      memorySize: 131072, // 128MB内存成本
      parallelism: 1
    };
  }
}