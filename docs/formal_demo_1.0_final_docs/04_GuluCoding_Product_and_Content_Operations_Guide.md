# GuluCoding Product & Content Operations Guide

**Document ID:** GC-PROD-2025-01  
**Version:** 1.0 (For V2.0 Architecture)  
**Classification:** Internal / For Product, Content & Teaching Teams  
**Audience:** Product Managers, Curriculum Designers, Teachers, QA Specialists

---

## 1. Introduction: The Content Factory

Welcome to the heart of GuluCoding's educational innovation: **The Content Factory**. This new model is a fundamental shift in how we create and deliver lessons.

**The Old Way:** Every new lesson had to be coded by an engineer. This was slow, expensive, and made you dependent on the engineering schedule to fix a typo or change a number.

**The New Way (Content Factory):** Our application is now a "Game Engine." It's like a smart video game console. The lessons themselves are "Game Cartridges," which are simple text files written in a format called **JSON**.

**Your Role:** You are now the creators! You can design, build, test, and publish new lessons just by creating and editing these JSON text files. You no longer need to wait for an engineer. This document is your guide to mastering this powerful new workflow.

## 2. Understanding the "Game Cartridge": The `level.json` File

Every lesson in GuluCoding is defined by a single `level.json` file. Think of this file as a detailed recipe that tells the Gulu Game Engine exactly what to do.

A `level.json` file has three main parts:

### 2.1 `meta`: The Lesson's Identity Card

This section contains basic information about the lesson.

*   `title`: The name of the lesson (e.g., "Swap Two Variables").
*   `description`: A short explanation of what the student will learn.
*   *We provide both `en` and `cn` fields for easy translation.*

### 2.2 `layout`: Setting the Stage

This section describes everything the student sees on the screen at the beginning of the lesson.

*   `elements`: A list of all the visual items. Each item has:
    *   `id`: A unique name you give it (e.g., `"box_a"`).
    *   `type`: What kind of item it is (e.g., `"VariableBox"`).
    *   `position`: Its `x` and `y` coordinates on the screen.
    *   `initialValue`: The number or text it starts with.

**Example:** To create a variable box named "a" with the value 10, you would write:
```json
{
  "id": "box_a",
  "type": "VariableBox",
  "position": { "x": 150, "y": 250 },
  "initialValue": 10
}
```

### 2.3 `logic`: The Step-by-Step Rules of the Game

This is the most important section. It's a list of steps that define the entire interactive flow of the lesson. The engine only ever looks at one step at a time.

Each step has three key parts:

1.  **`instruction`**: The text that is displayed to the student (e.g., "Drag the number 10 into box 'a'").
2.  **`trigger`**: The exact action the student must perform to complete the step.
    *   **Type:** What kind of action? (e.g., `ButtonClick`, `DragDrop`).
    *   **Target:** Which item(s) are involved? (e.g., `sourceId: "value_10"`, `targetId: "box_a"`).
3.  **`onSuccess`**: What happens after the student performs the correct action.
    *   `playSound`: What sound to play (e.g., `"ding"`, `"win"`).
    *   `nextStep`: Which step to go to next.
    *   `action` (Optional): An animation or change to execute (e.g., make a new box appear).

By chaining these steps together, you can create complex and engaging lessons with branching logic, hints, and rewards.

## 3. The Content Creation Workflow

Creating a new lesson is now a simple, 4-step process.

### Step 1: Design the Lesson (On Paper or Whiteboard)

Before touching the computer, map out your lesson:
*   What is the learning objective?
*   What visual elements are needed?
*   What are the step-by-step instructions for the student?
*   What is the correct action for each step?

### Step 2: Write the `level.json`

Using a text editor (like VS Code) or our future "Lesson Editor" tool, translate your design into a `level.json` file. Start with a template from an existing lesson and modify it.

*   Define your `meta` information.
*   Set up the initial `layout` and `elements`.
*   Build the `logic.steps` array, carefully defining the `instruction`, `trigger`, and `onSuccess` for each step.

### Step 3: Test in the Sandbox

This is a critical step. Navigate to our internal "Sandbox" page (e.g., `http://localhost:3000/lab/engine`).

*   Paste your entire `level.json` content into the editor on the page.
*   The right side of the screen will instantly show you a live, playable preview of your lesson.
*   Play through your lesson as if you were a student.
*   If you find a bug or want to change something, simply edit the JSON text, and the preview will update in real-time.

This allows you to perfect your lesson without needing to wait for an engineer or a new app deployment.

### Step 4: Submit for Review

Once you are happy with your lesson in the Sandbox, save your `level.json` file and submit it to the designated content repository or folder. It will then go through a quick QA check before being published to all users.

## 4. Product Features & Roadmap (User-Facing)

This new architecture unlocks a host of new features that are now on our roadmap.

### Core Product Features
*   **User Accounts:** Students can sign up, log in, and save their progress.
*   **Learning Dashboard:** A central hub showing completed lessons, earned stars, and the next lesson to tackle.
*   **Multi-Subject Access:** A single subscription will grant access to all our subjects (C++, ESL, Math, etc.).
*   **AI Tutor:** The "Explain this" feature, now powered by a secure backend, providing safe and helpful guidance.

### Near-Term Roadmap (Next 6 Months)
*   **Q1: The "Success Path" Revamp:** All existing C++ lessons will be migrated to the new engine, creating a seamless, persistent learning path.
*   **Q1: Pro Subscription Launch:** The official launch of our paid subscription with access to all features.
*   **Q2: ESL Module Launch:** The first set of interactive English lessons, built on the same engine.
*   **Q2: Parent/Teacher Portal:** A dashboard for parents and teachers to track student progress and performance.
*   **Q3: Math Module Launch:** The first set of interactive math lessons.

---
The Content Factory model puts the power of creation in your hands. It allows us to build a richer, more diverse, and more engaging learning platform faster than ever before. We are excited to see the amazing lessons you will build!
