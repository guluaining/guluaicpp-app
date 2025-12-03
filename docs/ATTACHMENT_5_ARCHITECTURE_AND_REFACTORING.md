# 附件五：GuluCoding 架构诊断与商业化重构技术白皮书
**Attachment 5: Architecture Diagnosis & Commercial Refactoring Technical Whitepaper**

**To:** 技术团队 (Tech Team), 产品经理 (PM), 创始人 (Founders)
**From:** 首席软件架构顾问 (Chief Software Architect)
**Date:** 2023-10-27
**Subject:** 从“手工坊”到“智能工厂”——系统解耦与内容生产流水线设计

---

## 1. 现状诊断：我们现在的系统是什么样子的？(Current Architecture)

### 1.1 架构隐喻：精美的手工八音盒
目前的 GuluCoding MVP 就像一个**手工制作的八音盒**。
*   **代码现状：** 所有的“乐谱”（题目逻辑）都直接刻在“滚筒”（代码）上。
*   **硬编码 (Hardcoded):** 在 `problemData.ts` 中，题目数据（如 `initialValues`）是静态写死的。
*   **条件逻辑 (Conditional Logic):** 在 `GameCanvas.tsx` 中，充斥着大量的 `if (problem.id === 'SWAP') { ... }`。
*   **紧耦合 (Tight Coupling):** 如果你想修改“交换变量”这一关的通关祝贺语，你必须修改源代码，然后重新编译整个 App。

### 1.2 核心痛点 (The Pain Points)
这种架构在 MVP 阶段非常完美（开发快、效果好），但在商业化阶段是致命的：
1.  **扩充瓶颈：** 每增加一道新题，都需要程序员写新的 `if/else` 逻辑。程序员成了内容生产的瓶颈。
2.  **测试困难：** 无法单独测试某一道题。必须运行整个 App，点击好几次才能到达测试关卡。
3.  **甚至无法热更新：** 如果发现题目里有一个错别字，必须重新发布整个软件版本。

---

## 2. 目标架构：内容工厂模式 (The Factory Mode Strategy)

我们要将系统重构为 **“游戏机 + 卡带”** 的模式。

### 2.1 核心概念：引擎与内容分离 (Decoupling Engine & Content)
*   **Gulu Engine (游戏机):** 一个通用的播放器。它不知道什么是“C++”，它只知道“把方块 A 移动到位置 B”。
*   **Level Data (游戏卡带):** 纯粹的数据文件（JSON）。它描述了关卡的一切规则。

### 2.2 理想的生产流水线 (The Factory Pipeline)
未来，增加一堂新课（比如“数组求和”）的流程应该是：

1.  **教研老师 (Content Dev):** 在“题目编辑器”中设计关卡，或者对 AI 说：“生成一个数组求和的关卡”。
2.  **生成数据:** 系统生成一个 `level_array_sum.json` 文件。
3.  **独立测试:** 老师把这个 JSON 拖入“预览器”，立刻试玩，调整参数。
4.  **发布:** 点击“发布”，JSON 被推送到服务器数据库。
5.  **用户端:** 学生打开 App，App 下载新的 JSON，引擎加载并运行。

**全过程不需要程序员参与！** 程序员只负责维护引擎的稳定性。

---

## 3. 技术实施方案 (Technical Implementation Plan)

### 步骤一：定义“Gulu 教学描述语言” (Step 1: Schema Design)
这是解耦的第一步。我们需要定义一套 JSON 标准（Schema）来描述任何交互。

**示例 Schema (`GuluLevelSchema`):**
```json
{
  "id": "lesson_001",
  "layout": {
    "background": "cyberpunk_blue",
    "elements": [
      { "id": "box_a", "type": "variable_box", "x": 100, "y": 200, "value": 10 },
      { "id": "box_b", "type": "variable_box", "x": 300, "y": 200, "value": null }
    ]
  },
  "logic_flow": [
    {
      "step_id": 1,
      "instruction": "Declare variable a",
      "trigger": { "type": "click_button", "target": "btn_declare" },
      "action": { "type": "spawn_element", "target": "box_a" }
    },
    {
      "step_id": 2,
      "instruction": "Assign 10 to a",
      "trigger": { "type": "drag_drop", "source": "val_10", "target": "box_a" },
      "validation": { "rule": "target.value == 10" },
      "on_success": { "play_sound": "ding", "next_step": 3 }
    }
  ]
}
```

### 步骤二：重构 GameCanvas 为“通用解释器” (Step 2: Engine Refactor)
现在的 `GameCanvas.tsx` 将被重写为一个**状态机 (State Machine)**。

*   **旧代码:**
    ```typescript
    if (problem.id === 'SWAP') { renderSwapGame(); }
    ```
*   **新代码:**
    ```typescript
    const GameEngine = ({ levelData }) => {
      // 1. 根据 levelData.layout 渲染所有元素
      // 2. 监听用户操作
      // 3. 将操作与 levelData.logic_flow[currentStep].trigger 比对
      // 4. 如果匹配，执行 action 并进入下一步
    }
    ```

### 步骤三：构建“独立沙盒” (Step 3: Content Sandbox)
为了实现“像工厂一样生产”，我们需要一个内部工具页面：`/sandbox`。
*   **功能：** 左侧是一个 JSON 编辑器（或 AI 输入框），右侧是 `GameEngine` 组件。
*   **作用：** 实时预览。教研改一个参数，右侧游戏立刻变化。这让内容开发和测试完全独立于 App 的主逻辑。

---

## 4. 商业化全栈架构演进 (Commercial Architecture Evolution)

为了支撑上述设计，我们需要引入后端。

### 4.1 总体架构图
```mermaid
graph TD
    UserApp[用户端 App (Next.js)] --> |读取| API_Gateway
    ContentTool[内容生产后台 (Internal Tool)] --> |写入| API_Gateway
    
    API_Gateway --> Auth[身份认证 (Clerk/Auth0)]
    API_Gateway --> DB[(PostgreSQL 数据库)]
    
    subgraph "Database Tables"
        DB --> Users[用户表]
        DB --> Progress[学习进度表]
        DB --> Levels[关卡内容表 (存储 JSON)]
    end
    
    ContentTool --> |AI 辅助生成| LLM_Service[AI 模型服务]
```

### 4.2 数据库设计关键点
*   **Levels 表:** 核心资产。
    *   `id`: UUID
    *   `config`: JSONB (存储上面的 Schema 数据)
    *   `version`: 版本号
*   **UserProgress 表:**
    *   `user_id`: UUID
    *   `level_id`: UUID
    *   `status`: 'locked' | 'active' | 'completed'
    *   `score`: int

---

## 5. 执行建议：从现在开始 (Action Plan)

不要试图一次性重写所有代码。建议采用 **Strangler Fig Pattern（绞杀榕模式）**：

1.  **保留现状：** 现有的 `SWAP`, `FIND_MAX` 代码保持不变，作为 `Legacy` 模块运行。
2.  **开辟新路：** 创建一个新的路由 `/lab/engine`，在这里开发通用的 JSON 解释器。
3.  **试点迁移：** 尝试用新的 JSON 格式重写最简单的 `ASSIGNMENT` 关卡。
4.  **逐步替换：** 当通用引擎成熟后，逐个替换旧的硬编码关卡。

### 给团队的寄语
现在的 MVP 是为了**证明可行性** (Proof of Concept)，我们已经做到了。
接下来的重构是为了**证明可规模化** (Proof of Scalability)。
这需要更强的抽象思维，但一旦完成，我们将拥有生成无限课程内容的魔法能力。

===============================================================================
下面把整件事拆成 5 个“连环画”式的故事，再配上一张“作战地图”和一份“最小可运行清单”。读完你就能自己上手改第一行代码，而不是继续看概念。

--------------------------------------------------
连环画 1：把“八音盒”拆开，看看到底卡在哪
1. 打开 GitHub 找到 GameCanvas.tsx，搜索关键字 “SWAP”  
2. 你会发现一段伪代码：  
   if (problem.id==='SWAP') {  
     画两个盒子；  
     写死祝贺语“恭喜你学会了 swap！”；  
   }  
3. 再打开 problemData.ts，搜索 “SWAP”，能看到 initialValues 被硬编码成 [10, 20]。  
4. 结论：  
   - 画面、规则、文案三样东西全揉在一个文件里 → 想改祝贺语都得发版。  
   - 每新增一题就新增一个 if 分支 → 程序员成了“人形瓶颈”。

--------------------------------------------------
连环画 2：给未来工厂画一张“乐高说明书”
我们要把“画面、规则、文案”拆成三块乐高：

① 画面乐高（layout）  
   - 背景图 cyberpunk_blue  
   - 元件 box_a、box_b 的坐标、类型、初始值  

② 规则乐高（logic_flow）  
   - 第 1 步：点击“声明变量”按钮 → 生成 box_a  
   - 第 2 步：拖数字 10 到 box_a → 如果 box_a.value===10 就 ding 一声并进入第 3 步  

③ 文案乐高（i18n）  
   - 把“恭喜你学会了 swap！”挪到单独的 zh.json / en.json，用 key 引用  

三块乐高拼在一起就是一个 JSON 文件，起名叫 level_swap.json，扔进服务器即可。

--------------------------------------------------
连环画 3：把 GameCanvas 改成一个“傻播放器”
旧 GameCanvas 里写满了 if/else，现在我们只留 3 句真话：

1. 根据 layout 渲染元件（通用 RenderLayer 组件）  
2. 监听用户事件 → 去 logic_flow[currentStep].trigger 里匹配  
3. 匹配成功 → 执行 action，并把 currentStep++  

伪代码只有 30 行，贴在下面，你可以直接拷走测试：

```typescript
export default function GameEngine({levelData}) {
  const [step, setStep] = useState(0);
  const {layout, logic_flow} = levelData;
  const current = logic_flow[step];

  // 1. 渲染画面
  return (
    <div style={{background: layout.background}}>
      {layout.elements.map(e=><Element key={e.id} config={e}/>)}
      <p>{current.instruction}</p>
    </div>
  );

  // 2. 事件回调（以拖放为例）
  function onDrop(source, target){
    if (current.trigger.type==='drag_drop'
        && current.trigger.source===source.id
        && current.trigger.target===target.id){
      // 3. 执行动作 & 进入下一步
      if(eval(current.validation.rule)){   // 简单校验
        playSound(current.on_success.play_sound);
        setStep(s=>s+1);
      }
    }
  }
}
```

--------------------------------------------------
连环画 4：开一条“并行跑道”——绞杀榕套路
1. 保留老路由 /play/swap，让它继续跑旧代码，用户无感知。  
2. 新建路由 /lab/engine/swap，把上面的 GameEngine 扔进去，读取 level_swap.json。  
3. 产品经理或教研同学只需把 JSON 拖到 /lab/engine 里就能即时预览；  
   一旦确认 OK，再把同一份 JSON 上传到正式库，老路由就可以下线。  
4. 按“最简关卡 → 中等关卡 → 复杂关卡”顺序，一棵一棵把老榕树绞死。

--------------------------------------------------
连环画 5：最小可运行清单（今晚就能动手）
| 任务 | 预计工时 | 交付物 | 备注 |
|---|---|---|---|
| 1. 把 SWAP 关卡写成 level_swap.json | 0.5 h | 一个合规的 JSON | 用附件里的 schema 当模板 |
| 2. 新建 /lab/engine 页面并渲染 layout | 1 h | 画面能出现两个盒子 | 直接复用现有组件 |
| 3. 让拖放事件触发 step++ | 1 h | 拖对数后“叮”一声 | 先写死校验规则 |
| 4. 把祝贺语文案抽到 zh.json | 0.5 h | 不再硬编码文案 | 为后续 i18n 做准备 |
| 5. 写一条 README 记录验证步骤 | 0.2 h | 团队可复制 | 防止知识孤岛 |

全部做完，明天早上你就能给教研同事演示：  
“改 JSON 里的数字 10 → 99，刷新页面立刻生效，无需发版。”

--------------------------------------------------
作战地图（一张图记住全过程）
```
旧代码（八音盒） ──┬──→ 继续服务用户
                   │
                   └──→ 新引擎（傻播放器）←-- 实验跑道 /lab/engine
                          ↑
教研/AI 生成 JSON ------→│（上传）
                          ↓
                  正式库（PostgreSQL JSONB）
                          ↓
                  用户 App 动态下载 → 实时生效
```

--------------------------------------------------
常见坑提示
1. eval 校验规则有安全隐患 → 正式环境改用 sandboxed expression parser（如 expr-eval）。  
2. 元件 ID 千万别用中文 → 后续做埋点统计会哭。  
3. 版本号字段 version 一定在根节点 → 以后做灰度/AB 要用。  
4. 别把老代码一次性全删 → 用“绞杀榕”留退路。  

--------------------------------------------------
一句话总结
今晚先让“ SWAP ”关卡脱离源码、跑在 JSON 上，你就完成了从“手工八音盒”到“可换卡带”的 0→1 跃迁；剩下的 99 个关卡，只是复制粘贴。
