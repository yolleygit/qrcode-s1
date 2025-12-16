# VS Code TypeScript 配置指南

## 📋 配置概述

本项目已配置 VS Code 的 TypeScript 自动闭合标签功能为禁用状态，以提供更精确的 JSX/TSX 开发控制。

## 🔧 当前配置

### 配置文件位置
```
.vscode/settings.json
```

### 配置内容
```json
{
    "kiroAgent.configureMCP": "Disabled",
    "typescript.autoClosingTags": false
}
```

## 🎯 配置说明

### `typescript.autoClosingTags: false`

**功能**: 禁用 TypeScript/JSX 文件中的自动闭合标签功能

**影响文件类型**:
- `.ts` - TypeScript 文件
- `.tsx` - TypeScript React 文件
- `.js` - JavaScript 文件（如果启用了 TypeScript 检查）
- `.jsx` - JavaScript React 文件

**配置原因**:
1. **精确控制**: 在复杂的 JSX 结构中，自动闭合标签可能在不合适的位置插入
2. **代码质量**: 开发者需要更加注意代码结构的完整性
3. **团队统一**: 确保所有开发者使用相同的编辑器行为
4. **避免冲突**: 减少与其他扩展功能的潜在冲突

## 💡 替代开发方法

禁用自动闭合标签后，推荐使用以下方法提高开发效率：

### 1. Emmet 快捷键 (VS Code 内置)

**基础语法**:
```
div>Tab          → <div></div>
span>Tab         → <span></span>
p>Tab            → <p></p>
```

**带类名**:
```
div.container>Tab    → <div className="container"></div>
span.text-lg>Tab     → <span className="text-lg"></span>
```

**带ID**:
```
div#header>Tab       → <div id="header"></div>
```

**嵌套结构**:
```
div.container>p.text>Tab → <div className="container"><p className="text"></p></div>
```

**多个元素**:
```
div*3>Tab            → <div></div><div></div><div></div>
li*5>Tab             → <li></li><li></li><li></li><li></li><li></li>
```

**兄弟元素**:
```
div+p>Tab            → <div></div><p></p>
```

### 2. React 特定的 Emmet

**React 组件**:
```
div.flex.items-center>Tab → <div className="flex items-center"></div>
```

**常用 React 结构**:
```
div.container>div.header+div.content+div.footer>Tab
```
生成:
```jsx
<div className="container">
  <div className="header"></div>
  <div className="content"></div>
  <div className="footer"></div>
</div>
```

### 3. 代码片段 (Snippets)

**推荐扩展**:
- "ES7+ React/Redux/React-Native snippets"
- "Simple React Snippets"

**常用片段**:
- `rfc` → React Function Component
- `rafce` → React Arrow Function Component with Export
- `useState` → useState Hook
- `useEffect` → useEffect Hook

### 4. 自定义代码片段

在 VS Code 中创建自定义片段：

1. 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (Mac)
2. 输入 "Configure User Snippets"
3. 选择 "typescriptreact.json"

**示例自定义片段**:
```json
{
  "React Component": {
    "prefix": "rcomp",
    "body": [
      "interface ${1:ComponentName}Props {",
      "  $2",
      "}",
      "",
      "export function ${1:ComponentName}({ $3 }: ${1:ComponentName}Props) {",
      "  return (",
      "    <div>$4</div>",
      "  );",
      "}"
    ],
    "description": "Create a React component with TypeScript"
  }
}
```

## 🚀 开发最佳实践

### 1. 使用 Emmet 的建议

**推荐做法**:
```jsx
// 使用 Emmet 快速生成结构
div.flex.items-center.gap-4>button.btn.btn-primary+span.text-sm>Tab
```

**避免做法**:
```jsx
// 不要依赖自动闭合，手动确保标签完整
<div className="flex items-center gap-4">
  <button className="btn btn-primary">
  // 忘记闭合标签会导致错误
```

### 2. 代码结构建议

**良好的结构**:
```jsx
export function MyComponent() {
  return (
    <div className="container">
      <header className="header">
        <h1>Title</h1>
      </header>
      <main className="content">
        <p>Content here</p>
      </main>
    </div>
  );
}
```

**使用 Emmet 生成**:
```
div.container>header.header>h1{Title}^main.content>p{Content here}
```

### 3. 调试技巧

**检查未闭合标签**:
1. VS Code 会在问题面板中显示语法错误
2. 使用 "Bracket Pair Colorizer" 扩展可视化括号匹配
3. 启用 "Auto Rename Tag" 扩展同步修改开闭标签

## 🔍 故障排除

### 常见问题

#### 1. Emmet 不工作
**解决方案**:
```json
// 在 settings.json 中添加
{
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  }
}
```

#### 2. 想要恢复自动闭合标签
**临时启用**:
1. 按 `Ctrl+Shift+P`
2. 输入 "Preferences: Open Settings (JSON)"
3. 临时修改: `"typescript.autoClosingTags": true`
4. 重新加载窗口

**永久启用** (不推荐):
修改 `.vscode/settings.json` 文件

#### 3. 与其他扩展冲突
**检查步骤**:
1. 禁用所有扩展
2. 逐个启用扩展测试
3. 找到冲突的扩展后查看其设置

### 性能优化

**建议设置**:
```json
{
  "typescript.autoClosingTags": false,
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.preferences.quoteStyle": "single"
}
```

## 📚 相关资源

### 官方文档
- [VS Code TypeScript 配置](https://code.visualstudio.com/docs/languages/typescript)
- [Emmet 官方文档](https://docs.emmet.io/)
- [VS Code 代码片段指南](https://code.visualstudio.com/docs/editor/userdefinedsnippets)

### 推荐扩展
- **ES7+ React/Redux/React-Native snippets** - React 代码片段
- **Auto Rename Tag** - 自动重命名配对标签
- **Bracket Pair Colorizer 2** - 括号配对着色
- **Prettier** - 代码格式化
- **ESLint** - 代码检查

### 学习资源
- [Emmet 速查表](https://docs.emmet.io/cheat-sheet/)
- [React TypeScript 最佳实践](https://react-typescript-cheatsheet.netlify.app/)

## 🎯 团队协作

### 配置同步
- 所有团队成员使用相同的 `.vscode/settings.json` 配置
- 新成员加入时会自动应用项目配置
- 配置变更通过版本控制同步

### 代码审查要点
1. 检查 JSX 标签是否正确闭合
2. 验证组件结构的完整性
3. 确保使用了一致的代码风格

### 培训建议
1. 新团队成员培训 Emmet 使用
2. 分享常用代码片段
3. 定期更新开发最佳实践

---

*配置指南最后更新: 2024年12月16日*  
*配置状态: ✅ 已生效*  
*维护者: QR Master 开发团队*