
import React, { useState } from 'react';
import { ProblemDef, Language } from '../types';
import { VariableBox } from './VariableBox';

interface VisualizerProps {
  problem: ProblemDef;
  step: number;
  currentValues: Record<string, number>;
  isDetailMode: boolean;
  language: Language;
}

type ProViewMode = 'VISUAL' | 'PSEUDO' | 'FLOW';

export const Visualizer: React.FC<VisualizerProps> = ({ problem, step, currentValues, isDetailMode, language }) => {
  const [proViewMode, setProViewMode] = useState<ProViewMode>('VISUAL');
  
  const t = (en: string, cn: string) => language === 'cn' ? cn : en;

  // --- TABS RENDERER ---
  const renderTabs = () => (
      <div className="absolute top-2 left-0 w-full flex justify-center gap-2 z-20">
          <button 
             onClick={() => setProViewMode('VISUAL')}
             className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${proViewMode === 'VISUAL' ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'}`}
          >
              🎨 {t("Visualizer", "动画演示")}
          </button>
          <button 
             onClick={() => setProViewMode('PSEUDO')}
             className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${proViewMode === 'PSEUDO' ? 'bg-purple-500 text-white shadow-lg' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'}`}
          >
              📝 {t("Pseudocode", "伪代码")}
          </button>
          <button 
             onClick={() => setProViewMode('FLOW')}
             className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${proViewMode === 'FLOW' ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'}`}
          >
              🔀 {t("Flowchart", "流程图")}
          </button>
      </div>
  );

  // --- PSEUDOCODE RENDERER ---
  const renderPseudocode = () => {
      return (
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
              <div className="w-full max-w-lg space-y-3">
                  {problem.pseudocode.map((line, idx) => {
                      const isActive = line.stepTrigger.includes(step);
                      return (
                          <div 
                            key={idx}
                            className={`
                                p-3 rounded-lg font-mono text-sm transition-all duration-300 flex items-center
                                ${isActive ? 'bg-purple-900/50 border-l-4 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] scale-105' : 'bg-slate-800/50 border-l-4 border-slate-700 opacity-70'}
                            `}
                            style={{ marginLeft: `${line.indent * 20}px` }}
                          >
                              <span className={`mr-3 text-xs ${isActive ? 'text-purple-400' : 'text-slate-500'}`}>{idx + 1}</span>
                              <span className={isActive ? 'text-white font-bold' : 'text-slate-400'}>{t(line.text.en, line.text.cn)}</span>
                          </div>
                      )
                  })}
              </div>
          </div>
      )
  };

  // --- FLOWCHART RENDERER ---
  const renderFlowchart = () => {
      const { nodes, edges } = problem.flowchart;
      
      return (
          <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
              <svg width="500" height="350" viewBox="0 0 500 350">
                  <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                      </marker>
                  </defs>
                  
                  {/* Edges */}
                  {edges.map((edge, idx) => {
                      const fromNode = nodes.find(n => n.id === edge.from);
                      const toNode = nodes.find(n => n.id === edge.to);
                      if (!fromNode || !toNode) return null;

                      // Simple straight lines or doglegs could be better, but direct line for now
                      // Adjust start/end points slightly based on shape? For now center to center.
                      // Actually, let's use a simpler path logic
                      
                      // For Decision nodes (diamond), if label is Yes, go right/bottom. No go down/left.
                      // This requires smart routing. For this demo, we assume simple direct lines are defined by data x/y.
                      
                      return (
                          <g key={idx}>
                            <line 
                                x1={fromNode.x} y1={fromNode.y + 20} // Start from bottom of node
                                x2={toNode.x} y2={toNode.y - 20}     // End at top of node
                                stroke="#475569" 
                                strokeWidth="2" 
                                markerEnd="url(#arrowhead)" 
                            />
                            {edge.label && (
                                <text 
                                    x={(fromNode.x + toNode.x) / 2} 
                                    y={(fromNode.y + toNode.y) / 2} 
                                    fill="#94a3b8" 
                                    fontSize="10" 
                                    textAnchor="middle"
                                    className="bg-slate-900"
                                >
                                    {t(edge.label.en, edge.label.cn)}
                                </text>
                            )}
                          </g>
                      );
                  })}

                  {/* Nodes */}
                  {nodes.map((node) => {
                      const isActive = node.stepTrigger.includes(step);
                      const color = isActive ? '#10b981' : '#334155'; // Green if active, Slate if not
                      const stroke = isActive ? '#34d399' : '#475569';
                      const textColor = isActive ? 'white' : '#cbd5e1';

                      return (
                          <g key={node.id} className="transition-all duration-500">
                              {node.type === 'start' || node.type === 'end' ? (
                                  <rect 
                                    x={node.x - 40} y={node.y - 15} rx="15" ry="15" width="80" height="30" 
                                    fill={color} stroke={stroke} strokeWidth="2" 
                                    className={isActive ? 'animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.5)]' : ''}
                                  />
                              ) : node.type === 'decision' ? (
                                  <polygon 
                                    points={`${node.x},${node.y-20} ${node.x+50},${node.y} ${node.x},${node.y+20} ${node.x-50},${node.y}`}
                                    fill={color} stroke={stroke} strokeWidth="2"
                                    className={isActive ? 'animate-pulse' : ''}
                                  />
                              ) : (
                                  // Process Rect
                                  <rect 
                                    x={node.x - 50} y={node.y - 18} width="100" height="36" 
                                    fill={color} stroke={stroke} strokeWidth="2" 
                                    className={isActive ? 'animate-pulse' : ''}
                                  />
                              )}
                              
                              <text 
                                x={node.x} y={node.y} dy="4" 
                                textAnchor="middle" 
                                fill={textColor} 
                                fontSize="10" 
                                fontWeight="bold"
                                className="pointer-events-none"
                              >
                                  {t(node.label.en, node.label.cn)}
                              </text>
                          </g>
                      );
                  })}
              </svg>
          </div>
      )
  }

  // --- MAIN VISUALIZER RENDERER WRAPPER ---
  // We wrap the existing logic into a 'Visual' component or conditional rendering
  
  const renderVisualizerContent = () => {
      const emptyLabel = t("Empty", "空");
      const garbageLabel = "?";

      // --- ASSIGNMENT VISUALIZATION ---
      if (problem.id === 'ASSIGNMENT') {
          const { a, b } = currentValues;
          
          let valA: number | string = garbageLabel;
          let valB: number | string = garbageLabel;
          let showA = false;
          let showB = false;

          if (step >= 1) { showA = true; showB = true; }
          if (step >= 2) valA = a;
          if (step >= 3) valB = b;
          if (step >= 4) valB = a;

          return (
              <div className="w-full h-full flex justify-center items-center gap-24">
                  <div className={`transition-opacity duration-500 ${showA ? 'opacity-100' : 'opacity-0'}`}>
                    <VariableBox 
                        name="a" 
                        value={typeof valA === 'number' ? valA : null} 
                        address="0x04" 
                        color="#3b82f6" 
                        emptyLabel={valA as string}
                        customClass={step === 2 ? 'ring-4 ring-blue-500/40' : ''}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                      <div className={`text-4xl text-slate-500 transition-opacity duration-500 ${step >= 4 ? 'opacity-100' : 'opacity-20'}`}>➔</div>
                      {step >= 4 && <span className="text-xs text-slate-500 font-mono">copy</span>}
                  </div>
                  <div className={`transition-opacity duration-500 ${showB ? 'opacity-100' : 'opacity-0'}`}>
                    <VariableBox 
                        name="b" 
                        value={typeof valB === 'number' ? valB : null} 
                        address="0x08" 
                        color="#ef4444"
                        emptyLabel={valB as string}
                        customClass={step === 3 ? 'ring-4 ring-red-500/40' : step === 4 ? 'animate-pulse ring-4 ring-red-500/40' : ''}
                    />
                  </div>
                  <FlyingValue show={step === 2} val={a} from={{x: '50%', y: '-20%'}} to={{x: '20%', y: '50%'}} color="bg-blue-500" />
                  <FlyingValue show={step === 3} val={b} from={{x: '50%', y: '-20%'}} to={{x: '80%', y: '50%'}} color="bg-red-500" />
                  <FlyingValue show={step === 4} val={a} from={{x: '20%', y: '50%'}} to={{x: '80%', y: '50%'}} color="bg-blue-500" />
              </div>
          )
      }

      // --- SWAP VISUALIZATION ---
      if (problem.id === 'SWAP') {
        const valA = currentValues.a;
        const valB = currentValues.b;
        let tempVal: number | null = null;
        let finalA = valA;
        let finalB = valB;
        if (step >= 1) tempVal = valA;
        if (step >= 2) finalA = valB;
        if (step >= 3) finalB = valA;

        return (
          <div className="w-full h-full flex justify-center items-center">
            <div className="flex gap-24 relative z-10">
              <VariableBox name="a" value={finalA} address="0x04" color="#3b82f6" customClass={step === 2 ? 'ring-4 ring-blue-500/40 scale-105' : ''} emptyLabel={emptyLabel} />
              <VariableBox name="b" value={finalB} address="0x08" color="#ef4444" customClass={step === 3 ? 'ring-4 ring-red-500/40 scale-105' : ''} emptyLabel={emptyLabel} />
            </div>
            <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <VariableBox name="temp" value={tempVal} address="0x0C" color="#10b981" customClass={step === 1 ? 'ring-4 ring-emerald-500/40 scale-105' : ''} emptyLabel={emptyLabel} />
            </div>
            <FlyingValue show={step === 1} val={valA} from={{x: '28%', y: '35%'}} to={{x: '50%', y: '65%'}} color="bg-blue-500" />
            <FlyingValue show={step === 2} val={valB} from={{x: '72%', y: '35%'}} to={{x: '28%', y: '35%'}} color="bg-red-500" />
            <FlyingValue show={step === 3} val={valA} from={{x: '50%', y: '65%'}} to={{x: '72%', y: '35%'}} color="bg-emerald-500" />
          </div>
        );
      }

      // --- FIND MAX VISUALIZATION ---
      if (problem.id === 'FIND_MAX') {
        const { a, b, c } = currentValues;
        let maxVal: number | null = null;
        let activeComparison: string[] = [];
        if (step >= 1) maxVal = a; 
        const currentMaxAfterB = (b > a) ? b : a;
        if (step >= 3 && b > a) maxVal = b; 
        if (step >= 5) maxVal = (c > currentMaxAfterB) ? c : currentMaxAfterB;
        if (step === 2) activeComparison = ['b', 'max'];
        if (step === 4) activeComparison = ['c', 'max'];

        return (
          <div className="w-full h-full flex flex-col items-center justify-between p-4">
            <div className="flex justify-center gap-8 w-full">
              <VariableBox name="a" value={a} address="0x04" color="#3b82f6" emptyLabel={emptyLabel} />
              <VariableBox name="b" value={b} address="0x08" color="#ef4444" customClass={activeComparison.includes('b') ? 'ring-4 ring-yellow-500 scale-110 z-10' : ''} emptyLabel={emptyLabel} />
              <VariableBox name="c" value={c} address="0x0C" color="#8b5cf6" customClass={activeComparison.includes('c') ? 'ring-4 ring-yellow-500 scale-110 z-10' : ''} emptyLabel={emptyLabel} />
            </div>
            <div className="text-slate-500 text-2xl font-bold rotate-90">➔</div>
            <div className="relative">
                <VariableBox name="max" value={maxVal} address="0x10" color="#eab308" customClass={activeComparison.includes('max') ? 'ring-4 ring-yellow-500 scale-110' : ''} emptyLabel={emptyLabel} />
            </div>
            <FlyingValue show={step === 1} val={a} from={{x: '20%', y: '20%'}} to={{x: '50%', y: '80%'}} color="bg-blue-500" />
            <FlyingValue show={step === 3 && b > a} val={b} from={{x: '50%', y: '20%'}} to={{x: '50%', y: '80%'}} color="bg-red-500" />
            <FlyingValue show={step === 5 && c > currentMaxAfterB} val={c} from={{x: '80%', y: '20%'}} to={{x: '50%', y: '80%'}} color="bg-purple-500" />
          </div>
        );
      }

      // --- SORT 3 VISUALIZATION ---
      if (problem.id === 'SORT_3') {
        const { a, b, c } = currentValues;
        let currentArr = [a, b, c];
        let swappedIndices: number[] = [];
        const states = [];
        states.push([...currentArr]); 
        if (currentArr[0] > currentArr[1]) { const t = currentArr[0]; currentArr[0] = currentArr[1]; currentArr[1] = t; } states.push([...currentArr]);
        if (currentArr[1] > currentArr[2]) { const t = currentArr[1]; currentArr[1] = currentArr[2]; currentArr[2] = t; } states.push([...currentArr]);
        if (currentArr[0] > currentArr[1]) { const t = currentArr[0]; currentArr[0] = currentArr[1]; currentArr[1] = t; } states.push([...currentArr]);
        const displayArr = states[step] || states[states.length-1];
        if (step === 1 && states[0][0] > states[0][1]) swappedIndices = [0, 1];
        if (step === 2 && states[1][1] > states[1][2]) swappedIndices = [1, 2];
        if (step === 3 && states[2][0] > states[2][1]) swappedIndices = [0, 1];

        return (
          <div className="w-full h-full flex justify-center items-center gap-8 relative">
            {displayArr.map((val, idx) => {
               let color = "#3b82f6"; 
               if (val === currentValues.b) color = "#ef4444"; 
               if (val === currentValues.c) color = "#10b981"; 
               const isSwapping = swappedIndices.includes(idx);
               return (
                 <div key={idx} className={`transition-all duration-500 ${isSwapping ? 'translate-y-[-10px]' : ''}`}>
                    <VariableBox name={idx === 0 ? 'a' : idx === 1 ? 'b' : 'c'} value={val} address={`0x0${4 + idx*4}`} color={color} customClass={isSwapping ? 'ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)]' : ''} emptyLabel={emptyLabel} />
                 </div>
               )
            })}
            {step > 0 && swappedIndices.length > 0 && <div className="absolute top-4 text-yellow-400 font-bold animate-pulse">{t("SWAP!", "交换!")}</div>}
          </div>
        );
      }
      return <div>Unknown</div>;
  };

  // --- RENDER DETAIL PANEL (Existing Logic) ---
  // We render this *only* if isDetailMode is true AND we are in 'VISUAL' mode?
  // Or we render it alongside pseudocode?
  // The prompt says "With Detailed Mode", implying parallel. 
  // However, PseudoCode basically REPLACES Detail Mode text with simpler steps.
  // Let's keep Detail Panel separate, but maybe only show it in Visual mode for cleaner UI, or below.
  // For now, I'll return the active view.

  return (
      <div className="relative w-full h-[400px] bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col">
          {renderTabs()}
          <div className="flex-1 pt-10 relative">
              {proViewMode === 'VISUAL' && renderVisualizerContent()}
              {proViewMode === 'PSEUDO' && renderPseudocode()}
              {proViewMode === 'FLOW' && renderFlowchart()}
          </div>
          
          {/* If Detail Mode is ON, show it as an overlay or below? 
              The previous implementation returned the DetailPanel INSTEAD of the visualizer.
              To support the new structure, we should handle Detail Mode differently.
              If Detail Mode is active, we probably want to see the Text Log *instead* of the animation,
              BUT now we have Pseudocode which is similar.
              Let's treat Detail Mode as a text log that appears *below* the visualizer if enabled, 
              OR override the visualizer content if that was the original intent.
              
              Original intent: "In detail mode, all steps list line of code...".
              Let's maintain the original logic: If Detail Mode is ON, it overrides the view content with the log,
              BUT only if we are in Visual mode. Pseudocode/Flowchart are their own distinct views.
          */}
          {isDetailMode && proViewMode === 'VISUAL' && (
              <div className="absolute inset-0 bg-slate-900 z-30 pt-12 overflow-y-auto">
                  <DetailLogic problem={problem} step={step} currentValues={currentValues} language={language} />
              </div>
          )}
      </div>
  );
};


// --- HELPER COMPONENTS ---

const FlyingValue = ({ show, val, from, to, color }: { show: boolean, val: number, from: {x:string, y:string}, to: {x:string, y:string}, color: string }) => {
  return (
    <div 
      className={`absolute flex items-center justify-center w-12 h-12 rounded-full text-white font-bold z-50 pointer-events-none transition-all duration-700 ease-in-out shadow-xl border-2 border-white/20`}
      style={{
         opacity: show ? 1 : 0,
         left: show ? to.x : from.x,
         top: show ? to.y : from.y,
         transform: 'translate(-50%, -50%)',
      }}
    >
      <div className={`w-full h-full rounded-full flex items-center justify-center ${color}`}>
        {val}
      </div>
    </div>
  );
}

// Moved Detail Logic here to keep main component clean
const DetailLogic: React.FC<{problem: ProblemDef, step: number, currentValues: any, language: Language}> = ({ problem, step, currentValues, language }) => {
    const t = (en: string, cn: string) => language === 'cn' ? cn : en;
    const { a, b, c } = currentValues;
    
    return (
        <DetailPanel step={step} language={language}>
            {/* ASSIGNMENT */}
            {problem.id === 'ASSIGNMENT' && (
                <>
                  <DetailRow label={t("Step 0: Start", "步骤 0: 开始")} active={step === 0} detail={t("Program Start", "程序开始")} />
                  <DetailRow label={t("Step 1: int a, b;", "步骤 1: int a, b;")} active={step === 1} detail={t(`Allocated 'a' and 'b'.\nValues are UNKNOWN (Garbage).`, `分配了 'a' 和 'b'。\n里面的值是未知的（垃圾值）。`)} />
                  <DetailRow label={`Step 2: a = ${a};`} active={step === 2} detail={t(`Initialize 'a' to ${a}. Box is now clean.`, `给 'a' 赋值 ${a}。盒子现在干净了。`)} />
                  <DetailRow label={`Step 3: b = ${b};`} active={step === 3} detail={t(`Initialize 'b' to ${b}. Box is now clean.`, `给 'b' 赋值 ${b}。盒子现在干净了。`)} />
                  <DetailRow label="Step 4: b = a;" active={step === 4} detail={t(`Copy value of 'a' (${a}) to 'b'.\nOld 'b' value is overwritten.`, `把 'a' 的值 (${a}) 复制给 'b'。\n'b' 原来的值被覆盖了。`)} />
                </>
            )}
            {/* SWAP */}
            {problem.id === 'SWAP' && (
                <>
                  <DetailRow label={t("Step 0: Start", "步骤 0: 开始")} active={step === 0} detail={t(`Initial State: a = ${a}, b = ${b}`, `初始状态: a = ${a}, b = ${b}`)} />
                  <DetailRow label="Step 1: int temp = a;" active={step === 1} detail={t(`Copying 'a' (${a}) into 'temp'.\nMemory: temp is now ${a}.`, `将 'a' (${a}) 复制到 'temp'.\n内存: temp 现在是 ${a}.`)} />
                  <DetailRow label="Step 2: a = b;" active={step === 2} detail={t(`Overwriting 'a' with value of 'b' (${b}).\nMemory: a is now ${b}. Old 'a' value is safe in temp.`, `用 'b' (${b}) 的值覆盖 'a'.\n内存: a 现在是 ${b}. 旧的 'a' 值安全保存在 temp 中.`)} />
                  <DetailRow label="Step 3: b = temp;" active={step === 3} detail={t(`Overwriting 'b' with value of 'temp' (${a}).\nMemory: b is now ${a}.`, `用 'temp' (${a}) 的值覆盖 'b'.\n内存: b 现在是 ${a}.`)} />
                  <DetailRow label={t("Step 4: End", "步骤 4: 结束")} active={step === 4} detail={t("Swap Complete.", "交换完成。")} />
                </>
            )}
            {/* FIND MAX */}
            {problem.id === 'FIND_MAX' && (
                <>
                   <DetailRow label="Step 1: int max = a;" active={step === 1} detail={t(`Initialize 'max' with value of 'a'.\nmax = ${a}`, `初始化 'max' 为 'a' 的值.\nmax = ${a}`)} />
                   <DetailRow label="Step 2: if (b > max)" active={step === 2} detail={t(`Check: is b (${b}) > max (${a})?\nResult: ${b > a ? "TRUE (1)" : "FALSE (0)"}`, `检查: b (${b}) > max (${a}) 吗?\n结果: ${b > a ? "真 (1)" : "假 (0)"}`)} resultType={b > a ? 'true' : 'false'} language={language} />
                   <DetailRow label="Step 3: max = b;" active={step === 3} detail={b > a ? t(`Condition TRUE. Update max: ${a} ➔ ${b}`, `条件为真. 更新 max: ${a} ➔ ${b}`) : t(`Condition FALSE. Skip.`, `条件为假. 跳过.`)} dimmed={!(b > a)} />
                   <DetailRow label="Step 4: if (c > max)" active={step === 4} detail={t(`Check: is c (${c}) > max (${b>a?b:a})?`, `检查: c (${c}) > max (${b>a?b:a}) 吗?`)} resultType={c > (b>a?b:a) ? 'true' : 'false'} language={language} />
                   <DetailRow label="Step 5: max = c;" active={step === 5} detail={c > (b>a?b:a) ? t(`Condition TRUE. Update max.`, `条件为真. 更新 max.`) : t(`Condition FALSE. Skip.`, `条件为假. 跳过.`)} dimmed={!(c > (b>a?b:a))} />
                </>
            )}
            {/* SORT 3 - Simplified for brevity in this refactor, logic matches visualizer */}
            {problem.id === 'SORT_3' && (
                 <DetailRow label="Sorting Steps" active={true} detail={t("See visualizer for swap logic.", "请查看动画演示交换逻辑。")} />
            )}
        </DetailPanel>
    )
}

const DetailPanel: React.FC<{children: React.ReactNode, step: number, language: Language}> = ({ children, language }) => {
  return (
    <div className="w-full h-full mx-auto bg-slate-900 rounded-xl overflow-y-auto p-4 space-y-2">
      <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-wider">
        {language === 'cn' ? "逻辑执行跟踪" : "Logic Execution Trace"}
      </h3>
      {children}
    </div>
  )
}

const DetailRow: React.FC<{ label: string, active: boolean, detail: string, dimmed?: boolean, resultType?: 'true' | 'false', language?: Language }> = ({ label, active, detail, dimmed, resultType, language }) => {
  return (
    <div className={`
      p-3 rounded-lg border transition-all duration-300
      ${active ? 'bg-slate-800 border-blue-500/50 shadow-lg' : 'bg-transparent border-slate-800 opacity-60'}
    `}>
      <div className="flex justify-between items-center mb-1">
        <span className={`font-mono text-sm ${active ? 'text-blue-300 font-bold' : 'text-slate-500'}`}>
          {label}
        </span>
        {resultType && (
           <span className={`text-xs font-bold px-2 py-0.5 rounded ${resultType === 'true' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
             {resultType === 'true' ? (language === 'cn' ? '真' : 'TRUE') : (language === 'cn' ? '假' : 'FALSE')}
           </span>
        )}
      </div>
      <div className={`font-mono text-xs whitespace-pre-line leading-relaxed pl-4 border-l-2 ${active ? 'border-slate-600 text-slate-300' : 'border-transparent text-slate-600'} ${dimmed ? 'line-through opacity-50' : ''}`}>
        {detail}
      </div>
    </div>
  )
}
