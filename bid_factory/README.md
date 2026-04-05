# 标书工厂 Web 版

基于浏览器的智能标书生成器，无需服务器，完全静态网站。

## 🚀 快速开始

### 本地测试

直接在浏览器中打开 `index.html` 文件即可使用：

```bash
# 方法 1: 直接打开文件
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows

# 方法 2: 使用本地服务器（推荐）
python3 -m http.server 8080
# 然后访问 http://localhost:8080
```

### 部署到 GitHub Pages

1. **创建 GitHub 仓库**
   ```bash
   # 在 GitHub 上创建新仓库，例如：bid-factory-web
   ```

2. **推送代码**
   ```bash
   cd /home/admin/.openclaw/workspace-technician/projects/project-radar/bid_factory/web
   
   # 初始化 Git（如果还没有）
   git init
   
   # 添加远程仓库（替换为你的仓库地址）
   git remote add origin https://github.com/YOUR_USERNAME/bid-factory-web.git
   
   # 提交并推送
   git add .
   git commit -m "Initial commit: 标书工厂 Web 版"
   git branch -M main
   git push -u origin main
   ```

3. **启用 GitHub Pages**
   - 进入 GitHub 仓库页面
   - 点击 Settings → Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main"，文件夹选择 "/ (root)"
   - 点击 Save

4. **访问网站**
   - 等待 1-2 分钟部署完成
   - 访问：`https://YOUR_USERNAME.github.io/bid-factory-web/`

### 部署到 Vercel

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
cd /home/admin/.openclaw/workspace-technician/projects/project-radar/bid_factory/web
vercel

# 按提示操作，选择项目类型為 Static Site
```

### 部署到 Netlify

1. 访问 [Netlify](https://www.netlify.com/)
2. 拖拽 `web` 文件夹到部署区域
3. 或连接 GitHub 仓库自动部署

## 📁 文件结构

```
web/
├── index.html      # 主页面
├── style.css       # 样式表
├── app.js          # 应用逻辑
└── README.md       # 本文件
```

## ✨ 功能特性

- **上传招标公告** - 粘贴或输入招标公告文本
- **自动解析** - 智能提取项目名称、编号、招标人等关键信息
- **在线编辑** - 可手动修改解析结果
- **一键生成** - 生成技术标、商务标、资质文件清单
- **即时下载** - 直接在浏览器下载 Word 文档
- **隐私安全** - 所有处理在浏览器端完成，不上传服务器

## 📄 生成文档

1. **技术标** - 包含项目理解、技术方案、实施计划、质量保证、售后服务
2. **商务标** - 包含投标函、报价表、商务条款响应、企业资质、业绩案例
3. **资质文件清单** - 必备资质和专业资质清单

## 🔧 自定义配置

### 修改公司信息

编辑 `app.js` 文件中的 `companyInfo` 对象：

```javascript
const companyInfo = {
    name: '你的公司名称',
    address: '公司地址',
    phone: '联系电话',
    email: '邮箱',
    legalRep: '法定代表人',
    registerCapital: '注册资本',
    establishDate: '成立日期'
};
```

### 修改模板内容

编辑 `app.js` 中的以下函数：
- `generateTechnicalBid()` - 技术标模板
- `generateBusinessBid()` - 商务标模板
- `generateQualificationList()` - 资质清单模板

## 🛠️ 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式设计（响应式布局）
- **JavaScript (ES6+)** - 应用逻辑
- **docx.js** - Word 文档生成库
- **FileSaver.js** - 文件下载库

## 📝 使用说明

1. **输入招标公告**
   - 在文本框中粘贴招标公告内容
   - 或点击"加载示例"查看示例格式

2. **解析信息**
   - 点击"解析公告信息"按钮
   - 系统自动提取关键信息

3. **确认信息**
   - 检查解析结果
   - 可点击任意字段进行编辑修改

4. **生成标书**
   - 点击"生成标书"按钮
   - 等待生成进度完成

5. **下载文档**
   - 选择要下载的文档
   - 或点击"下载全部"一次性下载所有文档

## ⚠️ 注意事项

1. **信息准确性** - 自动提取的信息需要人工核对
2. **报价填写** - 报价表需要人工填写具体金额
3. **资质文件** - 需要附加真实的资质证书扫描件
4. **方案定制** - 技术方案需要根据项目特点进行定制
5. **法律审核** - 标书内容需要法务审核

## 🌐 浏览器兼容性

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 📞 技术支持

如有问题或建议，请联系技术团队。

---

**版本**: 1.0.0  
**更新日期**: 2026-04-06  
**开发团队**: 项目雷达技术组
