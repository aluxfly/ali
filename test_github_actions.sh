#!/bin/bash
# 测试 GitHub Actions 配置脚本

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     🧪 项目雷达 - GitHub Actions 配置测试               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查项计数
PASSED=0
FAILED=0

# 检查函数
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2: $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $2: $1 (不存在)"
        ((FAILED++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2: $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $2: $1 (不存在)"
        ((FAILED++))
    fi
}

check_env() {
    if [ -n "${!1}" ]; then
        echo -e "${GREEN}✓${NC} $2: $1 已设置"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} $2: $1 未设置（可选）"
    fi
}

echo "📁 检查文件结构..."
echo "─────────────────────────────────────────────────────────"

cd /home/admin/.openclaw/workspace-technician/projects/project-radar/

check_file ".github/workflows/update-data.yml" "工作流配置"
check_file "index.html" "前端页面"
check_file "server.js" "后端服务"
check_file "crawl_sgcc.py" "爬虫脚本"
check_file "requirements.txt" "Python 依赖"
check_file "GITHUB_ACTIONS_SETUP.md" "配置文档"
check_file "data/projects.json" "数据文件"

echo ""
echo "🔧 检查环境配置..."
echo "─────────────────────────────────────────────────────────"

check_env "GITHUB_OWNER" "GitHub 用户名"
check_env "GITHUB_REPO" "GitHub 仓库"
check_env "GITHUB_TOKEN" "GitHub Token"

echo ""
echo "📋 验证工作流配置..."
echo "─────────────────────────────────────────────────────────"

if grep -q "workflow_dispatch" .github/workflows/update-data.yml; then
    echo -e "${GREEN}✓${NC} 手动触发配置：已启用"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} 手动触发配置：未找到"
    ((FAILED++))
fi

if grep -q "schedule:" .github/workflows/update-data.yml; then
    echo -e "${GREEN}✓${NC} 定时触发配置：已启用"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} 定时触发配置：未启用"
fi

if grep -q "actions/checkout" .github/workflows/update-data.yml; then
    echo -e "${GREEN}✓${NC} 代码检出：已配置"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} 代码检出：未配置"
    ((FAILED++))
fi

if grep -q "actions/setup-python" .github/workflows/update-data.yml; then
    echo -e "${GREEN}✓${NC} Python 环境：已配置"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Python 环境：未配置"
    ((FAILED++))
fi

if grep -q "playwright" .github/workflows/update-data.yml; then
    echo -e "${GREEN}✓${NC} Playwright：已配置"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Playwright：未配置"
    ((FAILED++))
fi

if grep -q "actions-gh-pages" .github/workflows/update-data.yml; then
    echo -e "${GREEN}✓${NC} GitHub Pages 部署：已配置"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} GitHub Pages 部署：未配置"
    ((FAILED++))
fi

echo ""
echo "🌐 验证前端配置..."
echo "─────────────────────────────────────────────────────────"

if grep -q "updateData()" index.html; then
    echo -e "${GREEN}✓${NC} 更新函数：已定义"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} 更新函数：未找到"
    ((FAILED++))
fi

if grep -q "GITHUB_CONFIG" index.html; then
    echo -e "${GREEN}✓${NC} GitHub 配置对象：已定义"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} GitHub 配置对象：未找到"
    ((FAILED++))
fi

if grep -q "triggerGitHubWorkflowDirect" index.html; then
    echo -e "${GREEN}✓${NC} 直接触发函数：已实现"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} 直接触发函数：未找到"
    ((FAILED++))
fi

if grep -q "triggerGitHubWorkflowProxy" index.html; then
    echo -e "${GREEN}✓${NC} 代理触发函数：已实现"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} 代理触发函数：未找到"
    ((FAILED++))
fi

if grep -q "pollUpdateStatus" index.html; then
    echo -e "${GREEN}✓${NC} 状态轮询函数：已实现"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} 状态轮询函数：未找到"
    ((FAILED++))
fi

echo ""
echo "🔙 验证后端配置..."
echo "─────────────────────────────────────────────────────────"

if grep -q "/api/trigger-workflow" server.js; then
    echo -e "${GREEN}✓${NC} 代理 API 端点：已实现"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} 代理 API 端点：未找到"
    ((FAILED++))
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  测试结果：${PASSED} 通过，${FAILED} 失败"
echo "═══════════════════════════════════════════════════════════"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ 所有检查项通过！${NC}"
    echo ""
    echo "下一步："
    echo "1. 设置环境变量：export GITHUB_TOKEN=ghp_xxx"
    echo "2. 启动后端服务：npm start"
    echo "3. 访问网站测试按钮功能"
    exit 0
else
    echo -e "${RED}❌ 存在失败的检查项，请修复后重试${NC}"
    exit 1
fi
