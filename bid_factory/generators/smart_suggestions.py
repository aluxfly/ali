#!/usr/bin/env python3.11
"""
智能建议模块
根据招标要求推荐方案、提供历史中标方案参考、提示风险点
"""

import re
from typing import Dict, List, Optional
from datetime import datetime


class SmartSuggestionEngine:
    """智能建议引擎"""
    
    def __init__(self):
        # 行业关键词与方案映射
        self.solution_mapping = {
            '电力': self._get_power_solution,
            '设备': self._get_equipment_solution,
            '软件': self._get_software_solution,
            '系统': self._get_system_solution,
            '工程': self._get_engineering_solution,
            '服务': self._get_service_solution,
        }
        
        # 风险关键词
        self.risk_keywords = {
            '工期紧': '建议增加人员配置，采用并行开发模式',
            '预算低': '建议优化方案，控制成本，突出性价比',
            '技术新': '建议安排技术专家，加强技术培训',
            '要求高': '建议配置资深团队，严格质量管控',
            '跨区域': '建议设立本地化服务团队',
            '质保长': '建议提前规划售后服务资源',
        }
    
    def analyze_requirements(self, announcement_text: str) -> Dict:
        """分析招标要求，生成智能建议"""
        suggestions = {
            'recommended_solutions': [],
            'risk_points': [],
            'key_focus': [],
            'historical_reference': [],
        }
        
        # 提取关键词
        keywords = self._extract_keywords(announcement_text)
        
        # 生成推荐方案
        suggestions['recommended_solutions'] = self._generate_solutions(keywords, announcement_text)
        
        # 识别风险点
        suggestions['risk_points'] = self._identify_risks(announcement_text)
        
        # 提取关注重点
        suggestions['key_focus'] = self._extract_key_focus(announcement_text)
        
        # 历史参考（示例）
        suggestions['historical_reference'] = self._get_historical_reference(keywords)
        
        return suggestions
    
    def _extract_keywords(self, text: str) -> List[str]:
        """提取关键词"""
        keywords = []
        
        # 行业关键词
        industries = ['电力', '电网', '设备', '软件', '系统', '工程', '服务', '采购', '建设']
        for industry in industries:
            if industry in text:
                keywords.append(industry)
        
        return keywords
    
    def _generate_solutions(self, keywords: List[str], text: str) -> List[Dict]:
        """生成推荐方案"""
        solutions = []
        
        for keyword in keywords:
            if keyword in self.solution_mapping:
                solution = self.solution_mapping[keyword]()
                if solution:
                    solutions.append(solution)
        
        # 如果没有匹配到特定方案，提供通用方案
        if not solutions:
            solutions.append({
                'name': '通用解决方案',
                'description': '根据项目特点定制的综合解决方案',
                'highlights': [
                    '成熟的技术架构',
                    '丰富的实施经验',
                    '完善的售后服务',
                ]
            })
        
        return solutions
    
    def _identify_risks(self, text: str) -> List[Dict]:
        """识别风险点"""
        risks = []
        
        # 检查工期风险
        if any(word in text for word in ['工期', '周期', '时间紧', '紧急']):
            risks.append({
                'type': '工期风险',
                'description': '项目工期可能较紧张',
                'mitigation': '建议增加人员配置，采用并行开发模式，提前规划关键节点'
            })
        
        # 检查预算风险
        if any(word in text for word in ['预算', '限价', '低价']):
            risks.append({
                'type': '预算风险',
                'description': '项目预算可能有限',
                'mitigation': '建议优化方案降低成本，突出性价比优势'
            })
        
        # 检查技术风险
        if any(word in text for word in ['新技术', '创新', '研发']):
            risks.append({
                'type': '技术风险',
                'description': '项目可能涉及新技术应用',
                'mitigation': '建议安排技术专家参与，加强技术预研和培训'
            })
        
        # 检查质量风险
        if any(word in text for word in ['高质量', '严格', '标准高']):
            risks.append({
                'type': '质量风险',
                'description': '项目质量要求较高',
                'mitigation': '建议配置资深团队，建立严格的质量管控体系'
            })
        
        # 检查售后风险
        if any(word in text for word in ['质保', '售后', '维护', '服务']):
            risks.append({
                'type': '售后风险',
                'description': '项目售后服务要求较高',
                'mitigation': '建议提前规划售后服务资源，建立本地化服务团队'
            })
        
        return risks
    
    def _extract_key_focus(self, text: str) -> List[str]:
        """提取评标关注重点"""
        focus_points = []
        
        # 常见评标因素
        if '技术' in text:
            focus_points.append('技术方案评分（通常占比 40-60%）')
        if '价格' in text or '报价' in text:
            focus_points.append('价格评分（通常占比 20-40%）')
        if '业绩' in text or '案例' in text:
            focus_points.append('业绩案例评分（通常占比 10-20%）')
        if '资质' in text or '资格' in text:
            focus_points.append('企业资质要求（必须满足）')
        if '服务' in text:
            focus_points.append('售后服务评分（通常占比 5-15%）')
        
        return focus_points
    
    def _get_historical_reference(self, keywords: List[str]) -> List[Dict]:
        """获取历史中标方案参考（示例数据）"""
        references = []
        
        # 示例历史数据
        sample_references = [
            {
                'project_name': '某省电力设备采购项目',
                'winning_bid': 'XXX 科技有限公司',
                'bid_amount': 'XXX 万元',
                'key_factors': ['技术方案先进', '价格合理', '业绩丰富'],
                'date': '2023 年 X 月'
            },
            {
                'project_name': '某市信息系统建设项目',
                'winning_bid': 'XXX 信息技术有限公司',
                'bid_amount': 'XXX 万元',
                'key_factors': ['本地化服务', '响应快速', '案例丰富'],
                'date': '2023 年 X 月'
            },
        ]
        
        return sample_references
    
    def _get_power_solution(self) -> Dict:
        """电力行业解决方案"""
        return {
            'name': '电力行业解决方案',
            'description': '针对电力行业特点的专业解决方案',
            'highlights': [
                '符合电力行业标准和规范',
                '满足电网安全运行要求',
                '支持电力系统特殊需求',
                '具备电力行业实施经验',
            ]
        }
    
    def _get_equipment_solution(self) -> Dict:
        """设备采购解决方案"""
        return {
            'name': '设备采购解决方案',
            'description': '设备供应与安装整体解决方案',
            'highlights': [
                '提供知名品牌设备',
                '完整的安装调试服务',
                '完善的备品备件供应',
                '专业的技术培训',
            ]
        }
    
    def _get_software_solution(self) -> Dict:
        """软件系统解决方案"""
        return {
            'name': '软件系统解决方案',
            'description': '定制化软件开发与实施',
            'highlights': [
                '成熟的技术架构',
                '灵活的定制开发',
                '完善的功能模块',
                '持续的升级维护',
            ]
        }
    
    def _get_system_solution(self) -> Dict:
        """系统集成解决方案"""
        return {
            'name': '系统集成解决方案',
            'description': '多系统整合与集成',
            'highlights': [
                '统一的技术平台',
                '无缝的系统对接',
                '数据互联互通',
                '整体运维支持',
            ]
        }
    
    def _get_engineering_solution(self) -> Dict:
        """工程实施解决方案"""
        return {
            'name': '工程实施解决方案',
            'description': '工程总包与实施服务',
            'highlights': [
                '专业施工团队',
                '严格的质量管控',
                '安全的施工管理',
                '及时的交付保障',
            ]
        }
    
    def _get_service_solution(self) -> Dict:
        """服务类解决方案"""
        return {
            'name': '专业服务解决方案',
            'description': '专业技术服务',
            'highlights': [
                '资深专家团队',
                '快速响应机制',
                '完善的服务流程',
                '持续的服务改进',
            ]
        }
    
    def generate_suggestion_report(self, announcement_text: str) -> str:
        """生成智能建议报告"""
        suggestions = self.analyze_requirements(announcement_text)
        
        report = []
        report.append("=" * 60)
        report.append("智能建议报告")
        report.append(f"生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("=" * 60)
        
        # 推荐方案
        report.append("\n【推荐方案】")
        for i, solution in enumerate(suggestions['recommended_solutions'], 1):
            report.append(f"\n{i}. {solution['name']}")
            report.append(f"   描述：{solution['description']}")
            report.append("   亮点：")
            for highlight in solution['highlights']:
                report.append(f"   • {highlight}")
        
        # 风险点
        report.append("\n【风险点提示】")
        if suggestions['risk_points']:
            for i, risk in enumerate(suggestions['risk_points'], 1):
                report.append(f"\n{i}. {risk['type']}")
                report.append(f"   说明：{risk['description']}")
                report.append(f"   应对：{risk['mitigation']}")
        else:
            report.append("未发现明显风险点")
        
        # 关注重点
        report.append("\n【评标关注重点】")
        for focus in suggestions['key_focus']:
            report.append(f"• {focus}")
        
        # 历史参考
        report.append("\n【历史中标参考】")
        for ref in suggestions['historical_reference']:
            report.append(f"\n项目：{ref['project_name']}")
            report.append(f"中标单位：{ref['winning_bid']}")
            report.append(f"中标金额：{ref['bid_amount']}")
            report.append(f"关键因素：{', '.join(ref['key_factors'])}")
        
        report.append("\n" + "=" * 60)
        
        return "\n".join(report)


def main():
    """主函数 - 示例用法"""
    engine = SmartSuggestionEngine()
    
    sample_announcement = """
    项目名称：某市电力设备采购项目
    项目概况：采购一批电力设备，工期要求 3 个月，预算 500 万元
    技术要求：符合国家电力行业标准，质保期 3 年
    资质要求：具备电力行业相关资质，有类似项目业绩
    """
    
    report = engine.generate_suggestion_report(sample_announcement)
    print(report)


if __name__ == '__main__':
    main()
