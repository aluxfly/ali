#!/usr/bin/env python3.11
# -*- coding: utf-8 -*-
"""
项目雷达 - Streamlit Web 应用
提供简单的 Web 界面查看招标数据

用法:
    streamlit run app.py
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import streamlit as st

DATA_DIR = Path(__file__).parent / "data"


def load_projects(date: str) -> list:
    """加载指定日期的项目数据"""
    json_file = DATA_DIR / f"projects_{date}.json"
    
    if not json_file.exists():
        # 尝试查找最近的数据文件
        if DATA_DIR.exists():
            files = list(DATA_DIR.glob("projects_*.json"))
            if files:
                json_file = sorted(files)[-1]
            else:
                return []
        else:
            return []
    
    with open(json_file, "r", encoding="utf-8") as f:
        return json.load(f)


def parse_amount(amount_str: str) -> float:
    """解析金额字符串为数字"""
    if not amount_str:
        return 0
    clean = amount_str.replace("¥", "").replace("$", "").replace(",", "")
    if "万" in clean:
        return float(clean.replace("万", "")) * 10000
    elif "亿" in clean:
        return float(clean.replace("亿", "")) * 100000000
    try:
        return float(clean)
    except:
        return 0


def main():
    st.set_page_config(
        page_title="项目雷达 - 国家电网招标数据",
        page_icon="📊",
        layout="wide"
    )
    
    st.title("📊 项目雷达 MVP")
    st.markdown("**国家电网电子商务平台招标公告数据**")
    
    # 侧边栏筛选
    st.sidebar.header("筛选条件")
    
    # 日期选择
    available_dates = []
    if DATA_DIR.exists():
        files = list(DATA_DIR.glob("projects_*.json"))
        available_dates = sorted([f.stem.replace("projects_", "") for f in files], reverse=True)
    
    if available_dates:
        selected_date = st.sidebar.selectbox(
            "选择日期",
            available_dates,
            index=0
        )
    else:
        st.sidebar.warning("暂无数据，请先运行爬虫")
        selected_date = datetime.now().strftime("%Y-%m-%d")
    
    # 地区筛选
    projects = load_projects(selected_date)
    
    regions = list(set(p.get("region", "") for p in projects if p.get("region")))
    regions.sort()
    
    selected_region = st.sidebar.selectbox(
        "选择地区",
        ["全部"] + regions,
        index=0
    )
    
    # 金额筛选
    col1, col2 = st.sidebar.columns(2)
    with col1:
        min_amount = st.number_input("最低金额 (万)", min_value=0, value=0)
    with col2:
        max_amount = st.number_input("最高金额 (万)", min_value=0, value=100000)
    
    # 关键词搜索
    keyword = st.sidebar.text_input("关键词搜索")
    
    # 应用筛选
    filtered_projects = projects
    
    if selected_region != "全部":
        filtered_projects = [p for p in filtered_projects if selected_region in p.get("region", "")]
    
    if keyword:
        filtered_projects = [p for p in filtered_projects if keyword in p.get("title", "")]
    
    if min_amount > 0:
        filtered_projects = [p for p in filtered_projects if parse_amount(p.get("amount", "")) >= min_amount * 10000]
    
    if max_amount < 100000:
        filtered_projects = [p for p in filtered_projects if parse_amount(p.get("amount", "")) <= max_amount * 10000]
    
    # 主界面
    st.markdown(f"**共 {len(projects)} 个项目** | 筛选后：**{len(filtered_projects)} 个**")
    
    if filtered_projects:
        # 显示统计卡片
        col1, col2, col3, col4 = st.columns(4)
        
        total_amount = sum(parse_amount(p.get("amount", "")) for p in filtered_projects)
        avg_amount = total_amount / len(filtered_projects) if filtered_projects else 0
        
        regions_count = len(set(p.get("region", "") for p in filtered_projects))
        
        with col1:
            st.metric("项目数量", len(filtered_projects))
        with col2:
            st.metric("总金额", f"¥{total_amount/10000:.0f}万")
        with col3:
            st.metric("平均金额", f"¥{avg_amount/10000:.0f}万")
        with col4:
            st.metric("覆盖地区", regions_count)
        
        st.divider()
        
        # 显示项目列表
        for i, p in enumerate(filtered_projects, 1):
            with st.expander(f"{i}. {p.get('title', '无标题')}", expanded=(i <= 5)):
                col1, col2 = st.columns([3, 1])
                
                with col1:
                    st.markdown(f"**招标编号**: {p.get('project_id', 'N/A')}")
                    st.markdown(f"**预算金额**: {p.get('amount', 'N/A')}")
                    st.markdown(f"**所在地区**: {p.get('region', 'N/A')}")
                    st.markdown(f"**发布日期**: {p.get('publish_date', 'N/A')}")
                
                with col2:
                    link = p.get('link', '')
                    if link:
                        st.link_button("查看详情", link)
                    st.markdown(f"**序号**: {i}")
    
    else:
        st.info("没有符合条件的项目")
    
    # 底部信息
    st.divider()
    st.markdown("""
    **使用说明**:
    - 左侧边栏可进行筛选
    - 点击项目标题展开查看详情
    - 数据来源于国家电网电子商务平台
    
    **技术栈**: Python + Streamlit
    """)


if __name__ == "__main__":
    main()
