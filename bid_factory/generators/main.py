#!/usr/bin/env python3.11
"""
标书工厂 - 主入口
命令行工具，用于生成标书文档
"""

import argparse
import json
import os
import sys
from pathlib import Path

# 添加生成器路径
sys.path.insert(0, os.path.dirname(__file__))

from bid_generator import BidGenerator
from smart_suggestions import SmartSuggestionEngine


def generate_from_file(input_file: str, output_dir: str = None):
    """从文件读取招标公告并生成标书"""
    with open(input_file, 'r', encoding='utf-8') as f:
        announcement_text = f.read()
    
    generator = BidGenerator(output_dir)
    engine = SmartSuggestionEngine()
    
    # 提取信息
    bid_info = generator.extract_bid_info(announcement_text)
    
    print("\n" + "=" * 60)
    print("标书工厂 - 自动生成标书")
    print("=" * 60)
    print(f"\n项目名称：{bid_info.get('project_name', '未识别')}")
    print(f"项目编号：{bid_info.get('project_number', '未识别')}")
    print(f"招标人：{bid_info.get('tenderer', '未识别')}")
    
    # 生成智能建议
    print("\n【智能建议】")
    suggestions = engine.analyze_requirements(announcement_text)
    
    print(f"\n推荐方案：{len(suggestions['recommended_solutions'])} 个")
    for solution in suggestions['recommended_solutions']:
        print(f"  • {solution['name']}")
    
    print(f"\n风险点：{len(suggestions['risk_points'])} 个")
    for risk in suggestions['risk_points']:
        print(f"  ⚠ {risk['type']}: {risk['description']}")
    
    # 生成标书
    print("\n【生成标书】")
    results = generator.generate_all(announcement_text)
    
    for bid_type, path in results.items():
        print(f"  ✓ {bid_type}: {path}")
    
    # 保存智能建议报告
    suggestion_report = engine.generate_suggestion_report(announcement_text)
    report_path = os.path.join(generator.output_dir, '智能建议报告.txt')
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(suggestion_report)
    print(f"  ✓ 智能建议报告：{report_path}")
    
    print("\n" + "=" * 60)
    print("标书生成完成！")
    print("=" * 60)
    
    return results


def generate_from_json(json_file: str, output_dir: str = None):
    """从 JSON 文件读取招标信息并生成标书"""
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    generator = BidGenerator(output_dir)
    
    print("\n" + "=" * 60)
    print("标书工厂 - 自动生成标书")
    print("=" * 60)
    
    # 生成标书
    results = generator.generate_all(
        data.get('announcement_text', ''),
        data.get('project_name')
    )
    
    for bid_type, path in results.items():
        print(f"  ✓ {bid_type}: {path}")
    
    print("\n" + "=" * 60)
    print("标书生成完成！")
    print("=" * 60)
    
    return results


def generate_interactive(output_dir: str = None):
    """交互式生成标书"""
    generator = BidGenerator(output_dir)
    engine = SmartSuggestionEngine()
    
    print("\n" + "=" * 60)
    print("标书工厂 - 交互式生成")
    print("=" * 60)
    print("\n请输入招标公告内容（输入 END 结束）：\n")
    
    lines = []
    while True:
        line = input()
        if line.strip() == 'END':
            break
        lines.append(line)
    
    announcement_text = '\n'.join(lines)
    
    # 提取信息
    bid_info = generator.extract_bid_info(announcement_text)
    
    print("\n识别到的信息：")
    print(f"  项目名称：{bid_info.get('project_name', '未识别')}")
    print(f"  项目编号：{bid_info.get('project_number', '未识别')}")
    print(f"  招标人：{bid_info.get('tenderer', '未识别')}")
    
    confirm = input("\n确认生成标书？(y/n): ")
    if confirm.lower() != 'y':
        print("已取消")
        return
    
    # 生成智能建议
    print("\n【智能建议】")
    suggestions = engine.analyze_requirements(announcement_text)
    
    for risk in suggestions['risk_points']:
        print(f"  ⚠ {risk['type']}: {risk['mitigation']}")
    
    # 生成标书
    print("\n【生成标书】")
    results = generator.generate_all(announcement_text)
    
    for bid_type, path in results.items():
        print(f"  ✓ {bid_type}: {path}")
    
    print("\n标书生成完成！")
    
    return results


def main():
    parser = argparse.ArgumentParser(
        description='标书工厂 - 自动生成标书文档',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例用法:
  python main.py -i announcement.txt          # 从文本文件生成
  python main.py -j bid_info.json             # 从 JSON 文件生成
  python main.py --interactive                # 交互式生成
  python main.py -i announcement.txt -o ./output  # 指定输出目录
        """
    )
    
    parser.add_argument('-i', '--input', help='招标公告文本文件路径')
    parser.add_argument('-j', '--json', help='招标信息 JSON 文件路径')
    parser.add_argument('-o', '--output', help='输出目录路径')
    parser.add_argument('--interactive', action='store_true', help='交互式生成模式')
    
    args = parser.parse_args()
    
    if args.interactive:
        generate_interactive(args.output)
    elif args.json:
        generate_from_json(args.json, args.output)
    elif args.input:
        generate_from_file(args.input, args.output)
    else:
        # 默认使用示例数据
        print("未指定输入文件，使用示例数据演示...")
        
        sample_announcement = """
        项目名称：某市电力设备采购项目
        项目编号：SGCC-2024-001
        招标人：国网某省电力公司
        预算金额：500 万元
        投标截止时间：2024 年 12 月 31 日
        项目地点：某省某市
        技术要求：符合国家电力行业标准，质保期 3 年
        资质要求：具备电力行业相关资质，有类似项目业绩
        """
        
        generator = BidGenerator(args.output)
        engine = SmartSuggestionEngine()
        
        results = generator.generate_all(sample_announcement)
        
        print("\n示例标书生成完成：")
        for bid_type, path in results.items():
            print(f"  {bid_type}: {path}")
        
        # 生成智能建议报告
        report = engine.generate_suggestion_report(sample_announcement)
        report_path = os.path.join(generator.output_dir, '智能建议报告_示例.txt')
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"  智能建议报告：{report_path}")


if __name__ == '__main__':
    main()
