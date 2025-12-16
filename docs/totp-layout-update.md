# TOTP 动态二维码功能区更新说明

## 概述

按照线框图要求，已将TOTP功能区更新为左右两栏布局，保持与整体设计一致。

## 布局结构

### 左侧：输入区（Form）
- **密钥输入**：主要输入字段，带说明文字
- **可选信息展开**：点击展开显示账户名称等可选字段
- **生成按钮**：主要操作按钮

### 右侧：结果区（Result）
- **动态二维码**：生成的TOTP二维码显示区域
- **当前验证码**：实时显示6位验证码，带倒计时
- **操作按钮**：复制验证码、复制URI、下载二维码

### 底部：安全提醒
- 位置：整个功能区底部
- 内容：验证码安全使用提醒

## 功能特性

### 实时验证码
- 6位数字验证码：`123 456` 格式显示
- 30秒倒计时：显示剩余有效时间
- 自动刷新：倒计时结束自动生成新验证码

### 交互优化
- 可选信息折叠：默认隐藏，点击展开
- 按钮状态管理：根据输入状态启用/禁用
- 复制功能：一键复制验证码和URI

### 视觉设计
- 左右等宽布局：`lg:grid-cols-2`
- 紧凑间距：适应嵌入模式
- 状态反馈：按钮hover和disabled状态

## 代码结构

```typescript
// 主要状态
const [secretKey, setSecretKey] = useState('');
const [accountName, setAccountName] = useState('');
const [showOptional, setShowOptional] = useState(false);
const [currentCode, setCurrentCode] = useState('123456');
const [timeLeft, setTimeLeft] = useState(29);
const [qrGenerated, setQrGenerated] = useState(false);

// 倒计时逻辑
useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        setCurrentCode(generateNewCode());
        return 30;
      }
      return prev - 1;
    });
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

## 符合线框图要求

✅ 左右两栏布局  
✅ 左侧输入区，右侧结果区  
✅ 密钥输入为主要字段  
✅ 可选信息折叠显示  
✅ 当前验证码带倒计时  
✅ 复制和下载操作按钮  
✅ 底部安全提醒  

## 测试状态

✅ 组件编译通过  
✅ 开发服务器运行正常  
✅ 嵌入模式适配完成