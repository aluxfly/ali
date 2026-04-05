#!/usr/bin/env python3.11
"""
国家电网 ECP 招标公告爬虫
爬取 sgccetp.com.cn 平台的招标公告数据
"""

import json
import argparse
from datetime import datetime
from playwright.sync_api import sync_playwright

# 招标公告列表页配置
LIST_PAGES = [
    {
        'name': '招标公告',
        'url': 'https://sgccetp.com.cn/portal/#/list/list-spe/2018032600289606_1_2018032700291334/old/1',
        'type': 'bid'
    },
    {
        'name': '采购公告', 
        'url': 'https://sgccetp.com.cn/portal/#/list/list-spe/2018032600289606_1_2018032900295987/old/1',
        'type': 'procurement'
    },
    {
        'name': '中标(成交)结果公告',
        'url': 'https://sgccetp.com.cn/portal/#/list/list-com/2018032600289606_1_2018060501171111/old/1',
        'type': 'win'
    },
    {
        'name': '推荐中标候选人公示',
        'url': 'https://sgccetp.com.cn/portal/#/list/list-com/2018032600289606_1_2018060501171107/old/1',
        'type': 'candidate'
    },
]

BASE_URL = 'https://sgccetp.com.cn'

def extract_region(title):
    """从标题中提取地区信息"""
    regions = [
        '国网北京', '国网天津', '国网河北', '国网山西', '国网山东', 
        '国网上海', '国网江苏', '国网浙江', '国网安徽', '国网福建',
        '国网湖北', '国网湖南', '国网河南', '国网江西', '国网四川',
        '国网重庆', '国网辽宁', '国网吉林', '国网黑龙江', '国网陕西',
        '国网甘肃', '国网青海', '国网宁夏', '国网新疆', '国网西藏',
        '国网内蒙古', '国网', '中电装备', '中国电力', '新疆',
    ]
    for region in regions:
        if region in title:
            return region
    return ''

def extract_keywords(title):
    """从标题中提取关键词"""
    keywords = ['招标', '采购', '谈判', '变更', '中标', '公告', '询价', '框架']
    found = [kw for kw in keywords if kw in title]
    return ', '.join(found)

def crawl_list_page(page, list_config):
    """爬取单个列表页"""
    print(f"  正在爬取：{list_config['name']}")
    
    try:
        page.goto(list_config['url'], wait_until='networkidle', timeout=60000)
        page.wait_for_timeout(5000)  # 等待动态内容加载
        
        projects = []
        
        # 查找所有项目链接 - 使用更精确的选择器
        links = page.query_selector_all('a[href*="/doc/"]')
        
        seen_titles = set()
        for link in links:
            try:
                href = link.get_attribute('href') or ''
                text = (link.inner_text() or '').strip()
                
                # 跳过空链接和重复项
                if not href or not text or text in seen_titles:
                    continue
                
                # 跳过太短的标题（可能是无效项）
                if len(text) < 10:
                    continue
                
                # 跳过明显无效的标题
                if text in ['正在招标', '查看详情', '更多', '首页']:
                    continue
                
                # 只保留包含关键词的项目
                if not any(kw in text for kw in ['招标', '采购', '公告', '中标', '谈判', '竞价']):
                    continue
                
                seen_titles.add(text)
                
                # 构建完整 URL
                if href.startswith('#'):
                    full_url = f"{BASE_URL}/portal/{href}"
                elif href.startswith('http'):
                    full_url = href
                else:
                    full_url = f"{BASE_URL}/portal/#{href}"
                
                # 提取日期（从标题末尾或链接中）
                publish_date = ''
                date_parts = text.split()
                if date_parts and len(date_parts[-1]) == 10 and date_parts[-1].count('-') == 2:
                    publish_date = date_parts[-1]
                    text = ' '.join(date_parts[:-1]).strip()
                
                # 如果没有从标题提取到日期，使用今天
                if not publish_date:
                    publish_date = datetime.now().strftime('%Y-%m-%d')
                
                project = {
                    'title': text,
                    'link': full_url,
                    'publish_date': publish_date,
                    'amount': '',
                    'region': extract_region(text),
                    'project_id': '',
                    'deadline': '',
                    'contact': '',
                    'description': extract_keywords(text),
                    'source': BASE_URL,
                    'crawl_time': datetime.now().isoformat()
                }
                
                projects.append(project)
                
            except Exception as e:
                print(f"    解析链接失败：{e}")
                continue
        
        print(f"    找到 {len(projects)} 个项目")
        return projects
        
    except Exception as e:
        print(f"  爬取失败：{e}")
        return []

def crawl_all(output_path):
    """爬取所有列表页"""
    print("开始爬取国家电网招标公告...")
    print(f"目标文件：{output_path}")
    
    all_projects = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True, 
            args=['--no-sandbox', '--disable-dev-shm-usage']
        )
        page = browser.new_page()
        page.set_viewport_size({'width': 1920, 'height': 1080})
        
        for list_config in LIST_PAGES:
            projects = crawl_list_page(page, list_config)
            all_projects.extend(projects)
        
        browser.close()
    
    # 去重（基于标题）
    seen = set()
    unique_projects = []
    for p in all_projects:
        if p['title'] not in seen:
            seen.add(p['title'])
            unique_projects.append(p)
    
    # 按发布日期排序（最新的在前）
    unique_projects.sort(key=lambda x: x['publish_date'], reverse=True)
    
    # 构建输出数据
    output_data = {
        'crawl_date': datetime.now().strftime('%Y-%m-%d'),
        'crawl_time': datetime.now().isoformat(),
        'source': BASE_URL,
        'total_count': len(unique_projects),
        'projects': unique_projects
    }
    
    # 写入文件
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n爬取完成！")
    print(f"  总计：{len(unique_projects)} 个项目")
    print(f"  输出：{output_path}")
    
    return output_data

def main():
    parser = argparse.ArgumentParser(description='国家电网 ECP 招标公告爬虫')
    parser.add_argument('--output', '-o', default='data/projects.json',
                       help='输出文件路径')
    args = parser.parse_args()
    
    crawl_all(args.output)

if __name__ == '__main__':
    main()
