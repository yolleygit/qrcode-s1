# QR Master 开发环境配置指南

## VS Code 配置

项目包含预配置的 VS Code 设置文件 `.vscode/settings.json`，用于优化开发体验。

### 当前配置

```json
{
    "kiroAgent.configureMCP": "Disabled",
    "typescript.autoClosingTags": false
}
```

> **最新更新 (2024年12月15日)**: 新增 TypeScript 自动闭合标签配置，禁用自动闭合标签功能以提供更精确的 JSX/TSX 开发体验。详细说明请参考下方的配置说明部分。

#### Kiro Agent 配置
- **设置项**: `kiroAgent.configureMCP`
- **值**: `"Disabled"`
- **说明**: 禁用 Kiro Agent 的 MCP (Model Context Protocol) 配置功能
- **原因**: 在当前项目中，我们不需要 MCP 自动配置，手动管理更适合项目需求
- **影响**: 
  - 禁用自动 MCP 服务器配置
  - 需要手动管理 MCP 连接和工具
  - 提供更精确的开发环境控制

#### TypeScript 自动闭合标签配置
- **配置项**: `typescript.autoClosingTags`
- **当前值**: `false`
- **功能**: 禁用 TypeScript 文件中的自动闭合标签功能
- **原因**: 在 JSX/TSX 开发中，自动闭合标签可能会在不合适的位置插入，影响开发体验
- **影响范围**: 所有 `.ts`、`.tsx`、`.js`、`.jsx` 文件
- **替代方案**: 使用 Emmet 快捷键或手动编写标签
- **优势**: 
  - 提供更精确的标签控制
  - 避免自动插入导致的代码结构问题
  - 减少在复杂 JSX 结构中的编辑干扰
- **适用场景**: React 组件开发，复杂 JSX 结构编写

### 开发环境要求

- **VS Code**: 推荐使用最新版本
- **Node.js**: 18.0 或更高版本
- **TypeScript**: 5.0 或更高版本

### 推荐扩展

为了获得最佳开发体验，建议安装以下 VS Code 扩展：

- **TypeScript and JavaScript Language Features** (内置)
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **Tailwind CSS IntelliSense**
- **Auto Rename Tag**

### 自定义配置

如果您需要修改这些设置，可以：

1. **项目级别修改**: 直接编辑 `.vscode/settings.json`
2. **用户级别覆盖**: 在用户设置中添加相同的配置项

```json
// 用户设置示例 - 如果您希望覆盖项目设置
{
    "kiroAgent.configureMCP": "Enabled",     // 启用 MCP 自动配置
    "typescript.autoClosingTags": true,      // 启用自动闭合标签
    "editor.formatOnSave": true              // 保存时自动格式化
}
```

### 故障排除

#### Kiro Agent 相关问题

如果遇到 Kiro Agent 相关的问题：

1. **确认扩展安装**：检查 Kiro Agent 扩展是否正确安装
2. **验证配置**：确认 `kiroAgent.configureMCP` 设置为 `"Disabled"`
3. **重启生效**：修改配置后重启 VS Code 使设置生效
4. **检查日志**：查看 VS Code 输出面板中的 Kiro Agent 日志

#### 常见问题

**问题 1**: Kiro Agent 尝试自动配置 MCP 服务器
- **解决方案**: 确认 `kiroAgent.configureMCP` 设置为 `"Disabled"`
- **验证方法**: 检查 `.vscode/settings.json` 文件内容

**问题 2**: TypeScript 自动闭合标签仍然工作
- **解决方案**: 确认 `typescript.autoClosingTags` 设置为 `false`
- **验证方法**: 在 JSX/TSX 文件中输入 `<div>` 后按回车，应该不会自动添加 `</div>`
- **注意**: 某些扩展可能会覆盖此设置，检查用户设置是否有冲突配置

**问题 3**: 配置更改不生效
- **解决方案**: 重新加载 VS Code 窗口（Ctrl+Shift+P → "Developer: Reload Window"）
- **备选方案**: 完全重启 VS Code 应用程序

**问题 4**: JSX 标签编写体验不佳
- **原因**: 自动闭合标签已禁用，需要手动管理
- **解决方案**: 使用 VS Code 的内置快捷键或代码片段
- **推荐**: 安装 "Auto Rename Tag" 扩展来辅助标签管理

#### MCP (Model Context Protocol) 说明

**什么是 MCP**：
- MCP 是一个用于 AI 助手与外部工具和数据源交互的协议
- 允许 Kiro Agent 自动配置和管理外部服务连接
- 提供工具调用、资源访问等功能

**为什么禁用**：
1. **项目特定需求** - 当前项目不需要复杂的外部工具集成
2. **安全考虑** - 手动管理连接提供更好的安全控制
3. **开发简化** - 减少不必要的自动化配置，专注于核心功能开发
4. **团队一致性** - 确保所有开发者使用相同的工具配置

**如果需要启用 MCP**：
```json
{
    "kiroAgent.configureMCP": "Enabled"
}
```

**启用后的功能**：
- 自动发现和配置 MCP 服务器
- 动态工具加载和管理
- 增强的 AI 助手功能

#### TypeScript 自动闭合标签详解

**为什么禁用自动闭合标签**：

1. **JSX/TSX 开发体验** - 在 React 组件开发中，自动闭合标签可能会：
   - 在不需要的地方插入闭合标签
   - 干扰复杂的 JSX 结构编写
   - 与其他扩展功能冲突

2. **代码控制精度** - 手动管理标签提供：
   - 更精确的代码结构控制
   - 避免意外的标签插入
   - 更好的代码可读性

3. **团队开发一致性** - 确保所有开发者使用相同的编辑行为

**实际影响示例**：

```tsx
// 禁用自动闭合标签后的编写体验
function MyComponent() {
  return (
    <div className="container">
      <h1>标题</h1>  {/* 需要手动闭合 */}
      <p>内容      {/* 需要手动闭合 */}
    </div>
  );
}
```

**推荐的替代方案**：
- 使用 **Emmet** 快捷键（内置于 VS Code）
- 安装 **Auto Rename Tag** 扩展
- 使用代码片段（snippets）快速生成标签结构

**如果您更喜欢自动闭合标签**：
```json
// 在用户设置中覆盖
{
    "typescript.autoClosingTags": true
}
```

## 项目结构

```
.vscode/
├── settings.json          # 工作区设置
└── extensions.json        # 推荐扩展（如果需要）
```

## 配置最佳实践

1. **团队一致性**: 项目配置确保团队成员使用相同的开发环境
2. **版本控制**: `.vscode/settings.json` 应该提交到版本控制系统
3. **文档同步**: 配置变更时及时更新文档
4. **灵活性**: 允许开发者在用户设置中覆盖项目设置

## 📋 配置变更日志

### 2024年12月15日 - 最新更新
- ✅ **新增 TypeScript 配置** - 添加 `typescript.autoClosingTags: false` 设置
- ✅ **保持 Kiro Agent MCP 配置** - 维持 `kiroAgent.configureMCP: "Disabled"` 设置
- 📝 **文档同步** - 更新开发环境配置文档以反映最新设置
- 🔧 **编辑器优化** - 禁用自动闭合标签以改善 JSX/TSX 开发体验
- 📋 **配置完善** - 为团队提供统一的 TypeScript 开发环境

### 配置验证清单
- [x] Kiro Agent MCP 功能已禁用
- [x] TypeScript 自动闭合标签已禁用
- [x] 配置文件格式正确（有效的 JSON）
- [x] 文档说明与实际配置一致
- [x] 故障排除指南完整
- [x] JSX/TSX 开发体验优化

---

*最后更新：2024年12月15日 - 验证配置同步状态*