#!/usr/bin/env python3.11
# -*- coding: utf-8 -*-
"""
国家电网电子商务平台 (ECP) 招标公告爬虫 - 真实数据版本 v4
Project Radar - 项目雷达

使用 Playwright 浏览器自动化爬取真实数据

用法:
    python3.11 crawl_sgcc_real.py
"""

import json
import os
import sys
import time
import random
import logging
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, asdict

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# ============== 配置 ==============

BASE_URL = "https://ecp.sgcc.com.cn"
DATA_DIR = Path(__file__).parent / "data"
LOG_DIR = Path(__file__).parent / "logs"

# 招标公告列表页面 URL
LIST_URLS = [
    "https://ecp.sgcc.com.cn/#/list/list-spe/2018032600289606_1_2018032700291334",  # 招标公告及投标邀请书
    "https://ecp.sgcc.com.cn/#/list/list-spe/2018032600289606_1_2018032900295987",  # 采购公告
    "https://ecp.sgcc.com.cn/#/list/list-com/2018032600289606_1_2018060501171111",  # 中标（成交）结果公告
]

# 请求头配置
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
}

# ============== 日志配置 ==============

def setup_logging(verbose: bool = False):
    """配置日志"""
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    
    log_file = LOG_DIR / f"crawl_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    
    level = logging.DEBUG if verbose else logging.INFO
    
    logging.basicConfig(
        level=level,
        format='%(asctime)s [%(levelname)s] %(message)s',
        handlers=[
            logging.FileHandler(log_file, encoding='utf-8'),
            logging.StreamHandler()
        ]
    )
    
    return logging.getLogger(__name__)

logger = setup_logging()

# ============== 数据类 ==============

@dataclass
class Project:
    """项目数据类"""
    title: str
    link: str
    publish_date: str
    amount: str = ""
    region: str = ""
    project_id: str = ""
    deadline: str = ""
    contact: str = ""
    description: str = ""
    source: str = BASE_URL
    crawl_time: str = ""
    
    def __post_init__(self):
        if not self.crawl_time:
            self.crawl_time = datetime.now().isoformat()
    
    def to_dict(self) -> dict:
        return asdict(self)

# ============== 爬虫类 ==============

class SGCPCrawler:
    """国家电网 ECP 平台爬虫"""
    
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.projects: List[Project] = []
    
    def is_valid_project(self, text: str) -> bool:
        """判断是否是有效的招标公告"""
        if not text or len(text) < 15:
            return False
        
        # 过滤掉导航菜单项（通常包含多个空格分隔的短词）
        words = text.split()
        if len(words) > 8:  # 导航菜单通常有很多短词
            return False
        
        # 过滤掉包含特定关键词的导航项
        nav_keywords = ['全面计划', '公共信息', '资质能力核实', '不良行为处理', 
                       '实物 ID 管理', '业务指导视频', '宣传培训', '保证金服务']
        if any(kw in text for kw in nav_keywords):
            return False
        
        # 有效的招标公告通常包含以下关键词之一
        valid_keywords = ['招标', '采购', '中标', '公告', '公示', '谈判', '询价', '变更']
        if not any(kw in text for kw in valid_keywords):
            return False
        
        return True
    
    def extract_date_from_text(self, text: str) -> Optional[str]:
        """从文本中提取日期"""
        if not text:
            return None
        
        patterns = [
            r'(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})[日号]?',
            r'(\d{4})[-/.](\d{2})[-/.](\d{2})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                year, month, day = match.groups()
                return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
        
        return None
    
    def extract_region(self, text: str) -> str:
        """从标题中提取地区"""
        provinces = [
            '北京', '天津', '上海', '重庆', '河北', '河南', '山东', '山西',
            '江苏', '浙江', '安徽', '江西', '福建', '广东', '广西', '海南',
            '湖北', '湖南', '辽宁', '吉林', '黑龙江', '四川', '贵州', '云南',
            '陕西', '甘肃', '青海', '宁夏', '新疆', '西藏', '内蒙古',
            '国网', '中国电力', '中电装备', '华中', '华北', '华东', '西南', '国网辽宁',
            '国网江苏', '国网西藏', '国网福建', '国网黑龙江', '国网江西', '国网陕西',
            '国网上海', '国网安徽', '国网浙江', '国网山东', '国网河北', '国网河南',
            '国网湖北', '国网湖南', '国网四川', '国网重庆', '国网北京', '国网天津'
        ]
        
        # 按长度排序，优先匹配长的（更具体）
        provinces_sorted = sorted(provinces, key=len, reverse=True)
        
        for province in provinces_sorted:
            if province in text:
                return province
        
        return ""
    
    def extract_type(self, text: str) -> str:
        """从标题中提取项目类型"""
        types = []
        
        if '招标' in text:
            types.append('招标')
        if '中标' in text:
            types.append('中标')
        if '采购' in text:
            types.append('采购')
        if any(kw in text for kw in ['公告', '公示']):
            types.append('公告')
        if '谈判' in text:
            types.append('谈判')
        if '询价' in text:
            types.append('询价')
        if '变更' in text:
            types.append('变更')
        
        return ', '.join(types) if types else ''
    
    def crawl(self, target_date: str = None, max_projects: int = 100) -> List[Project]:
        """执行爬取"""
        if not target_date:
            target_date = datetime.now().strftime("%Y-%m-%d")
        
        logger.info(f"开始爬取 {target_date} 的招标数据...")
        
        all_projects = []
        
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
            )
            
            context = browser.new_context(
                user_agent=HEADERS['User-Agent'],
                viewport={'width': 1920, 'height': 1080},
            )
            
            page = context.new_page()
            
            # 访问各个列表页面
            for i, url in enumerate(LIST_URLS):
                logger.info(f"[{i+1}/{len(LIST_URLS)}] 访问：{url[:80]}...")
                
                try:
                    page.goto(url, wait_until='networkidle', timeout=60000)
                    time.sleep(3)  # 等待动态内容加载
                    
                    # 滚动页面以加载更多内容
                    page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                    time.sleep(2)
                    
                    # 使用 JavaScript 提取数据
                    projects_data = page.evaluate('''() => {
                        // 查找所有包含日期的项目（更精确的选择器）
                        const items = document.querySelectorAll('li, .item, .notice-item, .bid-item, [class*="list"]');
                        const results = [];
                        const seen = new Set();
                        
                        items.forEach(item => {
                            const text = item.innerText.trim().replace(/\\s+/g, ' ');
                            
                            // 检查是否包含日期格式
                            const hasDate = /\\d{4}[-/年]\\d{1,2}[-/月]\\d{1,2}/.test(text);
                            
                            if (text.length > 20 && text.length < 300 && hasDate && !seen.has(text)) {
                                seen.add(text);
                                const link = item.querySelector('a');
                                let href = link ? link.getAttribute('href') : '';
                                
                                results.push({
                                    text: text,
                                    href: href || ''
                                });
                            }
                        });
                        
                        return results;
                    }''')
                    
                    logger.info(f"  找到 {len(projects_data)} 个带日期的项目")
                    
                    # 处理每个项目
                    for item in projects_data:
                        try:
                            project = self._parse_item(item, BASE_URL)
                            if project and project.title and self.is_valid_project(project.title):
                                all_projects.append(project)
                        except Exception as e:
                            if self.verbose:
                                logger.debug(f"解析项目失败：{e}")
                            continue
                    
                    # 限制总数
                    if len(all_projects) >= max_projects:
                        break
                        
                except Exception as e:
                    logger.warning(f"访问失败：{e}")
                    continue
                
                # 添加延迟，避免过快请求
                time.sleep(1)
            
            browser.close()
        
        # 去重
        all_projects = self._deduplicate(all_projects)
        
        # 限制数量
        all_projects = all_projects[:max_projects]
        
        logger.info(f"总共获取到 {len(all_projects)} 条有效数据")
        
        return all_projects
    
    def _parse_item(self, item: dict, base_url: str) -> Optional[Project]:
        """解析单个项目"""
        text = item.get('text', '').strip()
        href = item.get('href', '').strip()
        
        if not text or len(text) < 15:
            return None
        
        # 清理文本（移除多余空白和末尾日期）
        text = ' '.join(text.split())
        
        # 尝试移除末尾的日期（如果存在）
        date_pattern = r'\\s*\\d{4}[-/年]\\d{1,2}[-/月]\\d{1,2}[日号]?\\s*$'
        clean_text = re.sub(date_pattern, '', text).strip()
        
        # 如果清理后太短，使用原文本
        if len(clean_text) < 15:
            clean_text = text
        
        # 构建完整链接
        if href and not href.startswith('http'):
            if href.startswith('//'):
                full_link = 'https:' + href
            elif href.startswith('/'):
                full_link = base_url + href
            else:
                full_link = f"{base_url}/{href}"
        else:
            full_link = href
        
        # 提取日期（从原始文本中）
        publish_date = self.extract_date_from_text(text)
        if not publish_date:
            publish_date = datetime.now().strftime("%Y-%m-%d")
        
        # 提取地区
        region = self.extract_region(clean_text)
        
        # 提取项目类型
        project_type = self.extract_type(clean_text)
        
        return Project(
            title=clean_text,
            link=full_link,
            publish_date=publish_date,
            region=region,
            description=project_type,
        )
    
    def _deduplicate(self, projects: List[Project]) -> List[Project]:
        """去重"""
        seen = set()
        unique = []
        
        for p in projects:
            # 使用标题前 50 字符作为唯一键
            key = p.title[:50].strip()
            if key and key not in seen:
                seen.add(key)
                unique.append(p)
        
        return unique

# ============== 数据保存 ==============

def ensure_dirs():
    """确保目录存在"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    LOG_DIR.mkdir(parents=True, exist_ok=True)

def save_projects(projects: List[Project], date: str):
    """保存项目数据"""
    ensure_dirs()
    
    # 准备数据
    data = {
        "crawl_date": date,
        "crawl_time": datetime.now().isoformat(),
        "source": BASE_URL,
        "total_count": len(projects),
        "projects": [p.to_dict() for p in projects]
    }
    
    # 保存 JSON
    json_file = DATA_DIR / f"projects_{date}.json"
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.info(f"JSON 已保存：{json_file}")
    
    # 保存 CSV
    csv_file = DATA_DIR / f"projects_{date}.csv"
    with open(csv_file, 'w', encoding='utf-8-sig') as f:
        f.write("标题，链接，发布日期，金额，地区，招标编号，类型，爬取时间\n")
        for p in projects:
            f.write(f'"{p.title}","{p.link}","{p.publish_date}","{p.amount}","{p.region}","{p.project_id}","{p.description}","{p.crawl_time}"\n')
    logger.info(f"CSV 已保存：{csv_file}")

def print_summary(projects: List[Project], date: str):
    """打印摘要"""
    print("\n" + "=" * 70)
    print("爬取结果摘要")
    print("=" * 70)
    print(f"爬取日期：{date}")
    print(f"项目总数：{len(projects)}")
    
    if projects:
        # 按地区统计
        regions = {}
        for p in projects:
            region = p.region or "未知"
            regions[region] = regions.get(region, 0) + 1
        
        print("\n地区分布:")
        for region, count in sorted(regions.items(), key=lambda x: -x[1])[:10]:
            print(f"  {region}: {count} 个")
        
        # 显示前 10 个项目
        print("\n最新项目 (前 10 条):")
        for i, p in enumerate(projects[:10], 1):
            print(f"  {i}. {p.title[:60]}...")
            print(f"     日期：{p.publish_date} | 地区：{p.region or '未知'} | 类型：{p.description}")
            if p.link:
                print(f"     链接：{p.link[:70]}...")

# ============== 主函数 ==============

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="国家电网 ECP 平台招标公告爬虫")
    parser.add_argument("--date", type=str, default=None, help="爬取日期 (YYYY-MM-DD)，默认为今日")
    parser.add_argument("--verbose", "-v", action="store_true", help="详细日志")
    parser.add_argument("--max", type=int, default=100, help="最大爬取数量")
    args = parser.parse_args()
    
    # 设置日志
    global logger
    logger = setup_logging(args.verbose)
    
    print("=" * 70)
    print("项目雷达 - 国家电网 ECP 平台招标公告爬虫 v4")
    print("=" * 70)
    
    target_date = args.date or datetime.now().strftime("%Y-%m-%d")
    
    # 创建爬虫
    crawler = SGCPCrawler(verbose=args.verbose)
    
    # 执行爬取
    projects = crawler.crawl(target_date, max_projects=args.max)
    
    # 保存数据
    if projects:
        save_projects(projects, target_date)
        print_summary(projects, target_date)
    else:
        print("未能获取到数据，请检查网络连接或网站状态")
    
    print("\n" + "=" * 70)
    print("爬取完成!")
    if projects:
        print(f"数据文件：{DATA_DIR}/projects_{target_date}.*")
    print(f"日志文件：{LOG_DIR}/crawl_*.log")
    print("=" * 70)
    
    return projects

if __name__ == "__main__":
    main()
