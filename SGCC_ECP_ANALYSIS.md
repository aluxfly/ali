# 国家电网 ECP 平台网站分析报告

**分析日期**: 2026-04-05  
**目标网站**: https://ecp.sgcc.com.cn/

---

## 1. 网站概述

### 1.1 基本信息
- **网站名称**: 国家电网新一代电子商务平台
- **技术架构**: Angular 单页应用 (SPA)
- **服务器**: nginx
- **主要特征**: 
  - 前端路由 (hash 路由)
  - 动态内容加载
  - 需要 JavaScript 执行

### 1.2 HTML 结构分析
```html
<!doctype html>
<html lang="zh-CN">
<head>
  <title>国家电网新一代电子商务平台</title>
  <base href="">
  <!-- DevExtreme UI 框架 -->
  <link rel="stylesheet" href="assets/css/dx.common.css"/>
  <link rel="stylesheet" href="assets/css/dx.light.css"/>
  <!-- 加密相关 JS -->
  <script src="assets/js/encrytrans.js"></script>
  <script src="assets/js/EcpSecureRandom.js"></script>
  <script src="assets/js/SM.js"></script>
  <!-- 配置文件 -->
  <script src="assets/js/config.202603281612.js"></script>
</head>
<body>
  <app-root></app-root>
  <!-- Angular bundles -->
  <script src="inline.*.bundle.js"></script>
  <script src="polyfills.*.bundle.js"></script>
  <script src="main.*.bundle.js"></script>
</body>
</html>
```

---

## 2. 技术发现

### 2.1 前端框架
- **框架**: Angular (从 `app-root` 标签和 bundle 命名模式判断)
- **UI 库**: DevExtreme (dx.common.css, dx.light.css)
- **路由**: Hash 路由 (`#/path/to/page`)

### 2.2 安全机制
1. **加密传输**: 
   - `encrytrans.js` - 加密传输模块
   - `EcpSecureRandom.js` - 安全随机数生成
   - `SM.js` - 国密算法支持

2. **配置系统**:
   - 使用 `ECPCONFIG.ipMap` 存储后端服务地址
   - 动态获取内外网标识 (`innerflag`)

3. **访问控制**:
   - 需要特定的 Referer 和 User-Agent
   - 可能存在的 IP 白名单机制

### 2.3 API 接口推测

根据代码分析，可能的 API 模式：

```javascript
// 配置中的服务映射
ECPCONFIG.ipMap = {
  'ecp_wcm_core': 'https://[wcm-server]/wcm',
  // 其他服务...
}

// API 调用示例
$.ajax({
  type: "POST",
  url: ECPCONFIG.ipMap['ecp_wcm_core'] + "/index/getOuterSysUrl",
  async: false,
  success: function(resultdata) {
    // 处理响应
  }
});
```

---

## 3. 爬取挑战

### 3.1 主要障碍

| 障碍 | 描述 | 解决方案 |
|------|------|----------|
| SPA 架构 | 内容通过 JS 动态加载 | 使用浏览器自动化 (Playwright/Selenium) |
| 资源 404 | 直接访问 JS/CSS 返回 404 | 需要正确的 Referer 和会话 |
| 加密机制 | 使用国密算法加密 | 需要逆向加密逻辑或使用浏览器 |
| 配置动态 | 配置文件带时间戳 | 需要动态解析配置 |
| 可能的反爬 | 频率限制、IP 封禁 | 添加延迟、使用代理池 |

### 3.2 robots.txt
- 位置：`/robots.txt`
- 状态：404 (不存在)
- 含义：无明确的爬虫限制声明

---

## 4. 推荐技术方案

### 4.1 方案优先级

#### 方案 A: Playwright 浏览器自动化 (推荐)
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('https://ecp.sgcc.com.cn/')
    page.wait_for_load_state('networkidle')
    
    # 导航到招标公告页面
    page.click('a:has-text("招标公告")')
    page.wait_for_load_state('networkidle')
    
    # 提取数据
    data = page.evaluate('''() => {
        return Array.from(document.querySelectorAll('.notice-item')).map(item => ({
            title: item.querySelector('.title')?.textContent,
            date: item.querySelector('.date')?.textContent,
            link: item.querySelector('a')?.href
        }));
    }''')
```

**优点**: 
- 完整执行 JavaScript
- 绕过大部分反爬机制
- 可以拦截网络请求

**缺点**:
- 资源消耗较大
- 速度较慢

#### 方案 B: 逆向 API (高级)
1. 使用浏览器开发者工具捕获网络请求
2. 分析请求头、参数和响应格式
3. 模拟请求（可能需要处理加密）

#### 方案 C: 混合方案 (当前实现)
- 优先尝试直接 API 调用
- 失败时降级到浏览器自动化
- 添加缓存机制减少请求

---

## 5. 数据字段定义

### 5.1 招标公告字段

| 字段 | 类型 | 描述 | 示例 |
|------|------|------|------|
| title | string | 项目名称 | "国家电网有限公司 2026 年第一次物资公开招标采购" |
| project_id | string | 招标编号 | "SGCC-2026-001" |
| publish_date | string | 发布日期 | "2026-04-05" |
| amount | string | 预算金额 | "¥15,000,000" |
| region | string | 地区 | "北京市" |
| link | string | 详情链接 | "https://ecp.sgcc.com.cn/..." |
| deadline | string | 截止日期 | "2026-04-20" |
| contact | string | 联系方式 | "张先生 010-12345678" |
| description | string | 项目描述 | "..." |

### 5.2 输出格式
```json
{
  "crawl_date": "2026-04-05",
  "source": "https://ecp.sgcc.com.cn/",
  "total_count": 50,
  "projects": [
    {
      "title": "...",
      "project_id": "...",
      "publish_date": "...",
      "amount": "...",
      "region": "...",
      "link": "...",
      "deadline": "...",
      "contact": "...",
      "description": "..."
    }
  ]
}
```

---

## 6. 合规注意事项

### 6.1 遵守规则
1. **频率控制**: 请求间隔 1-3 秒
2. **User-Agent**: 使用正常浏览器标识
3. **robots.txt**: 虽然不存在，仍应遵守礼貌爬取原则
4. **数据使用**: 仅用于合法目的，不用于商业转售

### 6.2 风险规避
- 遇到 403/429 立即停止
- 不尝试绕过验证码
- 不批量下载附件
- 尊重网站服务条款

---

## 7. 后续工作

### 7.1 待完成
- [ ] 安装 Playwright 浏览器依赖
- [ ] 实现浏览器自动化爬取
- [ ] 添加数据去重逻辑
- [ ] 实现增量爬取
- [ ] 添加监控告警

### 7.2 优化方向
- 使用代理池避免 IP 封禁
- 实现分布式爬取提高速度
- 添加数据质量校验
- 对接数据库持久化存储

---

## 附录 A: 测试 URL 列表

```
# 主页
https://ecp.sgcc.com.cn/

# 可能的招标公告页面 (需要前端路由)
https://ecp.sgcc.com.cn/#/bidNotice/index
https://ecp.sgcc.com.cn/#/notice/index
https://ecp.sgcc.com.cn/#/portal/bidNotice/index

# ecp2.0 路径
https://ecp.sgcc.com.cn/ecp2.0/
```

## 附录 B: 请求头模板

```python
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Referer': 'https://ecp.sgcc.com.cn/',
}
```

---

**报告生成时间**: 2026-04-05 13:30 CST
