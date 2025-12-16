# 端口配置说明

## 概述

QR Master 项目已将默认端口从 3000 更改为 3001，以避免与其他常见开发服务的端口冲突。

## 端口变更详情

### 变更内容
- **开发服务器端口**：从 3000 改为 3001
- **生产服务器端口**：从 3000 改为 3001
- **影响的命令**：`npm run dev` 和 `npm start`

### 变更原因
1. **避免端口冲突**：端口 3000 是许多 Node.js 应用的默认端口，容易产生冲突
2. **提高开发体验**：减少因端口占用导致的启动失败
3. **标准化配置**：为团队开发提供一致的端口配置

## 使用方法

### 开发环境
```bash
npm run dev
```
服务将在 `http://localhost:3001` 启动

### 生产环境
```bash
npm run build
npm start
```
服务将在 `http://localhost:3001` 启动

## 自定义端口

如果您需要使用其他端口，可以通过以下方式：

### 方法一：环境变量
```bash
# 开发环境使用端口 3000
PORT=3000 npm run dev

# 生产环境使用端口 8080
PORT=8080 npm start
```

### 方法二：修改 package.json
```json
{
  "scripts": {
    "dev": "next dev -p 您的端口号",
    "start": "next start -p 您的端口号"
  }
}
```

## 访问地址更新

### 主要页面
- **主页**：`http://localhost:3001`
- **中文版**：`http://localhost:3001/zh`
- **英文版**：`http://localhost:3001/en`

### 功能页面
- **TOTP 动态验证码**：`http://localhost:3001/totp`
- **加密二维码**：`http://localhost:3001/encrypted`（开发中）

## 部署注意事项

### 开发环境
- 确保端口 3001 未被其他服务占用
- 如有冲突，使用环境变量 `PORT` 指定其他端口

### 生产环境
- 在服务器部署时，建议使用环境变量配置端口
- 常见的生产端口：80（HTTP）、443（HTTPS）、8080、8000 等

### Docker 部署
如果使用 Docker，需要更新端口映射：
```dockerfile
# Dockerfile
EXPOSE 3001

# docker run 命令
docker run -p 3001:3001 qr-master
```

### Nginx 反向代理
如果使用 Nginx，需要更新配置：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 常见问题

### Q: 为什么要更改默认端口？
A: 端口 3000 是许多 Node.js 框架的默认端口，包括 Create React App、Express 等。使用 3001 可以避免开发时的端口冲突。

### Q: 如何检查端口是否被占用？
A: 
```bash
# macOS/Linux
lsof -i :3001

# Windows
netstat -ano | findstr :3001
```

### Q: 端口变更会影响现有的书签或链接吗？
A: 是的，如果您之前保存了 `localhost:3000` 的书签，需要更新为 `localhost:3001`。

### Q: 生产环境部署时需要注意什么？
A: 生产环境通常使用环境变量来配置端口，建议设置 `PORT` 环境变量而不是硬编码端口号。

## 相关文档

- [README.md](../README.md) - 项目主要文档
- [开发路线图](./development-roadmap.md) - 项目开发计划
- [TOTP 实现状态](./totp-implementation-status.md) - TOTP 功能状态

---

*最后更新：2024年12月 | 版本：v2.0.1*