
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundEngine } from '../utils/soundEngine';
import { Timer, Zap, RotateCcw, X, LogOut, ArrowRight, Sparkles, Brain, Target, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { fetchTenFastWords } from '../services/quoteService';
import { PracticeWord, WordPerformance } from '../types';

interface TenFastGameProps {
  smartQueue: PracticeWord[];
  onGameOver: (wpm: number, xp: number, mistakes: string[]) => void;
  onWordPerformance: (perf: WordPerformance) => void;
  onExit: () => void;
  initialDrillWord?: string | null;
}

const TenFastGame: React.FC<TenFastGameProps> = ({ smartQueue, onGameOver, onWordPerformance, onExit, initialDrillWord }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER' | 'DRILL_PENALTY'>(
    initialDrillWord ? 'DRILL_PENALTY' : 'START'
  );
  const [timeLeft, setTimeLeft] = useState(60);
  const [words, setWords] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState('');
  const [isError, setIsError] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeWords, setMistakeWords] = useState<string[]>([]);
  
  // Drill State
  const [drillTarget, setDrillTarget] = useState<string | null>(initialDrillWord || null);
  const [drillCount, setDrillCount] = useState(0);
  const DRILL_REQUIRED = 17;

  const wordStartTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const initGame = useCallback(() => {
    const wordList = fetchTenFastWords(150, smartQueue);
    setWords(wordList);
    setCurrentIdx(0);
    setInput('');
    setIsError(false);
    setTimeLeft(60);
    setCorrectCount(0);
    setMistakeWords([]);
    setDrillTarget(null);
    setDrillCount(0);
    setGameState('PLAYING');
    wordStartTimeRef.current = performance.now();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [smartQueue]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinalize();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const handleFinalize = () => {
    setGameState('GAMEOVER');
    clearInterval(timerRef.current);
    
    // Calculate final stats for history
    const totalChars = words.slice(0, currentIdx).reduce((acc, w) => acc + w.length + 1, 0);
    const finalWpm = Math.round((totalChars / 5));
    const xp = Math.max(5, Math.floor(finalWpm * (correctCount / 10)));
    onGameOver(finalWpm, xp, mistakeWords);
    localStorage.removeItem('frogType_pendingDrill');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState === 'DRILL_PENALTY') {
        handleDrillInput(e.target.value);
        return;
    }
    
    if (gameState !== 'PLAYING') return;
    const val = e.target.value;
    const targetWord = words[currentIdx];

    // Check for space (Next Word)
    if (val.endsWith(' ')) {
        const typed = val.trim();
        if (typed === targetWord) {
            const now = performance.now();
            const duration = (now - wordStartTimeRef.current) / 1000;
            const wordWpm = Math.round((targetWord.length / 5) / (duration / 60));
            onWordPerformance({ word: targetWord, wpm: wordWpm, isCorrect: true });
            setCorrectCount(prev => prev + 1);
            setCurrentIdx(prev => prev + 1);
            setInput('');
            setIsError(false);
            soundEngine.playKeypress();
            wordStartTimeRef.current = now;
            if (currentIdx > words.length - 20) {
                setWords(prev => [...prev, ...fetchTenFastWords(50, smartQueue)]);
            }
        } else {
            triggerFail(targetWord);
        }
        return;
    }

    // Incremental Accuracy Check
    if (!targetWord.startsWith(val)) {
        triggerFail(targetWord);
    } else {
        setIsError(false);
        setInput(val);
        soundEngine.playKeypress();
    }
  };

  const triggerFail = (word: string) => {
    soundEngine.playError();
    onWordPerformance({ word, wpm: 0, isCorrect: false });
    setMistakeWords(prev => [...prev, word]);
    setDrillTarget(word);
    setDrillCount(0);
    setGameState('DRILL_PENALTY');
    setInput('');
    clearInterval(timerRef.current);
    // Persist the drill state
    localStorage.setItem('frogType_pendingDrill', word);
  };

  const handleDrillInput = (val: string) => {
    if (!drillTarget) return;

    if (val.endsWith(' ')) {
        const typed = val.trim();
        if (typed === drillTarget) {
            soundEngine.playKeypress();
            const nextCount = drillCount + 1;
            setDrillCount(nextCount);
            setInput('');
            if (nextCount >= DRILL_REQUIRED) {
                soundEngine.playSuccess();
                localStorage.removeItem('frogType_pendingDrill');
                handleFinalize();
            }
        } else {
            soundEngine.playError();
            setDrillCount(0);
            setInput('');
        }
        return;
    }

    if (!drillTarget.startsWith(val)) {
        soundEngine.playError();
        setDrillCount(0);
        setInput('');
    } else {
        setInput(val);
        soundEngine.playKeypress();
    }
  };

  const totalChars = words.slice(0, currentIdx).reduce((acc, w) => acc + w.length + 1, 0);
  const realWpm = Math.round((totalChars / 5));

  if (gameState === 'START') {
      return (
          <div className="w-full max-w-4xl mx-auto h-[450px] bg-white rounded-3xl border-4 border-frog-green/20 flex flex-col items-center justify-center shadow-xl p-8">
              <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-frog-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-frog-400 shadow-lg">
                      <Zap className="w-10 h-10 text-frog-600" />
                  </div>
                  <h2 className="text-4xl font-black text-stone-800 tracking-tight">10 FAST</h2>
                  <p className="text-stone-500 text-lg max-w-md mx-auto">Master the most common English words. 60 seconds on the clock. **One mistake fails and forces a 17x repetition drill.**</p>
                  
                  <div className="flex gap-4 justify-center">
                      <button onClick={onExit} className="px-6 py-3 text-stone-400 font-bold hover:text-stone-600">Back</button>
                      <button onClick={initGame} className="px-10 py-4 bg-frog-green hover:bg-green-500 text-white font-black text-xl rounded-full shadow-lg shadow-frog-100 transition-transform hover:scale-105">START RUN</button>
                  </div>
              </div>
          </div>
      );
  }

  if (gameState === 'DRILL_PENALTY') {
      return (
          <div className="w-full max-w-4xl mx-auto h-[450px] bg-red-50 rounded-[3rem] border-4 border-red-200 flex flex-col items-center justify-center shadow-2xl p-10 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex items-center gap-3 mb-8">
                  <Brain className="w-8 h-8 text-red-500 animate-pulse" />
                  <h3 className="text-3xl font-black text-red-700 tracking-tight uppercase">Cognitive Reinforcement</h3>
              </div>
              
              <p className="text-red-500 font-bold text-sm mb-12 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Repeat the failed word <span className="underline font-black">{DRILL_REQUIRED} times</span> perfectly to clear.
              </p>

              <div className="relative group mb-8">
                  <div className="text-7xl font-black text-red-200/50 tracking-widest select-none text-center">
                      {drillTarget}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-7xl font-black tracking-widest text-red-600">
                      {input}
                  </div>
              </div>

              <div className="w-full max-w-md h-4 bg-red-100 rounded-full overflow-hidden border border-red-200 mb-4">
                  <div 
                    className="h-full bg-red-500 transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                    style={{ width: `${(drillCount / DRILL_REQUIRED) * 100}%` }}
                  ></div>
              </div>
              <div className="text-red-600 font-black text-2xl font-mono">
                  {drillCount} <span className="text-sm opacity-50">/</span> {DRILL_REQUIRED}
              </div>

              <input 
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                className="opacity-0 absolute inset-0 cursor-default"
                autoFocus
              />
          </div>
      );
  }

  if (gameState === 'GAMEOVER') {
      return (
          <div className="w-full max-w-4xl mx-auto h-[450px] bg-stone-900 rounded-3xl flex flex-col items-center justify-center text-white p-8 shadow-2xl">
              <div className="text-center space-y-4 animate-in zoom-in-95">
                  <div className="text-frog-green font-black text-7xl">{realWpm}</div>
                  <div className="text-stone-400 uppercase tracking-widest font-bold text-sm">Words Per Minute</div>
                  
                  <div className="grid grid-cols-2 gap-8 mt-4">
                      <div className="text-center">
                          <div className="text-xs text-stone-500 uppercase font-bold">Status</div>
                          <div className="text-xl font-mono text-frog-green flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Learned</div>
                      </div>
                      <div className="text-center">
                          <div className="text-xs text-stone-500 uppercase font-bold">Total Words</div>
                          <div className="text-xl font-mono">{correctCount}</div>
                      </div>
                  </div>

                  <div className="flex gap-4 justify-center mt-12">
                      <button onClick={onExit} className="px-6 py-3 bg-stone-800 hover:bg-stone-700 rounded-xl font-bold flex items-center gap-2"><LogOut className="w-4 h-4" /> Exit</button>
                      <button onClick={initGame} className="px-6 py-3 bg-frog-green hover:bg-green-500 text-white rounded-xl font-bold flex items-center gap-2"><RotateCcw className="w-4 h-4" /> New Run</button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="w-full max-w-4xl mx-auto h-[450px] bg-white rounded-[3rem] border border-stone-200 shadow-xl flex flex-col relative overflow-hidden">
        <div className="flex justify-between items-center p-8 border-b border-stone-100">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <div className="text-3xl font-black text-frog-green leading-none">{realWpm}</div>
                    <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1">EST. WPM</div>
                </div>
                <div className="h-10 w-px bg-stone-100"></div>
                <div className="flex flex-col">
                    <div className="text-3xl font-black text-stone-800 leading-none">{correctCount}</div>
                    <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1">WORDS</div>
                </div>
            </div>
            
            <div className="bg-stone-50 px-6 py-3 rounded-2xl flex items-center gap-3 border border-stone-100">
                <Timer className={`w-5 h-5 ${timeLeft < 10 ? 'text-red-500' : 'text-stone-400'}`} />
                <span className={`text-4xl font-black font-mono leading-none ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-stone-700'}`}>{timeLeft}</span>
            </div>

            <button onClick={onExit} className="p-2 hover:bg-stone-100 rounded-full text-stone-300 transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 p-10 flex flex-col items-center justify-center relative">
            <div className="w-full flex flex-wrap gap-x-6 gap-y-4 justify-center items-center text-3xl font-mono font-medium max-h-[160px] overflow-hidden opacity-90">
                {words.slice(currentIdx, currentIdx + 12).map((w, i) => {
                    const isActive = i === 0;
                    return (
                        <span key={i} className={`relative px-2 transition-all duration-200 ${isActive ? 'text-stone-900 font-black scale-110' : 'text-stone-200'}`}>
                            {isActive && (
                                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-frog-green rounded-full shadow-[0_0_10px_rgba(64,214,114,0.5)]"></div>
                            )}
                            {w}
                        </span>
                    );
                })}
            </div>
            
            <div className="mt-12 relative w-full max-w-sm">
                <input 
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    className={`w-full text-center text-4xl font-mono font-bold bg-stone-50 border-2 rounded-2xl py-4 focus:outline-none transition-all ${isError ? 'border-red-500 bg-red-50' : 'border-stone-100 focus:border-frog-green focus:bg-white'}`}
                    placeholder="Type words..."
                    autoFocus
                />
            </div>
        </div>

        <div className="h-2 bg-stone-100 w-full">
            <div className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 10 ? 'bg-red-500' : 'bg-frog-green'}`} style={{ width: `${(timeLeft / 60) * 100}%` }}></div>
        </div>
    </div>
  );
};

export default TenFastGame;
