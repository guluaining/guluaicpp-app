# 附件六："MVP of MVP" 重构行动指南 (今晚可执行版)
**Attachment 6: 'MVP of MVP' Refactoring Action Plan (Factory Mode Implementation Guide)**

这份指南由**首席技术顾问**为您量身定制，旨在让您在**今晚**就能看到“内容工厂模式”的雏形，且**不破坏现有代码**。

我们将创建一个并行的实验跑道，用纯 JSON 数据驱动一个全新的“交换变量”关卡。

---

## Step 0: 准备安全环境 (5 min)

在开始之前，确保我们在一个新的、隔离的分支上工作。

```bash
# 1. 确保在主分支并拉取最新
git checkout main
git pull

# 2. 创建并切换到新分支
git checkout -b feat/json-engine
Step 1: 把“硬编码”抄出来，生成第一份 level.json (10 min)
我们不修改 problemData.ts，而是新建一个 JSON 文件来描述 SWAP 关卡。
操作： 在 public/levels/ 文件夹下新建 swap.json。如果没有 levels 文件夹，请先创建它。
文件路径： public/levels/swap.json
code
JSON
{
  "id": "swap",
  "layout": {
    "background": "#0f172a",
    "elements": [
      { "id": "a", "type": "variable_box", "x": 150, "y": 250, "value": 10, "color": "#3b82f6" },
      { "id": "b", "type": "variable_box", "x": 450, "y": 250, "value": 20, "color": "#ef4444" }
    ]
  },
  "logic_flow": [
    {
      "step_id": 1,
      "instruction": "Declare a temp box to save 'a'",
      "trigger": { "type": "click_button", "label": "Declare Temp" },
      "action": { "type": "spawn_element", "element": { "id": "temp", "type": "variable_box", "x": 300, "y": 100, "value": null, "color": "#10b981" } },
      "on_success": { "play_sound": "ding", "next_step": 2 }
    },
    {
      "step_id": 2,
      "instruction": "Drag 'a' to 'temp' to save it",
      "trigger": { "type": "drag_drop", "source": "a", "target": "temp" },
      "validation": { "rule": "target.id === 'temp'" },
      "on_success": { "play_sound": "ding", "next_step": 3 }
    },
    {
      "step_id": 3,
      "instruction": "Drag 'b' to 'a' (Overwrite a)",
      "trigger": { "type": "drag_drop", "source": "b", "target": "a" },
      "validation": { "rule": "target.id === 'a'" },
      "on_success": { "play_sound": "ding", "next_step": 4 }
    },
    {
      "step_id": 4,
      "instruction": "Drag 'temp' to 'b' (Restore a to b)",
      "trigger": { "type": "drag_drop", "source": "temp", "target": "b" },
      "validation": { "rule": "target.id === 'b'" },
      "on_success": { "play_sound": "win", "message": "Swap Complete!" }
    }
  ]
}
Step 2: 新建通用引擎组件 (15 min)
这是一个全新的组件，它不包含任何 if (problem === 'SWAP')。它只读 JSON。
文件路径： components/GameEngine.tsx
code
Tsx
import React, { useState } from 'react';
import { VariableBox } from './VariableBox';

// 简化的通用引擎
export const GameEngine = ({ levelData }: { levelData: any }) => {
  const [step, setStep] = useState(0);
  const [elements, setElements] = useState<any[]>(levelData.layout.elements);
  
  // 当前逻辑步骤
  // 注意：数组索引从0开始，step_id从1开始，所以要 -1
  const currentLogic = levelData.logic_flow[step]; 

  const handleDragDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    
    // 核心引擎逻辑：检查动作是否符合 JSON 定义
    if (currentLogic.trigger.type === 'drag_drop') {
        if (sourceId === currentLogic.trigger.source && targetId === currentLogic.trigger.target) {
            console.log("Action Validated!");
            // 执行成功回调
            if (currentLogic.on_success.next_step) {
                setStep(s => s + 1);
            }
            if (currentLogic.on_success.message) {
                alert(currentLogic.on_success.message);
            }
        }
    }
  };

  const handleClick = (triggerLabel: string) => {
      if (currentLogic.trigger.type === 'click_button' && currentLogic.trigger.label === triggerLabel) {
          // 执行 Action: 生成新元素
          if (currentLogic.action.type === 'spawn_element') {
              setElements(prev => [...prev, currentLogic.action.element]);
          }
          setStep(s => s + 1);
      }
  };

  return (
    <div className="relative w-full h-[500px] border rounded-xl p-4" style={{ background: levelData.layout.background }}>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full font-bold shadow-lg z-10">
          {currentLogic ? currentLogic.instruction : "Level Complete"}
      </div>

      {/* 渲染所有元素 */}
      {elements.map(el => (
          <div 
            key={el.id}
            draggable
            onDragStart={e => e.dataTransfer.setData('text/plain', el.id)}
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDragDrop(e, el.id)}
            style={{ position: 'absolute', left: el.x, top: el.y }}
          >
              <VariableBox name={el.id} value={el.value} address="0x.." color={el.color} />
          </div>
      ))}

      {/* 渲染按钮触发器 */}
      {currentLogic && currentLogic.trigger.type === 'click_button' && (
          <button 
            onClick={() => handleClick(currentLogic.trigger.label)}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg font-bold animate-pulse"
          >
              {currentLogic.trigger.label}
          </button>
      )}
    </div>
  );
};
Step 3: 在 App 中挂载实验跑道 (5 min)
我们暂时不通过路由访问（因为现有架构是单页应用），我们在侧边栏加一个秘密按钮来切换到这个引擎。
修改 App.tsx：
引入组件：import { GameEngine } from './components/GameEngine';
引入数据：import swapLevel from '../public/levels/swap.json'; (注意：Vite可能需要配置json导入，或者直接把json内容暂时拷到文件里)
为了简便，你可以先把 swap.json 的内容直接定义在 App.tsx 的一个变量里，叫 TEST_LEVEL_DATA。
在状态里加一个模式：const [showEngine, setShowEngine] = useState(false);
在侧边栏底部加个按钮：
code
Tsx
<button onClick={() => setShowEngine(true)} className="text-xs text-slate-600 mt-10">🧪 Dev Lab</button>
在主内容区渲染：
code
Tsx
{showEngine ? (
    <GameEngine levelData={TEST_LEVEL_DATA} /> 
) : (
    // ... 原有的内容 ...
)}
Step 4: 运行验证 (2 min)
运行 npm run dev。
点击侧边栏那个不起眼的 "Dev Lab" 按钮。
你应该能看到熟悉的“交换变量”关卡，但这次它是完全由 JSON 驱动的！
试着改一下 JSON 里的 background 颜色，或者改一下 instruction 文字。
你会发现 不需要改一行 React 代码，游戏内容就变了！
这就是 “内容工厂” 的雏形。
Step 5: 锁定成果 (2 min)
code
Bash
git add .
git commit -m "feat: Add experimental JSON-driven GameEngine and SWAP level schema"
git push origin feat/json-engine
恭喜！你刚刚迈出了从“手工作坊”走向“现代软件工厂”的第一步。
