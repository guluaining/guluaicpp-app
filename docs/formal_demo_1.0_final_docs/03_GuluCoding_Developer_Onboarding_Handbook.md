# GuluCoding Developer Onboarding Handbook

**Document ID:** GC-ENG-2025-01  
**Version:** 2.0 (For V2.0 Architecture)  
**Classification:** Internal / For Engineering Team  
**Welcome to the Team!** This document is your starting guide to developing and contributing to the GuluCoding V2.0 platform.

---

## 1. Philosophy & Core Concepts

Welcome aboard! You are joining a project that is transitioning from a successful proof-of-concept to a scalable, global platform. Our engineering philosophy is built on creating a clean, decoupled, and highly efficient development environment.

Before you write any code, you must understand our core architectural principle: **The "Content Factory" Model.**

*   **Our Goal:** To empower our content team (teachers and curriculum designers) to create rich, interactive lessons without writing any code.
*   **Your Role as an Engineer:** You are not a "lesson builder." You are an "engine builder" and a "tool builder." Your primary responsibility is to improve the Gulu Game Engine, the components it uses, and the tools that help our content team work efficiently.
*   **The Golden Rule:** All lesson-specific logic, text, or layout information is **forbidden** within React components. It **must** be defined in a `level.json` file. If you find yourself writing `if (levelId === 'some_id')`, you are violating this rule.

## 2. Getting Started: Local Development Setup

### Prerequisites
*   Node.js (LTS version)
*   `pnpm` (for Monorepo package management)
*   Git
*   A code editor (VS Code is recommended)

### Step-by-step Setup

1.  **Clone the Monorepo:**
    ```bash
    git clone https://github.com/GuluCoding/GuluAICPPAPP.git
    cd GuluAICPPAPP
    ```

2.  **Install Dependencies:**
    We use `pnpm` as our package manager for its efficiency with monorepos.
    ```bash
    pnpm install
    ```

3.  **Configure Environment Variables:**
    Copy the environment variable template.
    ```bash
    cp .env.example .env.local
    ```
    Now, open `.env.local` and fill in the required keys. You will get these from the project lead or your cloud console (e.g., Supabase Project URL and anon key).

4.  **Run the Development Server:**
    ```bash
    pnpm dev
    ```
    This command starts the Next.js development server for the `web-global` application. You can now open `http://localhost:3000` in your browser.

## 3. Monorepo Codebase Structure

We use a Turborepo-powered monorepo to manage our code. This allows us to share code between different applications (e.g., the global web app and the China web app).

```
/
├── apps/
│   ├── web-global/      # The main Next.js application for the global market
│   │   ├── app/         # App Router: contains all pages and API routes
│   │   └── public/
│   └── web-china/       # (Future) Next.js application tailored for the China market
│
├── packages/
│   ├── ui/              # [Shared] All stateless React components (VariableBox, Button, etc.)
│   ├── logic/           # [Shared] Core business logic, type definitions, and engine utilities
│   └── tsconfig/        # [Shared] TypeScript configurations
│
└── package.json         # Root package.json
└── turborepo.json       # Turborepo configuration
```

*   **`apps/web-global`**: This is where you will spend most of your time. It's the main Next.js application.
*   **`packages/ui`**: Our shared component library. If a component is purely presentational and could be used anywhere, it belongs here.
*   **`packages/logic`**: Shared, non-React-specific code. This includes our TypeScript types for the `level.json` schema, validation helpers, etc.

## 4. The Game Engine: How It Works

The heart of our application is the `GameEngine.tsx` component. It's a "dumb" interpreter that brings `level.json` files to life.

**Data Flow:**
1.  A Next.js page component fetches the `level.json` for the current lesson from our backend via an API route.
2.  The JSON data is passed as a prop to the `<GameEngine />` component.
3.  The engine parses the `layout.elements` array and dynamically renders the initial state of the lesson using components from our shared `ui` package (e.g., `<VariableBox />`).
4.  The engine maintains a `currentStep` state, which points to an object in the `logic.steps` array of the JSON.
5.  It renders the `instruction` for the current step.
6.  It attaches event listeners based on the `trigger` defined for the current step (e.g., it listens for a `ButtonClick` or a `DragDrop` event).
7.  When the user performs an action that matches the trigger, the engine:
    a. Runs the `validation` rule (if any).
    b. On success, executes the `action` (e.g., spawns a new element, copies a value).
    c. Plays the success sound and increments its `currentStep` state to move to the next step.

**Your Job as an Engine Developer:**
*   Add new `trigger` types (e.g., "DoubleClick", "TextInput").
*   Add new `action` types (e.g., "AnimateElement", "ShowConfetti").
*   Improve the rendering layer to support new element types.
*   Optimize the engine's performance.

## 5. Git Workflow & Coding Standards

*   **Branching:** We follow a standard GitFlow process.
    *   `main`: Production branch. Protected.
    *   `develop`: Integration branch for the next release.
    *   Create feature branches from `develop`: `feat/new-engine-action` or `fix/login-bug`.
*   **Commits:** Use [Conventional Commits](https://www.conventionalcommits.org/). (e.g., `feat: add confetti action to game engine`, `fix: resolve drag-drop bug on ipad`).
*   **Pull Requests (PRs):** All code must be reviewed via a PR to the `develop` branch. A PR must pass all CI checks (linting, type-checking, tests) before it can be merged.
*   **Linting & Formatting:** We use ESLint and Prettier. These are run automatically as a pre-commit hook.

## 6. Testing

*   **Unit Tests:** Core logic in the `packages/logic` directory should be covered by unit tests using Vitest or Jest.
*   **Component Tests:** UI components in `packages/ui` should be tested with React Testing Library.
*   **E2E Tests:** We use Playwright for end-to-end tests that simulate a user interacting with a full lesson.
*   **The Sandbox:** A crucial part of our testing strategy is the `/lab/engine` page, where you can paste any `level.json` and test it in isolation. **Always test new engine features in the sandbox first.**

---
Welcome again! We're excited to have you. By focusing on building a robust engine and empowering our content team, we can create an educational experience that is truly magical.
