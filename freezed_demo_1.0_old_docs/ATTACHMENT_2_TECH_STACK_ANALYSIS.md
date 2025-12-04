# 附件二：GuluCoding 技术选型与开源生态分析报告
**Attachment 2: Technical Stack Analysis & Selection Report**

## 第一部分：现有开源网校平台 (LMS) 深度评估

我为您调研了目前市面上主流的开源教育平台，并结合 GuluCoding 的特殊需求（C++交互、AI 导师、游戏化）进行了匹配度分析。

| 平台名称 | 技术栈 | 优点 | 致命弱点 (针对 Gulu) | 推荐指数 |
| :--- | :--- | :--- | :--- | :--- |
| **Open edX** | Python (Django) | 全球最强，哈佛/MIT使用，架构极其庞大，适合大学慕课。 | **太重、太丑、太难改**。它是为大学课程设计的，缺乏儿童游戏化基因。想把您的“盒子动效”塞进去极其困难。 | ⭐ |
| **Moodle** | PHP | 历史悠久，插件多，全球很多学校用。 | **技术栈过时 (PHP)**。UI 停留在 Web 1.0 时代，完全无法实现 Codecademy 级别的流畅交互。 | ⭐ |
| **FreeCodeCamp** | JS/Node.js | **全球最大的开源编程社区**。由一系列挑战关卡组成。 | 主要是“闯关列表”，缺乏“教学引导”和“可视化”。代码库是为成人自学设计的，不仅是平台，更是内容。 | ⭐⭐ |
| **Classroom.io** | React/Node | 界面现代，轻量级，专注课程管理。 | 功能过于简单，仅限于“放视频”和“简单的文字管理”，无法承载复杂的 C++ 运行环境。 | ⭐⭐ |

**🔴 核心结论：**
市面上**没有**现成的开源网校系统能直接满足 GuluCoding 的需求。
*   **Codecademy 的交互性** 需要定制的代码沙盒 (Sandbox)。
*   **Duolingo 的游戏化** 需要深度的前端定制 (Custom Frontend)。
*   **AI First** 需要重构底层数据流，而不是简单的插件。

**✅ 战略建议：**
不要使用传统的 LMS（学习管理系统）。**采用“现代全栈开发 (Modern Full-Stack)” + “无头 CMS (Headless CMS)” 的自研模式。** 这是目前硅谷新一代 EdTech（教育科技）公司的标准打法。

---

## 第二部分：推荐技术栈 —— “Gulu Stack” (全球先进标准)

为了达成“一份开发，全球运营”且体验对标 Duolingo，我们推荐以下技术架构。

### 1. 核心应用框架 (The Application)
*   **框架：Next.js (App Router)**
    *   *理由：* React 的事实标准。支持 SSR (SEO友好)，路由管理强大。Vercel (Next.js 母公司) 提供了全球最强的部署基建。
    *   *对标：* Duolingo, Notion, Netflix 都在使用类似技术。

### 2. 后端与数据库 (Backend as a Service)
*   **平台：Supabase (开源版 Firebase)**
    *   *核心优势：* 基于 **PostgreSQL**。提供 身份验证 (Auth)、数据库 (DB)、实时订阅 (Realtime)、存储 (Storage)。
    *   *中国适配：* Supabase 是开源的，你可以选择 **Self-host (自部署)** 到阿里云容器服务中，完全解决数据合规问题。
    *   *功能：* 管理用户、班级、进度、积分、排行榜。

### 3. 内容管理 (The "School" Part)
*   **系统：Strapi (Headless CMS)**
    *   *作用：* 管理“成功之路”的文章、课程大纲、视频链接、题目配置。
    *   *优势：* “无头”意味着它只提供 API。你的 Next.js 前端去调用它。这样你的前端可以做得像游戏一样炫酷，而内容管理依然井井有条。
    *   *运营：* 运营人员在 Strapi 后台录入课程，中美国际版自动同步更新。

### 4. 核心交互引擎 (The "Magic")
*   **代码沙盒：Judge0 (开源在线评测系统)**
    *   *痛点解决：* C++ 是编译型语言，浏览器无法直接运行。你需要一个安全的沙盒来编译运行孩子的代码。
    *   *方案：* 部署 Judge0 到后端服务器。前端发送代码 -> Judge0 编译运行 -> 返回结果 -> 触发 Gulu 动画。
*   **前端可视化：** 继续沿用您目前的 **React + Framer Motion** 方案（这是您的核心资产）。

### 5. AI 编排层 (AI First)
*   **框架：LangChain.js / Vercel AI SDK**
    *   *作用：* 管理 AI 的 Prompt，处理流式输出，管理上下文。
    *   *策略：* 在这一层做“路由”。如果用户 IP 是 CN -> 调用阿里云通义千问；如果 IP 是 Global -> 调用 Gemini/OpenAI。

---

## 第三部分：为什么这是最佳方案？(Executive Summary)

1.  **体验优先 (User Experience):** 传统的 LMS (Moodle) 给你的是一个“网站”；而 Next.js + 自研组件 给你的是一个“App”。对于孩子来说，这种流畅度、动画效果的区别是决定性的。
2.  **真正的数据主权:** 使用 Supabase 自部署方案，你可以完全掌控中国区的数据，完美符合《数据安全法》和 PIPL。
3.  **AI 深度集成:** 只有自研架构，AI 才能深入到“每一步操作”。例如：孩子拖拽错了变量，AI 可以在 0.5 秒内通过 WebSocket 推送一句鼓励，而不是等孩子提交作业后才反馈。
4.  **资产复用:** 你的 MVP 代码（Visualizer, GameCanvas）可以直接搬进 Next.js，不需要重写。