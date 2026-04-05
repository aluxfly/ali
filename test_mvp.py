#!/usr/bin/env python3.11
# -*- coding: utf-8 -*-
"""
项目雷达 MVP - 测试脚本

验证所有组件正常工作
"""

import json
import sys
from pathlib import Path

# 添加项目目录到路径
sys.path.insert(0, str(Path(__file__).parent))

def test_data_files():
    """测试数据文件"""
    data_dir = Path(__file__).parent / "data"
    
    if not data_dir.exists():
        print("❌ 数据目录不存在")
        return False
    
    json_files = list(data_dir.glob("projects_*.json"))
    csv_files = list(data_dir.glob("projects_*.csv"))
    
    if not json_files:
        print("❌ 未找到 JSON 数据文件")
        return False
    
    print(f"✅ 数据目录：{data_dir}")
    print(f"   - JSON 文件：{len(json_files)} 个")
    print(f"   - CSV 文件：{len(csv_files)} 个")
    return True


def test_json_data():
    """测试 JSON 数据格式"""
    data_dir = Path(__file__).parent / "data"
    json_files = list(data_dir.glob("projects_*.json"))
    
    if not json_files:
        return False
    
    latest = sorted(json_files)[-1]
    
    with open(latest, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        print("❌ JSON 数据格式错误")
        return False
    
    if not data:
        print("⚠️  数据为空")
        return True
    
    # 检查字段
    required_fields = ["title", "link", "publish_date"]
    sample = data[0]
    
    missing = [f for f in required_fields if f not in sample]
    if missing:
        print(f"❌ 缺少字段：{missing}")
        return False
    
    print(f"✅ JSON 数据格式正确")
    print(f"   - 最新文件：{latest.name}")
    print(f"   - 项目数量：{len(data)}")
    print(f"   - 示例项目：{data[0]['title'][:30]}...")
    return True


def test_crawler_import():
    """测试爬虫模块导入"""
    try:
        import crawl_sgcc
        print("✅ 爬虫模块导入成功")
        return True
    except ImportError as e:
        print(f"❌ 爬虫模块导入失败：{e}")
        return False


def test_viewer_import():
    """测试查看器模块导入"""
    try:
        import view_projects
        print("✅ 查看器模块导入成功")
        return True
    except ImportError as e:
        print(f"❌ 查看器模块导入失败：{e}")
        return False


def test_dependencies():
    """测试依赖包"""
    deps = {
        "requests": "requests",
        "bs4": "beautifulsoup4",
        "lxml": "lxml",
    }
    
    all_ok = True
    for module, package in deps.items():
        try:
            __import__(module)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} (未安装)")
            all_ok = False
    
    return all_ok


def main():
    print("=" * 60)
    print("项目雷达 MVP - 组件测试")
    print("=" * 60)
    print()
    
    tests = [
        ("依赖包", test_dependencies),
        ("数据文件", test_data_files),
        ("JSON 格式", test_json_data),
        ("爬虫模块", test_crawler_import),
        ("查看器模块", test_viewer_import),
    ]
    
    results = []
    for name, test_func in tests:
        print(f"\n[{name}]")
        result = test_func()
        results.append((name, result))
    
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    for name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"  {name}: {status}")
    
    print()
    print(f"总计：{passed}/{total} 通过")
    
    if passed == total:
        print("\n🎉 所有测试通过！MVP 可以正常运行")
        return 0
    else:
        print("\n⚠️  部分测试失败，请检查配置")
        return 1


if __name__ == "__main__":
    sys.exit(main())
