import { EncryptedQRData, DecryptionResult } from '../interfaces';

export interface ContentState {
  isAuthenticated: boolean;
  displayContent: string;
  realContent?: string;
  disguiseContent: string;
  hasPassword: boolean;
}

export class ContentSwitchService {
  private static instance: ContentSwitchService;
  private contentStates = new Map<string, ContentState>();

  public static getInstance(): ContentSwitchService {
    if (!ContentSwitchService.instance) {
      ContentSwitchService.instance = new ContentSwitchService();
    }
    return ContentSwitchService.instance;
  }

  /**
   * 初始化内容状态（显示伪装内容）
   */
  initializeContentState(qrId: string, qrData: EncryptedQRData): ContentState {
    const state: ContentState = {
      isAuthenticated: false,
      displayContent: qrData.disguise,
      disguiseContent: qrData.disguise,
      hasPassword: true
    };

    this.contentStates.set(qrId, state);
    return state;
  }

  /**
   * 验证密码并切换到真实内容
   */
  authenticateAndSwitch(
    qrId: string, 
    realContent: string, 
    transitionDuration: number = 300
  ): Promise<ContentState> {
    return new Promise((resolve) => {
      const state = this.contentStates.get(qrId);
      if (!state) {
        throw new Error('内容状态未初始化');
      }

      // 执行内容切换动画
      this.performContentTransition(state, realContent, transitionDuration)
        .then((newState) => {
          this.contentStates.set(qrId, newState);
          resolve(newState);
        });
    });
  }

  /**
   * 执行内容切换动画
   */
  private async performContentTransition(
    currentState: ContentState,
    realContent: string,
    duration: number
  ): Promise<ContentState> {
    // 模拟渐变切换效果
    return new Promise((resolve) => {
      // 第一阶段：淡出伪装内容
      setTimeout(() => {
        currentState.displayContent = '';
        
        // 第二阶段：淡入真实内容
        setTimeout(() => {
          const newState: ContentState = {
            ...currentState,
            isAuthenticated: true,
            displayContent: realContent,
            realContent: realContent
          };
          resolve(newState);
        }, duration / 2);
      }, duration / 2);
    });
  }

  /**
   * 切换回伪装内容
   */
  switchToDisguise(qrId: string): ContentState | null {
    const state = this.contentStates.get(qrId);
    if (!state) {
      return null;
    }

    const newState: ContentState = {
      ...state,
      isAuthenticated: false,
      displayContent: state.disguiseContent
    };

    this.contentStates.set(qrId, newState);
    return newState;
  }

  /**
   * 获取当前内容状态
   */
  getContentState(qrId: string): ContentState | null {
    return this.contentStates.get(qrId) || null;
  }

  /**
   * 检查是否已认证
   */
  isAuthenticated(qrId: string): boolean {
    const state = this.contentStates.get(qrId);
    return state?.isAuthenticated || false;
  }

  /**
   * 获取显示内容
   */
  getDisplayContent(qrId: string): string {
    const state = this.contentStates.get(qrId);
    return state?.displayContent || '';
  }

  /**
   * 安全地显示内容（带遮罩选项）
   */
  getSecureDisplayContent(qrId: string, maskSensitive: boolean = false): string {
    const state = this.contentStates.get(qrId);
    if (!state) {
      return '';
    }

    if (!state.isAuthenticated) {
      return state.disguiseContent;
    }

    if (maskSensitive && state.realContent) {
      return this.maskSensitiveContent(state.realContent);
    }

    return state.displayContent;
  }

  /**
   * 遮罩敏感内容
   */
  private maskSensitiveContent(content: string): string {
    // 输入验证
    if (!content || content.length === 0) {
      return '';
    }
    
    // 简单的遮罩逻辑：显示前后几个字符，中间用*代替
    if (content.length <= 8) {
      return '*'.repeat(Math.max(0, content.length));
    }

    const start = content.substring(0, 2);
    const end = content.substring(content.length - 2);
    const middle = '*'.repeat(Math.max(0, content.length - 4));
    
    return start + middle + end;
  }

  /**
   * 清除内容状态
   */
  clearContentState(qrId: string): boolean {
    return this.contentStates.delete(qrId);
  }

  /**
   * 清除所有内容状态
   */
  clearAllContentStates(): void {
    this.contentStates.clear();
  }

  /**
   * 设置自动切换回伪装内容的定时器
   */
  setAutoSwitchTimer(qrId: string, timeoutMs: number = 30000): void {
    setTimeout(() => {
      this.switchToDisguise(qrId);
    }, timeoutMs);
  }

  /**
   * 获取内容切换历史
   */
  getContentHistory(qrId: string): { timestamp: number; action: string; content: string }[] {
    // 在实际应用中，这里可以记录内容切换的历史
    // 现在返回空数组
    return [];
  }

  /**
   * 验证内容切换的安全性
   */
  validateContentSwitch(qrId: string, newContent: string): { isValid: boolean; reason?: string } {
    const state = this.contentStates.get(qrId);
    
    if (!state) {
      return { isValid: false, reason: '内容状态不存在' };
    }

    if (!state.isAuthenticated) {
      return { isValid: false, reason: '未通过身份验证' };
    }

    if (!newContent || newContent.trim().length === 0) {
      return { isValid: false, reason: '内容不能为空' };
    }

    return { isValid: true };
  }

  /**
   * 生成内容状态摘要
   */
  getContentStateSummary(qrId: string): {
    qrId: string;
    isAuthenticated: boolean;
    contentLength: number;
    disguiseLength: number;
    hasRealContent: boolean;
  } | null {
    const state = this.contentStates.get(qrId);
    if (!state) {
      return null;
    }

    return {
      qrId,
      isAuthenticated: state.isAuthenticated,
      contentLength: state.displayContent.length,
      disguiseLength: state.disguiseContent.length,
      hasRealContent: !!state.realContent
    };
  }
}