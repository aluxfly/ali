#!/usr/bin/env python3.11
# -*- coding: utf-8 -*-
"""
国家电网 ECP 平台网站分析脚本
使用 Playwright 分析网站结构和 API 接口
"""

import asyncio
import json
from playwright.async_api import async_playwright

async def analyze_website():
    """分析网站结构和 API"""
    
    results = {
        'urls_tested': [],
        'api_endpoints': [],
        'network_requests': [],
        'page_structure': {},
    }
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        
        # 设置控制台监听
        page.on('console', lambda msg: print(f'Console: {msg.type}: {msg.text}'))
        page.on('request', lambda req: results['network_requests'].append({
            'url': req.url,
            'method': req.method,
        }))
        page.on('response', lambda res: print(f'Response: {res.status} {res.url[:100]}'))
        
        # 访问主页
        print('正在访问主页...')
        try:
            await page.goto('https://ecp.sgcc.com.cn/', wait_until='networkidle', timeout=30000)
            print(f'主页标题：{await page.title()}')
            print(f'当前 URL: {page.url}')
            
            # 获取页面内容
            content = await page.content()
            results['page_structure']['home_content_length'] = len(content)
            
            # 查找所有链接
            links = await page.evaluate('''() => {
                return Array.from(document.querySelectorAll('a')).map(a => ({
                    href: a.href,
                    text: a.textContent.trim()
                })).filter(l => l.href && l.text);
            }''')
            results['page_structure']['links'] = links[:20]
            
            # 等待一段时间让可能的 API 请求完成
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f'访问主页失败：{e}')
        
        # 尝试访问可能的招标公告页面
        test_paths = [
            '/ecp/portal/admittanceNotice/index',
            '/ecp/portal/bidNotice/index', 
            '/ecp/portal/notice/index',
            '/bidNotice/index',
            '/notice/index',
        ]
        
        for path in test_paths:
            url = f'https://ecp.sgcc.com.cn{path}'
            print(f'\\n测试路径：{path}')
            try:
                await page.goto(url, wait_until='domcontentloaded', timeout=15000)
                await asyncio.sleep(2)
                current_url = page.url
                content = await page.content()
                
                results['urls_tested'].append({
                    'path': path,
                    'final_url': current_url,
                    'content_length': len(content),
                    'title': await page.title(),
                })
                
                # 检查是否有列表内容
                list_items = await page.evaluate('''() => {
                    const items = document.querySelectorAll('li, .list-item, .notice-item, .item');
                    return items.length;
                }''')
                print(f'  列表项数量：{list_items}')
                
            except Exception as e:
                print(f'  错误：{e}')
                results['urls_tested'].append({
                    'path': path,
                    'error': str(e),
                })
        
        await browser.close()
    
    return results


async def main():
    print('=' * 60)
    print('国家电网 ECP 平台网站分析')
    print('=' * 60)
    
    results = await analyze_website()
    
    print('\\n' + '=' * 60)
    print('分析结果')
    print('=' * 60)
    
    print(f'\\n测试的 URL 数量：{len(results["urls_tested"])}')
    for item in results['urls_tested']:
        print(f'  {item.get("path", "N/A")}: {item.get("title", "N/A")[:50]}')
    
    print(f'\\n网络请求数量：{len(results["network_requests"])}')
    for req in results['network_requests'][:20]:
        print(f'  {req["method"]} {req["url"][:80]}')
    
    # 保存结果
    with open('analysis_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f'\\n结果已保存至 analysis_results.json')


if __name__ == '__main__':
    asyncio.run(main())
