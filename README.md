# claude-code-sharing

> **49 页 HTML 单文件分享会幻灯片：用"Claude Code 的五块拼图"做主题，每页内嵌讲稿数据 + 4 个可交互动画演示。**

## 项目定位 / 背景

`claude-code-sharing` 是一个**纯静态**的分享会幻灯片工程——仓库内**没有 `package.json`、没有打包器**，就是 `index.html` + `app.js` + `anim.js` + `styles.css` + `anim.css` + 一份 49 张幻灯片的 `claude-code-architecture-talk.html`，浏览器双击即可打开。

主题是**Claude Code 架构逆向**——把官方 CLI 的源码结构（逆向材料）拆成"五块拼图"：
1. **架构总览** — 5 层（入口 / 渲染 / 编排 / 能力 / 基础设施），入口适配器矩阵（REPL / MCP / SDK / Bridge），核心 vs 插件（按信任级别分轨）
2. **循环与配置** — QueryEngine 的 `while(true)`，启动 4 级路由（feature flag + 动态 import + 并行 IO），Ink 渲染的 6 阶段管线 + 双缓冲
3. **上下文与记忆** — context budget、可控压缩、Memory 三层（短期 / 长期 / 项目 CLAUDE.md）
4. **工具与权限** — Bash 沙箱、permission 决策表、AskUserQuestion 救场、会话外延（SDK 仍受父对话约束）
5. **Hook 与扩展** — 27 节点生命周期事件、Skill vs Hook 对比、sub-agent 通信

`anim.js` 给 4 个核心概念（loop / budget / compression / permission）做了**可点击 state machine** 演示：每页用 `data-note` 属性写讲稿，右侧抽屉按 N 键打开讲者备注；S / H / F 键分别控制聚光灯、备注、全屏。

仓库还附带 `speaker-notes.md`（按页结构化的精简讲稿）和 `现场演示脚本.md`（实操剧本）。

## 仓库结构

```
claude-code-sharing/
├── index.html                  # 入口（极简，引入 styles + anim + app）
├── app.js                      # 翻页 / 缩放 / 全屏 / 聚光灯 / 讲稿抽屉
├── anim.js                     # 4 个交互演示：loop / budget / compression / permission
├── styles.css                  # 主题、排版、网格、表格、信任条
├── anim.css                    # 动画关键帧
├── claude-code-architecture-talk.html  # 49 张幻灯片主体（每节是 <section class="slide">）
├── speaker-notes.md            # 备用的精简讲稿
└── 现场演示脚本.md             # 实操剧本
```

## 技术栈

| 类别 | 选型 | 版本 |
| --- | --- | --- |
| 标记 | HTML5 (`<section class="slide">`) | — |
| 样式 | CSS3（Grid / Flexbox / `clamp()` / 渐变 / 动画） | — |
| 脚本 | 原生 ES2017+ JavaScript（无构建工具） | — |
| 依赖 | **零运行时依赖** | — |
| 字体 | 系统字体栈 | — |
| 部署 | 双击 `index.html` 即可（或挂 nginx / GitHub Pages） | — |

## 核心模块 / 特性

- **`index.html`**：`<main id="stage">` 包裹所有 `<section class="slide">`；侧栏抽屉 `<aside id="notes">` 显示讲稿；底部操作栏（prev / next / spot / notes / full / counter）；键盘绑定 ←/→/Space/PageUp/PageDown/Home/End/N/H/F。
- **`app.js`**：
  - `scale()`：根据 `innerWidth/1600, innerHeight/900` 计算等比缩放，所有 `.slide` 用 `transform: scale(s)` 自适应屏幕
  - `show(n)`：激活指定 slide，从 `dataset.note` 取讲稿写入抽屉，`history.replaceState` 同步 URL hash
  - `toggleNotes()` / `toggleSpot()`：抽屉 + 聚光灯（鼠标周围高亮）
  - `setWindowOpenHandler` 风格的 URL 路由：hash → `show(hash-1)`
  - 满屏：`document.fullscreenElement` 检测 + `requestFullscreen` / `exitFullscreen`
- **`anim.js`**（约 540 行）：注册 `window.SlideAnim = { init, onShow }`，被 `app.js` 在加载和翻页时调。实现 4 个 state machine 演示：
  - **LoopDemo**（slide 03，索引 5）：手工驱动 `重构 parsePath` 多轮脚本——`User / Model / Tool(Read/Edit/Bash)` 一步步点 Next，环形图高亮当前步
  - **BudgetDemo**（slide 10，索引 10）：context budget 可视化，分成 system / tools / history / response 四段
  - **CompressionDemo**（slide 13，索引 13）：长上下文压缩的"丢 vs 保"对比
  - **PermissionDemo**（slide 27，索引 27）：Bash 工具权限决策表（allow / deny / allow-with-rule / ask）交互
  - 每个 demo 用 `$$('.step')` 抓节点、`el(cls, html)` 建临时 DOM、`onShow` 调 `reset()` 重置状态
- **`styles.css`**：
  - 主题色（dark slide 用 `#0e0e12`，accent 用 `#efba4b`）
  - `.larch` 五层架构图（用 grid + 1/2/3/4/5 类切色深浅）
  - `.matrix` 入口适配器表、`.trust` 信任分轨条（用 `.trow.t-core / .t-plugin / .t-mcp / .t-skill / .t-hook` 各自配色）
  - `.band` 高亮带
  - `.four-keys` 5 个 key 卡片
  - 抽屉 `.notes.open` 滑入动画
- **`anim.css`**：关键帧（fadeIn / slideUp / pulseRing）、hover 效果、step 高亮
- **`claude-code-architecture-talk.html`**：49 个 `<section class="slide">`，每节结构：
  - `<div class="top">` — kicker + chapter "01 / 49"
  - `<h2>` — 当页标题
  - `<p class="subtitle">` — 一句话副标题
  - 内容区（按页不同：`.larch` / `.matrix` / `.trust` / 表格 / 流程图）
  - `<div class="foot">` — 讲者提示 + 当前页码
  - `data-note` 属性里写完整讲稿（一段话，3-8 句，覆盖为什么 / 怎么实现 / 怎么落地）
- **`speaker-notes.md`**：把 49 页的讲稿抽出来当备份 / 复习用
- **`现场演示脚本.md`**：现场怎么切页 + 调什么 demo + 注意事项

## 已完成 / 进行中

- ✅ 49 张幻灯片全部写完
- ✅ 4 个交互 demo（loop / budget / compression / permission）跑通
- ✅ 讲稿抽屉 + 聚光灯 + 全屏 + 缩放
- ✅ URL hash 同步（可分享"翻到第几页"）
- ✅ 备用的 `speaker-notes.md` 和 `现场演示脚本.md`
- ⏳ 后续内容更新（数字随逆向材料版本变）
- ⏳ 暗色 / 亮色切换
- ⏳ 导出 PDF（浏览器原生 print 配合 @media print 可加但未做）

## 本地预览

```bash
# 方案 1：直接双击 index.html（注意 hash 路由需要 file:// 下也能用）

# 方案 2：本地起静态服务（更稳）
python -m http.server 8000
# 或
npx serve .

# 然后浏览器打开 http://localhost:8000
# 键盘 ← / → 翻页，N 讲稿，H 聚光灯，F 全屏
```

## 状态

v0.1（讲完 49 页的完整稿），**内容与交互均可用**；是分享会材料，下一步可能扩到第二季（按逆向材料版本更新数字）。

## License

未声明 License。
