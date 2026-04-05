# 国家电网 ECP 招标公告爬虫 - 运行说明

## 概述

本项目使用 Playwright 浏览器自动化技术爬取国家电网电子商务平台 (ECP) 的真实招标公告数据。

## 环境要求

### 系统依赖

已安装的依赖（Alibaba Cloud Linux 3）：
```bash
sudo yum install -y atk pango cairo libX11 libXcomposite libXdamage libXext libXfixes libXfixes libXrandr libXi libXtst libdrm libxcb libxkbcommon-x11 libxshmfence mesa-libgbm at-spi2-atk at-spi2-core alsa-lib
```

### Python 依赖

```bash
# 激活虚拟环境（如果有）
source /home/admin/.openclaw/workspace-technician/.venv/bin/activate

# 安装依赖
python3.11 -m pip install playwright beautifulsoup4 requests

# 安装 Playwright 浏览器
python3.11 -m playwright install chromium
```

## 使用方法

### 基本用法

```bash
cd /home/admin/.openclaw/workspace-technician/projects/project-radar

# 爬取今日数据
python3.11 crawl_sgcc.py

# 或爬取指定日期
python3.11 crawl_sgcc.py --date 2026-04-05

# 详细日志
python3.11 crawl_sgcc.py --verbose

# 限制爬取数量
python3.11 crawl_sgcc.py --max 50
```

### 输出文件

爬取完成后，数据保存在 `data/` 目录：

- `projects_YYYY-MM-DD.json` - JSON 格式数据
- `projects_YYYY-MM-DD.csv` - CSV 格式数据

日志文件保存在 `logs/` 目录：
- `crawl_YYYYMMDD_HHMMSS.log`

## 数据字段

每个招标公告包含以下字段：

| 字段 | 说明 |
|------|------|
| title | 招标公告标题 |
| link | 详情页面链接 |
| publish_date | 发布日期 |
| amount | 预算金额（如有） |
| region | 地区/省份 |
| project_id | 招标编号（如有） |
| deadline | 截止日期（如有） |
| contact | 联系方式（如有） |
| description | 项目类型描述 |
| source | 数据来源 |
| crawl_time | 爬取时间 |

## 示例数据

```json
{
  "title": "国网黑龙江电力七台河供电公司 2026 年第二次服务类框架协议授权竞争性谈判采购变更公告 1",
  "link": "https://ecp.sgcc.com.cn/#/list/...",
  "publish_date": "2026-04-04",
  "region": "国网黑龙江",
  "description": "采购, 公告, 谈判, 变更"
}
```

## 爬取的数据源

爬虫访问以下国家电网 ECP 平台页面：

1. 招标公告及投标邀请书
2. 采购公告
3. 中标（成交）结果公告

## 注意事项

1. **网络要求**：需要能够访问 https://ecp.sgcc.com.cn
2. **爬取频率**：建议不要过于频繁爬取，避免触发反爬机制
3. **数据时效**：爬取的数据为实时数据，每次运行结果可能不同
4. **浏览器依赖**：首次运行需要下载 Chromium 浏览器（约 100MB）

## 常见问题

### Playwright 浏览器无法启动

确保已安装所有系统依赖：
```bash
python3.11 -m playwright install-deps chromium
```

### 爬取速度慢

这是正常现象，因为需要等待页面 JavaScript 渲染完成。可以通过减少 `--max` 参数来限制爬取数量。

### 数据为空

检查网络连接，确认可以访问 https://ecp.sgcc.com.cn

## 技术实现

- **浏览器自动化**：使用 Playwright 控制 Chromium 浏览器
- **JavaScript 渲染**：等待页面动态内容加载完成
- **数据提取**：使用 JavaScript 评估器直接提取 DOM 数据
- **智能过滤**：自动过滤导航菜单项，只保留真实招标公告

## 更新日志

- **v4** (2026-04-05): 改进数据过滤，只提取带日期的真实招标公告
- **v3** (2026-04-05): 支持多个列表页面爬取
- **v2** (2026-04-05): 使用 Playwright 获取真实数据
- **v1** (2026-04-05): 初始版本，使用示例数据

## 联系

如有问题，请查看日志文件或联系项目维护者。
