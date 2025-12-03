
import React, { useState, useEffect } from 'react';
import { Visualizer } from './components/Visualizer';
import { GameCanvas } from './components/GameCanvas';
import { CodeDisplay } from './components/CodeDisplay';
import { ESLPanel } from './components/ESLPanel';
import { IntroModal, PresentationId } from './components/IntroModal'; // Import IntroModal
import { generateExplanation } from './services/geminiService';
import { PROBLEMS, getStepLineMapping } from './problemData';
import { ProblemId, Language } from './types';

// Simple translation dictionary for UI elements
const UI_TEXT = {
  dashboard: { en: 'Dashboard', cn: '算法中心' },
  roadToSuccess: { en: 'Road to Success', cn: '成功之路' },
  whyGulu: { en: 'Why Gulu?', cn: 'Why Gulu? (演示)' },
  internationalRoadmap: { en: 'International Roadmap', cn: '国际化路线图' },
  visualizer: { en: 'Visualizer', cn: '可视化工具' },
  algorithms: { en: 'Algorithms', cn: '算法库' },
  testInputs: { en: 'Example Inputs', cn: '示例输入' },
  customInput: { en: 'Custom Input', cn: '自定义输入' },
  apply: { en: 'Apply', cn: '应用' },
  detailModeOn: { en: 'Detail Mode: ON', cn: '详细模式: 开启' },
  detailModeOff: { en: 'Detail Mode: OFF', cn: '详细模式: 关闭' },
  gameMode: { en: 'Gulu Game Mode', cn: '咕噜教学模式' },
  proMode: { en: 'Professional Mode', cn: '专业演示模式' },
  eslMode: { en: 'ESL Practice', cn: '英语练习与考试' },
  codeSnippet: { en: 'Snippet', cn: '代码片段' },
  codeFull: { en: 'Full Program', cn: '完整代码' },
  prev: { en: 'Previous', cn: '上一步' },
  next: { en: 'Next Step', cn: '下一步' },
  play: { en: 'Play', cn: '播放' },
  pause: { en: 'Pause', cn: '暂停' },
  reset: { en: 'Reset', cn: '重置' },
  sourceCode: { en: 'C++ Source Code', cn: 'C++ 源代码' },
  executing: { en: 'Executing', cn: '执行中' },
  aiTutor: { en: 'AI Tutor', cn: 'AI 导师' },
  poweredBy: { en: 'Powered by Gemini', cn: '由 Gemini 驱动' },
  explainStep: { en: 'Explain Step', cn: '解释这一步' },
  thinking: { en: 'Thinking...', cn: '思考中...' },
  ready: { en: 'Ready to start. Click Next or Play.', cn: '准备开始。点击下一步或播放。' },
  intro: { en: "Click 'Explain Step' to get a tutor's perspective.", cn: "点击 '解释这一步' 获取 AI 导师的讲解。" },
  startLearning: { en: 'Start Learning', cn: '开始学习' }
};

const App: React.FC = () => {
  // activeProblemId is null when showing the Dashboard (Card Grid)
  const [activeProblemId, setActiveProblemId] = useState<ProblemId | null>(null);
  const [currentValues, setCurrentValues] = useState<Record<string, number>>({});
  const [customValues, setCustomValues] = useState<Record<string, string>>({}); 
  
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // View Modes
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [viewMode, setViewMode] = useState<'GAME' | 'PRO' | 'ESL'>('GAME'); 
  const [isFullCodeMode, setIsFullCodeMode] = useState(false);
  
  // Presentation State
  const [showIntro, setShowIntro] = useState(true); // Default to showing intro on load
  const [introId, setIntroId] = useState<PresentationId>('INTRO');
  
  const [language, setLanguage] = useState<Language>('cn');
  
  const [explanation, setExplanation] = useState<string>(UI_TEXT.intro[language]);
  const [isExplaining, setIsExplaining] = useState(false);

  // Accordion State
  const [showAllPresets, setShowAllPresets] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(true);
  const [showAlgorithms, setShowAlgorithms] = useState(true); // Control visibility of algorithm list in sidebar

  const activeProblem = activeProblemId ? PROBLEMS[activeProblemId] : null;
  const maxSteps = activeProblem ? activeProblem.maxSteps : 0;

  useEffect(() => {
     if (step === 0) {
        setExplanation(UI_TEXT.intro[language]);
     }
  }, [language, step]);

  useEffect(() => {
    if (activeProblem) {
        setCurrentValues(activeProblem.initialValues);
        const initCustom: Record<string, string> = {};
        Object.keys(activeProblem.initialValues).forEach(k => {
            initCustom[k] = activeProblem.initialValues[k].toString();
        });
        setCustomValues(initCustom);
        setStep(0);
        setIsPlaying(false);
        setExplanation(UI_TEXT.intro[language]);
        setShowAllPresets(false); 
    }
  }, [activeProblemId, activeProblem]);

  useEffect(() => {
    let timer: number;
    if (isPlaying && step < maxSteps) {
      timer = window.setTimeout(() => {
        setStep((s) => s + 1);
      }, 2000); 
    } else if (step >= maxSteps) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, step, maxSteps]);

  const handleNext = () => {
    if (step < maxSteps) setStep(s => s + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleReset = () => {
    setStep(0);
    setIsPlaying(false);
    setExplanation(UI_TEXT.ready[language]);
  };

  const handlePresetSelect = (values: Record<string, number>) => {
    setCurrentValues(values);
    const newCustom: Record<string, string> = {};
    Object.keys(values).forEach(k => {
        newCustom[k] = values[k].toString();
    });
    setCustomValues(newCustom);
    setStep(0);
    setIsPlaying(false);
  };

  const handleCustomInputChange = (key: string, val: string) => {
      setCustomValues(prev => ({...prev, [key]: val}));
  };

  const applyCustomInputs = () => {
      const newValues: Record<string, number> = {};
      let valid = true;
      Object.keys(customValues).forEach(k => {
          const num = parseInt(customValues[k]);
          if (isNaN(num)) valid = false;
          newValues[k] = num;
      });

      if (valid) {
          setCurrentValues(newValues);
          setStep(0);
          setIsPlaying(false);
      }
  };

  const handleAIExplain = async () => {
    if (!activeProblem) return;
    setIsExplaining(true);
    
    const codeToUse = isFullCodeMode ? activeProblem.fullCode : activeProblem.code;
    const currentCodeLine = "See Logic"; 

    const text = await generateExplanation(activeProblem, step, currentValues, currentCodeLine, language);
    setExplanation(text);
    setIsExplaining(false);
  };

  const openPresentation = (id: PresentationId) => {
      setIntroId(id);
      setShowIntro(true);
  };

  const t = (key: keyof typeof UI_TEXT) => UI_TEXT[key][language];

  // --- RENDER DASHBOARD (Grid of Cards) ---
  const renderDashboard = () => (
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
          <h2 className="text-3xl font-bold text-white mb-8 border-b border-slate-800 pb-4">{t('algorithms')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(PROBLEMS).map(prob => (
                  <div 
                    key={prob.id}
                    onClick={() => setActiveProblemId(prob.id)}
                    className="group bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500 transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden"
                  >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{prob.title[language]}</h3>
                      <p className="text-slate-400 text-sm mb-6 line-clamp-3">{prob.description[language]}</p>
                      <button className="text-sm font-bold text-blue-400 group-hover:text-blue-300 flex items-center gap-2">
                          {t('startLearning')} <span className="transition-transform group-hover:translate-x-1">→</span>
                      </button>
                  </div>
              ))}
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans">
      
      {/* INTRO MODAL */}
      {showIntro && (
          <IntroModal 
            onClose={() => setShowIntro(false)} 
            language={language}
            setLanguage={setLanguage}
            presentationId={introId}
          />
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800 shrink-0">
          {/* Logo */}
          <a 
            href="https://gulu.steam.fun" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:opacity-80 transition-opacity group"
          >
            <h1 className="text-xl font-bold text-white flex flex-col leading-tight">
               <span className="text-blue-400 group-hover:text-blue-300 transition-colors">GuluCoding</span>
               <span className="text-slate-400 text-xl mt-0.5">咕噜编程</span>
            </h1>
          </a>
        </div>
        
        <div className="overflow-y-auto flex-1">
          
          <nav className="p-4 space-y-2">
            
            {/* 0. DASHBOARD BUTTON */}
            <button 
                onClick={() => setActiveProblemId(null)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all mb-4 flex items-center gap-2 ${activeProblemId === null ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                {t('dashboard')}
            </button>

            {/* 1. ROAD TO SUCCESS */}
            <div className="mb-4 border-b border-slate-800/50 pb-2">
                <button 
                    onClick={() => setShowRoadmap(!showRoadmap)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 hover:text-slate-300"
                >
                    {t('roadToSuccess')}
                    <span>{showRoadmap ? '▼' : '▶'}</span>
                </button>
                
                {showRoadmap && (
                    <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                        <button 
                            onClick={() => openPresentation('INTRO')}
                            className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all text-purple-400 hover:bg-slate-800 hover:text-purple-300 flex items-center gap-2"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                            {t('whyGulu')}
                        </button>
                        <button 
                            onClick={() => openPresentation('ROADMAP')}
                            className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all text-green-400 hover:bg-slate-800 hover:text-green-300 flex items-center gap-2"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            {t('internationalRoadmap')}
                        </button>
                    </div>
                )}
            </div>

            {/* 2. ALGORITHMS (Collapsible) */}
            <div>
                <button 
                    onClick={() => setShowAlgorithms(!showAlgorithms)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 hover:text-slate-300"
                >
                    {t('algorithms')}
                    <span>{showAlgorithms ? '▼' : '▶'}</span>
                </button>

                {showAlgorithms && (
                    <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {Object.values(PROBLEMS).map((prob) => (
                        <React.Fragment key={prob.id}>
                            <button
                                onClick={() => setActiveProblemId(prob.id)}
                                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                activeProblemId === prob.id 
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                            >
                                {prob.title[language]}
                            </button>

                            {/* ACTIVE PROBLEM EXPANDED CONTENT (Test Inputs) */}
                            {activeProblemId === prob.id && activeProblem && (
                                <div className="pl-4 pr-2 pb-2 animate-in slide-in-from-top-2 duration-300 space-y-4 border-l border-slate-800 ml-4 mb-2">
                                    
                                    {/* PRESETS LIST */}
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('testInputs')}</div>

                                        {/* Show only first 2 unless expanded */}
                                        {activeProblem.presets.slice(0, showAllPresets ? undefined : 2).map((preset, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handlePresetSelect(preset.values)}
                                                className={`
                                                    w-full text-left px-3 py-2 rounded border text-[11px] font-mono transition-colors flex items-center gap-2
                                                    ${JSON.stringify(currentValues) === JSON.stringify(preset.values) 
                                                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}
                                                `}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${JSON.stringify(currentValues) === JSON.stringify(preset.values) ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                                                {preset.label[language]}
                                            </button>
                                        ))}

                                        {/* MORE BUTTON */}
                                        {!showAllPresets && activeProblem.presets.length > 2 && (
                                            <button 
                                                onClick={() => setShowAllPresets(true)}
                                                className="w-full text-left px-3 py-1.5 text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
                                            >
                                                {language === 'en' ? 'More ...' : '更多 ...'}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* CUSTOM INPUT */}
                                    <div className="pt-2 border-t border-slate-800/50">
                                        <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('customInput')}</div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {Object.keys(customValues).map(key => (
                                                <div key={key} className="flex flex-col">
                                                    <label className="text-[9px] text-slate-500 font-mono mb-0.5 ml-0.5">{key}</label>
                                                    <input 
                                                        type="text" 
                                                        value={customValues[key]}
                                                        onChange={(e) => handleCustomInputChange(key, e.target.value)}
                                                        className="bg-slate-900 border border-slate-700 rounded p-1 text-[11px] text-center text-white focus:border-blue-500 focus:outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={applyCustomInputs}
                                            className="w-full mt-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-[10px] py-1.5 rounded border border-slate-700 transition-colors uppercase font-bold tracking-wider"
                                        >
                                            {t('apply')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
          </nav>
        </div>

        {/* Sidebar Footer: Language Switch */}
        <div className="p-4 border-t border-slate-800">
           <div className="flex bg-slate-800 rounded-lg p-1">
             <button 
               onClick={() => setLanguage('en')}
               className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${language === 'en' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
               English
             </button>
             <button 
               onClick={() => setLanguage('cn')}
               className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${language === 'cn' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
               中文
             </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto relative">
        
        {!activeProblem ? (
            // DASHBOARD VIEW
            renderDashboard()
        ) : (
            // PROBLEM VIEW
            <>
                <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{activeProblem.title[language]}</h2>
                    <p className="text-slate-400">{activeProblem.description[language]}</p>
                </div>
                
                {/* Mode Switches */}
                <div className="flex gap-4">
                    <div className="bg-slate-900 p-1 rounded-lg flex border border-slate-800">
                        <button
                            onClick={() => setViewMode('GAME')}
                            className={`px-4 py-2 text-sm font-bold rounded transition-all ${viewMode === 'GAME' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            {t('gameMode')}
                        </button>
                        <button
                            onClick={() => setViewMode('PRO')}
                            className={`px-4 py-2 text-sm font-bold rounded transition-all ${viewMode === 'PRO' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            {t('proMode')}
                        </button>
                        <button
                            onClick={() => setViewMode('ESL')}
                            className={`px-4 py-2 text-sm font-bold rounded transition-all ${viewMode === 'ESL' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            {t('eslMode')}
                        </button>
                    </div>
                </div>
                </header>

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Col: Visualizer */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* GAME MODE */}
                    {viewMode === 'GAME' && (
                        <GameCanvas 
                            problem={activeProblem} 
                            currentValues={currentValues} 
                            language={language} 
                            onStepChange={setStep}
                        />
                    )}

                    {/* ESL MODE */}
                    {viewMode === 'ESL' && (
                        <ESLPanel problem={activeProblem} />
                    )}

                    {/* PRO MODE */}
                    {viewMode === 'PRO' && (
                        <div className="space-y-6">
                            {/* Pro Visualizer */}
                            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-1 shadow-2xl min-h-[350px] flex items-center">
                                <Visualizer 
                                    problem={activeProblem} 
                                    step={step} 
                                    currentValues={currentValues}
                                    isDetailMode={isDetailMode}
                                    language={language}
                                />
                            </div>
                            
                            {/* Detail Mode Toggle (Pro Only) */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setIsDetailMode(!isDetailMode)}
                                    className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all
                                    ${isDetailMode 
                                        ? 'bg-purple-900/30 border-purple-500 text-purple-300' 
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}
                                    `}
                                >
                                    {isDetailMode ? t('detailModeOn') : t('detailModeOff')}
                                </button>
                            </div>

                            {/* Progress & Controls (Pro Only) */}
                            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="bg-blue-500 h-full transition-all duration-500 ease-out"
                                    style={{ width: `${(step / maxSteps) * 100}%` }}
                                ></div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <button 
                                    onClick={handleReset}
                                    className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                                    title={t('reset')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/><path d="M3 3v9h9"/></svg>
                                </button>

                                <button 
                                    onClick={handlePrev}
                                    disabled={step === 0}
                                    className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium border border-slate-700 transition-colors"
                                >
                                    {t('prev')}
                                </button>

                                <button 
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg transition-all flex items-center gap-2"
                                >
                                    {isPlaying ? t('pause') : t('play')}
                                </button>

                                <button 
                                    onClick={handleNext}
                                    disabled={step === maxSteps}
                                    className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium border border-slate-700 transition-colors"
                                >
                                    {t('next')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Col: Code & Explanation */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="sticky top-6 space-y-6">
                    
                    {/* Code Block */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t('sourceCode')}</h3>
                        
                        {/* Snippet vs Full Toggle */}
                        <div className="bg-slate-800 p-0.5 rounded flex text-[10px] font-bold">
                            <button 
                                onClick={() => setIsFullCodeMode(false)}
                                className={`px-2 py-1 rounded ${!isFullCodeMode ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
                            >
                                {t('codeSnippet')}
                            </button>
                            <button 
                                onClick={() => setIsFullCodeMode(true)}
                                className={`px-2 py-1 rounded ${isFullCodeMode ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
                            >
                                {t('codeFull')}
                            </button>
                        </div>
                        </div>
                        
                        <CodeDisplay 
                        code={isFullCodeMode ? activeProblem.fullCode : activeProblem.code} 
                        activeLineIndex={getStepLineMapping(activeProblem!.id, step)} 
                        language={language}
                        isInteractive={isFullCodeMode}
                        />
                    </div>

                    {/* AI Explanation Card */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                        
                        <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5c0-5.523 4.477-10 10-10Z"/><path d="M8 14h.01"/><path d="M11 11h.01"/><path d="M14 14h.01"/><path d="M17 11h.01"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z"/></svg>
                            </div>
                            <div>
                            <h3 className="font-bold text-white text-sm">{t('aiTutor')}</h3>
                            <p className="text-slate-400 text-[10px]">{t('poweredBy')}</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleAIExplain}
                            disabled={isExplaining}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-purple-300 px-3 py-1.5 rounded-full transition-colors border border-slate-700"
                        >
                            {isExplaining ? t('thinking') : t('explainStep')}
                        </button>
                        </div>
                        
                        <div className="prose prose-invert prose-sm">
                        <p className="text-slate-300 leading-relaxed min-h-[3rem]">
                            {isExplaining ? (
                            <span className="animate-pulse">{t('thinking')}</span>
                            ) : explanation}
                        </p>
                        </div>
                    </div>

                    </div>
                </div>

                </div>
            </>
        )}
      </main>
    </div>
  );
};

export default App;
