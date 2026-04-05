#!/usr/bin/env python3.11
# -*- coding: utf-8 -*-
"""
项目雷达 - 配置文件

在此处配置爬虫参数
"""

# 基础 URL
BASE_URL = "https://ecp.sgcc.com.cn"

# 尝试的 API 端点列表
API_ENDPOINTS = [
    # 招标公告
    "/ecp/portal/admittanceNotice/list",
    "/ecp/portal/bidNotice/list",
    "/ecp/portal/notice/list",
    "/ecp2.0/portal/notice/list",
    "/ecp2.0/portal/bidNotice/list",
    # 通用接口
    "/api/notice/list",
    "/api/bid/list",
    "/api/tender/list",
]

# 请求头
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/html, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Referer": BASE_URL,
}

# 请求超时 (秒)
TIMEOUT = 30

# 重试次数
MAX_RETRIES = 3

# 数据目录
DATA_DIR = "data"

# 是否使用代理 (如需要)
USE_PROXY = False
PROXY_URL = ""

# 是否启用 JavaScript 渲染 (需要 Selenium)
USE_SELENIUM = False
