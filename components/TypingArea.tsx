
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Quote, GameStatus, Settings, GameMode, WordPerformance } from '../types';
import { calculateXP } from '../utils/gameLogic';
import { soundEngine } from '../utils/soundEngine';
import { Play, RotateCcw, Award, Flame, Ghost, EyeOff, Sparkles, ArrowUp, Lock, XCircle, AlertTriangle, ArrowRight, Eraser, Skull, FileText } from 'lucide-react';

interface TypingAreaProps {
  quote: Quote;
  onComplete: (xpEarned: number, wpm: number, mistakes: string[], retryCount: number) => void;
  onFail: () => void;
  onMistake: (word?: string, expectedChar?: string, typedChar?: string) => void;
  onRequestNewQuote: () => void;
  onWordComplete?: (perf: WordPerformance) => void;
  streak: number;
  ghostWpm: number;
  settings: Settings;
  gameMode: GameMode;
  onInteract?: () => void;
  autoFocus?: boolean;
}

const TypingArea: React.FC<TypingAreaProps> = ({ 
  quote, 
  onComplete, 
  onFail, 
  onMistake,
  onWordComplete,
  onRequestNewQuote,
  streak,
  ghostWpm,
  settings,
  gameMode,
  onInteract,
  autoFocus = false
}) => {
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(autoFocus);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [wpm, setWpm] = useState(0);
  const [ghostIndex, setGhostIndex] = useState(0);
  const [capsLock, setCapsLock] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  
  // Tracking Stats
  const [sessionMistakes, setSessionMistakes] = useState(0);
  const [sessionMistakeWords, setSessionMistakeWords] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  
  // Word Timing State
  const wordStartTimeRef = useRef<number | null>(null);
  const currentWordIndexRef = useRef<number>(0);

  // Enhanced Error Tracking
  const [lastError, setLastError] = useState<{ 
      expectedChar: string, 
      typedChar: string, 
      index: number,
      expectedWord: string,
      typedWordPart: string 
  } | null>(null);

  // Smooth Caret State
  const [caretPos, setCaretPos] = useState({ left: 0, top: 0, height: 24, opacity: 0 });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const retryButtonRef = useRef<HTMLButtonElement>(null);

  // --- TTS LOGIC ---
  const speakText = useCallback((text: string) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2; 
      window.speechSynthesis.speak(utterance);
  }, []);

  const triggerTTS = useCallback((index: number) => {
      if (settings.ttsMode === 'OFF') return;
      
      const words = quote.text.split(' ');
      
      if (settings.ttsMode === 'QUOTE') {
          if (index === 0) speakText(quote.text);
          return;
      }

      let textToSpeak = '';
      
      if (settings.ttsMode === 'WORD') {
          textToSpeak = words[index] || '';
      } else if (settings.ttsMode === 'FLOW') {
          const w1 = words[index] || '';
          const w2 = words[index + 1] || '';
          textToSpeak = `${w1} ${w2}`;
      } else if (settings.ttsMode === 'NEXT') {
          textToSpeak = words[index + 1] || '';
      } else if (settings.ttsMode === 'SCOUT') {
          textToSpeak = words[index + 2] || '';
      }
      
      if (textToSpeak.trim()) speakText(textToSpeak);
  }, [quote.text, settings.ttsMode, speakText]);

  useEffect(() => {
    soundEngine.setEnabled(settings.sfxEnabled);
    soundEngine.setMechanicalEnabled(settings.mechanicalSoundEnabled);
    soundEngine.setMechanicalPreset(settings.mechanicalSoundPreset);
  }, [settings.sfxEnabled, settings.mechanicalSoundEnabled, settings.mechanicalSoundPreset]);

  useEffect(() => {
    setInput('');
    setStartTime(null);
    setEndTime(null);
    setStatus(GameStatus.IDLE);
    setWpm(0);
    setGhostIndex(0);
    setSessionMistakes(0);
    setSessionMistakeWords([]);
    setRetryCount(0);
    setLastError(null);
    wordStartTimeRef.current = null;
    currentWordIndexRef.current = 0;
    
    window.speechSynthesis.cancel();
    
    if (isFocused) {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 10);
    }
  }, [quote]);

  useEffect(() => {
    if (status === GameStatus.COMPLETED) {
        setTimeout(() => nextButtonRef.current?.focus(), 50);
    } else if (status === GameStatus.FAILED) {
        setTimeout(() => retryButtonRef.current?.focus(), 50);
    }
  }, [status]);

  const handleRetry = useCallback(() => {
    setInput('');
    setStartTime(null);
    setEndTime(null);
    setStatus(GameStatus.IDLE);
    setWpm(0);
    setGhostIndex(0);
    setSessionMistakes(0); 
    setLastError(null);
    setRetryCount(prev => prev + 1);
    wordStartTimeRef.current = null;
    currentWordIndexRef.current = 0;
    
    window.speechSynthesis.cancel();
    
    setIsFocused(true);
    setTimeout(() => inputRef.current?.focus(), 10);
  }, []);

  const handleNext = useCallback(() => {
    const isPerfectMaster = retryCount === 0 && sessionMistakes === 0;
    const xp = calculateXP(wpm, quote.text.length, streak, isPerfectMaster, settings.readAheadLevel);
    setIsFocused(true);
    onComplete(xp, wpm, sessionMistakeWords, retryCount);
  }, [onComplete, wpm, quote.text.length, streak, retryCount, sessionMistakes, sessionMistakeWords, settings.readAheadLevel]);

  useEffect(() => {
    const checkCapsLock = (e: KeyboardEvent | MouseEvent) => {
      if (e.getModifierState) {
        setCapsLock(e.getModifierState('CapsLock'));
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Shift') setIsShiftPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'Shift') setIsShiftPressed(false);
    };

    window.addEventListener('keydown', checkCapsLock as any);
    window.addEventListener('keyup', checkCapsLock as any);
    window.addEventListener('click', checkCapsLock as any);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', checkCapsLock as any);
      window.removeEventListener('keyup', checkCapsLock as any);
      window.removeEventListener('click', checkCapsLock as any);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (status === GameStatus.COMPLETED) {
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      if (status === GameStatus.FAILED) {
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          handleRetry();
        }
        return;
      }

      if (!isFocused) {
        if (e.key === 'Tab') return;

        if (!e.metaKey && !e.altKey && !e.ctrlKey) {
            e.preventDefault(); 
            setIsFocused(true);
            inputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isFocused, status, handleNext, handleRetry]);

  useLayoutEffect(() => {
    const updateCaret = () => {
        if (!textContainerRef.current) return;
        
        let targetEl: HTMLElement | null = null;
        let left = 0;
        let top = 0;
        let height = 0;

        if (input.length < quote.text.length) {
            targetEl = textContainerRef.current.querySelector(`[data-index="${input.length}"]`);
            if (targetEl) {
                left = targetEl.offsetLeft;
                top = targetEl.offsetTop;
                height = targetEl.offsetHeight;
            }
        } else {
            targetEl = textContainerRef.current.querySelector(`[data-index="${input.length - 1}"]`);
            if (targetEl) {
                left = targetEl.offsetLeft + targetEl.offsetWidth;
                top = targetEl.offsetTop;
                height = targetEl.offsetHeight;
            } else if (quote.text.length === 0) {
                 left = 0;
                 top = 0;
                 height = 24; 
            }
        }
        
        if (input.length === 0 && quote.text.length > 0) {
             const firstEl = textContainerRef.current.querySelector(`[data-index="0"]`) as HTMLElement;
             if (firstEl) {
                 left = firstEl.offsetLeft;
                 top = firstEl.offsetTop;
                 height = firstEl.offsetHeight;
             }
        }

        setCaretPos({ 
            left, 
            top, 
            height: height || 32, 
            opacity: isFocused && status !== GameStatus.COMPLETED && status !== GameStatus.FAILED ? 1 : 0
        });
    };

    updateCaret();
    window.addEventListener('resize', updateCaret);
    return () => window.removeEventListener('resize', updateCaret);
  }, [input, quote, isFocused, status, settings.readAheadLevel]);

  const handleFocus = () => {
    if (status === GameStatus.COMPLETED || status === GameStatus.FAILED) return;
    setIsFocused(true);
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    setTimeout(() => {
        if (document.activeElement !== inputRef.current) {
            setIsFocused(false);
        }
    }, 100);
  };

  const calculateStats = useCallback(() => {
    if (!startTime) return { currentWpm: 0 };
    const now = endTime || Date.now();
    const durationInMinutes = (now - startTime) / 60000;
    if (durationInMinutes <= 0) return { currentWpm: 0 };
    const currentWpm = Math.round((input.length / 5) / durationInMinutes);
    return { currentWpm };
  }, [endTime, input.length, startTime]);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      const interval = setInterval(() => {
        const { currentWpm } = calculateStats();
        setWpm(currentWpm);

        if (settings.ghostEnabled && ghostWpm > 0 && startTime) {
            const now = Date.now();
            const elapsedMins = (now - startTime) / 60000;
            const projectedChars = (ghostWpm * 5) * elapsedMins;
            setGhostIndex(projectedChars);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [status, calculateStats, settings.ghostEnabled, ghostWpm, startTime]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (status === GameStatus.COMPLETED || status === GameStatus.FAILED) return;

    const val = e.target.value;
    const prevLen = input.length;
    const now = Date.now();
    
    if (status === GameStatus.IDLE && val.length > 0) {
      setStartTime(now);
      setStatus(GameStatus.PLAYING);
      wordStartTimeRef.current = now;
    }

    if (val.length > prevLen) {
        soundEngine.playKeypress();
    }

    // --- WORD PERFORMANCE TRACKING ---
    if (val.endsWith(' ') && !input.endsWith(' ')) {
        const words = quote.text.split(' ');
        const finishedWord = words[currentWordIndexRef.current];
        if (finishedWord && wordStartTimeRef.current) {
            const wordDurationSec = (now - wordStartTimeRef.current) / 1000;
            const wordWpm = Math.round((finishedWord.length / 5) / (wordDurationSec / 60));
            
            if (onWordComplete) {
                onWordComplete({
                    word: finishedWord.toLowerCase().replace(/[^a-z]/g, ''),
                    wpm: wordWpm,
                    isCorrect: true
                });
            }
        }
        currentWordIndexRef.current += 1;
        wordStartTimeRef.current = now;
        
        const nextWordIndex = val.trim().split(' ').length;
        triggerTTS(nextWordIndex);
    }

    if (val.length > 0) {
      if (!quote.text.startsWith(val)) {
        soundEngine.playError();
        
        const mistakeIndex = val.length - 1;
        const expectedChar = quote.text[mistakeIndex];
        const typedChar = val[mistakeIndex];
        
        const wordStart = quote.text.lastIndexOf(' ', mistakeIndex) + 1;
        let wordEnd = quote.text.indexOf(' ', mistakeIndex);
        if (wordEnd === -1) wordEnd = quote.text.length;
        
        const expectedWord = quote.text.substring(wordStart, wordEnd);
        const typedWordPart = val.substring(wordStart);
        const cleanWord = expectedWord.replace(/[.,;!?]/g, '');

        setLastError({ 
            expectedChar, 
            typedChar, 
            index: mistakeIndex,
            expectedWord,
            typedWordPart
        });
        
        // Tracking the mistake for the mastery engine
        if (onWordComplete) {
            onWordComplete({
                word: cleanWord.toLowerCase().replace(/[^a-z]/g, ''),
                wpm: 0,
                isCorrect: false
            });
        }

        onMistake(cleanWord, expectedChar, typedChar);
        setSessionMistakes(prev => prev + 1);
        if (cleanWord && !sessionMistakeWords.includes(cleanWord)) {
            setSessionMistakeWords(prev => [...prev, cleanWord]);
        }

        if (gameMode === 'XQUOTES') {
            onFail(); 
            handleRetry(); 
            return;
        }

        setStatus(GameStatus.FAILED);
        onFail();
        return;
      }
    }

    setInput(val);

    if (val.length === quote.text.length) {
      const isPerfect = val === quote.text;
      setEndTime(now);
      
      if (isPerfect) {
        soundEngine.playSuccess(); 
        
        // Handle last word performance
        const words = quote.text.split(' ');
        const lastWord = words[words.length - 1];
        if (lastWord && wordStartTimeRef.current) {
            const wordDurationSec = (now - wordStartTimeRef.current) / 1000;
            const wordWpm = Math.round((lastWord.length / 5) / (wordDurationSec / 60));
            if (onWordComplete) {
                onWordComplete({
                    word: lastWord.toLowerCase().replace(/[^a-z]/g, ''),
                    wpm: wordWpm,
                    isCorrect: true
                });
            }
        }

        if (gameMode === 'XQUOTES') {
            const isPerfectMaster = retryCount === 0 && sessionMistakes === 0;
            const xp = calculateXP(wpm, quote.text.length, streak, isPerfectMaster, settings.readAheadLevel);
            onComplete(xp, wpm, sessionMistakeWords, retryCount);
            return;
        }

        setStatus(GameStatus.COMPLETED);
        const finalTime = now;
        const durationMins = (finalTime - (startTime || finalTime)) / 60000;
        const finalWpm = Math.round((quote.text.length / 5) / (durationMins || 1));
        setWpm(finalWpm);
      } else {
        soundEngine.playError();
        if (gameMode === 'XQUOTES') {
            onFail();
            handleRetry();
            return;
        } 
        setStatus(GameStatus.FAILED);
        onFail();
      }
    }
  };

  const getReadAheadState = (index: number) => {
    if (settings.readAheadLevel === 'NONE' || status === GameStatus.IDLE) return { isHidden: false, isHighlighted: false };
    
    const text = quote.text;
    const caret = input.length;
    
    let currentWordStart = text.lastIndexOf(' ', caret - 1);
    currentWordStart = currentWordStart === -1 ? 0 : currentWordStart + 1;
    
    let currentWordEnd = text.indexOf(' ', caret);
    if (currentWordEnd === -1) currentWordEnd = text.length;

    if (index >= currentWordStart && index < currentWordEnd) {
        return { isHidden: true, isHighlighted: false };
    }

    if (settings.readAheadLevel === 'ULTRA' || settings.readAheadLevel === 'BLIND') {
        let nextWordStart = currentWordEnd + 1;
        let nextWordEnd = text.indexOf(' ', nextWordStart);
        if (nextWordEnd === -1) nextWordEnd = text.length;

        if (index >= nextWordStart && index < nextWordEnd) {
            return { isHidden: true, isHighlighted: false }; 
        }
    }

    if (settings.readAheadLevel === 'BLIND') {
        let nextWordStart = currentWordEnd + 1;
        let nextWordEnd = text.indexOf(' ', nextWordStart);
        if (nextWordEnd === -1) nextWordEnd = text.length;
        
        let secondNextStart = nextWordEnd + 1;
        let secondNextEnd = text.indexOf(' ', secondNextStart);
        if (secondNextEnd === -1) secondNextEnd = text.length;

        if (index >= secondNextStart && index < secondNextEnd) {
             return { isHidden: true, isHighlighted: false };
        }
    }

    if (index > currentWordEnd) { 
        let highlightStart = currentWordEnd + 1;
        if (settings.readAheadLevel === 'ULTRA') {
             let skip1 = text.indexOf(' ', highlightStart);
             if (skip1 !== -1) highlightStart = skip1 + 1;
             else highlightStart = text.length; 
        } else if (settings.readAheadLevel === 'BLIND') {
             let skip1 = text.indexOf(' ', highlightStart);
             let skip2 = skip1 !== -1 ? text.indexOf(' ', skip1 + 1) : -1;
             if (skip2 !== -1) highlightStart = skip2 + 1;
             else highlightStart = text.length;
        }

        let highlightEnd = text.indexOf(' ', highlightStart);
        if (highlightEnd === -1) highlightEnd = text.length;

        if (index >= highlightStart && index < highlightEnd) {
             return { isHidden: false, isHighlighted: true };
        }
    }

    return { isHidden: false, isHighlighted: false };
  };

  const getTextColor = () => {
     if (status === GameStatus.FAILED) {
        if (gameMode === 'HARDCORE') return 'text-red-400/50';
        return 'text-red-300';
     }
     if (gameMode === 'HARDCORE') return 'text-stone-400';
     return 'text-stone-300';
  };

  const renderText = () => {
    return quote.text.split('').map((char, index) => {
      let colorClass = getTextColor(); 
      let bgClass = '';
      
      const { isHidden, isHighlighted } = getReadAheadState(index);

      if (index < input.length) {
        if (input[index] === char) {
          colorClass = 'text-frog-500'; // Changed from frog-green to frog-500 for theming
        } else {
          colorClass = 'text-red-500 bg-red-100'; 
        }
      } else {
          if (isHighlighted) {
              colorClass = 'text-frog-500 font-bold'; // Changed for theming
              bgClass = 'bg-frog-200/20'; // Use themed highlight
          }
      }

      if (gameMode === 'XWORDS' || gameMode === 'XQUOTES') {
          if (index >= input.length) {
              colorClass = 'text-stone-300';
          }
      }

      const isGhostHere = settings.ghostEnabled && Math.floor(ghostIndex) === index;

      return (
        <span key={index} data-index={index} className="relative">
            {isGhostHere && (
                <span className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-purple-400/50 z-20 animate-pulse">
                     <span className="absolute -top-4 -left-2 text-[10px] text-purple-400 opacity-70">👻</span>
                </span>
            )}

            <span 
                className={`
                    ${colorClass} ${bgClass} transition-colors duration-100
                    ${isHidden ? 'text-transparent selection:text-transparent' : ''}
                    ${isHidden && index < input.length && input[index] !== char ? '!text-red-500 !bg-red-100' : ''} 
                `}
            >
                {char}
            </span>
        </span>
      );
    });
  };

  const getContainerStyle = () => {
    if (status === GameStatus.FAILED) {
        if (gameMode === 'HARDCORE') {
            return 'bg-red-900/20 border-red-900/50 shadow-[0_0_40px_rgba(220,38,38,0.1)]';
        }
        return 'bg-red-50 border-red-200 shadow-inner';
    }

    if (gameMode === 'HARDCORE') {
        return 'bg-stone-900 border-stone-800 text-stone-400 shadow-[0_0_40px_rgba(0,0,0,0.2)]';
    }
    if (gameMode === 'XWORDS' || gameMode === 'XQUOTES') {
        return 'bg-red-50 border-red-100';
    }
    
    return 'bg-stone-50 border-stone-200 overflow-hidden';
  };

  const getFontSizeClass = () => {
    const len = quote.text.length;
    if (len < 100) return 'text-xl md:text-2xl leading-relaxed';
    if (len < 200) return 'text-lg md:text-xl leading-relaxed';
    return 'text-base md:text-lg leading-relaxed';
  };

  const isPerfectMasterPotential = retryCount === 0 && sessionMistakes === 0;

  const getCompletionContent = () => {
      switch(gameMode) {
          case 'XWORDS':
              return { title: 'Correction Complete!', btnLabel: 'Next Batch', Icon: Eraser };
          case 'PRACTICE':
              return { title: 'Words Mastered!', btnLabel: 'More Words', Icon: FileText };
          case 'HARDCORE':
              return { title: 'Survival Successful!', btnLabel: 'Next Challenge', Icon: Skull };
          case 'XQUOTES':
              return { title: 'Redemption!', btnLabel: 'Continue', Icon: RotateCcw };
          default:
              return { title: 'Quote Complete!', btnLabel: 'Next Quote', Icon: Award };
      }
  };

  const { title: completionTitle, btnLabel: completionBtn, Icon: CompletionIcon } = getCompletionContent();

  return (
    <div className="relative w-full max-w-6xl mx-auto min-h-[400px] flex flex-col" ref={containerRef}>
      {isPerfectMasterPotential && status === GameStatus.PLAYING && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-1 text-xs font-bold text-frog-500 animate-pulse">
          <Sparkles className="w-3 h-3" /> Perfect Master Potential (1.5x Bonus)
        </div>
      )}

      <div className={`
        relative flex-grow flex flex-col justify-center p-8 md:p-16 rounded-[3rem] transition-all duration-300 border
        ${getContainerStyle()}
        ${isFocused && status !== GameStatus.FAILED && status !== GameStatus.COMPLETED ? 'ring-2 ring-frog-500/50 ring-offset-2 ring-offset-bg-body' : ''}
        ${status === GameStatus.FAILED ? 'ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : ''}
        ${status === GameStatus.COMPLETED ? 'ring-2 ring-frog-500/20 bg-frog-50/20' : ''}
        ${streak > 2 && status === GameStatus.PLAYING ? 'shadow-[0_0_30px_rgba(251,146,60,0.15)] ring-1 ring-orange-100' : ''}
      `}>
        
        {!isFocused && status !== GameStatus.COMPLETED && status !== GameStatus.FAILED && (
          <div 
            onClick={handleFocus}
            className="absolute inset-0 z-50 flex items-center justify-center bg-stone-900/5 backdrop-blur-sm cursor-pointer rounded-[3rem] border-2 border-dashed border-frog-500/50 hover:border-frog-500 transition-all"
          >
            <div className="text-center animate-bounce text-frog-500">
              <Play className="w-10 h-10 mx-auto mb-2 opacity-80" fill="currentColor" />
              <span className="font-bold text-base tracking-wide uppercase font-sans">Click or Type to Start</span>
            </div>
          </div>
        )}
        
        {status === GameStatus.COMPLETED && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-stone-900/10 backdrop-blur-sm rounded-[3rem] cursor-pointer" onClick={handleNext}>
             <div className="bg-stone-50/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-stone-200 animate-in zoom-in-95 fade-in duration-300 flex flex-col items-center gap-6 min-w-[280px] cursor-default" onClick={(e) => e.stopPropagation()}>
                <div className="text-frog-500 font-black text-xl tracking-tight flex items-center gap-2">
                   <CompletionIcon className="w-6 h-6" /> {completionTitle}
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 w-full">
                   <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-1">Time</span>
                      <span className="font-mono font-bold text-2xl text-stone-700">{endTime && startTime ? ((endTime - startTime) / 1000).toFixed(1) : '0.0'}s</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-1">Speed</span>
                      <span className="font-mono font-bold text-2xl text-stone-700">{wpm} <span className="text-xs text-stone-400 font-sans font-medium">WPM</span></span>
                   </div>
                   <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-1">Retries</span>
                      <span className="font-mono font-bold text-2xl text-stone-700">{retryCount}</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-1">XP Earned</span>
                      <span className="font-mono font-bold text-2xl text-frog-500">+{calculateXP(wpm, quote.text.length, streak, retryCount === 0 && sessionMistakes === 0, settings.readAheadLevel) * (gameMode === 'HARDCORE' ? 5 : 1)}</span>
                   </div>
                </div>
                <button ref={nextButtonRef} onClick={handleNext} className="flex items-center gap-2 px-8 py-3 rounded-full transition shadow-lg font-bold text-sm tracking-wide uppercase transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full justify-center bg-frog-500 text-white hover:opacity-90 shadow-frog-200/50 focus:ring-frog-500">
                   {completionBtn} <CompletionIcon className="w-4 h-4" />
                </button>
             </div>
          </div>
        )}

        {status === GameStatus.FAILED && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-stone-900/10 backdrop-blur-sm rounded-[3rem] cursor-pointer" onClick={handleRetry}>
             <div className="bg-white p-6 rounded-3xl shadow-2xl border border-stone-100 animate-in zoom-in-95 fade-in duration-300 flex flex-col items-center gap-4 min-w-[260px] cursor-default" onClick={(e) => e.stopPropagation()}>
                <div className="text-red-500 font-black text-xl tracking-tight flex items-center gap-2">
                   <XCircle className="w-6 h-6" /> Run Failed
                </div>
                <div className="w-full bg-red-50 p-3 rounded-xl border border-red-100 flex flex-col items-center gap-1">
                    {lastError ? (
                        <>
                            <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Mistake</div>
                            <div className="flex items-center gap-3 font-mono text-base">
                                 <span className="text-red-500 font-medium" title="You Typed">{lastError.typedWordPart}</span>
                                 <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
                                 <span className="text-frog-500 font-bold" title="Expected">{lastError.expectedWord}</span>
                            </div>
                        </>
                    ) : (
                        <span className="text-stone-400 italic text-xs">Unknown Error</span>
                    )}
                </div>
                <div className="flex w-full justify-between gap-4 px-2">
                     <div className="flex flex-col items-center">
                        <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">Progress</span>
                        <span className="font-mono font-bold text-lg text-stone-700">{Math.floor((input.length / quote.text.length) * 100)}%</span>
                     </div>
                     <div className="w-px bg-stone-100"></div>
                     <div className="flex flex-col items-center">
                        <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">Speed</span>
                        <span className="font-mono font-bold text-lg text-stone-700">{wpm}</span>
                     </div>
                </div>
                <button ref={retryButtonRef} onClick={handleRetry} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white hover:bg-red-600 rounded-xl transition shadow-lg shadow-red-200/50 font-bold text-xs tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform hover:-translate-y-0.5">
                  <RotateCcw className="w-3.5 h-3.5" /> Try Again
                </button>
             </div>
          </div>
        )}

        <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 z-30 select-none pointer-events-none">
            {capsLock && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold tracking-widest border border-orange-200 shadow-sm animate-pulse">
                <Lock className="w-3 h-3" /> CAPS LOCK
              </div>
            )}
            {isShiftPressed && (
               <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold tracking-widest border border-blue-100 shadow-sm">
                <ArrowUp className="w-3 h-3" /> SHIFT
              </div>
            )}
        </div>

        <div className="absolute top-10 left-0 right-0 px-10 md:px-20 flex justify-between text-xs font-bold opacity-80 uppercase tracking-[0.2em] select-none font-sans z-10 text-stone-500">
          <div className="flex gap-4">
             <span>{quote.source}</span>
             {settings.ghostEnabled && <span className="text-purple-300 flex items-center gap-1"><Ghost className="w-3.5 h-3.5"/> {ghostWpm > 0 ? `${ghostWpm} WPM` : 'Ready'}</span>}
             {settings.readAheadLevel !== 'NONE' && <span className="text-frog-500 flex items-center gap-1"><EyeOff className="w-3.5 h-3.5"/> {settings.readAheadLevel}</span>}
          </div>
          <span className="text-right max-w-[200px] truncate">{quote.author}</span>
        </div>

        <div ref={textContainerRef} className={`font-mono tracking-wide break-words whitespace-pre-wrap mb-12 mt-10 relative z-10 outline-none select-none ${getTextColor()} ${getFontSizeClass()}`} onClick={handleFocus}>
          <div className="absolute bg-frog-500 w-[3px] rounded-full transition-all duration-100 ease-out z-20 pointer-events-none caret-blink shadow-[0_0_10px_rgba(64,214,114,0.5)]"
             style={{ left: caretPos.left - 1, top: caretPos.top + 2, height: caretPos.height - 4, opacity: caretPos.opacity }}
          />
          {renderText()}
        </div>

        <textarea ref={inputRef} value={input} onChange={handleChange} onBlur={handleBlur} onFocus={() => { setIsFocused(true); onInteract?.(); if (status === GameStatus.IDLE && input.length === 0) triggerTTS(0); }}
          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} onPaste={(e) => e.preventDefault()} onCopy={(e) => e.preventDefault()} onDrop={(e) => e.preventDefault()}
          className="absolute opacity-0 top-0 left-0 h-full w-full cursor-default resize-none" autoFocus={isFocused} disabled={status === GameStatus.COMPLETED || status === GameStatus.FAILED}
        />

        <div className="absolute bottom-10 left-0 right-0 px-10 md:px-20 flex justify-between items-end select-none z-10">
           <div className="flex items-center gap-10 text-stone-400 font-mono text-sm">
             <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-stone-300 mb-0.5 tracking-wider">Speed</span>
                <span className="font-bold text-xl opacity-80 font-sans">{wpm} <span className="text-[10px] font-normal opacity-50">WPM</span></span>
             </div>
             {streak > 0 && (
                <div className={`flex flex-col ${streak > 4 ? 'text-orange-500' : 'text-stone-400'}`}>
                    <span className="text-[10px] uppercase font-bold text-stone-300 mb-0.5 tracking-wider">Streak</span>
                    <span className="font-bold text-xl flex items-center gap-1.5 font-sans">
                        <Flame className={`w-4 h-4 ${streak > 4 ? 'fill-orange-500' : ''}`} /> {streak}
                    </span>
                </div>
             )}
           </div>
        </div>
      </div>
      
      <div className="text-center mt-8 h-4 text-stone-400 text-xs font-medium tracking-wide transition-opacity duration-500 font-sans">
        {status === GameStatus.FAILED ? <span className="text-red-400">{gameMode === 'HARDCORE' ? 'HARDCORE FAIL. 50% XP Penalty.' : 'Mistake made. Review your error above.'}</span> : 
         status === GameStatus.COMPLETED ? <span className="text-frog-500">Perfect! Streak +1 {retryCount === 0 && sessionMistakes === 0 && "(Mastery Bonus!)"}</span> :
         isFocused ? "Accuracy is paramount. One mistake restarts the quote." : ""}
      </div>
    </div>
  );
};

export default TypingArea;
