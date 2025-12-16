# 错误处理系统文档

## 📋 系统概述

错误处理系统为QR码生成器应用提供全面的错误捕获、处理和用户反馈机制。系统包含全局错误边界、网络状态监控、错误分类处理和用户友好的错误恢复功能。

**实施状态**: ✅ **已完成核心功能**  
**最后更新**: 2024年12月15日

## 🏗️ 系统架构

### 核心组件

1. **ErrorBoundary** - 全局错误边界组件
2. **NetworkStatus** - 网络状态监控组件  
3. **useErrorHandler** - 错误处理Hook
4. **Toast** - 错误消息提示系统

### 错误分类

系统将错误分为以下类型：
- `network` - 网络连接错误
- `validation` - 数据验证错误
- `permission` - 权限相关错误
- `timeout` - 操作超时错误
- `unknown` - 未知错误

## 🔧 组件详细说明

### ErrorBoundary 组件

**位置**: `app/[locale]/components/ErrorBoundary.tsx`

#### 功能特性
- ✅ 捕获React组件树中的JavaScript错误
- ✅ 显示友好的错误界面，包含错误图标和说明
- ✅ 提供多种恢复选项：重试、刷新页面、返回首页
- ✅ 开发环境下显示详细错误信息和堆栈跟踪
- ✅ 支持自定义错误处理回调函数
- ✅ 移动端优化：按钮符合44px最小触摸目标

#### 使用示例

```typescript
// 基础用法
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// 带自定义错误处理
<ErrorBoundary 
  onError={(error, errorInfo) => {
    // 发送错误报告到服务器
    console.log('Error reported:', error);
  }}
>
  <YourComponent />
</ErrorBoundary>

// 简化版本用于局部错误处理
<SimpleErrorBoundary>
  <SomeComponent />
</SimpleErrorBoundary>
```

#### 错误界面特性
- 🎨 **视觉设计**: 红色主题，清晰的错误图标和层次结构
- 📱 **移动端适配**: 响应式布局，触摸友好的按钮设计
- 🌙 **深色模式**: 完整的深色主题支持
- 🔄 **恢复选项**: 重试、刷新、返回首页三种恢复方式
- 🐛 **错误报告**: 开发环境下的详细错误信息展示

### NetworkStatus 组件

**位置**: `app/[locale]/components/NetworkStatus.tsx`

#### 功能特性
- ✅ 实时监控网络连接状态
- ✅ 网络断开时显示离线提示
- ✅ 网络恢复时显示连接成功消息
- ✅ 多种显示模式：浮动提示、指示器、横幅

#### 组件变体

```typescript
// 主要网络状态组件
<NetworkStatus showWhenOnline={false} />

// 简单的网络指示器
<NetworkIndicator className="ml-2" />

// 离线横幅提示
<OfflineBanner />
```

#### 显示逻辑
- **离线时**: 立即显示红色离线提示
- **恢复时**: 显示绿色连接成功消息，3秒后自动隐藏
- **在线时**: 根据`showWhenOnline`参数决定是否显示

### useErrorHandler Hook

**位置**: `app/[locale]/hooks/useErrorHandler.ts`

#### 功能特性
- ✅ 统一的错误处理接口
- ✅ 错误分类和用户友好消息转换
- ✅ 自动重试机制，支持指数退避
- ✅ 错误历史记录管理
- ✅ Toast消息集成

#### 使用示例

```typescript
function MyComponent() {
  const { handleError, retry, errors, isRetrying } = useErrorHandler();

  const handleSubmit = async () => {
    try {
      await retry(async () => {
        const response = await fetch('/api/generate-qr');
        if (!response.ok) throw new Error('生成失败');
        return response.json();
      }, {
        maxRetries: 3,
        delay: 1000,
        backoff: true
      });
    } catch (error) {
      handleError(error, 'QR码生成');
    }
  };

  return (
    <div>
      <button 
        onClick={handleSubmit} 
        disabled={isRetrying}
      >
        {isRetrying ? '重试中...' : '生成二维码'}
      </button>
      
      {errors.length > 0 && (
        <div className="error-list">
          {errors.map((error, index) => (
            <div key={index} className="error-item">
              {error.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### 重试配置选项
- `maxRetries`: 最大重试次数（默认3次）
- `delay`: 重试延迟时间（默认1000ms）
- `backoff`: 是否使用指数退避（默认true）

### useNetworkStatus Hook

#### 功能特性
- ✅ 监听浏览器网络状态变化事件
- ✅ 提供当前网络状态和错误信息
- ✅ 支持手动网络状态检查

#### 使用示例

```typescript
function NetworkAwareComponent() {
  const { isOnline, networkError, checkNetworkStatus } = useNetworkStatus();

  const handleAction = async () => {
    if (!isOnline) {
      alert('网络连接已断开，请检查网络后重试');
      return;
    }
    
    // 执行需要网络的操作
    try {
      await performNetworkOperation();
    } catch (error) {
      // 检查是否是网络问题
      if (!checkNetworkStatus()) {
        handleError('网络连接出现问题');
      }
    }
  };

  return (
    <div>
      <button 
        onClick={handleAction}
        disabled={!isOnline}
      >
        {isOnline ? '执行操作' : '网络断开'}
      </button>
    </div>
  );
}
```

## 🎯 错误处理流程

### 1. 错误捕获
```
JavaScript错误 → ErrorBoundary → 显示错误界面
网络错误 → useErrorHandler → Toast提示 + 重试选项
验证错误 → useErrorHandler → 表单错误提示
```

### 2. 错误分类处理
```typescript
// 系统自动根据错误特征进行分类
const errorType = getErrorType(error);

switch (errorType) {
  case 'network':
    return '网络连接出现问题，请检查网络后重试';
  case 'validation':
    return '输入信息有误，请检查后重新提交';
  case 'permission':
    return '权限不足，请联系管理员或重新登录';
  case 'timeout':
    return '操作超时，请稍后重试';
  default:
    return '操作失败，请稍后重试';
}
```

### 3. 用户反馈
- **即时反馈**: Toast消息显示错误信息
- **恢复选项**: 提供重试、刷新、返回等操作
- **状态指示**: 显示重试进度和网络状态

## 📱 移动端优化

### 触摸友好设计
- ✅ 所有错误界面按钮最小44px×44px
- ✅ 按钮间距至少8px，避免误触
- ✅ 支持触摸手势操作

### 响应式布局
- ✅ 错误界面在小屏幕设备上完整显示
- ✅ 文字大小和间距适配移动端阅读
- ✅ 模态框和提示在移动端正确居中

### 网络状态适配
- ✅ 离线状态下禁用网络相关功能
- ✅ 网络恢复时自动重试失败的操作
- ✅ 移动网络不稳定时的友好提示

## 🧪 测试覆盖

### 单元测试
- [ ] ErrorBoundary组件错误捕获测试
- [ ] useErrorHandler Hook功能测试
- [ ] 网络状态变化测试
- [ ] 错误分类逻辑测试

### 集成测试
- [ ] 端到端错误处理流程测试
- [ ] 网络断开恢复场景测试
- [ ] 移动端错误界面交互测试

### 用户体验测试
- [ ] 错误信息可读性测试
- [ ] 恢复操作有效性测试
- [ ] 移动端触摸体验测试

## 🔮 未来改进计划

### 短期计划 (1-2周)
- [ ] 添加错误报告功能，将错误信息发送到服务器
- [ ] 实现错误统计和分析面板
- [ ] 优化重试策略，根据错误类型调整重试逻辑

### 中期计划 (1个月)
- [ ] 添加离线模式支持，缓存用户数据
- [ ] 实现智能错误预测和预防
- [ ] 集成用户反馈系统

### 长期计划 (3个月)
- [ ] 机器学习驱动的错误分析
- [ ] 个性化错误处理策略
- [ ] 跨设备错误同步

## 📊 性能指标

### 错误处理性能
- **错误捕获延迟**: < 10ms
- **错误界面渲染时间**: < 100ms
- **网络状态检测响应**: < 50ms
- **重试操作响应**: < 200ms

### 用户体验指标
- **错误恢复成功率**: > 90%
- **用户错误理解度**: > 85%
- **错误处理满意度**: > 4.0/5.0

---

*本文档随系统更新持续维护，记录错误处理系统的完整实现和使用指南。*  
*最后更新：2024年12月15日*