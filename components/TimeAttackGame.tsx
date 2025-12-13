import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundEngine } from '../utils/soundEngine';
import { Timer, Trophy, RotateCcw, X, Zap, Clock, LogOut } from 'lucide-react';
import { fetchQuotes } from '../services/quoteService';

interface TimeAttackGameProps {
  onGameOver: (score: number, xp: number) => void;
  onExit: () => void;
}

const TimeAttackGame: React.FC<TimeAttackGameProps> = ({ onGameOver, onExit }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [nextWords, setNextWords] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'NORMAL' | 'ERROR'>('NORMAL');
  const [isLoading, setIsLoading] = useState(false);
  const [bonusNotification, setBonusNotification] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | undefined>(undefined);

  // Helper to clean words
  const cleanWord = (w: string) => w.replace(/[^a-zA-Z]/g, '').toLowerCase();

  // Initialize
  const startGame = async () => {
    setIsLoading(true);
    // Generate pool
    const quotes = await fetchQuotes(30, [], 'Tadpole', 'QUOTES'); 
    // Flatten quotes into words for speed typing, remove punctuation
    const allWords = quotes
        .map(q => q.text.split(' '))
        .flat()
        .map(cleanWord)
        .filter(w => w.length > 2);
    
    // Add backup words
    const backupWords = ["speed", "rush", "fast", "quick", "zoom", "dash", "type", "frog", "jump", "leap", "time", "clock", "race"];
    const finalPool = [...allWords, ...backupWords];

    setCurrentWord(finalPool[0]);
    setNextWords(finalPool.slice(1));
    setScore(0);
    setTimeLeft(60);
    setInput('');
    setStatus('NORMAL');
    setGameState('PLAYING');
    setIsLoading(false);
    setBonusNotification(null);
    
    // Auto focus
    setTimeout(() => inputRef.current?.focus(), 100);
  };

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

  const handleAction = (action: 'RETRY' | 'EXIT') => {
      // Auto-save XP if any score
      if (score > 0) {
          onGameOver(score, score * 2);
      }
      
      if (action === 'RETRY') {
          startGame();
      } else {
          onExit();
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'PLAYING') return;
    
    const rawVal = e.target.value;
    
    // Prevent space from becoming part of the word, acts as a soft block or ignored
    if (rawVal.endsWith(' ')) {
        return; 
    }

    const val = rawVal.trim().toLowerCase();
    
    // Check for error immediately
    if (!currentWord.startsWith(val)) {
        setStatus('ERROR');
        soundEngine.playError();
    } else {
        setStatus('NORMAL');
        soundEngine.playKeypress();
    }

    setInput(val);

    if (val === currentWord) {
        // Word Complete
        const newScore = score + 1;
        setScore(newScore);
        soundEngine.playSuccess();
        setInput('');
        
        // Time Extension Logic (Every 15 words)
        if (newScore % 15 === 0) {
            setTimeLeft(prev => prev + 10);
            setBonusNotification("+10s");
            setTimeout(() => setBonusNotification(null), 1000);
            soundEngine.playLevelUp();
        }
        
        // Advance Word
        // If queue empty, reuse some words randomly
        const nextPool = nextWords.length > 0 
            ? nextWords 
            : ["fast", "speed", "zoom", "dash", "rush", "quick", "blitz", "hyper", "turbo", "sonic"];
            
        setCurrentWord(nextPool[0]);
        setNextWords(prev => prev.slice(1));
    }
  };

  if (gameState === 'START') {
      return (
          <div className="w-full max-w-4xl mx-auto h-[400px] bg-white rounded-3xl border-4 border-stone-100 flex flex-col items-center justify-center shadow-xl p-8">
              <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-10 h-10 text-yellow-500" />
                  </div>
                  <h2 className="text-4xl font-black text-stone-800 tracking-tight">SPEED RUSH</h2>
                  <p className="text-stone-500 text-lg">60 Seconds. +10s every 15 words. No limits.</p>
                  
                  <div className="flex gap-4 justify-center">
                      <button onClick={onExit} className="px-6 py-3 text-stone-400 font-bold hover:text-stone-600">
                          Back
                      </button>
                      <button 
                        onClick={startGame}
                        disabled={isLoading}
                        className="px-10 py-4 bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-black text-xl rounded-full shadow-lg shadow-yellow-200 transition-transform hover:scale-105 disabled:opacity-50"
                      >
                          {isLoading ? "LOADING..." : "START TIMER"}
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  if (gameState === 'GAMEOVER') {
      return (
          <div className="w-full max-w-4xl mx-auto h-[400px] bg-stone-900 rounded-3xl flex flex-col items-center justify-center text-white p-8 shadow-2xl">
              <div className="text-center space-y-6 animate-in zoom-in-95">
                  <div className="text-yellow-400 font-black text-6xl">{score}</div>
                  <div className="text-stone-400 uppercase tracking-widest font-bold">Words Typed</div>
                  
                  <div className="flex gap-4 justify-center mt-8">
                      <button onClick={() => handleAction('EXIT')} className="px-6 py-3 bg-stone-800 hover:bg-stone-700 rounded-xl font-bold flex items-center gap-2">
                          <LogOut className="w-4 h-4" /> Save & Exit
                      </button>
                      <button onClick={() => handleAction('RETRY')} className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-stone-900 rounded-xl font-bold flex items-center gap-2">
                          <RotateCcw className="w-4 h-4" /> Retry
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="w-full max-w-4xl mx-auto h-[400px] bg-white rounded-3xl border border-stone-200 shadow-xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-stone-100">
            <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg"><Zap className="w-6 h-6 text-yellow-600" /></div>
                <div className="flex flex-col">
                    <div className="text-2xl font-black text-stone-800 leading-none">{score}</div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Next: {15 - (score % 15)}</div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {bonusNotification && (
                    <div className="text-green-500 font-black text-xl animate-bounce mr-4">
                        {bonusNotification}
                    </div>
                )}
                <div className={`text-4xl font-black font-mono ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-stone-800'}`}>
                    {timeLeft}
                </div>
            </div>

            <button onClick={onExit} className="p-2 hover:bg-stone-100 rounded-full text-stone-400">
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center bg-stone-50/50">
            
            {/* Word Queue */}
            <div className="flex items-center gap-4 mb-8 opacity-50">
                {nextWords.slice(0, 3).map((w, i) => (
                    <span key={i} className="text-xl font-bold text-stone-400">{w}</span>
                ))}
            </div>

            {/* Active Word */}
            <div className="relative mb-8">
                <div className="text-6xl font-black text-stone-200 tracking-wide select-none">
                    {currentWord}
                </div>
                <div className={`absolute top-0 left-0 text-6xl font-black tracking-wide pointer-events-none whitespace-pre ${status === 'ERROR' ? 'text-red-500' : 'text-stone-800'}`}>
                    {input}
                </div>
            </div>

            {/* Input */}
            <input 
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                className="opacity-0 absolute inset-0 cursor-default"
                autoFocus
            />
            
            <div className="text-stone-400 text-sm font-bold uppercase tracking-widest">Type Fast!</div>
        </div>
        
        {/* Progress Bar for Time */}
        <div className="h-2 bg-stone-100 w-full relative">
            <div 
                className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 10 ? 'bg-red-500' : 'bg-yellow-400'}`}
                style={{ width: `${Math.min(100, (timeLeft / 60) * 100)}%` }}
            ></div>
            
            {/* Checkpoint Markers */}
            <div className="absolute top-0 bottom-0 right-[15%] w-0.5 bg-white/50 z-10"></div>
        </div>
    </div>
  );
};

export default TimeAttackGame;