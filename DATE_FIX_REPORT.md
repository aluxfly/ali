# 发布日期字段修复报告

## 问题描述

用户反馈：网站显示的发布日期与原网页实际日期不符。

**问题原因**：爬虫代码中的日期提取逻辑存在严重缺陷。

### 原始代码问题

```python
# 提取日期（从标题末尾或链接中）
publish_date = ''
date_parts = text.split()
if date_parts and len(date_parts[-1]) == 10 and date_parts[-1].count('-') == 2:
    publish_date = date_parts[-1]
    text = ' '.join(date_parts[:-1]).strip()

# 如果没有从标题提取到日期，使用今天
if not publish_date:
    publish_date = datetime.now().strftime('%Y-%m-%d')  # ❌ 问题所在
```

**问题**：当无法从标题中提取日期时，爬虫使用当前日期（`datetime.now()`）作为发布日期，导致所有项目都显示为爬取当天的日期。

### 修复前数据示例

```json
{
  "title": "【宿州明丽电力有限公司】国网安徽电力宿州供电公司 2026 年原集体企业第二次服务公开招标采购",
  "publish_date": "2026-04-05"  // 所有项目都是今天
}
```

## 修复方案

### 1. 添加日期解析函数

```python
def parse_date(date_str):
    """解析日期字符串，支持多种格式"""
    formats = [
        '%Y-%m-%d',      # 2024-01-15
        '%Y/%m/%d',      # 2024/01/15
        '%Y 年%m 月%d日',   # 2024 年 01 月 15 日
        '%Y.%m.%d',      # 2024.01.15
        '%m-%d',         # 01-15 (需要补全年份)
        '%m/%d',         # 01/15
    ]
    
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            if fmt in ['%m-%d', '%m/%d']:
                dt = dt.replace(year=datetime.now().year)
            return dt.strftime('%Y-%m-%d')
        except ValueError:
            continue
    
    return ''
```

### 2. 从 DOM 元素提取日期

使用 JavaScript 获取链接所在列表项的完整文本，然后从中提取日期：

```python
# 使用 JavaScript 获取父元素的完整文本
js_code = '''el => {
    let parent = el.parentElement;
    while (parent && parent.tagName !== "LI" && parent.tagName !== "DIV" && parent.tagName !== "UL") {
        parent = parent.parentElement;
    }
    return parent ? parent.innerText : "";
}'''
parent_text = link.evaluate(js_code)

# 从父元素文本中提取日期
date_patterns = [
    r'(\d{4}-\d{2}-\d{2})',      # 2024-01-15
    r'(\d{4}/\d{2}/\d{2})',      # 2024/01/15
    r'(\d{4}年\d{2}月\d{2}日)',   # 2024 年 01 月 15 日
]
for pattern in date_patterns:
    match = re.search(pattern, parent_text)
    if match:
        parsed = parse_date(match.group(1))
        if parsed:
            publish_date = parsed
            break
```

### 3. 不再使用当前日期作为默认值

```python
project = {
    'title': text,
    'link': full_url,
    'publish_date': publish_date if publish_date else '',  # ✅ 保留空字符串而不是使用今天
    ...
}
```

## 修复后数据

### 日期分布

| 发布日期 | 项目数量 |
|---------|---------|
| 2026-04-04 | 14 |
| 2026-04-03 | 47 |
| **总计** | **61** |

### 修复后数据示例

```json
{
  "title": "【轻量化采购】【新疆新能电网建设服务有限公司】新疆信息产业有限责任公司 2026 年第三批二次竞价项目成交公告",
  "publish_date": "2026-04-04"  // ✅ 正确的日期
}
```

```json
{
  "title": "【宿州明丽电力有限公司】国网安徽电力宿州供电公司 2026 年原集体企业第二次服务公开招标采购",
  "publish_date": "2026-04-03"  // ✅ 正确的日期
}
```

## 修改的文件

1. **crawl_sgcc.py** - 爬虫主文件
   - 添加 `parse_date()` 函数支持多种日期格式
   - 修改 `crawl_list_page()` 函数从 DOM 元素提取日期
   - 移除使用当前日期作为默认值的逻辑

2. **data/projects.json** - 项目数据
   - 重新爬取，包含正确的发布日期

## 部署状态

✅ 已推送到 GitHub Pages
- 网站 URL: https://aluxfly.github.io/ali/
- 部署时间：2026-04-05 18:XX
- Git 提交：2dd3734

## 验证步骤

1. 访问网站：https://aluxfly.github.io/ali/
2. 检查项目列表中的发布日期
3. 对比原网页：https://sgccetp.com.cn/portal/
4. 确认日期显示正确

## 后续建议

1. **添加日期验证**：在爬取后验证日期是否合理（不应晚于当前日期）
2. **添加日志**：记录日期提取失败的项目，便于调试
3. **定期监控**：检查网站结构变化，确保日期提取逻辑持续有效
4. **异常处理**：对于无法提取日期的项目，标记为需要人工审核

---

**修复完成时间**：2026-04-05
**修复耗时**：约 20 分钟
