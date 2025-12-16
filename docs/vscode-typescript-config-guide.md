# VS Code TypeScript 配置指南

## 📋 配置概述

本项目已禁用 VS Code 的 TypeScript 自动闭合标签功能，以提供更精确的 JSX/TSX 开发控制。

## ⚙️ 当前配置

```json
{
    "kiroAgent.configureMCP": "Disabled",
    "typescript.autoClosingTags": false
}
```

> **说明**: 当前配置已启用 `typescript.autoClosingTags: false`，这会禁用 TypeScript/JSX 文件中的自动闭合标签功能，提供更精确的代码控制。

## 🎯 配置目的

### 为什么禁用自动闭合标签？

1. **避免意外插入** - 在复杂的 JSX 结构中，自动闭合标签可能在不合适的位置插入
2. **提高代码质量** - 开发者需要更加注意代码结构的完整性
3. **减少语法错误** - 避免自动插入导致的标签不匹配问题
4. **统一团队体验** - 确保所有开发者使用相同的编辑行为

### 适用场景

- ✅ React 组件开发
- ✅ 复杂的 JSX 结构编写
- ✅ TypeScript + JSX 项目
- ✅ 需要精确控制标签结构的场景

## 🚀 替代开发方法

### 1. Emmet 快捷键（推荐）

VS Code 内置的 Emmet 功能提供了强大的快捷键支持：

```
div>Tab          → <div></div>
div.class>Tab    → <div className="class"></div>
div*3>Tab        → <div></div><div></div><div></div>
ul>li*3>Tab      → <ul><li></li><li></li><li></li></ul>
```

#### 常用 React Emmet 快捷键

```
// 基础标签
div>Tab                    → <div></div>
span>Tab                   → <span></span>
button>Tab                 → <button></button>

// 带类名
div.container>Tab          → <div className="container"></div>
button.btn.primary>Tab     → <button className="btn primary"></button>

// 带属性
input[type=text]>Tab       → <input type="text" />
img[src alt]>Tab           → <img src="" alt="" />

// 嵌套结构
div.card>h2+p>Tab          → <div className="card"><h2></h2><p></p></div>
ul.list>li.item*3>Tab      → <ul className="list"><li className="item"></li><li className="item"></li><li className="item"></li></ul>
```

### 2. 代码片段（Snippets）

#### 推荐扩展

安装 "ES7+ React/Redux/React-Native snippets" 扩展，提供丰富的 React 代码片段：

```
rfc>Tab     → React Function Component
rafce>Tab   → React Arrow Function Component with Export
useState>Tab → const [state, setState] = useState()
useEffect>Tab → useEffect(() => {}, [])
```

#### 自定义代码片段

在 VS Code 中创建自定义代码片段：

1. 按 `Ctrl+Shift+P`（Windows/Linux）或 `Cmd+Shift+P`（Mac）
2. 输入 "Configure User Snippets"
3. 选择 "typescriptreact.json"
4. 添加自定义片段

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

### 3. 手动编写（完全控制）

对于复杂的 JSX 结构，手动编写标签提供最大的控制权：

```tsx
// 复杂的条件渲染
{isLoading ? (
  <div className="loading">
    <Spinner />
    <p>加载中...</p>
  </div>
) : error ? (
  <div className="error">
    <ErrorIcon />
    <p>{error.message}</p>
    <button onClick={retry}>重试</button>
  </div>
) : (
  <div className="content">
    {data.map(item => (
      <ItemCard key={item.id} item={item} />
    ))}
  </div>
)}
```

## 🔧 开发最佳实践

### 1. 使用 Emmet 提高效率

```tsx
// 快速创建表单结构
form.form>div.field*3>label+input[type=text]>Tab

// 生成结果：
<form className="form">
  <div className="field">
    <label></label>
    <input type="text" />
  </div>
  <div className="field">
    <label></label>
    <input type="text" />
  </div>
  <div className="field">
    <label></label>
    <input type="text" />
  </div>
</form>
```

### 2. 利用 VS Code 的智能提示

- 输入 `<` 后会显示可用的 HTML 标签和 React 组件
- 使用 `Ctrl+Space` 触发智能提示
- 利用自动导入功能快速导入组件

### 3. 格式化和 Linting

确保使用 Prettier 和 ESLint 来保持代码格式一致：

```json
// .vscode/settings.json 中的其他推荐配置
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.quoteStyle": "single",
  "javascript.preferences.quoteStyle": "single"
}
```

## 🐛 故障排除

### 配置不生效？

1. **重新加载窗口**
   ```
   Ctrl+Shift+P → "Developer: Reload Window"
   ```

2. **检查用户设置**
   - 确保用户设置中没有覆盖项目配置
   - 检查 `settings.json` 文件是否正确

3. **验证配置**
   ```
   Ctrl+Shift+P → "Preferences: Open Settings (JSON)"
   ```
   确认配置已正确应用

### 仍然出现自动闭合标签？

1. 检查是否有其他扩展干扰
2. 暂时禁用所有扩展进行测试
3. 确认文件类型正确（.tsx, .jsx）

## 📚 相关资源

- [Emmet 官方文档](https://emmet.io/)
- [VS Code TypeScript 配置](https://code.visualstudio.com/docs/languages/typescript)
- [React 开发最佳实践](https://react.dev/learn)
- [ES7+ React Snippets 扩展](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)

## 📝 反馈和建议

如果在使用过程中遇到问题或有改进建议，请：

1. 检查本文档的故障排除部分
2. 查看项目的 GitHub Issues
3. 与团队成员讨论最佳实践

---

*最后更新: 2024年12月16日*  
*维护者: Kiro AI Assistant*  
*配置状态: ✅ 已应用并生效*