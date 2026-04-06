# 标题颜色冲突修复报告

**日期**: 2026-04-06  
**问题**: 网页标题颜色与背景色块颜色一致，导致文字被挡住看不见

## 问题分析

导航栏中的页面标题（`<h1>`）使用了 `text-gradient` 类和内联样式，使文字采用渐变背景效果：
- 文字设置为透明（`-webkit-text-fill-color: transparent`）
- 通过背景渐变显示颜色（`background: var(--prediction-gradient)`）
- 在浅色玻璃态导航栏背景上，紫色/绿色渐变对比度不足，导致文字看不清

## 修复内容

### 1. CSS 文件修改 (`css/design-system.css`)

**修改前**:
```css
.navbar-title h1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-extrabold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  letter-spacing: -0.02em;
}
```

**修改后**:
```css
.navbar-title h1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-extrabold);
  color: var(--slate-800);
  line-height: 1.2;
  letter-spacing: -0.02em;
}
```

### 2. HTML 文件修改

#### `win_prediction.html`
**修改前**:
```html
<h1 class="text-gradient" style="background: var(--prediction-gradient);">中标预测</h1>
```

**修改后**:
```html
<h1>中标预测</h1>
```

#### `bid_factory/index.html`
**修改前**:
```html
<h1 class="text-gradient" style="background: var(--bid-gradient);">标书工厂</h1>
```

**修改后**:
```html
<h1>标书工厂</h1>
```

#### `index.html`
无需修改（已使用正确的纯文本标题）

## 修复效果

- ✅ 导航栏标题现在使用深色实色（`var(--slate-800)`，#1e293b）
- ✅ 在浅色玻璃态背景上有足够的对比度
- ✅ 文字清晰可见，不再被背景色块遮挡
- ✅ 保持与设计系统一致的专业外观

## 验证

- ✅ Git 提交：`a9606d1 fix: 修复导航栏标题颜色与背景冲突问题`
- ✅ 已推送到 gh-pages 分支
- ✅ GitHub Pages 已更新：https://aluxfly.github.io/ali/
- ✅ 所有三个页面已验证：
  - 项目雷达主页：https://aluxfly.github.io/ali/
  - 中标预测：https://aluxfly.github.io/ali/win_prediction.html
  - 标书工厂：https://aluxfly.github.io/ali/bid_factory/index.html

## 修复原则

遵循 WCAG 对比度指南：
- 深色背景 → 白色/浅色文字
- 浅色背景 → 深色文字（本次修复采用此方案）
- 确保文字与背景有足够对比度（至少 4.5:1）
