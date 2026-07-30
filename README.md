<div align="center">

# 📚 初中学习笔记

### 浙江专用 · 全科整理

---

</div>

## 科目索引

| 科目 | 笔记数 | 教材版本 |
|------|--------|----------|
| 📐 数学 | 6 篇 | 浙教版 |
| 🔬 物理 | 3 篇 | 浙教版 |
| 📝 英语 | 2 篇 | 外研版 |
| 📖 新概念英语 | 1 篇 | 第二册 |

## 快速导航

- **数学**：整式的乘除 · 因式分解 · 一元一次方程 · 口算速算 · 分数约分 · 几何规范
- **物理**：物态变化 · 物质变化与性质 · 质量与密度
- **英语**：16 种时态总结 · 语法体系

## 本地启动

```bash
# 方式一：Docsify 热重载（推荐，修改 .md 自动刷新）
npx docsify-cli serve . --port 3000

# 方式二：Python 静态服务器（无需安装 Docsify，无热重载）
python -m http.server 3000
```

启动后浏览器打开 `http://localhost:3000`。

## 发布部署

```bash
# 1. 重新生成侧边栏（扫描目录 → _sidebar.md，跳过 .docsignore 黑名单）
node generate-sidebar.js

# 2. 提交并推送
git add .
git commit -m "描述本次改动"
git push
```

推送后 **GitHub Pages** 自动部署，无需额外操作。仓库地址：`github.com/DeanYao2014/study-notes`

## 项目结构

```
├── index.html          # Docsify 入口 + 全部 CSS/JS（单文件设计）
├── _sidebar.md         # 自动生成，勿手动编辑
├── generate-sidebar.js # 侧边栏生成脚本
├── .docsignore         # 发布黑名单（不生成到侧边栏的文件）
├── .nojekyll           # 禁用 GitHub Pages 的 Jekyll 处理
├── 数学/ 物理/ 化学/ ...  # 各科 Markdown 笔记
└── CLAUDE*.md          # Claude 辅导助手配置（不发布）
```

## 使用说明

- ← 左侧边栏按科目分类，点击展开
- 🔍 顶部搜索框支持中文搜索知识点
- 🌙 左下角切换日间/夜间模式
- 📐 数学公式支持 KaTeX 渲染
- 📈 支持交互式函数图像和几何图形

---

> 📌 笔记持续更新中。点击左侧目录开始学习。
