
import React, { useState, useEffect } from 'react';
import { Language } from '../types';

export type PresentationId = 'INTRO' | 'ROADMAP';

interface IntroModalProps {
  onClose: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  presentationId: PresentationId;
}

type PresentationMode = 'FUN' | 'PRO';

interface Slide {
  id?: string;
  title?: { en: string; cn: string };
  subtitle?: { en: string; cn: string };
  content?: { en: string; cn: string };
  icon?: React.ReactNode;
  color?: string;
}

// --- SUB-COMPONENT: Pain Point Animation ---
const PainPointAnimation = ({ mode }: { mode: PresentationMode }) => {
    const [phase, setPhase] = useState<'HAPPY' | 'STRUGGLING' | 'GAVE_UP'>('HAPPY');

    useEffect(() => {
        const cycle = () => {
            setPhase('HAPPY');
            setTimeout(() => setPhase('STRUGGLING'), 2500);
            setTimeout(() => setPhase('GAVE_UP'), 6500);
            setTimeout(cycle, 9500);
        };
        cycle();
        return () => {};
    }, []);

    const keywords = mode === 'PRO' ? [
        { text: "Syntax Error", x: 10, y: 20, delay: 0 },
        { text: "Abstract", x: 80, y: 15, delay: 0.5 },
        { text: "English", x: 15, y: 70, delay: 1.0 },
        { text: "Typing...", x: 75, y: 75, delay: 1.5 },
        { text: "missing ;", x: 50, y: 10, delay: 2.0 },
        { text: "Seg Fault", x: 50, y: 85, delay: 2.5 },
    ] : [
        { text: "Monster!", x: 10, y: 20, delay: 0 },
        { text: "Boring...", x: 80, y: 15, delay: 0.5 },
        { text: "ABC??", x: 15, y: 70, delay: 1.0 },
        { text: "Keyboard Fire", x: 75, y: 75, delay: 1.5 },
        { text: "Bug Bug Bug", x: 50, y: 10, delay: 2.0 },
        { text: "Game Over", x: 50, y: 85, delay: 2.5 },
    ];

    return (
        <div className={`w-full h-64 relative flex items-center justify-center rounded-xl overflow-hidden mb-6 ${mode === 'PRO' ? 'bg-slate-900/50 border border-slate-700' : 'bg-orange-100/10 border border-orange-300/30'}`}>
            {/* Background Keywords */}
            {phase !== 'HAPPY' && keywords.map((k, i) => (
                <div 
                    key={i}
                    className={`absolute font-mono font-bold transition-all duration-500 transform
                        ${phase === 'GAVE_UP' ? 'scale-150 opacity-10 text-slate-500' : 'scale-100 opacity-60 animate-pulse text-red-400'}
                    `}
                    style={{ 
                        left: `${k.x}%`, 
                        top: `${k.y}%`, 
                        animationDelay: `${k.delay}s`,
                        fontSize: phase === 'GAVE_UP' ? '1.5rem' : '0.9rem',
                        fontFamily: mode === 'PRO' ? 'monospace' : 'sans-serif'
                    }}
                >
                    {k.text}
                </div>
            ))}

            {/* Avatar Container */}
            <div className={`transition-all duration-1000 transform ${phase === 'GAVE_UP' ? 'translate-y-10' : ''}`}>
                {/* Avatar SVG */}
                <svg width="120" height="120" viewBox="0 0 100 100" className="overflow-visible">
                    {/* Body/Face Shape */}
                    <circle 
                        cx="50" cy="50" 
                        r={phase === 'GAVE_UP' ? 35 : 45} 
                        fill={phase === 'HAPPY' ? '#fbbf24' : phase === 'STRUGGLING' ? '#f87171' : '#94a3b8'} 
                        className={`transition-all duration-1000 
                            ${phase === 'HAPPY' && mode === 'FUN' ? 'animate-bounce' : ''}
                            ${phase === 'STRUGGLING' ? 'animate-[wiggle_0.2s_ease-in-out_infinite]' : ''}
                            ${phase === 'GAVE_UP' ? 'scale-y-75 origin-bottom' : ''}
                        `}
                    />
                    
                    {/* Eyes */}
                    <g className={`transition-all duration-500 ${phase === 'STRUGGLING' ? 'translate-y-[-2px]' : ''}`}>
                        {phase === 'HAPPY' ? (
                            <>
                                <circle cx="35" cy="40" r="5" fill="#1e293b" />
                                <circle cx="65" cy="40" r="5" fill="#1e293b" />
                            </>
                        ) : phase === 'STRUGGLING' ? (
                            <>
                                <circle cx="35" cy="40" r="4" fill="#1e293b" />
                                <circle cx="65" cy="40" r="6" fill="#1e293b" />
                                <path d="M 30 30 L 40 35" stroke="#1e293b" strokeWidth="2" />
                                <path d="M 70 30 L 60 35" stroke="#1e293b" strokeWidth="2" />
                            </>
                        ) : (
                            <>
                                {/* X Eyes */}
                                <path d="M 30 35 L 40 45 M 40 35 L 30 45" stroke="#1e293b" strokeWidth="3" />
                                <path d="M 60 35 L 70 45 M 70 35 L 60 45" stroke="#1e293b" strokeWidth="3" />
                            </>
                        )}
                    </g>

                    {/* Mouth */}
                    <g className="transition-all duration-500">
                        {phase === 'HAPPY' ? (
                            <path d="M 30 60 Q 50 75 70 60" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                        ) : phase === 'STRUGGLING' ? (
                            <path d="M 35 70 Q 50 60 65 70" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                        ) : (
                            <path d="M 40 70 L 60 70" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                        )}
                    </g>

                    {/* Sweat Drops (Struggling only) */}
                    {phase === 'STRUGGLING' && (
                        <g className="animate-pulse">
                            <path d="M 85 30 Q 85 40 80 35" fill="#3b82f6" />
                            <path d="M 15 35 Q 15 45 20 40" fill="#3b82f6" />
                        </g>
                    )}
                </svg>
            </div>
            
            {/* Status Text Overlay */}
            <div className="absolute bottom-4 font-bold text-sm tracking-widest uppercase">
                {phase === 'HAPPY' && <span className={mode === 'FUN' ? "text-yellow-600" : "text-yellow-500"}>{mode === 'FUN' ? "Let's Go!" : "Start"}</span>}
                {phase === 'STRUGGLING' && <span className="text-red-400">{mode === 'FUN' ? "Help Me!" : "Frustration"}</span>}
                {phase === 'GAVE_UP' && <span className="text-slate-500">{mode === 'FUN' ? "Nap Time..." : "Quit"}</span>}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: Roadmap Animation ---
const RoadmapAnimation = ({ mode, language }: { mode: PresentationMode, language: Language }) => {
    const [activeStep, setActiveStep] = useState<number | null>(null);

    // STRICT 7 STEPS based on prompt
    const steps = [
        { 
            id: 1, 
            title: { en: "AI Entry", cn: "AI入门" }, 
            desc: { en: "Gamified Patterns", cn: "游戏化模式" },
            details: { 
                en: "AI game-based entry to familiarize and love basic coding English patterns.", 
                cn: "AI游戏化编程中英文入门，熟悉和喜欢上最基本编程英语训练模式。" 
            }
        },
        { 
            id: 2, 
            title: { en: "Bilingual", cn: "带英主题" }, 
            desc: { en: "CN First -> EN", cn: "先中后英" },
            details: { 
                en: "Learn concept in Chinese mode first, then switch to Full English mode.", 
                cn: "单元主题中带英（先学中文模式，再切换全英模式）。" 
            }
        },
        { 
            id: 3, 
            title: { en: "Intensive", cn: "强化训练" }, 
            desc: { en: "Typing/Vocab", cn: "打字/拼读/词汇" },
            details: { 
                en: "Typing, Spelling Bee, Sight Words, accumulation, basic communication, self-study.", 
                cn: "编程英语强化训练（打字，拼读，基本阅读，Spelling Bee，Sight Words，单词积累，课堂基本交流，自主学习）。" 
            }
        },
        { 
            id: 4, 
            title: { en: "EN Primary", cn: "英语为主" }, 
            desc: { en: "CN Auxiliary", cn: "中文辅助" },
            details: { 
                en: "Unit taught primarily in English with Chinese assistance.", 
                cn: "单元英语为主，中文辅助。" 
            }
        },
        { 
            id: 5, 
            title: { en: "Full EN", cn: "完全英文" }, 
            desc: { en: "Bilingual Teacher", cn: "双语老师辅助" },
            details: { 
                en: "Full English environment with bilingual teacher support.", 
                cn: "完全英文，中英双语老师辅助。" 
            }
        },
        { 
            id: 6, 
            title: { en: "Guided", cn: "指导自主" }, 
            desc: { en: "EN Activities", cn: "英文模式活动" },
            details: { 
                en: "Teacher guides independent learning and coding activities in English.", 
                cn: "老师指导英文模式自主学习编程和参加编程活动。" 
            }
        },
        { 
            id: 7, 
            title: { en: "Fly Free", cn: "自由飞翔" }, 
            desc: { en: "Global Community", cn: "国际社区" },
            details: { 
                en: "Join international classes, communities, and courses.", 
                cn: "自由飞翔，参加国际班级，国际编程社区，课程。" 
            }
        },
    ];

    const t = (obj: {en: string, cn: string}) => language === 'cn' ? obj.cn : obj.en;

    const handleStepClick = (id: number) => {
        setActiveStep(prev => prev === id ? null : id);
    };

    return (
        <div className={`w-full h-80 relative flex items-center justify-center rounded-xl overflow-hidden mb-6 p-4 transition-colors duration-500
            ${mode === 'PRO' ? 'bg-slate-900/80 border border-slate-700' : 'bg-blue-900/20 border border-blue-400/30'}`}
        >
            {/* MAP VISUALIZATION (Used for BOTH modes to ensure visibility and content) */}
            <div className="relative w-full h-full">
                {/* Connecting Path */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
                    <path 
                        d="M 30 250 Q 100 200 150 250 T 260 150 T 370 50" 
                        fill="none" 
                        stroke={mode === 'PRO' ? '#3b82f6' : '#fbbf24'} 
                        strokeWidth="3" 
                        strokeDasharray={mode === 'PRO' ? "0" : "8 4"}
                        strokeOpacity="0.6"
                        className={mode === 'FUN' ? "animate-[dash_30s_linear_infinite]" : ""}
                    />
                </svg>

                {/* Steps */}
                {steps.map((step, i) => {
                    const isActive = activeStep === step.id;
                    
                    // Position along the path roughly
                    // x goes 5% -> 95%
                    // y goes 80% -> 10%
                    const left = 5 + (i * 13.5);
                    const bottom = 10 + (i * 12);

                    return (
                        <div 
                            key={step.id}
                            onClick={() => handleStepClick(step.id)}
                            className={`absolute flex flex-col items-center cursor-pointer transform transition-all duration-300 group
                                ${isActive ? 'scale-125 z-20' : 'hover:scale-110 z-10'}
                            `}
                            style={{ 
                                left: `${left}%`, 
                                bottom: `${bottom}%`,
                            }}
                        >
                            <div className={`
                                w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 transition-colors
                                ${isActive 
                                    ? (mode === 'PRO' ? 'bg-blue-600 border-white text-white' : 'bg-yellow-400 border-white text-black')
                                    : (mode === 'PRO' ? 'bg-slate-800 border-blue-900 text-blue-500 group-hover:bg-blue-900' : 'bg-orange-500 border-yellow-300 text-white group-hover:bg-orange-400')
                                }
                            `}>
                                {step.id}
                            </div>
                            
                            {/* Label */}
                            <div className={`
                                text-[9px] md:text-[10px] px-1 py-0.5 rounded mt-1 whitespace-nowrap backdrop-blur-sm transition-all max-w-[80px] overflow-hidden text-ellipsis
                                ${isActive ? 'bg-white text-black font-bold' : 'bg-black/60 text-white'}
                            `}>
                                {t(step.title)}
                            </div>
                        </div>
                    );
                })}

                {/* Trophy at end */}
                <div className="absolute top-2 right-2 text-3xl animate-pulse">
                    {mode === 'PRO' ? '🎓' : '🏆'}
                </div>

                {/* ACTIVE DETAIL OVERLAY */}
                {activeStep !== null && (
                    <div className="absolute bottom-4 left-4 right-4 bg-slate-800/95 border border-slate-600 p-4 rounded-xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 z-30">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-bold text-sm uppercase tracking-wider ${mode === 'PRO' ? 'text-blue-400' : 'text-yellow-400'}`}>
                                Step {activeStep}: {t(steps[activeStep-1].title)} - {t(steps[activeStep-1].desc)}
                            </h4>
                            <button onClick={(e) => { e.stopPropagation(); setActiveStep(null); }} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <p className="text-white text-sm md:text-base leading-relaxed">
                            {t(steps[activeStep-1].details)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: Team Animation ---
const TeamAnimation = ({ mode }: { mode: PresentationMode }) => {
    return (
        <div className={`w-full h-64 relative flex items-center justify-center rounded-xl overflow-hidden mb-6 ${mode === 'PRO' ? 'bg-slate-900/50 border border-slate-700' : 'bg-green-100/10 border border-green-300/30'}`}>
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-10 text-4xl text-blue-500 animate-pulse font-mono">C++</div>
                <div className="absolute bottom-10 right-10 text-4xl text-green-500 animate-bounce font-mono">Logic</div>
                <div className={`absolute top-1/2 left-4 text-2xl text-yellow-500 animate-[spin_10s_linear_infinite]`}>{mode === 'FUN' ? 'Magic' : 'E=mc²'}</div>
                <div className="absolute top-10 right-20 text-3xl text-purple-500 font-serif">English</div>
                <div className="absolute bottom-4 left-1/3 text-2xl text-pink-500">{mode === 'FUN' ? 'Fun' : 'Math'}</div>
            </div>

            {/* Central Badge */}
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center mb-4 relative overflow-hidden">
                    {/* Google Colors Ring */}
                    <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-red-500 border-b-yellow-500 border-l-green-500 rounded-full animate-[spin_4s_linear_infinite]"></div>
                    
                    {/* Trophy/Wand Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-yellow-500 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                         {mode === 'FUN' 
                            ? <path d="M14.5 2l-1.3 5.3-5.2 1.2 5.2 1.2 1.3 5.3 1.3-5.3 5.2-1.2-5.2-1.2zM5 14l-1 4-4 1 4 1 1 4 1-4 4-1-4-1z" /> // Sparkles
                            : <path d="M12 2l1.5 4h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" /> // Star
                         }
                    </svg>
                </div>
                
                <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded border ${mode === 'PRO' ? 'bg-blue-900/50 text-blue-300 border-blue-500/30' : 'bg-yellow-400 text-black border-yellow-500'}`}>{mode === 'FUN' ? 'Coding Wizards' : 'Google Experts'}</span>
                    <span className={`px-2 py-1 text-xs rounded border ${mode === 'PRO' ? 'bg-purple-900/50 text-purple-300 border-purple-500/30' : 'bg-purple-400 text-white border-purple-500'}`}>{mode === 'FUN' ? 'Super Teachers' : 'AI Veterans'}</span>
                </div>
            </div>
        </div>
    );
};

export const IntroModal: React.FC<IntroModalProps> = ({ onClose, language, setLanguage, presentationId }) => {
  const [slide, setSlide] = useState(0);
  const [mode, setMode] = useState<PresentationMode>('PRO');

  const t = (en: string, cn: string) => language === 'cn' ? cn : en;

  // --- RENDER HELPERS ---

  const renderComparison = () => (
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl mt-8 animate-in fade-in duration-700">
          {/* Traditional Side */}
          <div className={`flex-1 rounded-xl p-6 relative overflow-hidden transition-all 
             ${mode === 'PRO' ? 'bg-slate-800 border border-slate-700 opacity-80' : 'bg-slate-300 grayscale rotate-1 shadow-lg'}`}>
              <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded 
                 ${mode === 'PRO' ? 'bg-slate-700 text-slate-300' : 'bg-slate-500 text-white'}`}>
                  {mode === 'FUN' ? 'BORING...' : 'TRADITIONAL'}
              </div>
              <h3 className={`font-bold text-lg mb-4 ${mode === 'PRO' ? 'text-white' : 'text-slate-800'}`}>{t("Textbook Learning", "课本学习")}</h3>
              <div className={`font-mono text-xs p-4 rounded h-40 overflow-hidden 
                 ${mode === 'PRO' ? 'bg-slate-950 text-slate-400 border border-slate-800' : 'bg-white text-slate-800 border border-slate-300'}`}>
                  <p>#include &lt;iostream&gt;</p>
                  <p>using namespace std;</p>
                  <p>int main() &#123;</p>
                  <p>&nbsp;&nbsp;int a = 10;</p>
                  <p>&nbsp;&nbsp;// Zzzzz...</p>
                  <p>&#125;</p>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2"><span className="text-red-500">✕</span> {mode === 'FUN' ? t("Yawn...", "好困啊...") : t("Static Text", "枯燥文字")}</div>
                  <div className="flex items-center gap-2"><span className="text-red-500">✕</span> {mode === 'FUN' ? t("Brain hurts", "脑壳疼") : t("Hard to visualize", "难以想象")}</div>
              </div>
          </div>

          {/* VS Badge */}
          <div className="flex items-center justify-center">
              <div className={`rounded-full font-black flex items-center justify-center shadow-xl z-10 
                 ${mode === 'PRO' ? 'w-10 h-10 bg-slate-700 text-slate-300 text-sm' : 'w-12 h-12 bg-yellow-400 text-black scale-125 rotate-12'}`}>
                 VS
              </div>
          </div>

          {/* Gulu Side */}
          <div className={`flex-1 rounded-xl p-6 text-white relative overflow-hidden shadow-2xl transition-all
              ${mode === 'PRO' ? 'bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/30' : 'bg-gradient-to-br from-yellow-400 to-orange-500 -rotate-1 scale-105 border-2 border-white/20'}`}>
              <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded 
                 ${mode === 'PRO' ? 'bg-blue-600 text-white' : 'bg-white text-purple-900 animate-pulse'}`}>
                 GULU AICC
              </div>
              <h3 className="font-bold text-lg mb-4">{t("Gulu AI Coach", "咕噜 AI 教练")}</h3>
              
              {/* Animation Mockup */}
              <div className={`h-40 rounded-lg relative flex items-center justify-center mb-4 
                 ${mode === 'PRO' ? 'bg-slate-950 border border-slate-700' : 'bg-black/20 border border-white/10'}`}>
                  <div className={`absolute w-16 h-20 rounded flex items-center justify-center 
                     ${mode === 'PRO' ? 'border border-blue-500 bg-blue-500/10 text-blue-400 font-mono animate-pulse' : 'border-2 border-white bg-white/20 animate-bounce font-bold'}`}>
                      <span>10</span>
                  </div>
                  {mode === 'FUN' && <div className="absolute text-4xl animate-spin -top-2 -right-2">🌟</div>}
              </div>

              <div className="space-y-2 text-sm text-white/90">
                  <div className="flex items-center gap-2"><span className="text-green-400">✓</span> {mode === 'FUN' ? t("Super Fun!", "超级好玩！") : t("Interactive & Visual", "交互与可视化")}</div>
                  <div className="flex items-center gap-2"><span className="text-green-400">✓</span> {mode === 'FUN' ? t("I get it!", "我懂了！") : t("Instant Feedback", "即时反馈")}</div>
              </div>
          </div>
      </div>
  );

  const renderUniqueAdvantage = () => (
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mt-8 animate-in fade-in duration-700">
          {/* Card 1: Retention */}
          <div className={`flex-1 border rounded-xl p-8 transition-all group 
             ${mode === 'PRO' ? 'bg-slate-900 border-slate-700' : 'bg-pink-500/80 border-pink-400 hover:scale-105'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg 
                  ${mode === 'PRO' ? 'bg-slate-800 text-blue-400' : 'bg-white text-pink-500'}`}>
                   {mode === 'FUN' ? <span className="text-3xl">❤️</span> : <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.28 3.6-2.34 3.6-4.44 0-2.12-1.63-3.66-3.6-3.66-1.64 0-2.96.85-3.6 2.46C14.76 6.7 13.44 5.9 11.8 5.9c-1.97 0-3.6 1.54-3.6 3.66 0 2.1 2.11 3.16 3.6 4.44C13.28 15.32 15.12 18.34 15.12 19.88c0-1.54 1.84-4.56 3.32-5.88z"/><path d="M12 14c-1.49-1.28-3.6-2.34-3.6-4.44 0-2.12 1.63-3.66 3.6-3.66 1.64 0 2.96.85 3.6 2.46.64-1.61 1.96-2.46 3.6-2.46 1.97 0 3.6 1.54 3.6 3.66 0 2.1-2.11 3.16-3.6 4.44-1.48 1.32-3.32 4.34-3.32 5.88 0-1.54-1.84-4.56-3.32-5.88z"/><path d="M12 18v4"/><path d="M12 2v1"/><path d="M8.41 3.59l.71.71"/><path d="M15.59 3.59l-.71.71"/></svg>}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{mode === 'FUN' ? t("Love Coding!", "爱上编程！") : t("Zero Dropout", "零放弃率")}</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  {mode === 'FUN' 
                    ? t("You won't want to stop playing! It's better than cartoons.", "你会玩到停不下来！这比动画片还好看。")
                    : t("Build confidence & love for coding. Unlike the industry's 50%* quit rate, kids play Gulu and want more.", "建立自信与热爱。相比行业50%*的放弃率，孩子玩咕噜反而意犹未尽。")
                  }
              </p>
          </div>

          {/* Card 2: International Ladder */}
          <div className={`flex-1 border rounded-xl p-8 transition-all group 
             ${mode === 'PRO' ? 'bg-slate-900 border-slate-700' : 'bg-blue-500/80 border-blue-400 hover:scale-105'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg 
                  ${mode === 'PRO' ? 'bg-slate-800 text-green-400' : 'bg-white text-blue-500'}`}>
                  {mode === 'FUN' ? <span className="text-3xl">🚀</span> : <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/></svg>}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{mode === 'FUN' ? t("World Talent", "走向世界") : t("International Standard", "国际化标准")}</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  {mode === 'FUN'
                    ? t("Speak the language of computers! You can make apps for the whole world.", "学会电脑的语言！你可以为全世界的人开发游戏和应用。")
                    : t("From Zero English to full English IDE environment. We bridge the gap that even 'award winners' face.", "从零英语基础到全英文开发环境。我们要填补即使是‘获奖学生’也面临的国际化鸿沟。")
                  }
              </p>
          </div>
      </div>
  );

  // --- DATA LOADING ---
  const getSlides = (id: PresentationId, m: PresentationMode): Slide[] => {
      const proMode = m === 'PRO';

      // --- PRESENTATION 1: INTRO (Original) ---
      if (id === 'INTRO') {
          return [
            {
              id: 'pain_point',
              title: { en: proMode ? "The 'Black Screen' Crisis" : "Defeat the Code Monster!", cn: proMode ? "“黑屏幕”危机" : "打败代码小怪兽！" },
              subtitle: { en: "Why 90% Quit", cn: "为什么90%放弃" },
              content: { 
                  en: proMode 
                    ? "Traditional learning is abstract. Strict syntax and English errors frustrate students before they understand logic."
                    : "Boring black screens? Alien words? Scary errors? No wonder kids run away!",
                  cn: proMode
                    ? "传统学习太抽象。严格的语法和英文错误让学生在理解逻辑前就受挫。"
                    : "黑乎乎的屏幕？看不懂的英文？难怪小朋友想逃跑！"
              },
              color: "from-slate-900 to-red-950" 
            },
            {
              title: { en: proMode ? "Generation 3.0 Learning" : "Your AI Super-Buddy!", cn: proMode ? "第三代编程学习体验" : "你的 AI 超级伙伴！" },
              subtitle: { en: "AI-Powered Adaptive System", cn: "AI驱动的自适应系统" },
              content: {
                  en: proMode
                    ? "We use AI for personalized adaptive learning (Self-paced), providing high-quality solutions tailored to each student."
                    : "Meet Gulu! A magical AI teacher who knows EXACTLY what you need and adjusts the speed just for you.",
                  cn: proMode
                    ? "我们利用AI进行个性化自适应学习（自配速），为每个学生提供高质量的定制方案。"
                    : "认识一下咕噜！它是一个有魔法的AI老师，知道你哪里不会，专门为你调整速度。"
              },
              icon: <div className="text-6xl animate-bounce">🤖</div>,
              color: "from-blue-900 to-slate-950"
            },
            {
              title: { en: proMode ? "See it. Touch it. Master it." : "Don't Read. PLAY!", cn: proMode ? "看见它。触摸它。掌握它。" : "别死记硬背，玩起来！" },
              subtitle: { en: "Pedagogy: Concrete before Abstract", cn: "教学法：先具象，后抽象" },
              content: {
                  en: proMode
                    ? "Digestion Metaphor: AI breaks knowledge down into 'absorbable units' (micro-interactions), making learning effortless."
                    : "We chop big hard concepts into tiny yummy cookies. You eat them one by one (play small games)!",
                  cn: proMode
                    ? "消化原理：AI将知识分解成“可吸收单元”（微小互动），让学习像吃饭一样自然。"
                    : "我们要把难啃的大骨头，变成美味的小饼干。你只需要玩一个个小游戏！"
              },
              icon: <div className="text-6xl animate-spin">🍪</div>,
              color: "from-indigo-900 to-slate-950"
            },
            {
                id: "comparison",
                title: { en: proMode ? "Traditional vs. Gulu-AICC" : "Boring Class vs. Gulu World", cn: proMode ? "传统方式 vs 咕噜AI" : "无聊课堂 vs 咕噜世界" },
                subtitle: { en: "Efficiency Gap", cn: "效率差距" },
                content: { en: "", cn: "" },
                color: "from-slate-900 to-indigo-950"
            },
            {
                id: "unique_advantage",
                title: { en: proMode ? "Our Unique Advantage" : "Level Up Like a Game!", cn: proMode ? "我们的独特优势" : "像游戏一样升级！" },
                subtitle: { en: "Value Proposition", cn: "核心价值主张" },
                content: { en: "", cn: "" },
                color: "from-purple-900 to-slate-950"
            }
          ];
      }

      // --- PRESENTATION 2: ROADMAP (New) ---
      if (id === 'ROADMAP') {
          return [
            {
              title: { en: proMode ? "From 'Chinese Circle' to Global" : "Break the Bubble!", cn: proMode ? "从“中文圈子编程”到“英文国际编程”" : "冲破中文圈的泡泡！" },
              subtitle: { en: "The Crisis", cn: "现状危机" },
              content: {
                  en: proMode 
                    ? "99% of Chinese kids learn 'Mute Coding' (Pinyin vars, Chinese comments). They spend the most time and money but end up with 'Chinglish Coding', unable to communicate globally. This hurts confidence and success."
                    : "Coding only in Chinese is like learning 'Mute English'! You spend so much effort but can't talk to the world's computers. Don't let that happen!",
                  cn: proMode
                    ? "99%中国孩子学的是“中文圈编程”（拼音变量、中文注释）。化了最多的钱和时间，结果却是“哑巴编程”，无法与国际交流。这严重影响了自信心和成功机会。"
                    : "只用中文学编程，就像学“哑巴英语”！花了大力气却没法和全世界的高手交流。别被困住！"
              },
              icon: <div className="text-6xl animate-pulse">💬🚫</div>,
              color: "from-red-950 to-slate-900"
            },
            {
              title: { en: proMode ? "The Root Cause: Systemic Failure" : "Why is it Hard?", cn: proMode ? "原因：系统性缺失" : "为什么这么难？" },
              subtitle: { en: "Teacher & Tool Gap", cn: "师资与工具断层" },
              content: {
                  en: proMode
                    ? "It is NOT the student's fault. The problem lies in outdated teaching theories, tools, and textbooks. Most institutions lack qualified bilingual teachers or international leadership."
                    : "It's NOT your fault! Most schools don't have teachers who are masters of BOTH Coding AND English. But we do!",
                  cn: proMode
                    ? "原因不在学生！主要是教学理论、工具和教材落后。大部分学校缺乏合格的双语教师和国际化教学带头人。老师都不会，学生怎么学？"
                    : "这不是你的错！因为很难找到既懂编程又懂英语的好老师。但我们有！"
              },
              icon: <div className="text-6xl animate-bounce">👩‍🏫❓</div>,
              color: "from-orange-950 to-slate-900"
            },
            {
              id: "team",
              title: { en: proMode ? "Gulu Coding Origin" : "Born in Silicon Valley", cn: proMode ? "咕噜编程背景" : "来自硅谷的魔法" },
              subtitle: { en: "Canada/Silicon Valley DNA", cn: "加拿大硅谷滑铁卢基因" },
              content: {
                  en: proMode 
                    ? "Originating from Waterloo & Silicon Valley with native English/Math/AI advantages. Founder has 10+ years of ESL gaming teaching practice. We provide a smooth roadmap for transition."
                    : "We come from Waterloo and Silicon Valley! With 10 years of experience, we built a magic map to help you switch to English coding happily!",
                  cn: proMode
                    ? "源自加拿大硅谷滑铁卢，具备原生英文数学AI优势。创始人拥有十余年ESL游戏化教学实践。我们提供了学生快乐平稳过渡的实现路线图。"
                    : "我们来自滑铁卢和硅谷！带着10年的经验，为你画了一张快乐通往英语编程的魔法地图！"
              },
              color: "from-green-950 to-slate-900"
            },
            {
                id: "roadmap_viz",
                title: { en: proMode ? "The 7-Step Bridge" : "Your Hero's Journey", cn: proMode ? "七步国际化桥梁" : "你的英雄之旅" },
                subtitle: { en: "Implementation Roadmap", cn: "实施路线图" },
                content: { 
                    en: proMode 
                        ? "A clear path from Bilingual Entry to International Independence. We provide the ecosystem for smooth transition."
                        : "Follow this map! From a beginner to a Global Coding Champion!",
                    cn: proMode
                        ? "从双语入门到国际化独立的清晰路径。我们为平稳过渡提供完整的生态系统。"
                        : "跟着这张地图走！从新手村直接通往世界冠军的领奖台！"
                },
                color: "from-blue-900 to-indigo-900"
            },
            {
                title: { en: proMode ? "Comprehensive Ecosystem" : "Join the Big League", cn: proMode ? "全方位生态优势" : "加入顶级联盟" },
                subtitle: { en: "Beyond Teaching", cn: "不止于教学" },
                content: {
                    en: proMode
                        ? "We combine China-Canada advantages: International student communities, Big Tech mentors, strict service processes, and homework management."
                        : "Make friends around the world! Learn from real wizards at Google and Facebook! We take care of everything.",
                    cn: proMode
                        ? "结合中加优势：拥有国际学生社区、大厂导师资源。除了先进技术，我们还有严格的教学服务、作业管理流程。"
                        : "和全世界的孩子做朋友！跟谷歌和脸书的真魔法师学习！我们为你安排好了一切。"
                },
                icon: <div className="text-6xl animate-spin">🌏🤝</div>,
                color: "from-purple-950 to-slate-900"
            }
          ];
      }

      return [];
  };

  const slides = getSlides(presentationId, mode);
  const currentSlide: Slide = slides[slide] || {};

  const handleNext = () => {
    if (slide < slides.length - 1) setSlide(s => s + 1);
    else onClose();
  };

  const handlePrev = () => {
    if (slide > 0) setSlide(s => s - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-4">
       {/* Background Effects */}
       <div className={`absolute inset-0 bg-gradient-to-br ${slides[slide]?.color || 'from-slate-900 to-black'} transition-colors duration-1000 opacity-20`}></div>
       
       {/* Top Bar Controls */}
       <div className="absolute top-4 w-full px-4 md:px-8 z-50 flex justify-between items-center">
            {/* Mode Switcher */}
            <div className="bg-slate-900/80 p-1 rounded-full border border-slate-600 flex shadow-lg backdrop-blur-md">
                <button
                    onClick={() => setMode('FUN')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${mode === 'FUN' ? 'bg-yellow-400 text-black shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    🎈 {language === 'cn' ? '趣味版' : 'Fun'}
                </button>
                <button
                    onClick={() => setMode('PRO')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${mode === 'PRO' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    💼 {language === 'cn' ? '专业版' : 'Pro'}
                </button>
            </div>

            {/* Language Switch */}
            <div className="flex gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-700">
                <button 
                    onClick={() => setLanguage('en')} 
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    EN
                </button>
                <button 
                    onClick={() => setLanguage('cn')} 
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${language === 'cn' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    中文
                </button>
            </div>
       </div>

       {/* CONTENT AREA */}
       <div className="relative z-10 max-w-6xl w-full flex flex-col items-center">
          
          {/* Progress Bar */}
          <div className="flex gap-2 mb-8 absolute top-[-60px]">
            {slides.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === slide ? 'w-12 bg-white' : 'w-4 bg-slate-700'}`}></div>
            ))}
          </div>

          <div className="flex flex-col items-center w-full">
               {/* Slide Specific Content */}
               {(() => {
                   if (currentSlide.id === 'pain_point') {
                       return <PainPointAnimation mode={mode} />
                   }
                   if (currentSlide.id === 'team') {
                       return <TeamAnimation mode={mode} />
                   }
                   if (currentSlide.id === 'roadmap_viz') {
                       return <RoadmapAnimation mode={mode} language={language} />
                   }
                   if (currentSlide.id === 'comparison') {
                       return renderComparison();
                   }
                   if (currentSlide.id === 'unique_advantage') {
                       return renderUniqueAdvantage();
                   }
                   if (currentSlide.icon) {
                       return (
                           <div className={`mb-8 p-6 rounded-full border shadow-2xl backdrop-blur-sm animate-in zoom-in duration-500 ${mode === 'FUN' ? 'bg-white/10 border-white/30' : 'bg-slate-800/50 border-slate-700'}`}>
                                {currentSlide.icon}
                           </div>
                       )
                   }
                   return null;
               })()}

               <h2 className={`text-sm font-bold tracking-[0.2em] uppercase mb-4 animate-in slide-in-from-bottom-4 duration-700 ${mode === 'FUN' ? 'text-yellow-300' : 'text-blue-400'}`}>
                    {t(currentSlide.subtitle?.en || "", currentSlide.subtitle?.cn || "")}
               </h2>
               <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 animate-in slide-in-from-bottom-8 duration-700 delay-100 text-center">
                    {t(currentSlide.title?.en || "", currentSlide.title?.cn || "")}
               </h1>
               <p className="text-slate-200 text-lg md:text-xl max-w-2xl leading-relaxed mb-8 animate-in slide-in-from-bottom-8 duration-700 delay-200 text-center px-4">
                    {t(currentSlide.content?.en || "", currentSlide.content?.cn || "")}
               </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-4 animate-in fade-in duration-1000 delay-500 mt-8">
             <button 
                onClick={() => { if (slide > 0) handlePrev(); else onClose(); }} 
                className="px-6 py-3 rounded-lg text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700"
             >
                 {slide === 0 ? t("Close", "关闭") : t("Back", "上一步")}
             </button>
             <button 
                onClick={handleNext}
                className={`px-10 py-3 rounded-lg font-bold text-lg shadow-lg transition-transform hover:scale-105 ${mode === 'FUN' ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300' : 'bg-white text-slate-900 hover:bg-slate-200'}`}
             >
                {slide === slides.length - 1 ? t("Finish", "完成") : t("Next", "下一步")}
             </button>
          </div>

       </div>
    </div>
  );
};
