# 项目雷达 MVP - 国家电网招标数据爬虫

## 📋 项目简介

项目雷达是一个最小可行产品 (MVP)，用于爬取和展示国家电网电子商务平台 (ECP) 的招标公告数据。

**核心功能**:
- ✅ 爬取国家电网招标项目数据
- ✅ 展示项目列表（标题、金额、地区、日期）
- ✅ 基础筛选（按地区/金额/关键词）
- ✅ 项目详情查看
- ✅ 数据导出（CSV/JSON）

## 🚀 快速开始

### 环境要求

- Python 3.11+
- 依赖包：`requests`, `beautifulsoup4`, `lxml`
- 可选：`streamlit` (Web 界面)

### 安装依赖

```bash
cd /home/admin/.openclaw/workspace-technician/projects/project-radar

# 安装必要依赖
python3.11 -m pip install requests beautifulsoup4 lxml

# 可选：安装 Streamlit (Web 界面)
python3.11 -m pip install streamlit
```

### 运行爬虫

```bash
# 爬取今日数据
python3.11 crawl_sgcc.py

# 爬取指定日期
python3.11 crawl_sgcc.py --date 2026-04-05
```

### 查看数据

#### 方式 1: 命令行查看

```bash
# 查看今日数据
python3.11 view_projects.py

# 查看指定日期
python3.11 view_projects.py --date 2026-04-05

# 按地区筛选
python3.11 view_projects.py --region 北京

# 按金额筛选 (单位：元)
python3.11 view_projects.py --min-amount 1000000

# 查看项目详情
python3.11 view_projects.py --detail 1

# 显示统计信息
python3.11 view_projects.py --stats

# 导出数据
python3.11 view_projects.py --export csv
python3.11 view_projects.py --export json
```

#### 方式 2: Web 界面 (Streamlit)

```bash
# 启动 Web 应用
streamlit run app.py

# 在浏览器中访问 http://localhost:8501
```

## 📁 目录结构

```
project-radar/
├── crawl_sgcc.py      # 爬虫脚本
├── view_projects.py   # 数据查看器 (命令行)
├── app.py             # Web 应用 (Streamlit)
├── README.md          # 本文档
└── data/              # 数据存储目录
    ├── projects_2026-04-05.json
    └── projects_2026-04-05.csv
```

## 📊 数据字段

| 字段 | 说明 |
|------|------|
| title | 项目名称/标题 |
| project_id | 招标编号 |
| amount | 预算金额 |
| region | 所在地区 |
| publish_date | 发布日期 |
| link | 详情链接 |

## 🔧 命令行参数详解

### crawl_sgcc.py

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--date` | 爬取日期 (YYYY-MM-DD) | 今日 |
| `--output` | 输出目录 | ./data |

### view_projects.py

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--date` | 查看日期 | 今日 |
| `--region` | 按地区筛选 | 无 |
| `--keyword` | 关键词搜索 | 无 |
| `--min-amount` | 最低金额 | 无 |
| `--max-amount` | 最高金额 | 无 |
| `--detail` | 查看第 N 个项目详情 | 无 |
| `--all` | 显示全部项目 | 前 20 个 |
| `--export` | 导出格式 (csv/json) | 无 |
| `--stats` | 显示统计信息 | 无 |

## ⚠️ 注意事项

1. **网站反爬**: 国家电网 ECP 平台可能有反爬措施，如遇到访问限制请降低爬取频率
2. **数据更新**: 爬虫仅获取指定日期的数据，历史数据需要手动指定日期
3. **网络依赖**: 需要稳定的网络连接才能获取实时数据
4. **示例数据**: 如无法获取实时数据，系统会生成示例数据用于演示

## 🛠️ 技术栈

- **爬虫**: Python + requests + BeautifulSoup4
- **命令行**: Python argparse
- **Web 界面**: Streamlit
- **数据存储**: JSON + CSV

## 📝 开发日志

- 2026-04-05: MVP 版本交付
  - 完成爬虫脚本
  - 完成命令行查看器
  - 完成 Streamlit Web 应用
  - 支持数据导出

## 📞 使用示例

```bash
# 完整工作流示例
cd /home/admin/.openclaw/workspace-technician/projects/project-radar

# 1. 爬取今日数据
python3.11 crawl_sgcc.py

# 2. 查看数据摘要
python3.11 view_projects.py --stats

# 3. 筛选北京地区项目
python3.11 view_projects.py --region 北京

# 4. 导出筛选结果
python3.11 view_projects.py --region 北京 --export csv

# 5. 启动 Web 界面
streamlit run app.py
```

---

**项目雷达 MVP** - 快速交付，持续迭代 🚀
