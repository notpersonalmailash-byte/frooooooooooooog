
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundEngine } from '../utils/soundEngine';
import { Timer, Zap, RotateCcw, X, LogOut, ArrowRight, Sparkles } from 'lucide-react';
import { fetchBlitzWords } from '../services/quoteService';
import { PracticeWord, WordPerformance } from '../types';

interface BlitzGameProps {
  smartQueue: PracticeWord[];
  onGameOver: (wpm: number, xp: number, mistakes: string[]) => void;
  onWordPerformance: (perf: WordPerformance) => void;
  onExit: () => void;
}

const BlitzGame: React.FC<BlitzGameProps> = ({ smartQueue, onGameOver, onWordPerformance, onExit }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [timeLeft, setTimeLeft] = useState(60);
  const [words, setWords] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState('');
  const [isError, setIsError] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeWords, setMistakeWords] = useState<string[]>([]);
  
  const wordStartTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const mistakeWordsRef = useRef<string[]>([]); // Ref to avoid stale closure issues if needed

  const initGame = useCallback(() => {
    const wordList = fetchBlitzWords(150, smartQueue);
    setWords(wordList);
    setCurrentIdx(0);
    setInput('');
    setIsError(false);
    setTimeLeft(60);
    setCorrectCount(0);
    setMistakeWords([]);
    mistakeWordsRef.current = [];
    setGameState('PLAYING');
    wordStartTimeRef.current = performance.now();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [smartQueue]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const endGame = () => {
    setGameState('GAMEOVER');
    clearInterval(timerRef.current);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'PLAYING') return;
    const val = e.target.value;
    const targetWord = words[currentIdx];

    // Check for space (Next Word)
    if (val.endsWith(' ')) {
        const typed = val.trim();
        if (typed === targetWord) {
            // Success
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
            
            // Check if we need more words
            if (currentIdx > words.length - 20) {
                setWords(prev => [...prev, ...fetchBlitzWords(50, smartQueue)]);
            }
        } else {
            // Typing space while word is incorrect -> ignore or visual error
            setIsError(true);
            soundEngine.playError();
        }
        return;
    }

    // Incremental Accuracy Check
    if (!targetWord.startsWith(val)) {
        setIsError(true);
        soundEngine.playError();
        // Record mistake for deep mastery remediation at end of test
        onWordPerformance({ word: targetWord, wpm: 0, isCorrect: false });
        if (!mistakeWordsRef.current.includes(targetWord)) {
            mistakeWordsRef.current = [...mistakeWordsRef.current, targetWord];
            setMistakeWords(mistakeWordsRef.current);
        }
        setInput('');
        setIsError(false);
    } else {
        setIsError(false);
        setInput(val);
        soundEngine.playKeypress();
    }
  };

  const totalChars = words.slice(0, currentIdx).reduce((acc, w) => acc + w.length + 1, 0);
  const realWpm = Math.round((totalChars / 5));

  const handleFinish = () => {
      // Pass the mistakes collected via ref/state back to parent
      onGameOver(realWpm, Math.floor(correctCount * 1.5), mistakeWordsRef.current);
  };

  if (gameState === 'START') {
      return (
          <div className="w-full max-w-4xl mx-auto h-[450px] bg-white rounded-3xl border-4 border-frog-green/20 flex flex-col items-center justify-center shadow-xl p-8">
              <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-frog-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-frog-400 shadow-lg">
                      <Zap className="w-10 h-10 text-frog-600" />
                  </div>
                  <h2 className="text-4xl font-black text-stone-800 tracking-tight">BLITZ 200</h2>
                  <p className="text-stone-500 text-lg max-w-md mx-auto">Master common words. 60 seconds on the clock. **Mistakes trigger mandatory remediation.**</p>
                  
                  <div className="flex gap-4 justify-center">
                      <button onClick={onExit} className="px-6 py-3 text-stone-400 font-bold hover:text-stone-600">Back</button>
                      <button onClick={initGame} className="px-10 py-4 bg-frog-green hover:bg-green-500 text-white font-black text-xl rounded-full shadow-lg shadow-frog-100 transition-transform hover:scale-105">START BLITZ</button>
                  </div>
              </div>
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
                          <div className="text-xs text-stone-500 uppercase font-bold">Accuracy</div>
                          <div className="text-xl font-mono">{mistakeWords.length === 0 ? '100%' : 'Mastery Req.'}</div>
                      </div>
                      <div className="text-center">
                          <div className="text-xs text-stone-500 uppercase font-bold">Mistakes</div>
                          <div className={`text-xl font-mono ${mistakeWords.length > 0 ? 'text-red-400' : 'text-green-400'}`}>{mistakeWords.length}</div>
                      </div>
                  </div>

                  <div className="flex gap-4 justify-center mt-12">
                      <button onClick={handleFinish} className={`px-8 py-4 rounded-full font-black text-xl flex items-center gap-2 transition-all transform hover:scale-105 ${mistakeWords.length > 0 ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-900/50' : 'bg-frog-green hover:bg-green-500 shadow-green-900/50'}`}>
                          {mistakeWords.length > 0 ? 'START REMEDIATION' : 'FINISH RUN'} <ArrowRight className="w-6 h-6" />
                      </button>
                  </div>
                  {mistakeWords.length > 0 && <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-4">Mandatory: 30 reps per mistake.</p>}
              </div>
          </div>
      );
  }

  return (
    <div className="w-full max-w-4xl mx-auto h-[450px] bg-white rounded-[3rem] border border-stone-200 shadow-xl flex flex-col relative overflow-hidden">
        {/* HUD */}
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

        {/* Word Display */}
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
            
            {/* Real Input */}
            <div className="mt-12 relative w-full max-w-sm">
                <input 
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    className={`w-full text-center text-4xl font-mono font-bold bg-stone-50 border-2 rounded-2xl py-4 focus:outline-none transition-all ${isError ? 'border-red-500 bg-red-50' : 'border-stone-100 focus:border-frog-green focus:bg-white'}`}
                    placeholder="Type words..."
                    autoFocus
                />
                {isError && <div className="absolute -top-8 left-0 right-0 text-center text-xs font-bold text-red-500 animate-bounce uppercase">Mistake! Word Reset</div>}
            </div>
        </div>

        <div className="h-2 bg-stone-100 w-full">
            <div className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 10 ? 'bg-red-500' : 'bg-frog-green'}`} style={{ width: `${(timeLeft / 60) * 100}%` }}></div>
        </div>
    </div>
  );
};

export default BlitzGame;
