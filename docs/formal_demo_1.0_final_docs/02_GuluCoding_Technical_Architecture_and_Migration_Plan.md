# GuluCoding Technical Architecture & Migration Plan

**Document ID:** GC-CTO-2025-01  
**Version:** 2.0 (Official Engineering Plan)  
**Classification:** Confidential / For Technical & Product Teams  
**Date:** December 4, 2025

---

## 1. Introduction & Problem Statement

This document provides the official technical architecture and migration plan for GuluCoding V2.0. The current MVP, while successful in validating product-market fit, is built on a frontend-only architecture that is not scalable, secure, or commercially viable.

**Core Technical Debt:**
*   **Monolithic Frontend:** A single React component (`GameCanvas.tsx`) contains over 1,200 lines of hard-coded logic for all lessons.
*   **Content/Code Coupling:** Every new lesson or content change requires direct intervention from an engineer, creating a production bottleneck.
*   **Security Vulnerability:** The Gemini API key is exposed client-side, posing a significant financial risk.
*   **Lack of Data Persistence:** User data is stored in memory and lost on refresh, making user accounts, progress tracking, and monetization impossible.

**Objective:** To transition GuluCoding from a "hand-crafted demo" to an "industrial-grade content factory" by implementing a modern, full-stack, decoupled architecture.

## 2. Architectural Principles

The V2.0 architecture is guided by three core principles:

1.  **Decoupling (The "Content Factory" Model):** The **Engine Layer** (the application) must be completely separate from the **Content Layer** (the lessons). The engine knows *how* to render an interactive experience but knows nothing about C++. The content, defined in a standardized JSON format, tells the engine *what* to render.
2.  **Data-Driven Design:** All interactive experiences are dynamically generated from data (JSON) fetched from a database, not from hard-coded component logic. This allows for content to be created, updated, and published without requiring a new application deployment.
3.  **Progressive Migration (Strangler Fig Pattern):** We will not execute a high-risk "big bang" rewrite. The new V2.0 architecture will be built in parallel with the existing MVP. We will migrate lessons one by one, running both systems concurrently until the new system is fully validated and can replace the old one.

## 3. Target Architecture & Technology Stack

### 3.1 V2.0 Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14 (App Router)** | The industry standard for React. Provides SSR/SSG for SEO, integrated API routes for a full-stack backend, and seamless deployment via Vercel. |
| **Backend/DB** | **Supabase (PostgreSQL)** | Open-source Firebase alternative. Provides Auth, a robust PostgreSQL DB with excellent JSONB support, Storage, and Real-time capabilities. Can be self-hosted in China for compliance. |
| **Code Execution**| **Judge0** | A secure, open-source sandbox for compiling and running user-submitted C++ code, essential for advanced lessons and custom input. |
| **AI Orchestration**| **Backend API Route** | A custom API proxy will manage all LLM calls. This secures API keys and allows for dynamic routing between Gemini (Global) and domestic models (CN). |
| **Deployment** | **Vercel (Global), Aliyun (CN)**| Leverages best-in-class global CDN and CI/CD, while ensuring onshore deployment for the China market. |
| **Monorepo** | **Turborepo** | To manage the shared `ui` and `logic` packages between the `web-global` and `web-china` applications. |

### 3.2 System Architecture Diagram

```mermaid
graph TD
    subgraph "User & Content Interfaces"
        WebApp[Next.js Web App]
        ContentCMS[Content Management System]
    end

    subgraph "Application Services (Next.js API Routes)"
        APIGateway[API Gateway]
        AIProxy[AI Proxy Router]
        CodeRunner[Code Runner (Judge0)]
    end

    subgraph "Backend as a Service (Supabase)"
        Auth[Authentication]
        DB[(PostgreSQL Database)]
        Storage[File Storage]
    end

    WebApp --> APIGateway
    ContentCMS --> APIGateway

    APIGateway --> Auth
    APIGateway --> DB
    APIGateway --> AIProxy
    APIGateway --> CodeRunner
```

## 4. Database & Content Schema

### 4.1 PostgreSQL Schema

**Table: `levels`** (Stores the configuration for each lesson)
```sql
CREATE TABLE levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,      -- e.g., 'swap-variables'
  config JSONB NOT NULL,          -- The core lesson data (see JSON Schema below)
  version INT DEFAULT 1,
  status TEXT DEFAULT 'draft',    -- 'draft', 'published', 'archived'
  subject TEXT NOT NULL,          -- 'cpp', 'esl', 'math'
  difficulty INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table: `user_progress`** (Tracks a user's progress on each lesson)
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

**Table: `user_profiles`** (Extends the Supabase `auth.users` table)
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'pro'
  region TEXT -- 'global', 'cn'
);
```

### 4.2 Content JSON Schema (`config` field in `levels`)

This JSON structure is the heart of the Content Factory model. It declaratively defines every aspect of a lesson.

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

## 5. Phased Migration Plan

This migration will be executed in five distinct phases to minimize risk and deliver value incrementally.

*   **Phase 1: Foundation & Infrastructure (2 Weeks)**
    1.  Initialize a new Next.js project with Turborepo.
    2.  Migrate all existing MVP components into a `/legacy` folder within the new project.
    3.  Set up Supabase project, define database tables.
    4.  Deploy to Vercel (Global) and Aliyun (CN) preview environments.
    *   **Goal:** Have the old MVP running inside the new Next.js shell.

*   **Phase 2: Authentication & Data Persistence (2 Weeks)**
    1.  Integrate Supabase Auth for user registration and login (Email/Google for Global, stubs for WeChat CN).
    2.  Create API routes to read and write to the `user_progress` table.
    *   **Goal:** Users can log in and have their progress saved and restored.

*   **Phase 3: The Universal Game Engine (3 Weeks)**
    1.  Develop the new `GameEngine.tsx` component that reads and interprets the JSON schema.
    2.  Create the first `level.json` file for the simplest lesson (`ASSIGNMENT`).
    3.  Build a sandboxed page (`/lab/engine`) for real-time testing of the engine with different JSON files.
    *   **Goal:** A fully functional, JSON-driven lesson running in isolation.

*   **Phase 4: Content Migration & Tooling (3 Weeks)**
    1.  Convert all existing C++ lessons (`SWAP`, `FIND_MAX`, `SORT`) into the JSON format.
    2.  Develop a simple internal web tool (or use a JSON editor) for the content team to edit and validate the lesson JSON.
    3.  Train the content team on the new workflow.
    *   **Goal:** All MVP content is now in the new format and the content team can work independently of engineers.

*   **Phase 5: Full Integration & Launch (2 Weeks)**
    1.  Replace the old `/legacy` components with the new `GameEngine`.
    2.  Implement the AI proxy API route to secure the API key.
    3.  Integrate payment gateways (Stripe/WeChat).
    4.  Switch DNS to point to the new V2.0 application.
    *   **Goal:** The V2.0 platform is live, secure, and ready for commercial operation.

---
This plan provides a clear, actionable path to resolving our current technical debt and building a foundation for future growth. By prioritizing a phased, low-risk migration, we can continue to serve our existing users while building the robust platform our business strategy demands.
