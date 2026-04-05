#!/usr/bin/env python3.11
# -*- coding: utf-8 -*-
"""
查看爬取的招标公告数据

用法:
    python3.11 view_projects.py
    python3.11 view_projects.py --date 2026-04-05
    python3.11 view_projects.py --region 辽宁
"""

import argparse
import json
from pathlib import Path
from datetime import datetime

DATA_DIR = Path(__file__).parent / "data"

def load_projects(date: str = None):
    """加载项目数据"""
    if not date:
        date = datetime.now().strftime("%Y-%m-%d")
    
    json_file = DATA_DIR / f"projects_{date}.json"
    
    if not json_file.exists():
        print(f"错误：找不到数据文件 {json_file}")
        print("可用的数据文件:")
        for f in DATA_DIR.glob("projects_*.json"):
            print(f"  - {f.name}")
        return None
    
    with open(json_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def filter_projects(data: dict, region: str = None, project_type: str = None):
    """过滤项目"""
    projects = data.get('projects', [])
    
    if region:
        projects = [p for p in projects if region in p.get('region', '')]
    
    if project_type:
        projects = [p for p in projects if project_type in p.get('description', '')]
    
    return projects

def print_projects(projects: list, limit: int = 20):
    """打印项目列表"""
    if not projects:
        print("没有找到符合条件的项目")
        return
    
    print(f"\n共找到 {len(projects)} 条数据")
    print("=" * 80)
    
    for i, p in enumerate(projects[:limit], 1):
        print(f"\n[{i}] {p['title']}")
        print(f"    日期：{p['publish_date']}")
        print(f"    地区：{p['region'] or '未知'}")
        print(f"    类型：{p['description'] or '未分类'}")
        if p.get('link'):
            print(f"    链接：{p['link'][:70]}...")
    
    if len(projects) > limit:
        print(f"\n... 还有 {len(projects) - limit} 条数据")

def print_stats(data: dict):
    """打印统计信息"""
    projects = data.get('projects', [])
    
    print("\n" + "=" * 80)
    print("统计信息")
    print("=" * 80)
    print(f"爬取日期：{data.get('crawl_date', '未知')}")
    print(f"项目总数：{len(projects)}")
    
    # 地区统计
    regions = {}
    for p in projects:
        region = p.get('region', '未知') or '未知'
        regions[region] = regions.get(region, 0) + 1
    
    print("\n地区分布:")
    for region, count in sorted(regions.items(), key=lambda x: -x[1])[:10]:
        print(f"  {region}: {count} 个")
    
    # 类型统计
    types = {}
    for p in projects:
        desc = p.get('description', '')
        if desc:
            for t in desc.split(', '):
                types[t] = types.get(t, 0) + 1
    
    print("\n项目类型:")
    for t, count in sorted(types.items(), key=lambda x: -x[1]):
        print(f"  {t}: {count} 个")

def main():
    parser = argparse.ArgumentParser(description="查看招标公告数据")
    parser.add_argument("--date", type=str, default=None, help="数据日期 (YYYY-MM-DD)")
    parser.add_argument("--region", type=str, default=None, help="按地区过滤")
    parser.add_argument("--type", type=str, default=None, help="按类型过滤")
    parser.add_argument("--stats", action="store_true", help="显示统计信息")
    parser.add_argument("--limit", type=int, default=20, help="显示数量限制")
    args = parser.parse_args()
    
    # 加载数据
    data = load_projects(args.date)
    if not data:
        return
    
    # 显示统计
    if args.stats:
        print_stats(data)
    
    # 过滤并显示
    projects = filter_projects(data, args.region, args.type)
    print_projects(projects, args.limit)

if __name__ == "__main__":
    main()
