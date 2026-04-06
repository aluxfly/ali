#!/usr/bin/env python3.11
"""
标书工厂测试脚本
测试标书生成功能
"""

import os
import sys
from datetime import datetime

# 添加生成器路径
sys.path.insert(0, os.path.dirname(__file__))

from bid_generator import BidGenerator
from smart_suggestions import SmartSuggestionEngine


def test_extraction():
    """测试信息提取功能"""
    print("\n" + "=" * 60)
    print("测试 1: 信息提取功能")
    print("=" * 60)
    
    generator = BidGenerator()
    
    test_announcement = """项目名称：国网江苏省电力公司 2024 年设备采购项目
项目编号：SGCC-JS-2024-001
招标人：国网江苏省电力公司
预算金额：1200 万元
投标截止时间：2024 年 6 月 30 日 9:30
开标时间：2024 年 6 月 30 日 9:30
项目地点：江苏省南京市
联系人：王主任
联系电话：025-88888888"""
    
    info = generator.extract_bid_info(test_announcement)
    
    print(f"\n提取结果：")
    print(f"  项目名称：{info['project_name']}")
    print(f"  项目编号：{info['project_number']}")
    print(f"  招标人：{info['tenderer']}")
    print(f"  预算金额：{info['budget']}")
    print(f"  投标截止：{info['bid_deadline']}")
    print(f"  项目地点：{info['project_location']}")
    
    # 验证
    assert info['project_name'] != '', "项目名称提取失败"
    assert info['project_number'] != '', "项目编号提取失败"
    assert info['tenderer'] != '', "招标人提取失败"
    assert info['budget'] != '', "预算金额提取失败"
    
    print("\n✓ 信息提取测试通过")
    return True


def test_technical_bid():
    """测试技术标生成"""
    print("\n" + "=" * 60)
    print("测试 2: 技术标生成")
    print("=" * 60)
    
    generator = BidGenerator(output_dir='./test_outputs')
    
    bid_info = {
        'project_name': '测试项目 - 技术标',
        'project_number': 'TEST-2024-001',
        'tenderer': '测试单位',
        'budget': '100 万元',
        'bid_deadline': '2024-12-31',
    }
    
    output_path = generator.generate_technical_bid(bid_info)
    
    # 验证文件存在
    assert os.path.exists(output_path), f"技术标文件未生成：{output_path}"
    
    # 验证文件大小
    file_size = os.path.getsize(output_path)
    assert file_size > 10000, f"技术标文件大小异常：{file_size} bytes"
    
    print(f"\n生成文件：{output_path}")
    print(f"文件大小：{file_size / 1024:.2f} KB")
    print("\n✓ 技术标生成测试通过")
    return True


def test_business_bid():
    """测试商务标生成"""
    print("\n" + "=" * 60)
    print("测试 3: 商务标生成")
    print("=" * 60)
    
    generator = BidGenerator(output_dir='./test_outputs')
    
    bid_info = {
        'project_name': '测试项目 - 商务标',
        'project_number': 'TEST-2024-002',
        'tenderer': '测试单位',
        'budget': '200 万元',
    }
    
    output_path = generator.generate_business_bid(bid_info)
    
    # 验证文件存在
    assert os.path.exists(output_path), f"商务标文件未生成：{output_path}"
    
    # 验证文件大小
    file_size = os.path.getsize(output_path)
    assert file_size > 10000, f"商务标文件大小异常：{file_size} bytes"
    
    print(f"\n生成文件：{output_path}")
    print(f"文件大小：{file_size / 1024:.2f} KB")
    print("\n✓ 商务标生成测试通过")
    return True


def test_qualification_list():
    """测试资质文件清单生成"""
    print("\n" + "=" * 60)
    print("测试 4: 资质文件清单生成")
    print("=" * 60)
    
    generator = BidGenerator(output_dir='./test_outputs')
    
    bid_info = {
        'project_name': '测试项目 - 资质清单',
        'project_number': 'TEST-2024-003',
    }
    
    output_path = generator.generate_qualification_list(bid_info)
    
    # 验证文件存在
    assert os.path.exists(output_path), f"资质清单文件未生成：{output_path}"
    
    print(f"\n生成文件：{output_path}")
    print("\n✓ 资质文件清单生成测试通过")
    return True


def test_smart_suggestions():
    """测试智能建议功能"""
    print("\n" + "=" * 60)
    print("测试 5: 智能建议功能")
    print("=" * 60)
    
    engine = SmartSuggestionEngine()
    
    test_announcement = """项目名称：紧急电力设备采购项目
项目概况：工期紧张，预算有限，技术要求高
需要快速实施，质保期 5 年
具备电力行业资质，有类似项目业绩"""
    
    suggestions = engine.analyze_requirements(test_announcement)
    
    print(f"\n推荐方案数量：{len(suggestions['recommended_solutions'])}")
    print(f"风险点数量：{len(suggestions['risk_points'])}")
    print(f"关注重点数量：{len(suggestions['key_focus'])}")
    
    # 验证
    assert len(suggestions['recommended_solutions']) > 0, "未生成推荐方案"
    assert len(suggestions['risk_points']) > 0, "未识别风险点"
    
    print("\n识别的风险点：")
    for risk in suggestions['risk_points']:
        print(f"  ⚠ {risk['type']}: {risk['description']}")
    
    print("\n✓ 智能建议功能测试通过")
    return True


def test_full_generation():
    """测试完整标书生成流程"""
    print("\n" + "=" * 60)
    print("测试 6: 完整标书生成流程")
    print("=" * 60)
    
    generator = BidGenerator(output_dir='./test_outputs')
    engine = SmartSuggestionEngine()
    
    test_announcement = """项目名称：某市智能电网建设项目
项目编号：SGCC-2024-SMART-001
招标人：国网某市电力公司
预算金额：800 万元
投标截止时间：2024 年 8 月 31 日
项目地点：某市
技术要求：符合智能电网标准，支持远程监控
资质要求：具备电力行业资质，有智能电网项目经验
工期要求：6 个月
质保期：3 年"""
    
    # 生成完整标书
    results = generator.generate_all(test_announcement)
    
    # 生成智能建议报告
    report = engine.generate_suggestion_report(test_announcement)
    report_path = os.path.join(generator.output_dir, '测试_智能建议报告.txt')
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    # 验证所有文件
    print("\n生成的文件：")
    for bid_type, path in results.items():
        assert os.path.exists(path), f"文件未生成：{path}"
        file_size = os.path.getsize(path)
        print(f"  ✓ {bid_type}: {os.path.basename(path)} ({file_size / 1024:.2f} KB)")
    
    print(f"  ✓ 智能建议报告：{os.path.basename(report_path)}")
    
    print("\n✓ 完整标书生成流程测试通过")
    return True


def run_all_tests():
    """运行所有测试"""
    print("\n" + "=" * 60)
    print("标书工厂 - 测试套件")
    print(f"运行时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    tests = [
        ("信息提取", test_extraction),
        ("技术标生成", test_technical_bid),
        ("商务标生成", test_business_bid),
        ("资质清单生成", test_qualification_list),
        ("智能建议", test_smart_suggestions),
        ("完整流程", test_full_generation),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            success = test_func()
            results.append((name, success, None))
        except Exception as e:
            results.append((name, False, str(e)))
            print(f"\n✗ {name} 测试失败：{e}")
    
    # 汇总结果
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    
    passed = sum(1 for _, success, _ in results if success)
    total = len(results)
    
    for name, success, error in results:
        status = "✓ 通过" if success else f"✗ 失败 ({error})"
        print(f"  {name}: {status}")
    
    print(f"\n总计：{passed}/{total} 测试通过")
    
    if passed == total:
        print("\n🎉 所有测试通过！")
        return True
    else:
        print(f"\n⚠ {total - passed} 个测试失败")
        return False


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)
