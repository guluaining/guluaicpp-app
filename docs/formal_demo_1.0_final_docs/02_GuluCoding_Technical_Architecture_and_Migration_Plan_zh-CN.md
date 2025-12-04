# GuluCoding 技术架构与迁移计划

**文档ID:** GC-CTO-2025-01  
**版本:** 2.0 (官方工程计划)  
**密级:** 机密 / 技术与产品团队专用  
**日期:** 2025年12月4日

---

## 1. 引言与问题陈述

本文档提供 GuluCoding V2.0 的官方技术架构与迁移计划。当前的 MVP (最小可行产品) 虽然成功验证了产品与市场的匹配度，但其建立在一个无法规模化、不安全且不具备商业可行性的纯前端架构之上。

**核心技术债务:**
*   **单体前端:** 单个 React 组件 (`GameCanvas.tsx`) 包含了超过 1200 行的硬编码逻辑，囊括了所有课程。
*   **内容与代码耦合:** 每一门新课程或内容的变更都需要工程师的直接介入，造成了生产瓶颈。
*   **安全漏洞:** Gemini API 密钥暴露在客户端，构成了重大的财务风险。
*   **缺乏数据持久化:** 用户数据存储在内存中，刷新即丢失，使得用户账户、进度跟踪和商业化成为空谈。

**目标:** 通过实施现代化的、全栈的、解耦的架构，将 GuluCoding 从一个“手工艺品”转变为一个“工业级的内容工厂”。

## 2. 架构原则

V2.0 架构遵循三大核心原则：

1.  **解耦 (内容工厂模式):** **引擎层** (应用程序) 必须与 **内容层** (课程) 完全分离。引擎只关心 *如何* 渲染互动体验，但对 C++ 一无所知。而以标准化 JSON 格式定义的内容，则告诉引擎 *渲染什么*。
2.  **数据驱动设计:** 所有的互动体验都由从数据库获取的数据 (JSON) 动态生成，而非来自硬编码的组件逻辑。这使得内容的创建、更新和发布无需重新部署整个应用程序。
3.  **渐进式迁移 (绞杀榕模式):** 我们不会执行高风险的“推倒重来”。新的 V2.0 架构将与现有 MVP 并行构建。我们将逐一迁移课程，让两个系统同时运行，直到新系统得到充分验证并能完全取代旧系统。

## 3. 目标架构与技术选型

### 3.1 V2.0 技术栈

| 层面 | 技术选型 | 理由 |
| :--- | :--- | :--- |
| **框架** | **Next.js 14 (App Router)** | React 的行业标杆。为 SEO 提供 SSR/SSG，集成了 API 路由以支持全栈后端，并通过 Vercel 实现无缝部署。 |
| **后端/数据库** | **Supabase (PostgreSQL)** | 开源的 Firebase 替代品。提供身份验证、基于 PostgreSQL 的强大数据库（JSONB 支持极佳）、存储和实时能力。可为中国区合规进行自托管。 |
| **代码执行**| **Judge0** | 一个安全的、开源的沙箱，用于编译和运行用户提交的 C++ 代码，是高级课程和自定义输入的关键。 |
| **AI 编排**| **后端 API 路由** | 一个自定义的 API 代理将管理所有对大语言模型的调用。这能保护 API 密钥，并允许在 Gemini (国际) 和国内模型 (中国) 之间进行动态路由。 |
| **部署** | **Vercel (国际), 阿里云 (中国)**| 利用顶级的全球 CDN 和 CI/CD，同时确保中国市场的本地化部署。 |
| **代码仓库** | **Turborepo** | 用于管理 `web-global` 和 `web-china` 应用之间共享的 `ui` 和 `logic` 包。 |

### 3.2 系统架构图

```mermaid
graph TD
    subgraph "用户与内容接口"
        WebApp[Next.js Web 应用]
        ContentCMS[内容管理系统]
    end

    subgraph "应用服务 (Next.js API 路由)"
        APIGateway[API 网关]
        AIProxy[AI 代理路由]
        CodeRunner[代码运行器 (Judge0)]
    end

    subgraph "后端即服务 (Supabase)"
        Auth[身份认证]
        DB[(PostgreSQL 数据库)]
        Storage[文件存储]
    end

    WebApp --> APIGateway
    ContentCMS --> APIGateway

    APIGateway --> Auth
    APIGateway --> DB
    APIGateway --> AIProxy
    APIGateway --> CodeRunner
```

## 4. 数据库与内容 Schema 设计

### 4.1 PostgreSQL Schema

**表: `levels`** (存储每节课的配置)
```sql
CREATE TABLE levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,      -- 例如 'swap-variables'
  config JSONB NOT NULL,          -- 核心课程数据 (见下面的 JSON Schema)
  version INT DEFAULT 1,
  status TEXT DEFAULT 'draft',    -- 'draft', 'published', 'archived'
  subject TEXT NOT NULL,          -- 'cpp', 'esl', 'math'
  difficulty INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**表: `user_progress`** (追踪用户在每节课上的进度)
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'locked',   -- 'locked', 'active', 'completed'
  stars INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, level_id)
);
```

**表: `user_profiles`** (扩展 Supabase 的 `auth.users` 表)
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'pro'
  region TEXT -- 'global', 'cn'
);
```

### 4.2 内容 JSON Schema (`levels` 表中的 `config` 字段)

这个 JSON 结构是内容工厂模型的核心。它以声明式的方式定义了一节课的方方面面。

```json
{
  "version": 1,
  "meta": {
    "title": { "en": "Swap Two Variables", "cn": "交换两个变量" },
    "description": { "en": "Learn the classic swap algorithm.", "cn": "学习经典的变量交换算法。" }
  },
  "layout": {
    "elements": [
      {
        "id": "box_a",
        "type": "VariableBox",
        "position": { "x": 150, "y": 250 },
        "initialValue": 10
      },
      {
        "id": "box_b",
        "type": "VariableBox",
        "position": { "x": 450, "y": 250 },
        "initialValue": 20
      }
    ]
  },
  "logic": {
    "steps": [
      {
        "stepId": 1,
        "instruction": { "en": "Declare a temporary variable.", "cn": "声明一个临时变量。" },
        "trigger": { "type": "ButtonClick", "targetId": "declare_temp_button" },
        "action": {
          "type": "SpawnElement",
          "element": { "id": "box_temp", "type": "VariableBox", "position": { "x": 300, "y": 100 } }
        },
        "onSuccess": { "playSound": "ding", "nextStep": 2 }
      },
      {
        "stepId": 2,
        "instruction": { "en": "Drag 'a' to 'temp' to save its value.", "cn": "将'a'拖动到'temp'来保存它的值。" },
        "trigger": { "type": "DragDrop", "sourceId": "box_a", "targetId": "box_temp" },
        "action": { "type": "CopyValue", "from": "box_a", "to": "box_temp" },
        "validation": { "rule": "target.value === source.value" },
        "onSuccess": { "playSound": "ding", "nextStep": 3 }
      }
    ]
  }
}
```

## 5. 分阶段迁移计划

本次迁移将分五个不同阶段执行，以最小化风险并增量交付价值。

*   **第一阶段: 基础与设施 (2周)**
    1.  使用 Turborepo 初始化一个新的 Next.js 项目。
    2.  将所有现有 MVP 组件迁移到新项目中的 `/legacy` 文件夹。
    3.  设置 Supabase 项目，定义数据库表。
    4.  部署到 Vercel (国际) 和阿里云 (中国) 的预览环境。
    *   **目标:** 让旧的 MVP 在新的 Next.js 外壳内运行。

*   **第二阶段: 认证与数据持久化 (2周)**
    1.  集成为用户注册和登录的 Supabase Auth (国际版使用邮箱/Google，中国版预留微信接口)。
    2.  创建 API 路由以读写 `user_progress` 表。
    *   **目标:** 用户可以登录，并且他们的进度可以被保存和恢复。

*   **第三阶段: 通用游戏引擎 (3周)**
    1.  开发新的 `GameEngine.tsx` 组件，使其能读取并解析 JSON Schema。
    2.  为最简单的课程 (`ASSIGNMENT`) 创建第一个 `level.json` 文件。
    3.  构建一个沙盒页面 (`/lab/engine`)，用于实时测试不同 JSON 文件下的引擎表现。
    *   **目标:** 一个功能齐全、由 JSON 驱动的课程在隔离环境中运行。

*   **第四阶段: 内容迁移与工具化 (3周)**
    1.  将所有现有的 C++ 课程 (`SWAP`, `FIND_MAX`, `SORT`) 转换为 JSON 格式。
    2.  为内容团队开发一个简单的内部网页工具（或使用 JSON 编辑器）来编辑和验证课程 JSON。
    3.  对内容团队进行新工作流程的培训。
    *   **目标:** 所有 MVP 内容都采用新格式，内容团队可以独立于工程师工作。

*   **第五阶段: 全面集成与上线 (2周)**
    1.  用新的 `GameEngine` 替换旧的 `/legacy` 组件。
    2.  实施 AI 代理 API 路由以保护 API 密钥。
    3.  集成支付网关 (Stripe/微信)。
    4.  切换 DNS，指向新的 V2.0 应用程序。
    *   **目标:** V2.0 平台正式上线，安全可靠，并为商业运营做好准备。

---
此计划为解决我们当前的技术债务和为未来增长奠定基础，提供了一条清晰、可行的路径。通过优先采用分阶段、低风险的迁移策略，我们可以在服务现有用户的同时，构建出我们业务战略所要求的强大平台。
