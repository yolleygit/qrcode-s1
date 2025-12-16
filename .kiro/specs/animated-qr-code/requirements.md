# 动态验证码二维码模块需求文档

## 简介

为现有的 QR Master 二维码生成工具添加动态验证码二维码功能，允许用户创建类似Google Authenticator的TOTP（Time-based One-Time Password）二维码，每30秒自动更新验证码内容，用于双因素认证和安全验证场景。

## 术语表

- **动态验证码系统 (Dynamic_TOTP_System)**: 负责生成和管理基于时间的一次性密码二维码的核心系统
- **TOTP生成器 (TOTP_Generator)**: 根据密钥和当前时间生成6位数字验证码的算法模块
- **二维码更新器 (QR_Updater)**: 负责定时更新二维码内容的组件
- **倒计时组件 (Countdown_Component)**: 显示当前验证码剩余有效时间的用户界面组件
- **密钥管理器 (Secret_Manager)**: 处理密钥生成、存储和验证的安全模块

## 需求

### 需求 1

**用户故事:** 作为用户，我想要生成TOTP验证码二维码，以便设置双因素认证。

#### 验收标准

1. WHEN 用户输入服务名称和账户名 THEN 动态验证码系统 SHALL 生成包含这些信息的TOTP配置
2. WHEN TOTP生成器创建密钥 THEN 动态验证码系统 SHALL 生成32字符的Base32编码密钥
3. WHEN 系统生成二维码 THEN 动态验证码系统 SHALL 创建符合Google Authenticator标准的otpauth URI
4. WHEN 用户扫描二维码 THEN 动态验证码系统 SHALL 确保二维码包含所有必需的TOTP参数
5. WHEN 密钥管理器处理密钥 THEN 动态验证码系统 SHALL 提供密钥的安全显示和复制功能

### 需求 2

**用户故事:** 作为用户，我想要看到实时更新的验证码，以便验证TOTP配置是否正确。

#### 验收标准

1. WHEN TOTP生成器计算验证码 THEN 动态验证码系统 SHALL 每30秒生成新的6位数字验证码
2. WHEN 当前时间变化 THEN 二维码更新器 SHALL 自动更新显示的验证码
3. WHEN 验证码更新 THEN 动态验证码系统 SHALL 保持二维码的基本配置不变
4. WHEN 系统显示验证码 THEN 动态验证码系统 SHALL 同时显示当前验证码和二维码
5. WHEN 验证码生成 THEN TOTP生成器 SHALL 使用SHA-1算法和30秒时间窗口

### 需求 3

**用户故事:** 作为用户，我想要看到验证码的剩余有效时间，以便知道何时会更新。

#### 验收标准

1. WHEN 倒计时组件启动 THEN 动态验证码系统 SHALL 显示当前验证码的剩余秒数
2. WHEN 时间倒计时 THEN 倒计时组件 SHALL 每秒更新剩余时间显示
3. WHEN 倒计时归零 THEN 倒计时组件 SHALL 重置为30秒并触发验证码更新
4. WHEN 倒计时显示 THEN 倒计时组件 SHALL 提供视觉进度条或圆形进度指示器
5. WHEN 验证码即将过期 THEN 倒计时组件 SHALL 在最后5秒提供视觉警告

### 需求 4

**用户故事:** 作为用户，我想要自定义TOTP参数，以便适配不同的认证服务要求。

#### 验收标准

1. WHEN 用户设置时间窗口 THEN 动态验证码系统 SHALL 支持15秒、30秒、60秒的时间窗口选项
2. WHEN 用户选择验证码长度 THEN 动态验证码系统 SHALL 支持6位和8位验证码长度
3. WHEN 用户选择哈希算法 THEN 动态验证码系统 SHALL 支持SHA-1、SHA-256、SHA-512算法
4. WHEN 用户修改参数 THEN 动态验证码系统 SHALL 立即重新生成二维码和验证码
5. WHEN 参数配置完成 THEN 动态验证码系统 SHALL 在二维码中包含所有自定义参数

### 需求 5

**用户故事:** 作为用户，我想要导出TOTP配置，以便在其他设备或应用中使用。

#### 验收标准

1. WHEN 用户选择导出密钥 THEN 密钥管理器 SHALL 提供Base32格式的密钥文本
2. WHEN 用户导出URI THEN 动态验证码系统 SHALL 生成完整的otpauth URI字符串
3. WHEN 用户保存二维码 THEN 动态验证码系统 SHALL 支持PNG和SVG格式导出
4. WHEN 用户复制配置 THEN 动态验证码系统 SHALL 提供一键复制密钥和URI功能
5. WHEN 导出操作执行 THEN 动态验证码系统 SHALL 显示安全提醒关于密钥保护

### 需求 6

**用户故事:** 作为用户，我想要验证生成的TOTP码，以便确认配置正确性。

#### 验收标准

1. WHEN 用户输入验证码 THEN 动态验证码系统 SHALL 验证输入的6位或8位数字验证码
2. WHEN 验证码校验 THEN TOTP生成器 SHALL 检查当前时间窗口和前后一个时间窗口的验证码
3. WHEN 验证成功 THEN 动态验证码系统 SHALL 显示绿色成功提示
4. WHEN 验证失败 THEN 动态验证码系统 SHALL 显示红色错误提示和可能的原因
5. WHEN 时间同步检查 THEN 动态验证码系统 SHALL 提供时间同步状态检查功能

### 需求 7

**用户故事:** 作为用户，我想要在移动设备上使用TOTP二维码生成功能，以便随时创建验证码配置。

#### 验收标准

1. WHEN 用户在移动设备访问 THEN 动态验证码系统 SHALL 提供触摸友好的响应式界面
2. WHEN 移动设备显示二维码 THEN 动态验证码系统 SHALL 自动调整二维码大小适应屏幕
3. WHEN 用户在移动设备操作 THEN 动态验证码系统 SHALL 支持触摸复制和分享功能
4. WHEN 移动设备性能限制 THEN 动态验证码系统 SHALL 优化计算性能确保流畅更新
5. WHEN 移动设备导出 THEN 动态验证码系统 SHALL 适配移动浏览器的文件保存机制