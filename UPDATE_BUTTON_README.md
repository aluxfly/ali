# 🔄 更新数据按钮功能说明

## 实现方案

采用 **方案 A：后端 API 服务**

### 架构设计

```
┌─────────────────┐     POST /api/update-data     ┌─────────────────┐
│   前端按钮      │ ───────────────────────────→  │  Node.js 服务器  │
│  (index.html)   │                               │   (server.js)   │
└─────────────────┘                               └────────┬────────┘
                                                          │
                                                          │ spawn
                                                          ↓
                                                 ┌─────────────────┐
                                                 │  Python 爬虫    │
                                                 │ (crawl_sgcc.py) │
                                                 └────────┬────────┘
                                                          │
                                                          │ 写入
                                                          ↓
                                                 ┌─────────────────┐
                                                 │  数据文件       │
                                                 │ (projects.json) │
                                                 └─────────────────┘
```

## 修改的文件

1. **index.html** - 添加更新数据按钮和相关功能
   - 在导航栏添加 "🔄 更新数据" 按钮
   - 添加按钮样式（绿色渐变，悬停效果）
   - 添加更新状态提示（Toast 通知）
   - 实现 `updateData()` JavaScript 函数

2. **server.js** (新增) - Node.js 后端服务
   - 提供 `/api/update-data` POST 接口
   - 执行 Python 爬虫脚本
   - 返回更新结果和状态

3. **package.json** (新增) - Node.js 项目配置
   - 定义项目依赖（express）
   - 提供启动脚本

## 使用方式

### 本地开发

1. **启动后端服务**
   ```bash
   cd /home/admin/.openclaw/workspace-technician/projects/project-radar
   npm start
   ```

2. **访问网站**
   - 打开浏览器访问：http://localhost:3000

3. **点击更新数据**
   - 点击右上角 "🔄 更新数据" 按钮
   - 等待爬虫执行（约 30-60 秒）
   - 页面自动刷新显示最新数据

### API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/api/data-status` | GET | 获取数据状态 |
| `/api/update-data` | POST | 执行数据更新 |

### 示例请求

```bash
# 检查数据状态
curl http://localhost:3000/api/data-status

# 触发数据更新
curl -X POST http://localhost:3000/api/update-data
```

## 部署状态

### 当前状态
- ✅ 后端服务已实现
- ✅ 前端按钮已添加
- ✅ API 接口已测试
- ⏳ 等待部署到生产环境

### 部署选项

#### 选项 1：本地服务器（推荐用于开发）
```bash
npm start
# 服务运行在 http://localhost:3000
```

#### 选项 2：部署到云平台（如 Railway/Render）
1. 将代码推送到 Git 仓库
2. 在云平台连接仓库
3. 设置启动命令：`npm start`
4. 配置环境变量（如需要）

#### 选项 3：Docker 部署
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 注意事项

1. **Python 环境**：确保系统已安装 Python 3.11 和 Playwright
2. **依赖安装**：首次运行需执行 `npm install`
3. **权限问题**：确保爬虫脚本有执行权限
4. **超时设置**：爬虫可能需要 30-60 秒，请耐心等待

## 故障排除

### 问题：点击按钮无反应
- 检查后端服务是否运行：`curl http://localhost:3000/health`
- 查看浏览器控制台错误信息

### 问题：更新失败
- 检查 Python 环境：`python3.11 --version`
- 检查 Playwright 安装：`python3.11 -m playwright --version`
- 查看服务器日志

### 问题：数据未更新
- 检查 `data/projects.json` 文件时间戳
- 查看爬虫执行日志
