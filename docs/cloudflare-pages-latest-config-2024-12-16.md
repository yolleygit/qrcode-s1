# Cloudflare Pages 最新配置指南 - 2024年12月16日

## 📋 基于最新文档的配置

**参考文档**: Cloudflare Developer Platform 最新文档  
**更新时间**: 2024年12月16日  
**适用项目**: Next.js 静态导出项目

## 🎯 关键发现

### @cloudflare/next-on-pages 已废弃
- **状态**: 已废弃 (deprecated)
- **官方建议**: 使用 OpenNext adapter 替代
- **静态项目**: 不需要任何适配器

### 静态导出项目的正确配置

**你的项目特点**:
```javascript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',  // 👈 静态导出模式
  distDir: 'out',    // 👈 输出目录
  // ...
};
```

## ✅ 正确的 Cloudflare Pages 配置

### 1. 控制台设置

**在 Cloudflare Pages 控制台中**:
```yaml
Production branch: main
Build command: npm run build
Build directory: out
Deploy command: [留空 - 重要！]
```

**关键点**:
- ❌ 不要设置 Deploy command
- ❌ 不要使用 `npx wrangler deploy`
- ✅ Cloudflare Pages 自动处理静态文件部署

### 2. 项目文件配置

**需要的文件**:
```
项目根目录/
├── _headers          # 安全头配置
├── _redirects        # 路由重定向
├── _routes.json      # 静态资源优化 (新增)
└── package.json      # 无需 @cloudflare/next-on-pages
```

**不需要的文件**:
```
❌ wrangler.toml      # 静态站点不需要
❌ @cloudflare/next-on-pages 依赖
```

## 🔧 文件配置详解

### _routes.json (性能优化)
```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": [
    "/favicon.ico",
    "/_next/static/*",
    "/images/*",
    "/*.png", "/*.jpg", "/*.jpeg", "/*.gif", "/*.svg",
    "/*.ico", "/*.css", "/*.js"
  ]
}
```

**作用**:
- 静态资源直接从 CDN 提供
- 避免不必要的 Worker 调用
- 提升性能，降低成本

### _headers (安全配置)
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### _redirects (路由配置)
```
/ /zh 302
/en/* /en/:splat 200
/zh/* /zh/:splat 200
/* /zh/404 404
```

## 🚀 部署流程

### 正确的部署流程
```
1. 代码推送到 GitHub
   ↓
2. Cloudflare Pages 自动检测
   ↓
3. 执行构建命令: npm run build
   ↓
4. 生成静态文件到 out/ 目录
   ↓
5. 自动部署到全球 CDN
   ↓
6. 网站上线 ✅
```

### 错误的流程 (之前的问题)
```
1-4. 正常构建 ✅
   ↓
5. 尝试执行 npx wrangler deploy ❌
   ↓
6. 失败：不兼容的命令
```

## 📊 性能优化效果

### 使用 _routes.json 的好处
- **CDN 直接服务**: 静态资源不经过 Worker
- **降低延迟**: 减少处理时间
- **节省成本**: 减少 Worker 调用次数
- **提升性能**: 更快的资源加载

### 对比数据
```
优化前:
- 每个静态资源都调用 Worker
- 增加延迟和成本

优化后:
- 静态资源直接从 CDN 提供
- 只有动态路由才调用 Worker (你的项目没有)
```

## 🛠️ 故障排除

### 常见问题

**Q: 为什么还是显示 "npx wrangler deploy" 错误？**
A: 需要在 Cloudflare Pages 控制台中删除 Deploy command 设置

**Q: 静态站点需要 wrangler.toml 吗？**
A: 不需要。只有使用 Workers 或 Functions 的项目才需要

**Q: @cloudflare/next-on-pages 什么时候用？**
A: 只有使用 Next.js 服务器端功能 (SSR, API Routes) 时才需要，静态导出不需要

### 检查清单

部署前检查:
- [ ] 移除 @cloudflare/next-on-pages 依赖
- [ ] 删除 wrangler.toml 文件
- [ ] 添加 _routes.json 优化配置
- [ ] 在控制台中清空 Deploy command
- [ ] 确认 Build directory 设置为 "out"

## 📚 参考资源

### 官方文档
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [静态资源路由优化](https://developers.cloudflare.com/pages/platform/functions/routing/)
- [Next.js 部署指南](https://developers.cloudflare.com/pages/framework-guides/)

### 最佳实践
- 静态导出项目使用 Pages，不使用 Workers
- 使用 _routes.json 优化性能
- 通过 Git 集成实现自动部署

## 🎯 总结

**你的项目配置**:
- ✅ 完美适合 Cloudflare Pages
- ✅ 静态导出模式正确
- ✅ 无需任何适配器或 Worker 配置
- ✅ 直接部署静态文件即可

**关键要点**:
1. 静态导出 ≠ 需要 @cloudflare/next-on-pages
2. Cloudflare Pages 原生支持静态文件
3. 性能优化通过 _routes.json 实现
4. 部署命令应该留空

---

**配置负责人**: 开发团队  
**配置类型**: Cloudflare Pages 静态站点优化  
**配置状态**: ✅ 已完成  
**预期效果**: 更快的部署和更好的性能

*此配置基于 Cloudflare 2024年最新文档，确保项目使用最佳实践和最优性能配置。*