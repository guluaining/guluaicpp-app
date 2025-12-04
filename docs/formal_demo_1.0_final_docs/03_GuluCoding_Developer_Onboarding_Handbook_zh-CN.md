# GuluCoding 开发者入职手册

**文档ID:** GC-ENG-2025-01  
**版本:** 2.0 (V2.0 架构专用)  
**密级:** 内部文档 / 工程团队专用  
**欢迎加入团队！** 本文档是你开发和贡献 GuluCoding V2.0 平台的入门指南。

---

## 1. 开发哲学与核心概念

欢迎登船！你正在加入一个从成功的概念验证（POC）转型为可扩展的全球化平台的项目。我们的工程哲学建立在创造一个清晰、解耦且高效的开发环境之上。

在编写任何代码之前，你必须理解我们最核心的架构原则：**“内容工厂”模型**。

*   **我们的目标:** 赋能我们的内容团队（教师和课程设计师），让他们无需编写任何代码即可创建丰富的互动式课程。
*   **你作为工程师的角色:** 你不是“课程开发者”，而是“引擎建造者”和“工具建造者”。你的主要职责是改进 Gulu 游戏引擎、其使用的组件，以及帮助我们内容团队高效工作的工具。
*   **黄金法则:** **禁止**在 React 组件中包含任何与特定课程相关的逻辑、文本或布局信息。所有这些都**必须**在一个 `level.json` 文件中定义。如果你发现自己正在编写 `if (levelId === 'some_id')` 这样的代码，你就违反了这条规则。

## 2. 开始：本地开发环境设置

### 前置要求
*   Node.js (LTS 版本)
*   `pnpm` (用于 Monorepo 的包管理)
*   Git
*   代码编辑器 (推荐使用 VS Code)

### 设置步骤

1.  **克隆 Monorepo 仓库:**
    ```bash
    git clone https://github.com/GuluCoding/GuluAICPPAPP.git
    cd GuluAICPPAPP
    ```

2.  **安装依赖:**
    我们使用 `pnpm` 作为包管理器，因为它在处理 monorepo 时效率更高。
    ```bash
    pnpm install
    ```

3.  **配置环境变量:**
    复制环境变量模板文件。
    ```bash
    cp .env.example .env.local
    ```
    现在，打开 `.env.local` 文件并填入所需的密钥。你将从项目负责人或你的云服务控制台（例如 Supabase 项目 URL 和 anon key）获取这些信息。

4.  **运行开发服务器:**
    ```bash
    pnpm dev
    ```
    此命令会为 `web-global` 应用启动 Next.js 开发服务器。现在你可以在浏览器中打开 `http://localhost:3000`。

## 3. Monorepo 代码库结构

我们使用由 Turborepo驱动的 monorepo 来管理我们的代码。这使我们可以在不同的应用程序（例如，国际版 web 应用和中国版 web 应用）之间共享代码。

```
/
├── apps/
│   ├── web-global/      # 面向全球市场的主要 Next.js 应用
│   │   ├── app/         # App Router: 包含所有页面和 API 路由
│   │   └── public/
│   └── web-china/       # (未来) 针对中国市场定制的 Next.js 应用
│
├── packages/
│   ├── ui/              # [共享] 所有无状态的 React 组件 (VariableBox, Button 等)
│   ├── logic/           # [共享] 核心业务逻辑、类型定义和引擎工具
│   └── tsconfig/        # [共享] TypeScript 配置
│
└── package.json         # 根 package.json
└── turborepo.json       # Turborepo 配置
```

*   **`apps/web-global`**: 这是你将花费大部分时间的地方。它是主要的 Next.js 应用程序。
*   **`packages/ui`**: 我们的共享组件库。如果一个组件纯粹是展示性的，并且可以在任何地方使用，它就属于这里。
*   **`packages/logic`**: 共享的、与 React 无关的代码。这包括我们的 `level.json` schema 的 TypeScript 类型、验证辅助函数等。

## 4. 游戏引擎：工作原理

我们应用的核心是 `GameEngine.tsx` 组件。它是一个“哑”解释器，负责将 `level.json` 文件变得鲜活。

**数据流:**
1.  一个 Next.js 页面组件通过 API 路由从我们的后端获取当前课程的 `level.json`。
2.  这个 JSON 数据作为 prop 传递给 `<GameEngine />` 组件。
3.  引擎解析 `layout.elements` 数组，并使用我们共享 `ui` 包中的组件（例如 `<VariableBox />`）动态渲染课程的初始状态。
4.  引擎维护一个 `currentStep` 状态，它指向 JSON 文件中 `logic.steps` 数组里的一个对象。
5.  它渲染当前步骤的 `instruction`（指令）。
6.  它根据当前步骤定义的 `trigger`（触发器）附加事件监听器（例如，监听 `ButtonClick` 或 `DragDrop` 事件）。
7.  当用户执行与触发器匹配的操作时，引擎会：
    a. 运行 `validation` 规则（如果有的话）。
    b. 成功后，执行 `action`（例如，生成一个新元素，复制一个值）。
    c. 播放成功音效，并增加 `currentStep` 状态以进入下一步。

**你作为引擎开发者的工作:**
*   添加新的 `trigger` 类型 (例如, "DoubleClick", "TextInput")。
*   添加新的 `action` 类型 (例如, "AnimateElement", "ShowConfetti")。
*   改进渲染层以支持新的元素类型。
*   优化引擎的性能。

## 5. Git 工作流与编码规范

*   **分支:** 我们遵循标准的 GitFlow 流程。
    *   `main`: 生产分支。受保护。
    *   `develop`: 用于下一个版本的集成分支。
    *   从 `develop` 创建功能分支: `feat/new-engine-action` 或 `fix/login-bug`。
*   **提交:** 使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。(例如, `feat: add confetti action to game engine`, `fix: resolve drag-drop bug on ipad`)。
*   **拉取请求 (PRs):** 所有代码必须通过向 `develop` 分支发起的 PR 进行审查。一个 PR 在合并前必须通过所有 CI 检查（代码风格、类型检查、测试）。
*   **代码风格与格式化:** 我们使用 ESLint 和 Prettier。它们会作为 pre-commit 钩子自动运行。

## 6. 测试

*   **单元测试:** `packages/logic` 目录中的核心逻辑应由 Vitest 或 Jest 进行单元测试覆盖。
*   **组件测试:** `packages/ui` 中的 UI 组件应使用 React Testing Library 进行测试。
*   **端到端 (E2E) 测试:** 我们使用 Playwright 进行端到端测试，模拟用户与完整课程的互动。
*   **沙盒:** `/lab/engine` 页面是我们测试策略的关键部分，你可以在其中粘贴任何 `level.json` 并在隔离环境中进行测试。**务必先在沙盒中测试新的引擎功能。**

---
再次欢迎你！我们很高兴你的加入。通过专注于构建一个强大的引擎并赋能我们的内容团队，我们可以创造出真正神奇的教育体验。
