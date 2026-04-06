#!/bin/bash
# 项目雷达启动脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║           📡 项目雷达 - 启动脚本                         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查 Python
if ! command -v python3.11 &> /dev/null; then
    echo "❌ 错误：未找到 Python 3.11，请先安装 Python 3.11"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装 Node.js 依赖..."
    npm install
fi

# 启动服务
echo "🚀 启动后端服务..."
echo ""
node server.js
