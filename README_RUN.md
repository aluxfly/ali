# 国家电网 ECP 平台爬虫 - 运行说明

## 快速开始

### 1. 安装依赖

```bash
# 进入项目目录
cd /home/admin/.openclaw/workspace-technician/projects/project-radar

# 安装 Python 依赖
python3.11 -m pip install requests beautifulsoup4 lxml playwright

# 安装 Playwright 浏览器（需要系统依赖）
python3.11 -m playwright install chromium
```

### 2. 系统依赖（Playwright 必需）

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2
```

**或者使用 Playwright 自动安装:**
```bash
python3.11 -m playwright install-deps chromium
```

### 3. 运行爬虫

```bash
# 爬取今日数据
python3.11 crawl_sgcc.py

# 爬取指定日期
python3.11 crawl_sgcc.py --date 2026-04-05

# 详细日志模式
python3.11 crawl_sgcc.py --verbose
```

### 4. 查看结果

```bash
# 查看 JSON 数据
cat data/projects_2026-04-05.json

# 查看 CSV 数据
cat data/projects_2026-04-05.csv

# 查看日志
cat logs/crawl_*.log
```

## 输出文件

### JSON 格式
```json
{
  "crawl_date": "2026-04-05",
  "crawl_time": "2026-04-05T13:30:00",
  "source": "https://ecp.sgcc.com.cn/",
  "total_count": 50,
  "projects": [
    {
      "title": "项目名称",
      "project_id": "SGCC-2026-001",
      "publish_date": "2026-04-05",
      "amount": "¥15,000,000",
      "region": "北京市",
      "link": "https://ecp.sgcc.com.cn/...",
      "deadline": "2026-04-20",
      "contact": "张先生 010-12345678",
      "description": "项目描述...",
      "source": "https://ecp.sgcc.com.cn",
      "crawl_time": "2026-04-05T13:30:00"
    }
  ]
}
```

### CSV 格式
```
标题，链接，发布日期，金额，地区，招标编号，截止时间，联系方式，描述
"国家电网有限公司 2026 年第一次物资公开招标采购","https://...","2026-04-05","¥15,000,000","北京市","SGCC-2026-001",...
```

## 技术说明

### 爬取模式

1. **Playwright 模式**（推荐）
   - 完整执行 JavaScript
   - 可以获取动态加载的内容
   - 需要安装浏览器依赖

2. **Requests 模式**（备用）
   - 仅获取静态 HTML
   - 适用于 SSR 网站
   - 对 SPA 网站效果有限

### 当前限制

由于国家电网 ECP 平台是 Angular 单页应用 (SPA)，内容通过 JavaScript 动态加载：

- **Playwright 可用时**: 尝试获取真实数据
- **Playwright 不可用时**: 生成示例数据用于演示

### 获取真实数据的步骤

1. **安装 Playwright 依赖**（见上方）
2. **确保网络可达**（某些环境可能需要代理）
3. **运行爬虫**

如果仍然无法获取真实数据，可能需要：

- 检查网站是否可访问
- 查看日志文件了解详细错误
- 考虑使用代理或 VPN

## 定时任务

### 使用 cron

```bash
# 编辑 crontab
crontab -e

# 添加每日执行任务（每天早上 9 点）
0 9 * * * cd /home/admin/.openclaw/workspace-technician/projects/project-radar && python3.11 crawl_sgcc.py >> logs/cron.log 2>&1
```

### 使用 systemd timer

创建服务文件 `/etc/systemd/system/sgcc-crawler.service`:
```ini
[Unit]
Description=SGCC ECP Crawler
After=network.target

[Service]
Type=oneshot
User=admin
WorkingDirectory=/home/admin/.openclaw/workspace-technician/projects/project-radar
ExecStart=/home/admin/.openclaw/workspace-venv/bin/python3.11 crawl_sgcc.py
```

创建定时器文件 `/etc/systemd/system/sgcc-crawler.timer`:
```ini
[Unit]
Description=Run SGCC Crawler Daily
Requires=sgcc-crawler.service

[Timer]
OnCalendar=*-*-* 09:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

启用定时器:
```bash
sudo systemctl enable --now sgcc-crawler.timer
```

## 故障排除

### Playwright 无法启动浏览器

**错误**: `libatk-1.0.so.0: cannot open shared object file`

**解决**: 安装系统依赖（见上方）

### 获取到的数据为空

1. 检查网站是否可访问
2. 查看详细日志：`cat logs/crawl_*.log`
3. 尝试使用 `--verbose` 模式
4. 检查是否需要代理

### 被网站封禁（403/429）

1. 增加请求延迟（修改 `REQUEST_DELAY` 配置）
2. 使用代理池
3. 降低爬取频率

## 配置选项

在 `crawl_sgcc.py` 中修改以下配置：

```python
# 请求间隔（秒）
REQUEST_DELAY = 2

# 最大重试次数
MAX_RETRIES = 3

# 重试延迟（秒）
RETRY_DELAY = 2
```

## 数据使用

**重要**: 请遵守以下规则：

1. 仅用于合法目的
2. 遵守网站服务条款
3. 不要用于商业转售
4. 控制爬取频率，避免影响网站正常运行
5. 遇到 403/429 错误立即停止

## 联系支持

如有问题，请查看：

- 网站分析文档：`SGCC_ECP_ANALYSIS.md`
- 日志文件：`logs/crawl_*.log`
- 示例数据：`data/projects_*.json`
