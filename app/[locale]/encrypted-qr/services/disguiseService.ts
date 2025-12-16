import { DEFAULT_DISGUISE_TEXTS } from '../interfaces';

export class DisguiseService {
  private static instance: DisguiseService;
  private readonly STORAGE_KEY = 'encrypted-qr-disguise-texts';

  public static getInstance(): DisguiseService {
    if (!DisguiseService.instance) {
      DisguiseService.instance = new DisguiseService();
    }
    return DisguiseService.instance;
  }

  /**
   * 获取默认伪装文本
   */
  getDefaultDisguiseText(): string {
    // 安全检查：确保数组不为空
    if (!DEFAULT_DISGUISE_TEXTS || DEFAULT_DISGUISE_TEXTS.length === 0) {
      return '欢迎访问我们的官方网站'; // 备用文本
    }
    
    const randomIndex = Math.floor(Math.random() * DEFAULT_DISGUISE_TEXTS.length);
    const selectedText = DEFAULT_DISGUISE_TEXTS[randomIndex];
    
    // 额外安全检查：确保选中的文本不为空
    return selectedText && selectedText.length > 0 ? selectedText : '欢迎访问我们的官方网站';
  }

  /**
   * 获取所有预设伪装文本
   */
  getPresetDisguiseTexts(): string[] {
    return [...DEFAULT_DISGUISE_TEXTS];
  }

  /**
   * 获取用户自定义伪装文本
   */
  getCustomDisguiseTexts(): string[] {
    try {
      // 检查是否在浏览器环境中
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * 获取所有伪装文本（预设+自定义）
   */
  getAllDisguiseTexts(): string[] {
    const preset = this.getPresetDisguiseTexts();
    const custom = this.getCustomDisguiseTexts();
    return [...preset, ...custom];
  }

  /**
   * 添加自定义伪装文本
   */
  addCustomDisguiseText(text: string): boolean {
    if (!text || text.trim().length === 0) {
      return false;
    }

    const trimmedText = text.trim();
    const customTexts = this.getCustomDisguiseTexts();
    
    // 检查是否已存在
    if (customTexts.includes(trimmedText) || DEFAULT_DISGUISE_TEXTS.includes(trimmedText)) {
      return false;
    }

    customTexts.push(trimmedText);
    
    try {
      // 检查是否在浏览器环境中
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customTexts));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * 删除自定义伪装文本
   */
  removeCustomDisguiseText(text: string): boolean {
    const customTexts = this.getCustomDisguiseTexts();
    const index = customTexts.indexOf(text);
    
    if (index === -1) {
      return false;
    }

    customTexts.splice(index, 1);
    
    try {
      // 检查是否在浏览器环境中
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customTexts));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * 验证伪装文本
   */
  validateDisguiseText(text: string): { isValid: boolean; message?: string } {
    if (!text || text.trim().length === 0) {
      return { isValid: false, message: '伪装文本不能为空' };
    }

    const trimmedText = text.trim();
    
    if (trimmedText.length < 5) {
      return { isValid: false, message: '伪装文本至少需要5个字符' };
    }

    if (trimmedText.length > 200) {
      return { isValid: false, message: '伪装文本不能超过200个字符' };
    }

    // 检查是否包含可疑内容
    const suspiciousPatterns = [
      /password/i,
      /secret/i,
      /private/i,
      /confidential/i,
      /encrypted/i,
      /密码/,
      /秘密/,
      /机密/,
      /加密/,
      /隐藏/
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(trimmedText)) {
        return { 
          isValid: false, 
          message: '伪装文本不应包含与加密、密码相关的词汇，以保持隐蔽性' 
        };
      }
    }

    return { isValid: true };
  }

  /**
   * 生成智能伪装文本建议
   */
  generateDisguiseSuggestions(category?: 'business' | 'personal' | 'social'): string[] {
    const suggestions = {
      business: [
        '欢迎访问我们的官方网站了解更多信息',
        '联系我们获取专业服务咨询',
        '扫码关注企业公众号获取最新动态',
        '查看我们的产品目录和服务介绍',
        '获取企业联系方式和地址信息'
      ],
      personal: [
        '这是我的个人名片信息',
        '欢迎添加我的联系方式',
        '查看我的个人作品集',
        '获取我的社交媒体链接',
        '了解更多关于我的信息'
      ],
      social: [
        '加入我们的社群讨论',
        '关注我们的最新活动',
        '参与我们的线上活动',
        '获取活动时间和地点信息',
        '查看更多精彩内容分享'
      ]
    };

    if (category && suggestions[category]) {
      return suggestions[category];
    }

    // 如果没有指定类别，返回混合建议
    return [
      ...suggestions.business.slice(0, 2),
      ...suggestions.personal.slice(0, 2),
      ...suggestions.social.slice(0, 1)
    ];
  }

  /**
   * 根据真实内容智能推荐伪装文本
   */
  suggestDisguiseForContent(realContent: string): string[] {
    const contentLower = realContent.toLowerCase();
    
    // 根据内容类型推荐不同的伪装文本
    if (contentLower.includes('password') || contentLower.includes('密码')) {
      return this.generateDisguiseSuggestions('business');
    } else if (contentLower.includes('private') || contentLower.includes('个人')) {
      return this.generateDisguiseSuggestions('personal');
    } else if (contentLower.includes('key') || contentLower.includes('密钥')) {
      return this.generateDisguiseSuggestions('business');
    } else {
      return this.generateDisguiseSuggestions();
    }
  }

  /**
   * 清除所有自定义伪装文本
   */
  clearCustomDisguiseTexts(): boolean {
    try {
      // 检查是否在浏览器环境中
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(this.STORAGE_KEY);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * 导出自定义伪装文本
   */
  exportCustomDisguiseTexts(): string {
    const customTexts = this.getCustomDisguiseTexts();
    return JSON.stringify(customTexts, null, 2);
  }

  /**
   * 导入自定义伪装文本
   */
  importCustomDisguiseTexts(jsonData: string): { success: boolean; imported: number; message?: string } {
    try {
      const importedTexts = JSON.parse(jsonData);
      
      if (!Array.isArray(importedTexts)) {
        return { success: false, imported: 0, message: '导入数据格式错误，应为字符串数组' };
      }

      const currentTexts = this.getCustomDisguiseTexts();
      let importedCount = 0;

      for (const text of importedTexts) {
        if (typeof text === 'string' && this.validateDisguiseText(text).isValid) {
          if (!currentTexts.includes(text) && !DEFAULT_DISGUISE_TEXTS.includes(text)) {
            currentTexts.push(text);
            importedCount++;
          }
        }
      }

      if (importedCount > 0 && typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentTexts));
      }

      return { 
        success: true, 
        imported: importedCount, 
        message: `成功导入 ${importedCount} 个伪装文本` 
      };
    } catch (error) {
      return { 
        success: false, 
        imported: 0, 
        message: `导入失败: ${error}` 
      };
    }
  }
}