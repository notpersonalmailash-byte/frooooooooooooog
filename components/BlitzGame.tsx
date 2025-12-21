
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundEngine } from '../utils/soundEngine';
import { Timer, Zap, RotateCcw, X, LogOut, Brain, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { fetchTenFastWords } from '../services/quoteService';
import { PracticeWord, WordPerformance } from '../types';

interface TenFastGameProps {
  smartQueue: PracticeWord[];
  onGameOver: (wpm: number, xp: number, mistakes: string[]) => void;
  onWordPerformance: (perf: WordPerformance) => void;
  onExit: () => void;
  onMistake: (word: string) => void; // Added for strict discipline hook
}

const TenFastGame: React.FC<TenFastGameProps> = ({ smartQueue, onGameOver, onWordPerformance, onExit, onMistake }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [timeLeft, setTimeLeft] = useState(60);
  const [words, setWords] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeWords, setMistakeWords] = useState<string[]>([]);

  const timerRef = useRef<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const initGame = useCallback(() => {
    const wordList = fetchTenFastWords(150, smartQueue);
    setWords(wordList);
    setCurrentIdx(0);
    setInput('');
    setTimeLeft(60);
    setCorrectCount(0);
    setMistakeWords([]);
    setGameState('PLAYING');
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
    const totalChars = words.slice(0, currentIdx).reduce((acc, w) => acc + w.length + 1, 0);
    const finalWpm = Math.round((totalChars / 5));
    onGameOver(finalWpm, Math.floor(finalWpm * (correctCount / 10)), mistakeWords);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'PLAYING') return;
    const val = e.target.value;
    const targetWord = words[currentIdx];

    if (val.endsWith(' ')) {
        const typed = val.trim().toLowerCase();
        if (typed === targetWord) {
            setCorrectCount(prev => prev + 1);
            setCurrentIdx(prev => prev + 1);
            setInput('');
            soundEngine.playKeypress();
        } else {
            triggerFail(targetWord);
        }
        return;
    }

    if (!targetWord.startsWith(val.toLowerCase())) {
        triggerFail(targetWord);
    } else {
        setInput(val);
        soundEngine.playKeypress();
    }
  };

  const triggerFail = (word: string) => {
    clearInterval(timerRef.current);
    soundEngine.playError();
    onMistake(word); // This triggers the 15x drill in App.tsx
    setInput('');
  };

  if (gameState === 'START') {
      return (
          <div className="w-full max-w-4xl mx-auto h-[450px] bg-white rounded-3xl border-4 border-frog-green/20 flex flex-col items-center justify-center shadow-xl p-8">
              <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-frog-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-frog-400 shadow-lg"><Zap className="w-10 h-10 text-frog-600" /></div>
                  <h2 className="text-4xl font-black text-stone-800 tracking-tight uppercase">Common Word Sprint</h2>
                  <p className="text-stone-500 text-lg max-w-md mx-auto">One mistake = Run ends and strictly forces a 15x repetition drill of the failed word.</p>
                  <div className="flex gap-4 justify-center">
                      <button onClick={onExit} className="px-6 py-3 text-stone-400 font-bold hover:text-stone-600">Back</button>
                      <button onClick={initGame} className="px-10 py-4 bg-frog-green hover:bg-green-500 text-white font-black text-xl rounded-full shadow-lg shadow-frog-100 transition-transform hover:scale-105">START SPRINT</button>
                  </div>
              </div>
          </div>
      );
  }

  if (gameState === 'GAMEOVER') {
      return (
          <div className="w-full max-w-4xl mx-auto h-[450px] bg-stone-900 rounded-3xl flex flex-col items-center justify-center text-white p-8 shadow-2xl">
              <div className="text-center space-y-4 animate-in zoom-in-95">
                  <div className="text-frog-green font-black text-7xl">{correctCount}</div>
                  <div className="text-stone-400 uppercase tracking-widest font-bold text-sm">Words Typed Correctly</div>
                  <div className="flex gap-4 justify-center mt-12">
                      <button onClick={onExit} className="px-6 py-3 bg-stone-800 hover:bg-stone-700 rounded-xl font-bold flex items-center gap-2"><LogOut className="w-4 h-4" /> Exit</button>
                      <button onClick={initGame} className="px-6 py-3 bg-frog-green hover:bg-green-500 text-white rounded-xl font-bold flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Try Again</button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="w-full max-w-4xl mx-auto h-[450px] bg-white rounded-[3rem] border border-stone-200 shadow-xl flex flex-col relative overflow-hidden">
        <div className="flex justify-between items-center p-8 border-b border-stone-100">
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
                            {isActive && <div className="absolute -bottom-2 left-0 right-0 h-1 bg-frog-green rounded-full shadow-[0_0_10px_rgba(64,214,114,0.5)]"></div>}
                            {w}
                        </span>
                    );
                })}
            </div>
            <div className="mt-12 relative w-full max-w-sm">
                <input ref={inputRef} autoFocus value={input} onChange={handleInputChange} className="w-full text-center text-4xl font-mono font-bold bg-stone-50 border-2 rounded-2xl py-4 focus:outline-none focus:border-frog-green transition-all" placeholder="Type..." />
            </div>
        </div>
        <div className="h-2 bg-stone-100 w-full"><div className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 10 ? 'bg-red-500' : 'bg-frog-green'}`} style={{ width: `${(timeLeft / 60) * 100}%` }}></div></div>
    </div>
  );
};

export default TenFastGame;
