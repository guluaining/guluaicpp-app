# 附件七：当前应用架构详解与新成员入职指南
**Attachment 7: Current App Architecture & Developer Onboarding Guide**

**版本:** v1.0.0 (MVP Stable)
**适用对象:** 新入职全栈工程师、前端工程师

---

## 1. 系统概览 (High-Level Overview)

GuluCoding 目前是一个基于 **React (Vite)** + **Tailwind CSS** 的单页应用 (SPA)。它没有后端数据库，所有教学内容和逻辑目前都**硬编码 (Hardcoded)** 在前端代码中。

### 核心设计模式
*   **数据驱动 (Partially):** 题目定义在 `problemData.ts` 中，但交互逻辑散落在组件里。
*   **状态提升 (State Lifting):** `App.tsx` 掌管全局状态（当前题目、当前步骤、语言），并向下分发给子组件。
*   **双轨制视图 (Dual-Mode):** 针对同一道题，提供“游戏教学模式” (`GameCanvas`) 和“专业演示模式” (`Visualizer`)。

---

## 2. 文件目录结构 (File Tree)

```text
/
├── index.html              # 入口 HTML (含 Tailwind CDN, Import Map)
├── index.tsx               # React 挂载入口
├── App.tsx                 # [核心] 主控制器，路由与布局容器
├── types.ts                # [核心] TypeScript 类型定义 (数据模型)
├── metadata.json           # 项目元数据
├── problemData.ts          # [数据] "静态数据库"，存放所有关卡定义
│
├── services/
│   └── geminiService.ts    # [AI] 封装 Google Gemini API 调用逻辑
│
├── components/             # 组件库
│   ├── GameCanvas.tsx      # [核心] 游戏化教学引擎 (目前是单体大对象)
│   ├── Visualizer.tsx      # [核心] 专业模式可视化 (动画、伪代码、流程图)
│   ├── CodeDisplay.tsx     # 代码显示组件 (支持交互式 Token 点击)
│   ├── VariableBox.tsx     # 原子组件：显示变量盒子 (内存地址、值、颜色)
│   ├── ESLPanel.tsx        # 英语学习模块 (翻转卡片、打字游戏)
│   └── IntroModal.tsx      # 演示文稿组件 ("成功之路" PPT)
│
└── docs/                   # 项目文档与战略规划
    ├── ATTACHMENT_1...     # MVP 报告
    ├── ATTACHMENT_5...     # 架构重构白皮书
    └── ...

3. 核心文件详解 (Deep Dive)
3.1 App.tsx (指挥官)
职责: 它是整个 App 的大脑。
主要状态:
activeProblemId: 当前选中的题目 (如 'SWAP')。如果为 null，显示仪表盘。
step: 当前动画/代码执行到了第几步。
language: 全局中英文切换 ('en' | 'cn')。
viewMode: 控制显示哪个主视图 ('GAME' | 'PRO' | 'ESL')。
关键逻辑:
侧边栏 (Sidebar) 的渲染与折叠逻辑。
调用 geminiService 获取 AI 解释。
协调 GameCanvas 和 CodeDisplay 的步数同步。
3.2 problemData.ts (静态数据库)
职责: 存放所有的教学内容。
数据结构: ProblemDef (在 types.ts 定义)。
内容:
initialValues: 变量初始值。
code / fullCode: C++ 代码字符串。
pseudocode / flowchart: 专业模式用的数据。
esl: 英语单词和测验题库。
注意: 这是未来“内容工厂化”改革的重点对象。目前修改题目必须改这个文件。
3.3 components/GameCanvas.tsx (游戏引擎 - 待重构)
职责: 实现“拖拽互动”和“Gulu 老师引导”。
现状: 这是一个巨型组件 (Monolith)。
关键逻辑:
handleMouseDown/handleTouchStart: 处理拖拽逻辑，兼容 iPad。
renderAssignmentGame, renderSwapGame, renderFindMaxGame: 硬编码了每个关卡的具体渲染和判定逻辑。
phase: 内部状态机 (如 DECLARE -> INIT_A -> COMPLETE)。
重构目标: 将其拆解为通用的 JSON 解释器 (详见附件5)。
3.4 components/Visualizer.tsx (专业视图)
职责: 传统的算法可视化，适合复习和逻辑梳理。
功能:
Visual Tab: 渲染变量变化动画 (使用 VariableBox)。
Pseudo Tab: 渲染高亮的伪代码。
Flowchart Tab: 渲染 SVG 流程图。
特点: 它是无状态的 (Stateless)，完全依赖 App.tsx 传入的 step 来决定显示什么。
3.5 components/ESLPanel.tsx (英语模块)
职责: 编程英语专项训练。
包含子模块:
LearnView: 单词翻转卡片 (Flip Cards)，集成 TTS 发音。
QuizView: 多项选择题。
AdvancedTypingGame: 4阶段打字游戏 (Imprint -> Recognition -> Recall -> Dictation)，包含复杂的连对奖励和音频循环逻辑。
3.6 components/IntroModal.tsx (演示文稿)
职责: App 启动时的全屏演示，以及“成功之路”板块。
架构: 也是一个迷你应用。
支持 FUN (趣味) 和 PRO (专业) 两种视觉风格切换。
包含复杂的 CSS 动画组件 (PainPointAnimation, RoadmapAnimation, TeamAnimation)。
数据结构：Slide 数组。
4. 数据流向图 (Data Flow)
场景：用户在“游戏模式”拖动了一个盒子
用户操作: 在 GameCanvas 中拖动 'a' 到 'b'。
局部状态更新: GameCanvas 内部判断操作正确，更新 localValues (b 变了)，并推进内部 phase。
向上通讯: GameCanvas 调用 props.onStepChange(newStep)。
全局更新: App.tsx 接收到 newStep，更新全局 step 状态。
向下广播:
CodeDisplay: 接收到新 step，高亮对应的 C++ 代码行。
Visualizer: (如果在后台) 也会同步到对应状态。
GeminiService: 如果用户点击“解释”，AI 会拿到当前的 step 和 currentValues 生成解释。
5. 新手开发注意事项
移动端兼容: 任何拖拽逻辑必须同时支持 Mouse 和 Touch 事件 (参考 GameCanvas.tsx 的实现)。
多语言: 所有 UI 文本必须通过 language === 'cn' ? ... : ... 进行判断，不要写死中文。
不要直接改 node_modules: 我们使用 Import Map (CDN)，没有本地 npm 依赖包（除了类型定义）。
图标: 目前使用 SVG 字符串直接嵌入。
6. 下一步重构方向 (Roadmap)
请在阅读代码前先阅读 docs/ATTACHMENT_5_ARCHITECTURE_AND_REFACTORING.md。
我们的目标是将 GameCanvas 中的硬编码逻辑剥离，建立 JSON 驱动的内容工厂。
Welcome to the Team! Let's build the future of Coding Education.
