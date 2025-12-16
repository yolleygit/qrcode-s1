// 核心功能验证脚本
import { 
  CryptoService, 
  QRCodeService, 
  DisguiseService, 
  ConfigService,
  EncryptedQRService 
} from './index';

export async function validateCoreFeatures(): Promise<{
  success: boolean;
  results: Record<string, boolean>;
  errors: string[];
}> {
  const results: Record<string, boolean> = {};
  const errors: string[] = [];

  try {
    // 1. 验证服务实例化
    const cryptoService = CryptoService.getInstance();
    const qrCodeService = QRCodeService.getInstance();
    const disguiseService = DisguiseService.getInstance();
    const configService = ConfigService.getInstance();
    const encryptedQRService = EncryptedQRService.getInstance();
    
    results['services_instantiation'] = true;

    // 2. 验证密码强度检查
    const passwordCheck = cryptoService.validatePasswordStrength('MyStr0ngP@ssw0rd123');
    results['password_validation'] = passwordCheck.isValid;

    // 3. 验证随机数生成
    const salt1 = cryptoService.generateSalt(32);
    const salt2 = cryptoService.generateSalt(32);
    results['random_generation'] = salt1.length === 32 && !salt1.every((v, i) => v === salt2[i]);

    // 4. 验证伪装文本功能
    const disguiseText = disguiseService.getDefaultDisguiseText();
    const disguiseValidation = disguiseService.validateDisguiseText(disguiseText);
    results['disguise_text'] = disguiseValidation.isValid && disguiseText.length > 0;

    // 5. 验证配置管理
    const config = configService.getConfig();
    const configValidation = configService.validateEncryptionConfig(config.encryption);
    results['config_management'] = configValidation.isValid;

    // 6. 验证二维码数据序列化
    const mockEncryptedData = {
      algorithm: 'AES-256-GCM',
      salt: new Uint8Array([1, 2, 3, 4]),
      iv: new Uint8Array([5, 6, 7, 8]),
      ciphertext: new Uint8Array([9, 10, 11, 12]),
      tag: new Uint8Array([13, 14, 15, 16])
    };
    
    const serialized = qrCodeService.serializeEncryptedData(mockEncryptedData, disguiseText);
    const deserialized = qrCodeService.deserializeEncryptedData(serialized);
    results['qr_serialization'] = deserialized.disguise === disguiseText;

    // 7. 验证二维码信息检查
    const qrInfo = encryptedQRService.getQRInfo(serialized);
    results['qr_info_check'] = qrInfo.isEncrypted && qrInfo.algorithm === 'AES-256-GCM';

    // 8. 验证支持的算法
    const supportedAlgorithms = encryptedQRService.getSupportedAlgorithms();
    results['supported_algorithms'] = supportedAlgorithms.includes('AES-256-GCM');

    console.log('✅ 核心功能验证完成');
    console.log('验证结果:', results);

    const allPassed = Object.values(results).every(Boolean);
    return {
      success: allPassed,
      results,
      errors
    };

  } catch (error) {
    errors.push(`验证过程出错: ${error}`);
    console.error('❌ 核心功能验证失败:', error);
    
    return {
      success: false,
      results,
      errors
    };
  }
}

// 如果直接运行此文件，执行验证
if (typeof window === 'undefined' && require.main === module) {
  validateCoreFeatures().then(result => {
    if (result.success) {
      console.log('🎉 所有核心功能验证通过！');
      process.exit(0);
    } else {
      console.log('❌ 核心功能验证失败');
      console.log('错误:', result.errors);
      process.exit(1);
    }
  });
}