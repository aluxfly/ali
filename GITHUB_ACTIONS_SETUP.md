# GitHub Actions 自动更新配置指南

## 📋 概述

本文档说明如何配置 GitHub Actions 实现项目雷达数据的自动更新。

## 🎯 功能特性

- ✅ **手动触发**：点击网站"🔄 更新数据"按钮触发
- ✅ **定时触发**：每天自动更新（可配置时间）
- ✅ **自动部署**：更新后自动部署到 GitHub Pages
- ✅ **状态轮询**：前端自动检测更新完成并刷新

---

## 🔧 配置步骤

### 步骤 1：创建 GitHub Personal Access Token

1. 访问 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 或直接访问：https://github.com/settings/tokens

2. 点击 "Generate new token (classic)"

3. 配置 Token 权限：
   ```
   ✅ repo (Full control of private repositories)
      ✅ repo:status
      ✅ repo_deployment
      ✅ public_repo
   ✅ workflow (Update GitHub Action workflows)
   ✅ admin:repo_hook (如果使用 webhook)
   ```

4. 生成 Token 并**立即复制保存**（只会显示一次）
   - 示例：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 步骤 2：配置 GitHub Secrets

#### 方式 A：使用环境变量（推荐用于本地测试）

在 `server.js` 所在机器设置环境变量：

```bash
# Linux/Mac
export GITHUB_OWNER=aluxfly
export GITHUB_REPO=ali
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Windows (PowerShell)
$env:GITHUB_OWNER="aluxfly"
$env:GITHUB_REPO="ali"
$env:GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### 方式 B：在 GitHub 仓库设置 Secrets（用于其他集成）

1. 访问仓库 Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加以下 Secrets：
   ```
   Name: GITHUB_TOKEN
   Value: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   
   Name: GITHUB_OWNER
   Value: aluxfly
   
   Name: GITHUB_REPO
   Value: ali
   ```

### 步骤 3：配置前端（可选）

如果需要在**纯静态模式**下使用（不依赖后端服务），可以：

1. 编辑 `index.html`
2. 找到 `GITHUB_CONFIG` 对象
3. 填入你的 Token：

```javascript
const GITHUB_CONFIG = {
  owner: 'aluxfly',
  repo: 'ali',
  workflowId: 'update-data.yml',
  token: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' // ⚠️ 注意：这会暴露 token
};
```

> ⚠️ **安全警告**：将 Token 硬编码在前端会暴露给所有访问者，仅用于测试！生产环境应使用后端代理模式。

### 步骤 4：验证工作流权限

确保 GitHub Actions 有权限：

1. 访问仓库 Settings → Actions → General
2. 确认 "Workflow permissions" 设置为：
   ```
   ✅ Read and write permissions
   ✅ Allow GitHub Actions to create and approve pull requests
   ```

---

## 🚀 使用方式

### 方式 1：网站按钮触发

1. 访问项目雷达网站：https://aluxfly.github.io/ali/
2. 点击右上角 "🔄 更新数据" 按钮
3. 等待提示"更新任务已触发"
4. 自动轮询检测更新完成（最长 5 分钟）
5. 页面自动刷新显示最新数据

### 方式 2：GitHub UI 手动触发

1. 访问 https://github.com/aluxfly/ali/actions
2. 选择 "🔄 自动更新项目数据" 工作流
3. 点击 "Run workflow" 按钮
4. 选择分支（main）
5. 点击 "Run workflow"

### 方式 3：curl 命令触发

```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  https://api.github.com/repos/aluxfly/ali/actions/workflows/update-data.yml/dispatches \
  -d '{"ref":"main","inputs":{"trigger_source":"curl"}}'
```

### 方式 4：定时自动触发

工作流已配置每天 00:00 UTC（北京时间 08:00）自动运行。

修改 `.github/workflows/update-data.yml` 中的 cron 表达式可调整时间：

```yaml
schedule:
  - cron: '0 0 * * *'  # 每天 00:00 UTC
```

Cron 表达式参考：https://crontab.guru/

---

## 📁 文件清单

```
project-radar/
├── .github/
│   └── workflows/
│       └── update-data.yml      # GitHub Actions 工作流配置
├── index.html                    # 前端页面（含更新按钮）
├── server.js                     # 后端服务（含代理 API）
├── crawl_sgcc.py                 # 爬虫脚本
├── requirements.txt              # Python 依赖
└── GITHUB_ACTIONS_SETUP.md       # 本配置文档
```

---

## 🔍 故障排查

### 问题 1：按钮点击无反应

**检查**：
- 浏览器控制台是否有错误
- 是否配置了正确的 GitHub 仓库信息
- 网络请求是否被 CORS 阻止

**解决**：
- 使用后端代理模式（默认）
- 检查 server.js 是否正常运行

### 问题 2：GitHub API 返回 401/403

**原因**：Token 无效或权限不足

**解决**：
1. 验证 Token 是否过期或被撤销
2. 确认 Token 有 `repo` 和 `workflow` 权限
3. 重新生成 Token 并更新配置

### 问题 3：工作流运行失败

**检查**：
1. 访问 https://github.com/aluxfly/ali/actions
2. 查看失败的工作流运行日志
3. 常见错误：
   - Python 依赖安装失败 → 检查 `requirements.txt`
   - Playwright 浏览器安装失败 → 检查缓存路径
   - 爬虫执行错误 → 检查目标网站是否可访问

### 问题 4：数据未自动部署到 GitHub Pages

**检查**：
1. 确认仓库已启用 GitHub Pages
2. 检查 Pages 设置：Settings → Pages → Source
3. 确认部署分支为 `gh-pages`

**解决**：
```bash
# 手动触发一次部署
git push origin main --force
```

---

## 🔐 安全建议

1. **不要**将 Personal Access Token 提交到代码仓库
2. **不要**在前端代码中硬编码 Token（生产环境）
3. 使用 GitHub Secrets 管理敏感信息
4. 定期轮换 Token（建议每 90 天）
5. 限制 Token 权限到最小必要范围

---

## 📊 监控与日志

### 查看工作流运行状态

- GitHub Actions: https://github.com/aluxfly/ali/actions
- 筛选工作流："🔄 自动更新项目数据"

### 查看部署状态

- GitHub Pages: https://github.com/aluxfly/ali/deployments
- 网站访问：https://aluxfly.github.io/ali/

### 查看数据文件

- 数据文件：https://raw.githubusercontent.com/aluxfly/ali/gh-pages/data/projects.json
- 最后更新时间：网站左上角 "🕐 更新于：..."

---

## 📞 支持

如有问题，请：
1. 查看本文档的故障排查部分
2. 检查 GitHub Actions 运行日志
3. 联系技术团队

---

**最后更新**: 2026-04-06
**版本**: v1.0
