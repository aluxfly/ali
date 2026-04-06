# 🚀 快速启动指南 - GitHub Actions 自动更新

> **5 分钟完成配置，实现一键自动更新**

---

## ⚡ 快速配置（3 步）

### 步骤 1：创建 GitHub Token（2 分钟）

1. 访问 https://github.com/settings/tokens
2. 点击 **"Generate new token (classic)"**
3. 填写备注：`project-radar-auto-update`
4. 勾选权限：
   - ✅ **repo** (Full control of private repositories)
   - ✅ **workflow** (Update GitHub Action workflows)
5. 点击 **"Generate token"**
6. **立即复制 Token**（格式：`ghp_xxxxxxxxxxxx`）

### 步骤 2：设置环境变量（1 分钟）

```bash
# 复制粘贴以下命令（替换 YOUR_TOKEN 为实际 Token）
export GITHUB_OWNER=aluxfly
export GITHUB_REPO=ali
export GITHUB_TOKEN=ghp_YOUR_TOKEN_HERE
```

### 步骤 3：启动服务并测试（2 分钟）

```bash
# 启动后端服务
cd /home/admin/.openclaw/workspace-technician/projects/project-radar
npm start

# 访问网站
# 本地：http://localhost:3000
# 线上：https://aluxfly.github.io/ali/

# 点击 "🔄 更新数据" 按钮测试
```

---

## ✅ 验证成功

### 网站显示
```
✅ 更新任务已触发
GitHub Actions 正在运行中...
查看运行状态 →
```

### GitHub Actions
访问 https://github.com/aluxfly/ali/actions

看到运行中的工作流：
```
🔄 自动更新项目数据  #123  ✓ 运行中
触发来源：website-button
```

### 数据更新
等待 2-5 分钟后：
- 工作流显示 ✅ 成功
- 网站自动刷新
- 左上角显示最新更新时间

---

## 🔧 常用操作

### 查看更新状态

```bash
# 查看最近一次工作流运行
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/repos/aluxfly/ali/actions/workflows/update-data.yml/runs?per_page=1
```

### 手动触发更新

**方式 1**: 网站按钮（推荐）
- 访问网站 → 点击 "🔄 更新数据"

**方式 2**: GitHub UI
- 访问 https://github.com/aluxfly/ali/actions
- 选择工作流 → Run workflow

**方式 3**: 命令行
```bash
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  https://api.github.com/repos/aluxfly/ali/actions/workflows/update-data.yml/dispatches \
  -d '{"ref":"main"}'
```

### 修改自动更新时间

编辑 `.github/workflows/update-data.yml`:
```yaml
schedule:
  - cron: '0 0 * * *'  # 修改这里
```

Cron 表达式参考：https://crontab.guru/

示例：
- `0 0 * * *` - 每天 00:00 UTC（北京 08:00）
- `0 12 * * *` - 每天 12:00 UTC（北京 20:00）
- `0 */6 * * *` - 每 6 小时

---

## 🐛 遇到问题？

### 按钮点击无反应
```bash
# 检查后端服务是否运行
curl http://localhost:3000/health

# 检查环境变量
echo $GITHUB_TOKEN
```

### GitHub API 报错 401
- Token 无效或过期
- 重新生成 Token 并更新环境变量

### 工作流运行失败
- 访问 https://github.com/aluxfly/ali/actions
- 点击失败的工作流查看日志
- 常见错误：
  - Python 依赖问题 → 检查 requirements.txt
  - 网络问题 → 检查爬虫是否可访问目标网站

### 数据未更新
- 检查 GitHub Pages 设置
- 确认 gh-pages 分支存在
- 手动触发一次部署

---

## 📞 获取帮助

- 📖 详细文档：`GITHUB_ACTIONS_SETUP.md`
- 📊 实现报告：`GITHUB_ACTIONS_IMPLEMENTATION_REPORT.md`
- 🧪 测试脚本：`./test_github_actions.sh`

---

**配置完成！** 🎉

现在你可以：
- ✅ 点击网站按钮自动更新数据
- ✅ 每天自动定时更新
- ✅ 在 GitHub Actions 查看运行历史

**下一步**: 访问网站测试按钮功能 → https://aluxfly.github.io/ali/
