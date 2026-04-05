# 标书工厂 Web 版 - 部署指南

## ✅ 当前状态

代码已推送到 GitHub 仓库：https://github.com/aluxfly/ali

文件位置：`gh-pages` 分支的 `bid_factory/` 目录

## 🚀 部署方案

### 方案一：GitHub Pages（推荐）

**步骤：**

1. 打开 GitHub 仓库：https://github.com/aluxfly/ali

2. 进入 Settings → Pages

3. 配置 GitHub Pages：
   - **Source**: Deploy from a branch
   - **Branch**: gh-pages
   - **Folder**: / (root)
   - 点击 Save

4. 等待 1-2 分钟部署完成

5. 访问网站：
   ```
   https://aluxfly.github.io/ali/bid_factory/
   ```

**注意：** 如果根目录已有其他页面，可以考虑：
- 将标书工厂放在子目录（当前配置）
- 或创建独立的仓库专门用于标书工厂

---

### 方案二：Vercel（最简单）

**步骤：**

1. 访问 https://vercel.com 并登录

2. 点击 "Add New Project"

3. 选择 "Import Git Repository"

4. 选择 `aluxfly/ali` 仓库

5. 配置项目：
   - **Framework Preset**: Other
   - **Root Directory**: `bid_factory/web`
   - **Build Command**: (留空)
   - **Output Directory**: (留空)

6. 点击 "Deploy"

7. 获取访问链接（类似）：
   ```
   https://ali-bid-factory.vercel.app
   ```

**优点：**
- 自动 HTTPS
- 自动部署（代码更新后自动重新部署）
- 全球 CDN 加速

---

### 方案三：Netlify

**步骤：**

1. 访问 https://www.netlify.com 并登录

2. 点击 "Add new site" → "Import an existing project"

3. 选择 GitHub 并授权

4. 选择 `aluxfly/ali` 仓库

5. 配置：
   - **Branch**: gh-pages
   - **Base directory**: `bid_factory/web`
   - **Build command**: (留空)
   - **Publish directory**: `.`

6. 点击 "Deploy site"

7. 获取访问链接（类似）：
   ```
   https://bid-factory-xxx.netlify.app
   ```

---

### 方案四：本地测试

**使用 Python 内置服务器：**

```bash
cd /home/admin/.openclaw/workspace-technician/projects/project-radar/bid_factory/web
python3 -m http.server 8080
```

然后访问：http://localhost:8080

**使用 Node.js http-server：**

```bash
npm install -g http-server
cd /home/admin/.openclaw/workspace-technician/projects/project-radar/bid_factory/web
http-server -p 8080
```

然后访问：http://localhost:8080

---

## 📝 自定义配置

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

---

## 🔧 更新部署

### GitHub Pages

```bash
cd /home/admin/.openclaw/workspace-technician/projects/project-radar
git add bid_factory/web/
git commit -m "更新标书工厂 Web 版"
git push origin gh-pages
```

等待 1-2 分钟自动部署。

### Vercel/Netlify

如果使用 Git 集成，推送代码后会自动重新部署。

---

## 📊 访问统计

如需添加访问统计，可以：

1. **Google Analytics** - 在 `index.html` 的 `<head>` 中添加 GA 代码
2. **Umami** - 开源统计工具，自托管
3. **Plausible** - 隐私友好的统计工具

---

## 🌐 自定义域名

### GitHub Pages

1. 在仓库 Settings → Pages → Custom domain
2. 输入你的域名（如 `bid.yourcompany.com`）
3. 在 DNS 提供商处添加 CNAME 记录

### Vercel

1. 在项目 Settings → Domains
2. 添加自定义域名
3. 按提示配置 DNS

---

## ⚠️ 注意事项

1. **文件大小** - 生成的 Word 文档在浏览器端创建，大文档可能较慢
2. **浏览器兼容性** - 需要现代浏览器（Chrome 80+, Firefox 75+, Safari 13+）
3. **CDN 依赖** - 使用 unpkg 和 cdnjs 加载第三方库，确保网络可达
4. **数据安全** - 所有处理在浏览器端完成，数据不会上传到服务器

---

## 📞 技术支持

如有问题，请检查：
1. 浏览器控制台错误（F12 → Console）
2. 网络连接状态
3. 第三方 CDN 是否可访问

---

**更新日期**: 2026-04-06  
**版本**: 1.0.0
