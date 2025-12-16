# GitHub 自动部署设置指南

## 当前状态
- ✅ 本地部署成功：https://abbdc353.qrcode-style.pages.dev
- 📝 使用本地代码直接上传

## 设置 GitHub 自动部署

### 1. 推送代码到 GitHub
```bash
git add .
git commit -m "配置 Cloudflare Pages 静态导出"
git push origin main
```

### 2. 在 Cloudflare Dashboard 中连接 GitHub
1. 访问 [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
2. 选择项目 `qrcode-style`
3. 进入 Settings > Source
4. 连接 GitHub 仓库
5. 选择分支（通常是 `main`）

### 3. 配置构建设置
- **构建命令**: `npm run build`
- **构建输出目录**: `out`
- **Node.js 版本**: `18` 或 `20`

### 4. 环境变量（如果需要）
在 Cloudflare Pages 设置中添加必要的环境变量。

## 自动部署的优势
- 🔄 每次推送代码自动部署
- 📊 部署历史记录
- 🌿 分支预览功能
- 🔒 更安全的部署流程

## 当前部署信息
- **最新部署**: https://abbdc353.qrcode-style.pages.dev
- **部署方式**: 本地 wrangler 命令
- **文件数量**: 92 个文件（56 个已存在）
- **部署时间**: 2.10 秒