# 开发环境 MCP 配置更新指南

## 📋 MCP 配置启用说明

**更新时间**: 2024年12月16日  
**配置变更**: Kiro Agent MCP 从禁用改为启用  
**影响范围**: 开发环境、工具集成、AI 辅助功能

## 🤖 MCP (Model Context Protocol) 简介

### 什么是 MCP？
Model Context Protocol (MCP) 是一个开放协议，用于连接 AI 助手与各种工具和数据源。它为 AI 系统提供了标准化的方式来访问和操作外部资源。

### 核心功能
- **工具集成**: 连接文件系统、数据库、API 等各种工具
- **数据访问**: 安全地访问本地和远程数据源
- **自动化流程**: 支持复杂的自动化开发和部署流程
- **上下文感知**: 提供基于项目上下文的智能辅助

## 🔧 配置变更详情

### VS Code 配置更新
**文件**: `.vscode/settings.json`

```json
{
    "kiroAgent.configureMCP": "Enabled",  // 从 "Disabled" 改为 "Enabled"
    "typescript.autoClosingTags": false
}
```

### 启用的功能
1. **自动 MCP 服务器发现**: Kiro Agent 将自动发现和配置可用的 MCP 服务器
2. **智能工具集成**: 自动连接到相关的开发工具和服务
3. **配置管理**: 自动管理 MCP 服务器的配置和更新
4. **错误处理**: 自动处理 MCP 连接错误和配置问题

## 📁 MCP 配置文件结构

### 项目级配置
**文件位置**: `.kiro/settings/mcp.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": ["read_file", "list_directory"]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "."],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": ["git_status", "git_log"]
    }
  }
}
```

### 用户级配置
**文件位置**: `~/.kiro/settings/mcp.json`

```json
{
  "mcpServers": {
    "global-tools": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everything"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## 🛠️ 常用 MCP 服务器

### 文件系统服务器
```json
{
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"],
    "description": "提供文件系统访问功能"
  }
}
```

### Git 服务器
```json
{
  "git": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "."],
    "description": "提供 Git 仓库操作功能"
  }
}
```

### 数据库服务器
```json
{
  "database": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres", "--connection-string", "postgresql://..."],
    "description": "提供数据库访问功能"
  }
}
```

### Web 搜索服务器
```json
{
  "web-search": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-brave-search"],
    "env": {
      "BRAVE_API_KEY": "your-api-key"
    },
    "description": "提供网络搜索功能"
  }
}
```

## 🚀 使用指南

### 1. 验证 MCP 配置
```bash
# 检查 VS Code 配置
cat .vscode/settings.json

# 检查项目 MCP 配置
cat .kiro/settings/mcp.json

# 检查用户 MCP 配置
cat ~/.kiro/settings/mcp.json
```

### 2. 重新加载 VS Code
```
Ctrl+Shift+P → "Developer: Reload Window"
```

### 3. 测试 MCP 功能
- 尝试使用 Kiro Agent 的文件操作功能
- 测试 Git 相关的 AI 辅助功能
- 验证自动配置是否正常工作

### 4. 查看 MCP 日志
```bash
# 查看 Kiro Agent 日志（具体路径可能不同）
tail -f ~/.kiro/logs/agent.log

# 查看 MCP 服务器日志
# 日志位置取决于具体的 MCP 服务器配置
```

## 🔒 安全配置

### 权限控制
```json
{
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "./src", "./docs"],
    "autoApprove": ["read_file", "list_directory"],
    "description": "只允许访问 src 和 docs 目录"
  }
}
```

### 环境变量管理
```json
{
  "secure-server": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-secure"],
    "env": {
      "API_KEY": "${API_KEY}",  // 从环境变量读取
      "LOG_LEVEL": "ERROR"
    }
  }
}
```

### 自动批准设置
```json
{
  "autoApprove": [
    "read_file",      // 自动批准文件读取
    "list_directory", // 自动批准目录列表
    "git_status"      // 自动批准 Git 状态查询
  ]
}
```

## 🛠️ 故障排除

### 常见问题

#### 1. MCP 服务器无法启动
**症状**: Kiro Agent 报告 MCP 服务器连接失败

**解决方案**:
```bash
# 检查 Node.js 和 npm 版本
node --version
npm --version

# 手动安装 MCP 服务器
npx -y @modelcontextprotocol/server-filesystem

# 检查网络连接
ping registry.npmjs.org
```

#### 2. 权限错误
**症状**: MCP 服务器报告权限不足

**解决方案**:
```bash
# 检查文件权限
ls -la .kiro/settings/

# 修复权限
chmod 644 .kiro/settings/mcp.json
```

#### 3. 配置文件语法错误
**症状**: MCP 配置无法加载

**解决方案**:
```bash
# 验证 JSON 语法
cat .kiro/settings/mcp.json | jq .

# 使用配置模板重新创建
cp docs/mcp-config-template.json .kiro/settings/mcp.json
```

### 调试技巧

#### 启用详细日志
```json
{
  "mcpServers": {
    "debug-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./"],
      "env": {
        "FASTMCP_LOG_LEVEL": "DEBUG",  // 启用详细日志
        "NODE_ENV": "development"
      }
    }
  }
}
```

#### 测试单个服务器
```bash
# 手动启动 MCP 服务器进行测试
npx -y @modelcontextprotocol/server-filesystem ./ --log-level DEBUG
```

## 📚 最佳实践

### 1. 配置管理
- **版本控制**: 将项目级 MCP 配置提交到版本控制
- **敏感信息**: 使用环境变量管理 API 密钥等敏感信息
- **文档维护**: 保持 MCP 配置文档的及时更新

### 2. 安全实践
- **最小权限**: 只授予 MCP 服务器必要的最小权限
- **定期审查**: 定期审查 MCP 服务器配置和权限
- **监控日志**: 监控 MCP 服务器的操作日志

### 3. 性能优化
- **按需启用**: 只启用项目需要的 MCP 服务器
- **资源监控**: 监控 MCP 服务器的资源使用情况
- **缓存策略**: 合理配置 MCP 服务器的缓存策略

### 4. 团队协作
- **统一配置**: 团队使用统一的 MCP 配置模板
- **培训支持**: 为团队成员提供 MCP 使用培训
- **文档共享**: 共享 MCP 配置和使用经验

## 🔄 配置模板

### 基础配置模板
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": ["read_file", "list_directory"]
    }
  }
}
```

### 完整配置模板
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./src", "./docs"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": ["read_file", "list_directory"]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "."],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": ["git_status", "git_log", "git_diff"]
    },
    "web-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}",
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": true,
      "autoApprove": []
    }
  }
}
```

## 📈 预期效果

### 开发体验改进
- 🤖 **智能代码建议**: 基于项目上下文的更准确代码建议
- 🔧 **自动化任务**: 自动化常见的开发任务和流程
- 📁 **文件操作**: 更智能的文件和目录操作
- 🔍 **代码搜索**: 更强大的代码搜索和分析功能

### 工具集成增强
- 📊 **数据访问**: 直接访问数据库和 API
- 🌐 **网络搜索**: 集成网络搜索功能
- 📝 **文档生成**: 自动生成和更新文档
- 🔄 **版本控制**: 增强的 Git 操作支持

## 🎯 后续步骤

### 立即行动
1. **重新加载 VS Code**: 使配置生效
2. **测试基础功能**: 验证 MCP 基础功能正常
3. **配置项目 MCP**: 根据项目需求配置 MCP 服务器
4. **团队通知**: 通知团队成员配置变更

### 短期计划
- [ ] 完善项目 MCP 配置
- [ ] 为团队提供 MCP 使用培训
- [ ] 建立 MCP 最佳实践文档
- [ ] 监控 MCP 性能影响

### 长期规划
- [ ] 建立企业级 MCP 配置管理
- [ ] 开发自定义 MCP 服务器
- [ ] 集成更多第三方工具
- [ ] 建立 MCP 安全审计流程

---

**文档版本**: 1.0  
**最后更新**: 2024年12月16日  
**适用版本**: Kiro Agent 最新版本  
**维护状态**: 活跃维护

*此指南详细说明了 MCP 配置启用后的使用方法和最佳实践，帮助开发团队充分利用 MCP 功能提升开发效率。*