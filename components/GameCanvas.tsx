
import React, { useState, useEffect, useRef } from 'react';
import { VariableBox } from './VariableBox';
import { ProblemDef, Language, ProblemId } from '../types';

interface GameCanvasProps {
  problem: ProblemDef;
  currentValues: Record<string, number>;
  language: Language;
  onStepChange: (step: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ problem, currentValues, language, onStepChange }) => {
  const t = (en: string, cn: string) => language === 'cn' ? cn : en;

  // Global Game State
  const [localValues, setLocalValues] = useState<Record<string, number | null>>(currentValues);
  const [boxes, setBoxes] = useState<string[]>([]); 
  const [feedback, setFeedback] = useState<string>("");
  const [phase, setPhase] = useState<string>('COVER'); // Start with COVER

  // Drag State
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [dragCurr, setDragCurr] = useState<{x: number, y: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSource, setDraggedSource] = useState<string | null>(null);
  
  // Refs for collision detection
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Reset when problem changes
  useEffect(() => {
    // For Assignment, start with nulls (garbage)
    if (problem.id === 'ASSIGNMENT') {
        setLocalValues({a: null, b: null});
    } else {
        setLocalValues(currentValues);
    }
    setPhase('COVER');
    setBoxes([]);
    setFeedback(getIntroText(problem.id));
    onStepChange(0);
  }, [problem.id, currentValues, language]);

  // Sync Phase to Code Step
  useEffect(() => {
    let newStep = 0;
    
    // Default start state for pre-game phases
    if (phase === 'COVER' || phase === 'INTRO') {
        onStepChange(0);
        return;
    }

    if (problem.id === 'ASSIGNMENT') {
        if (phase === 'DECLARE') newStep = 1;
        else if (phase === 'INIT_A') newStep = 1; 
        else if (phase === 'INIT_B') newStep = 2; 
        else if (phase === 'ASSIGN_ACTION') newStep = 3; 
        else if (phase === 'COMPLETE') newStep = 4;
    } 
    else if (problem.id === 'SWAP') {
        if (phase === 'DECLARE_TEMP' || phase === 'COPY_A_TEMP') newStep = 1;
        else if (phase === 'COPY_B_A') newStep = 2;
        else if (phase === 'COPY_TEMP_B') newStep = 3;
        else if (phase === 'COMPLETE') newStep = 4; 
    } 
    else if (problem.id === 'FIND_MAX') {
        if (phase === 'DECLARE_MAX' || phase === 'INIT_MAX') newStep = 1;
        else if (phase === 'CHECK_B') newStep = 2;
        else if (phase === 'UPDATE_MAX_B') newStep = 3;
        else if (phase === 'CHECK_C') newStep = 4;
        else if (phase === 'UPDATE_MAX_C') newStep = 5;
        else if (phase === 'COMPLETE') newStep = 5;
    } 
    else if (problem.id === 'SORT_3') {
        if (phase === 'COMPARE_1') newStep = 1;
        else if (phase === 'COMPARE_2') newStep = 2;
        else if (phase === 'COMPARE_3') newStep = 3;
        else if (phase === 'COMPLETE') newStep = 3;
    }

    onStepChange(newStep);
  }, [phase, problem.id, onStepChange]);

  const getIntroText = (id: ProblemId) => {
    switch (id) {
      case 'ASSIGNMENT': return t("Hi! I'm Gulu. Let's learn about Boxes (Variables)!", "你好！我是咕噜。我们来学习盒子（变量）！");
      case 'SWAP': return t("Let's swap A and B. We need a helper box!", "我们来交换 A and B。我们需要一个帮手盒子！");
      case 'FIND_MAX': return t("Who is the biggest? Let's find out!", "谁是最大的？我们来找一找！");
      case 'SORT_3': return t("Let's sort them from small to big!", "我们要把它们从小到大排好队！");
      default: return "";
    }
  };

  // --- DRAG HANDLERS (MOUSE & TOUCH) ---

  // Start Dragging (Mouse)
  const handleMouseDown = (e: React.MouseEvent, name: string) => {
    startDrag(name, e.clientX, e.clientY);
  };
  
  const handleValueDragStart = (e: React.MouseEvent, valStr: string) => {
    startDrag(`VAL:${valStr}`, e.clientX, e.clientY);
  };

  // Start Dragging (Touch)
  const handleTouchStart = (e: React.TouchEvent, name: string) => {
    // e.preventDefault(); // Don't prevent default here to allow clicking buttons, etc.
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        startDrag(name, touch.clientX, touch.clientY);
    }
  };

  const handleValueTouchStart = (e: React.TouchEvent, valStr: string) => {
      if (e.touches.length > 0) {
          const touch = e.touches[0];
          startDrag(`VAL:${valStr}`, touch.clientX, touch.clientY);
      }
  };

  // Shared Start Logic
  const startDrag = (source: string, clientX: number, clientY: number) => {
    // Extract real name from VAL:10 if needed
    const logicName = source.startsWith('VAL:') ? 'val' : source; // logic check uses source name or just checks phase
    
    // Check if draggable based on logic name or original source string
    // The canDrag function expects the variable name 'a', 'b' etc. 
    // For values, we bypass canDrag check here inside individual renderers? 
    // No, let's check.
    
    const checkName = source.startsWith('VAL:') ? 'val' : source;
    
    // Special check for Values: they are always draggable in INIT phase
    let allowed = false;
    if (source.startsWith('VAL:')) {
        if (problem.id === 'ASSIGNMENT' && (phase === 'INIT_A' || phase === 'INIT_B')) allowed = true;
    } else {
        if (canDrag(source)) allowed = true;
    }

    if (!allowed) return;

    setDragStart({ x: clientX, y: clientY });
    setDragCurr({ x: clientX, y: clientY });
    setDraggedSource(source);
    setIsDragging(true);
  };

  // Move (Mouse)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragCurr({ x: e.clientX, y: e.clientY });
  };

  // Move (Touch)
  const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault(); // Prevent scrolling while dragging
      if (e.touches.length > 0) {
          const touch = e.touches[0];
          setDragCurr({ x: touch.clientX, y: touch.clientY });
      }
  };

  // End (Mouse)
  const handleMouseUp = (e: React.MouseEvent) => {
    endDrag(e.clientX, e.clientY);
  };

  // End (Touch)
  const handleTouchEnd = (e: React.TouchEvent) => {
      if (!isDragging) return;
      // Touch end doesn't have touches list for the lifted finger, use changedTouches
      if (e.changedTouches.length > 0) {
          const touch = e.changedTouches[0];
          endDrag(touch.clientX, touch.clientY);
      }
  };

  // Shared End Logic
  const endDrag = (clientX: number, clientY: number) => {
    if (!isDragging || !draggedSource) return;
    
    const dropTarget = detectDropTarget(clientX, clientY);
    
    if (dropTarget) {
       handleDrop(draggedSource, dropTarget);
    }

    setIsDragging(false);
    setDraggedSource(null);
  };

  const detectDropTarget = (x: number, y: number): string | null => {
     for (const [name, el] of Object.entries(boxRefs.current)) {
         const element = el as HTMLDivElement | null;
         if (element) {
             const rect = element.getBoundingClientRect();
             if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                 return name;
             }
         }
     }
     return null;
  };

  // --- GAME LOGIC ROUTERS ---

  const canDrag = (name: string): boolean => {
      if (problem.id === 'ASSIGNMENT') return phase === 'ASSIGN_ACTION' && name === 'a';
      if (problem.id === 'SWAP') {
          if (phase === 'COPY_A_TEMP' && name === 'a') return true;
          if (phase === 'COPY_B_A' && name === 'b') return true;
          if (phase === 'COPY_TEMP_B' && name === 'temp') return true;
      }
      if (problem.id === 'FIND_MAX') {
          if (phase === 'INIT_MAX' && name === 'a') return true;
          if (phase === 'UPDATE_MAX_B' && name === 'b') return true;
          if (phase === 'UPDATE_MAX_C' && name === 'c') return true;
      }
      return false;
  };

  const handleDrop = (source: string, target: string) => {
      // LOGIC FOR ASSIGNMENT
      if (problem.id === 'ASSIGNMENT') {
          // Dragging number 10 to A
          if (phase === 'INIT_A' && source === `VAL:${currentValues.a}` && target === 'a') {
              setLocalValues(prev => ({...prev, a: currentValues.a}));
              setPhase('INIT_B');
              setFeedback(t(`Great! A is now ${currentValues.a}. Now clean box B and put ${currentValues.b} in it!`, `棒！A 现在是 ${currentValues.a}。现在清理盒子 B 并放入 ${currentValues.b}！`));
          }
          // Dragging number 20 to B
          else if (phase === 'INIT_B' && source === `VAL:${currentValues.b}` && target === 'b') {
              setLocalValues(prev => ({...prev, b: currentValues.b}));
              setPhase('ASSIGN_ACTION');
              setFeedback(t("Both boxes are ready! Now, Copy 'a' into 'b' (b = a).", "两个盒子都好了！现在，把 'a' 复制到 'b' (b = a)。"));
          }
          // Dragging box A to B
          else if (phase === 'ASSIGN_ACTION' && source === 'a' && target === 'b') {
              setLocalValues(prev => ({...prev, b: prev.a}));
              finishGame();
          }
      }

      // LOGIC FOR SWAP
      if (problem.id === 'SWAP') {
          if (phase === 'COPY_A_TEMP' && source === 'a' && target === 'temp') {
              setLocalValues(prev => ({...prev, temp: prev.a}));
              setPhase('COPY_B_A');
              setFeedback(t("Good! 'a' is safe in 'temp'. Now, move 'b' to 'a'.", "很好！'a' 安全地待在 'temp' 里了。现在，把 'b' 移到 'a'。"));
          } else if (phase === 'COPY_B_A' && source === 'b' && target === 'a') {
              setLocalValues(prev => ({...prev, a: prev.b}));
              setPhase('COPY_TEMP_B');
              setFeedback(t("Great! 'a' has 'b's value. Finally, move 'temp' to 'b'!", "棒！'a' 已经有了 'b' 的值。最后，把 'temp' 移回 'b'！"));
          } else if (phase === 'COPY_TEMP_B' && source === 'temp' && target === 'b') {
              setLocalValues(prev => ({...prev, b: prev.temp!}));
              finishGame();
          }
      }

      // LOGIC FOR FIND MAX
      if (problem.id === 'FIND_MAX') {
           if (phase === 'INIT_MAX' && source === 'a' && target === 'max') {
               const nextValues = {...localValues, max: localValues.a};
               setLocalValues(nextValues);
               advanceMaxLogic(nextValues as Record<string, number>, 'CHECK_B');
           }
           else if (phase === 'UPDATE_MAX_B' && source === 'b' && target === 'max') {
               const nextValues = {...localValues, max: localValues.b};
               setLocalValues(nextValues);
               advanceMaxLogic(nextValues as Record<string, number>, 'CHECK_C'); // Always check C next
           }
           else if (phase === 'UPDATE_MAX_C' && source === 'c' && target === 'max') {
               const nextValues = {...localValues, max: localValues.c};
               setLocalValues(nextValues);
               finishGame(t(`Found it! The max value is ${nextValues.max}.`, `找到了！最大值是 ${nextValues.max}。`));
           }
      }
  };

  // --- TRANSITIONS ---

  const finishGame = (msg?: string) => {
      setPhase('COMPLETE');
      setFeedback(msg || t("Amazing! Mission Complete!", "太棒了！任务完成！"));
      setTimeout(() => {
          setPhase('SUMMARY');
      }, 3000);
  };

  const advanceMaxLogic = (currentVals: Record<string, number>, nextPhase: 'CHECK_B' | 'CHECK_C') => {
      if (nextPhase === 'CHECK_B') {
          setPhase('CHECK_B');
          setFeedback(t(`Next, compare b and max. Is b (${currentVals.b}) > max (${currentVals.max})?`, `接下来，比较 b 和 max。b (${currentVals.b}) > max (${currentVals.max}) 吗？`));
      } else {
          setPhase('CHECK_C');
          setFeedback(t(`Next, compare c and max. Is c (${currentVals.c}) > max (${currentVals.max})?`, `接下来，比较 c 和 max。c (${currentVals.c}) > max (${currentVals.max}) 吗？`));
      }
  };


  // --- RENDERERS ---

  const renderCover = () => (
      <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
          <div className="mb-6">
               <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                   GuluCoding
               </h1>
               <h2 className="text-xl text-slate-400">咕噜编程算法AI互动教学工具</h2>
          </div>
          
          <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 max-w-lg w-full mb-8 backdrop-blur-sm">
               <h3 className="text-2xl font-bold text-white mb-2">{problem.title[language]}</h3>
               <p className="text-slate-300">{problem.description[language]}</p>
          </div>

          <button 
              onClick={() => {
                  setPhase('INTRO');
                  setFeedback(getIntroText(problem.id));
              }}
              className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-xl shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.7)] transition-all transform hover:scale-105"
          >
              {t("Start Learning", "开始学习")}
          </button>
      </div>
  );

  const renderSummary = () => (
      <div className="absolute inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">{t("Mastered!", "掌握了！")}</h2>
          <p className="text-slate-400 text-sm mb-6 uppercase tracking-wider">{problem.title[language]}</p>
          
          <div className="max-w-xl w-full text-left space-y-6">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-blue-400 mb-2 text-sm uppercase">{t("Summary", "总结")}</h4>
                  <p className="text-slate-200">{problem.summary[language]}</p>
              </div>

              <div>
                  <h4 className="font-bold text-purple-400 mb-3 text-sm uppercase px-2">{t("Key Takeaways", "关键点")}</h4>
                  <ul className="space-y-3">
                      {problem.keyTakeaways.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-lg">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                              <span className="text-slate-300 text-sm">{item[language]}</span>
                          </li>
                      ))}
                  </ul>
              </div>
          </div>

          <div className="mt-8 flex gap-4">
              <button 
                  onClick={() => {
                       if (problem.id === 'ASSIGNMENT') { setLocalValues({a: null, b: null}); }
                       else { setLocalValues(currentValues); }
                       setBoxes([]);
                       setPhase('COVER');
                  }}
                  className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors"
              >
                  {t("Replay", "重玩一遍")}
              </button>
          </div>
      </div>
  );

  const renderGulu = () => (
      <div className="flex items-start gap-4 mb-6 animate-in slide-in-from-left duration-500 z-20 relative shrink-0">
          <div className="w-20 h-20 relative shrink-0">
             <div className="w-full h-full animate-bounce">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
                   <defs>
                      <linearGradient id="guluGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                         <stop offset="0%" stopColor="#60a5fa" /> 
                         <stop offset="100%" stopColor="#3b82f6" /> 
                      </linearGradient>
                   </defs>
                   <circle cx="50" cy="50" r="45" fill="url(#guluGradient)" />
                   <ellipse cx="30" cy="30" rx="10" ry="5" fill="white" fillOpacity="0.3" transform="rotate(-45 30 30)" />
                   <circle cx="35" cy="45" r="8" fill="white" />
                   <circle cx="35" cy="45" r="3" fill="#1e293b" />
                   <circle cx="65" cy="45" r="8" fill="white" />
                   <circle cx="65" cy="45" r="3" fill="#1e293b" />
                   <path d="M 35 65 Q 50 75 65 65" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
                   <circle cx="25" cy="55" r="4" fill="#f472b6" fillOpacity="0.6" />
                   <circle cx="75" cy="55" r="4" fill="#f472b6" fillOpacity="0.6" />
                </svg>
             </div>
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-700 text-white text-[10px] px-2 rounded-full border border-blue-400 font-bold shadow-sm">
                 GULU
             </div>
          </div>

          <div className="bg-white text-slate-900 p-4 rounded-2xl rounded-tl-none shadow-xl relative max-w-lg border-2 border-blue-100 self-center mt-2">
             <div className="absolute top-0 -left-2 w-0 h-0 border-t-[15px] border-t-white border-l-[15px] border-l-transparent"></div>
             <p className="font-bold text-lg leading-snug">{feedback}</p>
          </div>
      </div>
  );

  const renderDraggableBox = (name: string, val: number | null, color: string, address: string, highlight: boolean = false) => {
      const isSource = canDrag(name);
      return (
        <div 
            ref={el => boxRefs.current[name] = el}
            className={`relative transition-transform duration-300 ${isSource ? 'cursor-grab active:cursor-grabbing hover:scale-105 touch-none' : ''}`}
            onMouseDown={isSource ? (e) => handleMouseDown(e, name) : undefined}
            onTouchStart={isSource ? (e) => handleTouchStart(e, name) : undefined}
        >
            <VariableBox 
                name={name} 
                value={val} 
                address={address} 
                color={color} 
                emptyLabel={t("?", "?")} 
                customClass={`${isSource ? "shadow-2xl ring-2 ring-white/50" : ""} ${highlight ? "ring-4 ring-yellow-400 scale-105 z-10" : ""}`}
            />
            {isSource && (
                <div className="absolute -bottom-8 left-0 w-full text-center text-xs text-white bg-blue-600/50 rounded px-1 animate-pulse pointer-events-none">
                    {t("Drag Me!", "拖动我！")}
                </div>
            )}
        </div>
      )
  };
  
  const renderValuePill = (valStr: string) => {
      return (
          <div 
            className="w-12 h-12 rounded-full bg-white text-slate-900 font-bold flex items-center justify-center shadow-lg cursor-grab hover:scale-110 active:cursor-grabbing border-4 border-slate-200 touch-none"
            onMouseDown={(e) => handleValueDragStart(e, valStr)}
            onTouchStart={(e) => handleValueTouchStart(e, valStr)}
          >
              {valStr}
          </div>
      )
  };

  const renderPlaceholderBox = () => (
      <div className="w-24 h-28 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-600 text-xs">
          {t("No Box", "没有盒子")}
      </div>
  );

  // --- SUB-GAMES ---
  
  const renderAssignmentGame = () => {
      const showA = boxes.includes('a');
      const showB = boxes.includes('b');
      
      return (
          <div className="flex flex-col h-full relative">
              {/* Value Palette */}
              <div className="absolute top-0 right-0 p-4 flex gap-4 bg-slate-800/50 rounded-bl-xl border-l border-b border-slate-700">
                  <div className="text-[10px] text-slate-400 absolute top-1 left-2">Values</div>
                  {renderValuePill(currentValues.a.toString())}
                  {renderValuePill(currentValues.b.toString())}
              </div>

              <div className="flex justify-center items-center flex-1 gap-24">
                  <div className="flex flex-col items-center gap-4 transition-all duration-500">
                      {!showA ? renderPlaceholderBox() : renderDraggableBox('a', localValues.a, '#3b82f6', '0x04')}
                  </div>
                  <div className="text-4xl text-slate-600">➔</div>
                  <div className="flex flex-col items-center gap-4 transition-all duration-500">
                       {!showB ? renderPlaceholderBox() : renderDraggableBox('b', localValues.b, '#ef4444', '0x08')}
                  </div>
              </div>
              
              {!showA && phase === 'DECLARE' && (
                  <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
                       <button onClick={() => { setBoxes(['a', 'b']); setPhase('INIT_A'); setFeedback(t("We got boxes A and B! But they have random junk (?) inside. Clean A first!", "我们领到了 A 和 B！但里面有随机垃圾 (?)。先清理 A！")); }} 
                            className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold animate-pulse shadow-lg">
                            {t("int a, b; (Get Boxes)", "int a, b; (领盒子)")}
                       </button>
                  </div>
              )}
          </div>
      )
  };

  const renderSwapGame = () => (
      <div className="flex justify-center items-center h-full gap-16 relative">
          <div className="flex flex-col items-center gap-2 transition-all duration-500">
             {boxes.includes('a') ? renderDraggableBox('a', localValues.a, '#3b82f6', '0x04') : renderPlaceholderBox()}
          </div>

          <div className="flex flex-col items-center gap-2 absolute top-0">
             {boxes.includes('temp') ? (
                 renderDraggableBox('temp', localValues.temp || null, '#10b981', '0x0C')
             ) : (
                 phase === 'DECLARE_TEMP' && (
                     <button 
                        onClick={() => {
                            setBoxes([...boxes, 'temp']);
                            setPhase('COPY_A_TEMP');
                            setFeedback(t("We have 'temp'. Now, copy 'a' to 'temp' to save it!", "有了 'temp'。现在把 'a' 复制到 'temp' 保存起来！"));
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse font-bold"
                     >
                         {t("Declare 'temp'", "声明 temp")}
                     </button>
                 )
             )}
          </div>

          <div className="flex flex-col items-center gap-2 transition-all duration-500">
             {boxes.includes('b') ? renderDraggableBox('b', localValues.b, '#ef4444', '0x08') : renderPlaceholderBox()}
          </div>
      </div>
  );

  const renderFindMaxGame = () => (
    <div className="flex flex-col items-center justify-center h-full w-full gap-12 pt-8">
         <div className="flex justify-center gap-12">
             {boxes.includes('a') ? renderDraggableBox('a', localValues.a as number, '#3b82f6', '0x04') : renderPlaceholderBox()}
             {boxes.includes('b') ? renderDraggableBox('b', localValues.b as number, '#ef4444', '0x08', phase === 'CHECK_B') : renderPlaceholderBox()}
             {boxes.includes('c') ? renderDraggableBox('c', localValues.c as number, '#8b5cf6', '0x0C', phase === 'CHECK_C') : renderPlaceholderBox()}
         </div>

         <div className="relative p-8 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/30 min-w-[150px] min-h-[180px] flex items-center justify-center">
             {boxes.includes('max') ? (
                 renderDraggableBox('max', localValues.max === 0 ? null : localValues.max, '#eab308', '0x10', (phase === 'CHECK_B' || phase === 'CHECK_C'))
             ) : (
                  phase === 'DECLARE_MAX' && (
                      <button 
                        onClick={() => {
                            setBoxes(['a', 'b', 'c', 'max']); 
                            setLocalValues({...localValues, max: 0}); 
                            setPhase('INIT_MAX');
                            setFeedback(t("Assume 'a' is the max initially. Drag 'a' to 'max'.", "首先假设 'a' 是最大的。把 'a' 拖到 'max'。"));
                        }}
                        className="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse font-bold whitespace-nowrap"
                     >
                         {t("Declare 'max'", "声明 max")}
                     </button>
                  )
             )}
         </div>

         {(phase === 'CHECK_B' || phase === 'CHECK_C') && (
             <div className="absolute bottom-4 flex gap-4 animate-in zoom-in duration-300">
                 <button 
                    onClick={() => {
                         if (phase === 'CHECK_B') {
                             if ((localValues.b as number) > (localValues.max as number)) {
                                 setPhase('UPDATE_MAX_B');
                                 setFeedback(t("Correct! B is bigger. Drag 'b' to 'max'.", "正确！B 更大。把 'b' 拖到 'max'。"));
                             } else {
                                 setFeedback(t("Wrong. b is NOT bigger than max.", "错误。b 并不比 max 大。"));
                             }
                         } else { 
                             if ((localValues.c as number) > (localValues.max as number)) {
                                 setPhase('UPDATE_MAX_C');
                                 setFeedback(t("Correct! C is bigger. Drag 'c' to 'max'.", "正确！C 更大。把 'c' 拖到 'max'。"));
                             } else {
                                 setFeedback(t("Wrong. c is NOT bigger than max.", "错误。c 并不比 max 大。"));
                             }
                         }
                    }}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:scale-105 transition-transform"
                 >
                     {t("YES", "是")}
                 </button>
                 <button 
                    onClick={() => {
                        if (phase === 'CHECK_B') {
                            if ((localValues.b as number) <= (localValues.max as number)) {
                                setFeedback(t("Correct. Max stays the same.", "正确。Max 保持不变。"));
                                setTimeout(() => advanceMaxLogic(localValues as Record<string, number>, 'CHECK_C'), 1000);
                            } else {
                                setFeedback(t("Wrong. b IS bigger!", "错了。b 确实比 max 大！"));
                            }
                        } else { 
                             if ((localValues.c as number) <= (localValues.max as number)) {
                                 setFeedback(t("Correct. Max doesn't change.", "正确。Max 不需要改变。"));
                                 finishGame();
                             } else {
                                setFeedback(t("Wrong. c IS bigger!", "错了。c 确实比 max 大！"));
                             }
                        }
                    }}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:scale-105 transition-transform"
                 >
                     {t("NO", "否")}
                 </button>
             </div>
         )}
    </div>
  );

  const renderSortGame = () => {
      const isP1 = phase === 'COMPARE_1';
      const isP2 = phase === 'COMPARE_2';
      const isP3 = phase === 'COMPARE_3';

      const handleSwapClick = (idx1: number, idx2: number) => {
          const keys = ['a', 'b', 'c'];
          const k1 = keys[idx1];
          const k2 = keys[idx2];
          const val1 = localValues[k1] as number;
          const val2 = localValues[k2] as number;

          setLocalValues(prev => ({...prev, [k1]: val2, [k2]: val1}));
      };

      const handleNext = (didSwap: boolean) => {
          if (phase === 'INTRO') {
              setPhase('COMPARE_1');
              setFeedback(t("First, compare A and B. Is A > B?", "首先，比较 A and B。A > B 吗？"));
          } else if (phase === 'COMPARE_1') {
              setPhase('COMPARE_2');
              setFeedback(t("Next, compare B and C. Is B > C?", "接着，比较 B and C。B > C 吗？"));
          } else if (phase === 'COMPARE_2') {
              setPhase('COMPARE_3');
              setFeedback(t("Last check, A and B again. Is A > B?", "最后检查，再次比较 A and B。A > B 吗？"));
          } else if (phase === 'COMPARE_3') {
              finishGame(t("Sorted! 1, 2, 3!", "排好序了！"));
          }
      };

      return (
          <div className="flex flex-col items-center justify-center h-full gap-8">
              <div className="flex gap-8">
                  {['a', 'b', 'c'].map((key, idx) => {
                      const isActive = (isP1 && (idx===0 || idx===1)) || (isP2 && (idx===1 || idx===2)) || (isP3 && (idx===0 || idx===1));
                      return (
                          <div key={key} className={`transition-all duration-300 ${isActive ? 'scale-110 z-10' : 'opacity-50'}`}>
                              <VariableBox 
                                name={key} 
                                value={localValues[key]} 
                                address={`0x0${4+idx*4}`} 
                                color={isActive ? '#eab308' : '#64748b'} 
                                customClass={isActive ? 'ring-4 ring-yellow-400' : ''}
                                emptyLabel={t("Empty", "空")}
                              />
                          </div>
                      )
                  })}
              </div>

              {phase === 'INTRO' && (
                  <button onClick={() => handleNext(false)} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold animate-bounce">
                      {t("Start Sorting", "开始排序")}
                  </button>
              )}

              {(isP1 || isP2 || isP3) && (
                  <div className="flex gap-4">
                      {(() => {
                          const [v1, v2] = isP1 || isP3 
                            ? [localValues.a as number, localValues.b as number] 
                            : [localValues.b as number, localValues.c as number];
                          const shouldSwap = v1 > v2;
                          
                          return (
                              <>
                                <button 
                                    onClick={() => {
                                        if (shouldSwap) {
                                            handleSwapClick(isP2 ? 1 : 0, isP2 ? 2 : 1);
                                            setFeedback(t("Swapped!", "已交换！"));
                                            setTimeout(() => handleNext(true), 1000);
                                        } else {
                                            setFeedback(t("Oops! No need to swap.", "哎呀！不需要交换。"));
                                        }
                                    }}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg"
                                >
                                    {t("Swap Needed", "需要交换")}
                                </button>
                                <button 
                                    onClick={() => {
                                        if (!shouldSwap) {
                                            setFeedback(t("Correct. Next...", "正确。下一步..."));
                                            setTimeout(() => handleNext(false), 800);
                                        } else {
                                            setFeedback(t("Oops! Look closer.", "哎呀！再看仔细点。"));
                                        }
                                    }}
                                    className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg"
                                >
                                    {t("No Swap", "不交换")}
                                </button>
                              </>
                          )
                      })()}
                  </div>
              )}
          </div>
      )
  };

  if (phase === 'COVER') return renderCover();
  if (phase === 'SUMMARY') return renderSummary();

  return (
    <div 
        ref={containerRef}
        className="relative h-[550px] bg-slate-900/80 rounded-xl border border-slate-700 p-6 overflow-hidden select-none flex flex-col w-full touch-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
      {renderGulu()}

      <div className="flex-1 pt-2 relative w-full flex flex-col justify-center">
        {problem.id === 'ASSIGNMENT' && renderAssignmentGame()}
        {problem.id === 'SWAP' && renderSwapGame()}
        {problem.id === 'FIND_MAX' && renderFindMaxGame()}
        {problem.id === 'SORT_3' && renderSortGame()}
      </div>

      {phase === 'INTRO' && problem.id !== 'ASSIGNMENT' && problem.id !== 'SORT_3' && (
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
               <button 
                 onClick={() => { 
                     if (problem.id === 'SWAP') { setBoxes(['a', 'b']); setPhase('DECLARE_TEMP'); setFeedback(t("We have A and B. Get a helper!", "我们有了 A 和 B。找个帮手！")); }
                     else if (problem.id === 'FIND_MAX') { setBoxes(['a','b','c']); setPhase('DECLARE_MAX'); setFeedback(t("We have A, B, C. We need a Max box.", "我们有了 A, B, C。我们需要一个 Max 盒子。")); }
                 }}
                 className="bg-green-600 hover:bg-green-500 text-white px-12 py-4 rounded-full font-bold text-xl shadow-2xl border-2 border-green-400 animate-pulse whitespace-nowrap"
               >
                   {t("Start Game", "开始游戏")}
               </button>
           </div>
      )}
      
      {phase === 'INTRO' && problem.id === 'ASSIGNMENT' && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
               <button onClick={() => { setPhase('DECLARE'); setFeedback(t("Let's ask the computer for two integer boxes: a and b.", "我们向电脑要两个整数盒子：a 和 b。")); }} 
                    className="bg-green-600 hover:bg-green-500 text-white px-12 py-4 rounded-full font-bold text-xl shadow-2xl border-2 border-green-400 animate-pulse whitespace-nowrap">
                    {t("Start", "开始")}
               </button>
          </div>
      )}

      {isDragging && dragStart && dragCurr && draggedSource && (
          <div 
            className="fixed pointer-events-none z-50 opacity-80"
            style={{ 
                left: dragCurr.x, 
                top: dragCurr.y,
                transform: 'translate(-50%, -50%)'
            }}
          >
               <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl border-4 border-white">
                   {draggedSource.startsWith('VAL:') ? draggedSource.split(':')[1] : (localValues[draggedSource] ?? "?")}
               </div>
               <div className="absolute top-full mt-2 text-white bg-black/50 px-2 rounded text-xs whitespace-nowrap">
                   {draggedSource.startsWith('VAL:') ? t("Value", "数值") : t(`Clone of ${draggedSource}`, `${draggedSource} 的分身`)}
               </div>
          </div>
      )}

      {phase === 'COMPLETE' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
               <div className="w-full h-full bg-gradient-to-t from-green-500/10 to-transparent"></div>
          </div>
      )}

    </div>
  );
};
