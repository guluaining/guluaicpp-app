
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProblemDef, ESLWord } from '../types';

interface ESLPanelProps {
  problem: ProblemDef;
}

// --- SOUND ENGINE (Web Audio API) ---
const playSound = (type: 'ding' | 'buzz' | 'tada' | 'click' | 'applause') => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();

  if (type === 'ding') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); // C6
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } else if (type === 'buzz') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } else if (type === 'tada') {
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.1, now + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.5);
        o.start(now + i * 0.1);
        o.stop(now + i * 0.1 + 0.5);
    });
  } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
  } else if (type === 'applause') {
      // Pink noise bursts for applause
      const bufferSize = ctx.sampleRate * 2; // 2 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (white + (data[i-1] || 0)) / 2; // Pink-ish
      }

      // Create multiple claps
      for (let i = 0; i < 15; i++) {
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          const gain = ctx.createGain();
          source.connect(gain);
          gain.connect(ctx.destination);
          
          const start = ctx.currentTime + Math.random() * 0.5;
          source.start(start);
          source.stop(start + 0.2); // Short clap
          gain.gain.setValueAtTime(0.2, start);
          gain.gain.exponentialRampToValueAtTime(0.01, start + 0.2);
      }
  }
};

// --- CONFETTI COMPONENT ---
const Confetti: React.FC = () => {
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#ef4444', '#3b82f6', '#10b981', '#eab308', '#8b5cf6'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.5,
        duration: 1 + Math.random() * 1
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
            {particles.map(p => (
                <div 
                    key={p.id}
                    className="absolute w-3 h-3 rounded-full animate-ping"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        backgroundColor: p.color,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`
                    }}
                />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
                 <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-bounce drop-shadow-2xl">
                     GREAT!
                 </h2>
            </div>
        </div>
    );
};

export const ESLPanel: React.FC<ESLPanelProps> = ({ problem }) => {
  const [tab, setTab] = useState<'learn' | 'quiz' | 'spelling'>('learn');

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8; 
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // --- SUB-COMPONENTS ---

  // 1. LEARN VIEW
  const LearnView = () => (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Technical Vocabulary</h3>
              <p className="text-slate-400 text-sm">Click Card or <span className="text-blue-400">Speaker</span> to listen</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {problem.esl.words.map((word, idx) => (
                  <FlipCard key={idx} word={word} onSpeak={() => speak(word.en)} />
              ))}
          </div>

          <div className="mt-8 flex justify-center gap-4">
              <button 
                onClick={() => setTab('quiz')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-transform hover:scale-105"
              >
                  Quiz (选择题)
              </button>
              <button 
                onClick={() => setTab('spelling')}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-transform hover:scale-105"
              >
                  Advanced Typing (进阶打字)
              </button>
          </div>
      </div>
  );

  // 2. QUIZ VIEW
  const QuizView = () => {
      const [idx, setIdx] = useState(0);
      const [score, setScore] = useState(0);
      const [done, setDone] = useState(false);
      
      const q = problem.esl.questions[idx];

      if (done) return (
          <div className="text-center py-10">
              <h3 className="text-2xl text-white font-bold mb-4">Quiz Complete!</h3>
              <p className="text-slate-300 mb-6">Score: {score} / {problem.esl.questions.length}</p>
              <button onClick={() => { setIdx(0); setScore(0); setDone(false); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Retry</button>
          </div>
      );

      return (
          <div className="max-w-xl mx-auto py-6">
              <div className="flex justify-between text-slate-400 text-xs font-bold uppercase mb-4">
                  <span>Question {idx+1}/{problem.esl.questions.length}</span>
                  <span>Score: {score}</span>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-lg text-white font-bold mb-6">{q.question}</h3>
                  <div className="grid gap-3">
                      {q.options.map((opt, i) => (
                          <button key={i} 
                            onClick={() => {
                                if (opt === q.correctAnswer) {
                                    playSound('ding');
                                    setScore(s => s+1);
                                } else {
                                    playSound('buzz');
                                }
                                if (idx < problem.esl.questions.length - 1) setIdx(i => i+1);
                                else setDone(true);
                            }}
                            className="p-3 bg-slate-900 border border-slate-700 hover:bg-blue-600 hover:border-blue-500 rounded text-left transition-colors text-slate-300 hover:text-white"
                          >
                              {opt}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )
  };

  // 3. ADVANCED SPELLING GAME
  const AdvancedTypingGame = () => {
      // Config
      const [groupSize, setGroupSize] = useState<number>(4);
      const [gamePhase, setGamePhase] = useState<'config' | 'playing' | 'report'>('config');
      
      // Game State
      const [stage, setStage] = useState(1); // 1, 2, 3, 4
      const [wordIdx, setWordIdx] = useState(0);
      const [activeWords, setActiveWords] = useState<ESLWord[]>([]);
      const [input, setInput] = useState("");
      const [inputStatus, setInputStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
      
      // Mastery State
      const [stageAttempts, setStageAttempts] = useState(0);
      const [stageCorrectCount, setStageCorrectCount] = useState(0);
      const [showRetryMsg, setShowRetryMsg] = useState(false);

      // Stage 2/3/4 Logic: Multiple Choice
      const [showChoices, setShowChoices] = useState(false);
      const [choices, setChoices] = useState<string[]>([]);
      
      // Rewards
      const [showConfetti, setShowConfetti] = useState(false);
      const [totalScore, setTotalScore] = useState(0); 
      
      const inputRef = useRef<HTMLInputElement>(null);

      const startGame = () => {
          const allWords = [...problem.esl.words];
          const selected: ESLWord[] = [];
          for (let i = 0; i < groupSize; i++) {
              selected.push(allWords[i % allWords.length]); 
          }
          setActiveWords(selected);
          setStage(1);
          setWordIdx(0);
          setTotalScore(0);
          setStageAttempts(0);
          setStageCorrectCount(0);
          setGamePhase('playing');
          prepareStep(1, 0, selected);
      };

      const prepareStep = (stg: number, wIdx: number, words: ESLWord[]) => {
          setInput("");
          setInputStatus('idle');
          setShowChoices(false);
          setChoices([]);
          
          const currentWord = words[wIdx];

          // STAGE 2: Type EN -> Select CN
          if (stg === 2 || stg === 4) {
              const wrongs = problem.esl.words.filter(w => w.en !== currentWord.en).map(w => w.cn);
              const opts = [currentWord.cn, wrongs[0] || '错误1', wrongs[1] || '错误2'].sort(() => Math.random() - 0.5);
              setChoices(opts);
          }

          // STAGE 3: Show CN -> Select EN -> Type EN
          if (stg === 3) {
              const wrongs = problem.esl.words.filter(w => w.en !== currentWord.en).map(w => w.en);
              const opts = [currentWord.en, wrongs[0] || 'Wrong1', wrongs[1] || 'Wrong2'].sort(() => Math.random() - 0.5);
              setChoices(opts);
              setShowChoices(true); 
          }
      };

      // Audio Loop Effect for Stage 1
      useEffect(() => {
          if (gamePhase !== 'playing' || stage !== 1 || showRetryMsg) return;
          
          let count = 0;
          let timer: number;
          
          const playLoop = () => {
              if (count >= 3) return;
              if (activeWords[wordIdx]) {
                  speak(activeWords[wordIdx].en);
              }
              count++;
              timer = window.setTimeout(playLoop, 2000); 
          };
          
          playLoop();
          return () => clearTimeout(timer);
      }, [gamePhase, stage, wordIdx, activeWords, speak, showRetryMsg]);


      const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
          setInput(e.target.value);
          playSound('click');
      };

      const checkTyping = (e?: React.FormEvent) => {
          if (e) e.preventDefault();
          
          const target = activeWords[wordIdx].en;
          if (input.trim().toLowerCase() === target.toLowerCase()) {
              setInputStatus('correct');
              playSound('ding');
              speak(target); // REINFORCEMENT: Speak immediately on success
              
              if (stage === 1) {
                  advance(true);
              } else if (stage === 2 || stage === 4) {
                  setShowChoices(true); 
              } else if (stage === 3) {
                  advance(true);
              }
          } else {
              setInputStatus('wrong');
              playSound('buzz');
              setInput("");
              // Don't advance on wrong typing, just clear
              // Optionally deduct internal score or count as "not correct" for this word attempt
              setTimeout(() => setInputStatus('idle'), 500);
          }
      };

      const handleChoiceSelect = (choice: string) => {
          const currentWord = activeWords[wordIdx];
          let isCorrect = false;

          if (stage === 2 || stage === 4) {
              isCorrect = choice === currentWord.cn;
          } else if (stage === 3) {
              isCorrect = choice === currentWord.en;
          }

          if (isCorrect) {
              playSound('ding');
              if (stage === 3) {
                  setShowChoices(false); 
                  if (inputRef.current) inputRef.current.focus();
              } else {
                  advance(true);
              }
          } else {
              playSound('buzz');
              advance(false); // Wrong choice counts as fail for this word logic?
              // Or simple retry? Let's treat as fail for mastery calc, but move on?
              // For kids, let's just buzz and let them retry choice without advancing
          }
      };

      const advance = (wasCorrect: boolean) => {
          if (wasCorrect) {
              setStageCorrectCount(c => c + 1);
              setTotalScore(s => s + 1);
          }

          // Streak reward
          if (wasCorrect && (wordIdx + 1) % 4 === 0) {
              setShowConfetti(true);
              playSound('applause'); // BETTER REWARD SOUND
              setTimeout(() => setShowConfetti(false), 2000);
          }

          setTimeout(() => {
              if (wordIdx < activeWords.length - 1) {
                  setWordIdx(i => i + 1);
                  prepareStep(stage, wordIdx + 1, activeWords);
              } else {
                  // End of List for this Stage
                  checkStageMastery();
              }
          }, 1000);
      };

      const checkStageMastery = () => {
          const accuracy = stageCorrectCount / activeWords.length;
          // Rule: 95% accuracy OR 3 attempts to pass
          if (accuracy >= 0.95 || stageAttempts >= 2) {
              // Pass
              if (stage < 4) {
                  playSound('tada');
                  setStage(s => s + 1);
                  setWordIdx(0);
                  setStageCorrectCount(0);
                  setStageAttempts(0);
                  prepareStep(stage + 1, 0, activeWords);
              } else {
                  setGamePhase('report');
                  playSound('applause');
              }
          } else {
              // Fail - Retry Stage
              setShowRetryMsg(true);
              setStageAttempts(a => a + 1);
              playSound('buzz');
          }
      };

      const retryStage = () => {
          setShowRetryMsg(false);
          setWordIdx(0);
          setStageCorrectCount(0);
          prepareStep(stage, 0, activeWords);
      };

      // --- RENDERERS ---

      if (gamePhase === 'config') return (
          <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in">
              <h2 className="text-3xl font-bold text-white mb-8">Typing Challenge Setup</h2>
              <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md">
                  <label className="block text-slate-400 text-sm font-bold uppercase mb-4">Select Word Group Size</label>
                  <div className="grid grid-cols-4 gap-4 mb-8">
                      {[4, 6, 8, 12].map(size => (
                          <button 
                            key={size}
                            onClick={() => setGroupSize(size)}
                            className={`p-4 rounded-xl font-bold text-xl transition-all ${groupSize === size ? 'bg-green-600 text-white scale-110 shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                          >
                              {size}
                          </button>
                      ))}
                  </div>
                  <button onClick={startGame} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105">
                      Start Game
                  </button>
              </div>
          </div>
      );

      if (gamePhase === 'report') {
          return (
              <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in">
                  <h2 className="text-4xl font-black text-white mb-2">MISSION COMPLETE!</h2>
                  <div className="text-6xl mb-6">🏆</div>
                  <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md text-center">
                      <div className="text-slate-400 text-sm font-bold uppercase mb-2">Total Score</div>
                      <div className="text-5xl font-mono text-green-400 mb-8">{totalScore}</div>
                      <button onClick={() => setGamePhase('config')} className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Play Again</button>
                  </div>
              </div>
          )
      }

      if (showRetryMsg) {
          return (
              <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in">
                  <h2 className="text-3xl font-bold text-white mb-4">Keep Going! 💪</h2>
                  <p className="text-slate-400 mb-8 text-center max-w-md">
                      You need 95% accuracy to advance. Let's practice this stage again to become a master!
                  </p>
                  <button onClick={retryStage} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg">
                      Retry Stage {stage}
                  </button>
              </div>
          )
      }

      const currentWord = activeWords[wordIdx];

      return (
          <div className="max-w-2xl mx-auto py-6 relative">
              {showConfetti && <Confetti />}

              {/* Progress Bar */}
              <div className="flex justify-between text-xs text-slate-500 font-bold uppercase mb-2">
                  <span>Stage {stage} / 4 (Try {stageAttempts + 1})</span>
                  <span>Word {wordIdx + 1} / {activeWords.length}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${((stage-1)*activeWords.length + wordIdx) / (activeWords.length*4) * 100}%` }}></div>
              </div>

              {/* STAGE INFO */}
              <div className="text-center mb-8">
                  <div className="inline-block px-4 py-1 rounded-full bg-slate-800 text-blue-400 text-xs font-bold uppercase mb-4 border border-blue-500/30">
                      {stage === 1 && "Stage 1: Imprint (Listen & Type)"}
                      {stage === 2 && "Stage 2: Recognition (Type & Match)"}
                      {stage === 3 && "Stage 3: Recall (Select & Type)"}
                      {stage === 4 && "Stage 4: Dictation (Listen Only)"}
                  </div>

                  <div className="h-32 flex flex-col items-center justify-center">
                      {stage === 1 && (
                          <>
                            <h2 className="text-4xl font-bold text-white mb-2">{currentWord.en}</h2>
                            <p className="text-xl text-slate-400">{currentWord.cn}</p>
                          </>
                      )}
                      {stage === 2 && (
                          <h2 className="text-4xl font-bold text-white">{currentWord.en}</h2>
                      )}
                      {stage === 3 && !showChoices && (
                           <h2 className="text-4xl font-bold text-white mb-2">{currentWord.cn}</h2>
                      )}
                      {stage === 3 && showChoices && (
                           <h2 className="text-4xl font-bold text-white mb-2">{currentWord.cn}</h2>
                      )}
                      {stage === 4 && (
                           <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center animate-pulse border-4 border-slate-700 cursor-pointer" onClick={() => speak(currentWord.en)}>
                               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                           </div>
                      )}
                  </div>
              </div>

              {/* INPUT / CHOICES AREA */}
              <div className="bg-slate-800/80 border border-slate-600 rounded-2xl p-8 shadow-2xl relative min-h-[200px] flex flex-col justify-center">
                  
                  {showChoices ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {choices.map((choice, i) => (
                              <button 
                                key={i}
                                onClick={() => handleChoiceSelect(choice)}
                                className="p-4 bg-slate-900 border border-slate-700 hover:bg-blue-600 hover:border-blue-500 rounded-xl text-white font-bold transition-all text-lg"
                              >
                                  {choice}
                              </button>
                          ))}
                      </div>
                  ) : (
                      <form onSubmit={checkTyping} className="relative">
                           <input 
                              ref={inputRef}
                              type="text" 
                              value={input}
                              onChange={handleInput}
                              autoFocus
                              className={`
                                w-full bg-slate-900 border-2 rounded-xl p-6 text-center text-3xl font-mono text-white outline-none transition-colors
                                ${inputStatus === 'correct' ? 'border-green-500 text-green-400' : inputStatus === 'wrong' ? 'border-red-500 text-red-400' : 'border-slate-600 focus:border-blue-500'}
                              `}
                              placeholder="Type here..."
                              autoComplete="off"
                           />
                           
                           {/* Green Check Icon */}
                           {inputStatus === 'correct' && (
                               <div className="absolute right-4 top-1/2 -translate-x-1/2 text-green-500 animate-in zoom-in duration-300">
                                   <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                               </div>
                           )}

                           <div className="mt-4 flex justify-center">
                               <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-8 rounded-full shadow-lg hover:bg-blue-500">Check</button>
                           </div>
                      </form>
                  )}
              </div>
          </div>
      )
  };

  return (
    <div className="w-full bg-slate-900/30 rounded-xl border border-slate-800 p-6 min-h-[600px]">
        <div className="flex justify-center mb-8">
            <div className="bg-slate-900 p-1 rounded-lg flex border border-slate-800">
                <button
                    onClick={() => setTab('learn')}
                    className={`px-4 py-2 text-sm font-bold rounded transition-all ${tab === 'learn' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    Learn (单词)
                </button>
                <button
                    onClick={() => setTab('quiz')}
                    className={`px-4 py-2 text-sm font-bold rounded transition-all ${tab === 'quiz' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    Quiz (测试)
                </button>
                <button
                    onClick={() => setTab('spelling')}
                    className={`px-4 py-2 text-sm font-bold rounded transition-all ${tab === 'spelling' ? 'bg-green-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    Typing Game (进阶)
                </button>
            </div>
        </div>

        {tab === 'learn' && <LearnView />}
        {tab === 'quiz' && <QuizView />}
        {tab === 'spelling' && <AdvancedTypingGame />}
    </div>
  );
};

const FlipCard: React.FC<{word: ESLWord, onSpeak: () => void}> = ({ word, onSpeak }) => {
    const [flipped, setFlipped] = useState(false);

    return (
        <div 
            className="group h-40 [perspective:1000px] cursor-pointer relative"
            onClick={() => { onSpeak(); setFlipped(!flipped); }}
        >
            <div className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
                <div className="absolute w-full h-full bg-slate-800 border border-slate-600 rounded-xl flex flex-col items-center justify-center [backface-visibility:hidden] shadow-lg group-hover:border-blue-400 overflow-hidden">
                    <span className="text-xl font-bold text-white mb-2">{word.en}</span>
                </div>
                <div className="absolute w-full h-full bg-blue-900/90 border border-blue-500 rounded-xl flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-lg">
                    <span className="text-xl font-bold text-white">{word.cn}</span>
                </div>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onSpeak(); }}
                className="absolute top-2 right-2 z-10 p-2 bg-slate-700/80 hover:bg-blue-500 text-white rounded-full transition-colors backdrop-blur-sm"
                title="Pronounce"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            </button>
        </div>
    )
}
