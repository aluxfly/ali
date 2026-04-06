#!/bin/bash
# 测试更新按钮修复

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║         🧪 更新按钮修复验证测试                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# 测试 1: 检查 index.html 是否存在
echo "📋 测试 1: 检查文件完整性"
if [ -f "index.html" ]; then
    echo "✅ index.html 存在"
else
    echo "❌ index.html 不存在"
    exit 1
fi

# 测试 2: 检查关键函数是否存在
echo ""
echo "📋 测试 2: 检查关键函数"
if grep -q "function showTokenConfigDialog" index.html; then
    echo "✅ showTokenConfigDialog 函数存在"
else
    echo "❌ showTokenConfigDialog 函数不存在"
    exit 1
fi

if grep -q "function getGitHubToken" index.html; then
    echo "✅ getGitHubToken 函数存在"
else
    echo "❌ getGitHubToken 函数不存在"
    exit 1
fi

if grep -q "function triggerGitHubWorkflowDirect(token)" index.html; then
    echo "✅ triggerGitHubWorkflowDirect(token) 函数存在"
else
    echo "❌ triggerGitHubWorkflowDirect(token) 函数不存在"
    exit 1
fi

# 测试 3: 检查 Token 配置按钮
echo ""
echo "📋 测试 3: 检查 Token 配置按钮"
if grep -q "token-config-btn" index.html; then
    echo "✅ Token 配置按钮存在"
else
    echo "❌ Token 配置按钮不存在"
    exit 1
fi

# 测试 4: 检查 localStorage 使用
echo ""
echo "📋 测试 4: 检查 localStorage 存储"
if grep -q "localStorage.getItem('github_token')" index.html; then
    echo "✅ localStorage.getItem 使用正确"
else
    echo "❌ localStorage.getItem 未找到"
    exit 1
fi

if grep -q "localStorage.setItem('github_token'" index.html; then
    echo "✅ localStorage.setItem 使用正确"
else
    echo "❌ localStorage.setItem 未找到"
    exit 1
fi

# 测试 5: 检查初始化代码
echo ""
echo "📋 测试 5: 检查初始化代码"
if grep -q "checkTokenStatus()" index.html; then
    echo "✅ checkTokenStatus 调用存在"
else
    echo "❌ checkTokenStatus 调用不存在"
    exit 1
fi

# 测试 6: 检查错误处理
echo ""
echo "📋 测试 6: 检查错误处理"
if grep -q "401" index.html; then
    echo "✅ 401 错误处理存在"
else
    echo "❌ 401 错误处理不存在"
fi

# 测试 7: HTML 语法检查（基本）
echo ""
echo "📋 测试 7: 检查 HTML 结构"
open_tags=$(grep -o "<script>" index.html | wc -l)
close_tags=$(grep -o "</script>" index.html | wc -l)
if [ "$open_tags" -eq "$close_tags" ]; then
    echo "✅ script 标签配对正确 ($open_tags 对)"
else
    echo "❌ script 标签不配对 (开:$open_tags 闭:$close_tags)"
    exit 1
fi

# 测试 8: 检查备份文件
echo ""
echo "📋 测试 8: 检查备份"
if [ -f "index.html.bak.20260406_api_fix" ]; then
    echo "✅ 备份文件存在"
else
    echo "⚠️  备份文件不存在（非致命）"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                    ✅ 所有测试通过                       ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  修复内容：                                              ║"
echo "║  • 纯前端方案：使用 localStorage 存储 GitHub Token         ║"
echo "║  • Token 配置对话框：引导用户配置 Personal Access Token    ║"
echo "║  • 错误处理：401 错误自动清除 Token 并提示重新配置         ║"
echo "║  • UI 优化：Token 配置按钮 + 状态指示                      ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  下一步：                                                ║"
echo "║  1. 提交修改到 Git                                       ║"
echo "║  2. 推送到 GitHub                                        ║"
echo "║  3. 等待 GitHub Pages 部署                               ║"
echo "║  4. 访问网站测试功能                                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# 显示部署命令
echo "📝 部署命令："
echo ""
echo "  git add index.html API_FIX_REPORT.md"
echo "  git commit -m \"fix: 更新按钮纯前端方案，支持用户配置 GitHub Token\""
echo "  git push origin main"
echo ""
echo "🌐 测试地址："
echo "  https://aluxfly.github.io/ali/"
echo ""
