
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Quote, GameStatus, Settings, GameMode, WordPerformance } from '../types';
import { calculateXP } from '../utils/gameLogic';
import { soundEngine } from '../utils/soundEngine';
import { Play, RotateCcw, Award, Flame, Ghost, EyeOff, Sparkles, ArrowUp, Lock, XCircle, AlertTriangle, ArrowRight, Eraser, Skull, FileText, RefreshCcw, Zap } from 'lucide-react';

// Added missing constants to fix "Cannot find name" errors
const DRILL_REPS = 30;
const QUOTE_REMEDIATION_REPS = 3;

interface TypingAreaProps {
  quote: Quote;
  onComplete: (xpEarned: number, wpm: number, mistakes: string[], retryCount: number) => void;
  onFail: (mistakeWord?: string) => void;
  onMistake: (word?: string, expectedChar?: string, typedChar?: string) => void;
  onRequestNewQuote: () => void;
  onWordComplete?: (perf: WordPerformance) => void;
  streak: number;
  ghostWpm: number;
  settings: Settings;
  gameMode: GameMode;
  onInteract?: () => void;
  autoFocus?: boolean;
  remediationRemaining?: number;
  isWordDrilling?: boolean;
}

const TypingArea: React.FC<TypingAreaProps> = ({ 
  quote, 
  onComplete, 
  onFail, 
  onMistake,
  onWordComplete,
  streak,
  ghostWpm,
  settings,
  gameMode,
  onInteract,
  autoFocus = false,
  remediationRemaining = 0,
  isWordDrilling = false
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
  
  const [sessionMistakes, setSessionMistakes] = useState(0);
  const [sessionMistakeWords, setSessionMistakeWords] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  
  const wordStartTimeRef = useRef<number | null>(null);
  const currentWordIndexRef = useRef<number>(0);
  const [lastError, setLastError] = useState<{ expectedChar: string, typedChar: string, index: number, expectedWord: string, typedWordPart: string } | null>(null);
  const [caretPos, setCaretPos] = useState({ left: 0, top: 0, height: 24, opacity: 0 });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const retryButtonRef = useRef<HTMLButtonElement>(null);

  const speakText = useCallback((text: string) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2; 
      window.speechSynthesis.speak(utterance);
  }, []);

  const triggerTTS = useCallback((index: number) => {
      if (settings.ttsMode === 'OFF') return;
      const words = quote.text.split(' ');
      if (settings.ttsMode === 'QUOTE') { if (index === 0) speakText(quote.text); return; }
      let textToSpeak = '';
      if (settings.ttsMode === 'WORD') textToSpeak = words[index] || '';
      else if (settings.ttsMode === 'FLOW') textToSpeak = `${words[index] || ''} ${words[index + 1] || ''}`;
      else if (settings.ttsMode === 'NEXT') textToSpeak = words[index + 1] || '';
      else if (settings.ttsMode === 'SCOUT') textToSpeak = words[index + 2] || '';
      if (textToSpeak.trim()) speakText(textToSpeak);
  }, [quote.text, settings.ttsMode, speakText]);

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
    if (isFocused || autoFocus) {
        setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [quote, remediationRemaining, isWordDrilling]);

  useEffect(() => {
    if (status === GameStatus.COMPLETED) setTimeout(() => nextButtonRef.current?.focus(), 50);
    else if (status === GameStatus.FAILED) setTimeout(() => retryButtonRef.current?.focus(), 50);
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
    onComplete(Math.floor(xp), wpm, sessionMistakeWords, retryCount);
  }, [onComplete, wpm, quote.text.length, streak, retryCount, sessionMistakes, sessionMistakeWords, settings.readAheadLevel]);

  useEffect(() => {
    const checkCapsLock = (e: KeyboardEvent | MouseEvent) => {
      if (e.getModifierState) setCapsLock(e.getModifierState('CapsLock'));
    };
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Shift') setIsShiftPressed(true); };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'Shift') setIsShiftPressed(false); };
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
        if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); handleNext(); }
        return;
      }
      if (status === GameStatus.FAILED) {
        if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); handleRetry(); }
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
        let left = 0; let top = 0; let height = 0;
        if (input.length < quote.text.length) {
            targetEl = textContainerRef.current.querySelector(`[data-index="${input.length}"]`);
            if (targetEl) { left = targetEl.offsetLeft; top = targetEl.offsetTop; height = targetEl.offsetHeight; }
        } else {
            targetEl = textContainerRef.current.querySelector(`[data-index="${input.length - 1}"]`);
            if (targetEl) { left = targetEl.offsetLeft + targetEl.offsetWidth; top = targetEl.offsetTop; height = targetEl.offsetHeight; }
        }
        if (input.length === 0 && quote.text.length > 0) {
             const firstEl = textContainerRef.current.querySelector(`[data-index="0"]`) as HTMLElement;
             if (firstEl) { left = firstEl.offsetLeft; top = firstEl.offsetTop; height = firstEl.offsetHeight; }
        }
        setCaretPos({ left, top, height: height || 32, opacity: isFocused && status !== GameStatus.COMPLETED && status !== GameStatus.FAILED ? 1 : 0 });
    };
    updateCaret();
    window.addEventListener('resize', updateCaret);
    return () => window.removeEventListener('resize', updateCaret);
  }, [input, quote, isFocused, status, settings.readAheadLevel]);

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
            setGhostIndex((ghostWpm * 5) * elapsedMins);
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
      setStartTime(now); setStatus(GameStatus.PLAYING); wordStartTimeRef.current = now;
    }
    if (val.length > prevLen) soundEngine.playKeypress();
    
    // Check for correct progression
    if (val.length > 0) {
      if (!quote.text.startsWith(val)) {
        soundEngine.playError();
        const mistakeIndex = val.length - 1;
        const wordStart = quote.text.lastIndexOf(' ', mistakeIndex) + 1;
        let wordEnd = quote.text.indexOf(' ', mistakeIndex);
        if (wordEnd === -1) wordEnd = quote.text.length;
        const expectedWord = quote.text.substring(wordStart, wordEnd);
        const typedWordPart = val.substring(wordStart);
        const cleanWord = expectedWord.replace(/[.,;!?]/g, '').toLowerCase();
        setLastError({ expectedChar: quote.text[mistakeIndex], typedChar: val[mistakeIndex], index: mistakeIndex, expectedWord, typedWordPart });
        if (onWordComplete) onWordComplete({ word: cleanWord.replace(/[^a-z]/g, ''), wpm: 0, isCorrect: false });
        onMistake(cleanWord, quote.text[mistakeIndex], val[mistakeIndex]);
        setSessionMistakes(prev => prev + 1);
        if (cleanWord && !sessionMistakeWords.includes(cleanWord)) setSessionMistakeWords(prev => [...prev, cleanWord]);
        setStatus(GameStatus.FAILED);
        onFail(cleanWord);
        return;
      }
    }

    // Word Progression Timing
    if (val.endsWith(' ') && !input.endsWith(' ')) {
        const words = quote.text.split(' ');
        const finishedWord = words[currentWordIndexRef.current];
        if (finishedWord && wordStartTimeRef.current) {
            const wordDurationSec = (now - wordStartTimeRef.current) / 1000;
            const wordWpm = Math.round((finishedWord.length / 5) / (wordDurationSec / 60));
            if (onWordComplete) onWordComplete({ word: finishedWord.toLowerCase().replace(/[^a-z]/g, ''), wpm: wordWpm, isCorrect: true });
        }
        currentWordIndexRef.current += 1;
        wordStartTimeRef.current = now;
        triggerTTS(val.trim().split(' ').length);
    }

    setInput(val);

    if (val.length === quote.text.length) {
      setEndTime(now);
      if (val === quote.text) {
        soundEngine.playSuccess(); 
        setStatus(GameStatus.COMPLETED);
        const durationMins = (now - (startTime || now)) / 60000;
        setWpm(Math.round((quote.text.length / 5) / (durationMins || 1)));
      } else {
        soundEngine.playError();
        setStatus(GameStatus.FAILED);
        onFail();
      }
    }
  };

  const currentWordTypedCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const isPerfectMasterPotential = retryCount === 0 && sessionMistakes === 0;

  const renderText = () => {
    return quote.text.split('').map((char, index) => {
      let colorClass = status === GameStatus.FAILED ? 'text-red-300' : 'text-stone-300'; 
      if (index < input.length) {
        colorClass = input[index] === char ? 'text-frog-green' : 'text-red-500 bg-red-100'; 
      }
      const isGhostHere = settings.ghostEnabled && Math.floor(ghostIndex) === index;
      return (
        <span key={index} data-index={index} className="relative">
            {isGhostHere && <span className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-purple-400/50 z-20 animate-pulse"><span className="absolute -top-4 -left-2 text-[10px] text-purple-400 opacity-70">👻</span></span>}
            <span className={`${colorClass} transition-colors duration-100`}>{char}</span>
        </span>
      );
    });
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto min-h-[400px] flex flex-col">
      {(isPerfectMasterPotential || isWordDrilling) && status === GameStatus.PLAYING && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-xs font-bold text-frog-green">
          <div className="flex items-center gap-1 animate-pulse">
            {isWordDrilling ? <Zap className="w-4 h-4 text-purple-500 fill-purple-500" /> : <Sparkles className="w-3 h-3" />} 
            {isWordDrilling ? "MASTERY DRILL ACTIVE" : "Perfect Master Potential (1.5x Bonus)"}
          </div>
          {isWordDrilling && (
            <div className="w-48 h-1.5 bg-stone-200 rounded-full overflow-hidden shadow-inner border border-stone-300">
               {/* Updated with DRILL_REPS constant instead of hardcoded 30 */}
               <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${(currentWordTypedCount / DRILL_REPS) * 100}%` }}></div>
            </div>
          )}
        </div>
      )}

      <div className={`
        relative flex-grow flex flex-col justify-center p-8 md:p-16 rounded-[3rem] transition-all duration-300 border
        ${status === GameStatus.FAILED ? 'bg-red-50 border-red-200 ring-2 ring-red-500' : isWordDrilling ? 'bg-purple-50/30 border-purple-200 ring-1 ring-purple-100' : 'bg-stone-50 border-stone-200'}
        ${isFocused && status !== GameStatus.FAILED && status !== GameStatus.COMPLETED ? 'ring-2 ring-frog-green/50 ring-offset-2 ring-offset-bg-body' : ''}
      `}>
        {!isFocused && status !== GameStatus.COMPLETED && status !== GameStatus.FAILED && (
          <div onClick={() => inputRef.current?.focus()} className="absolute inset-0 z-50 flex items-center justify-center bg-stone-900/5 backdrop-blur-sm cursor-pointer rounded-[3rem] border-2 border-dashed border-frog-green/30 hover:border-frog-green transition-all">
            <div className="text-center animate-bounce text-frog-green">
              <Play className="w-10 h-10 mx-auto mb-2" fill="currentColor" />
              <span className="font-bold text-base tracking-wide uppercase">Click or Type to Start</span>
            </div>
          </div>
        )}
        
        {status === GameStatus.COMPLETED && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-stone-900/10 backdrop-blur-sm rounded-[3rem] cursor-pointer" onClick={handleNext}>
             <div className="bg-white p-8 rounded-3xl shadow-2xl border border-stone-200 animate-in zoom-in-95 fade-in duration-300 flex flex-col items-center gap-6 min-w-[300px] cursor-default" onClick={(e) => e.stopPropagation()}>
                <div className={`${isWordDrilling ? 'text-purple-600' : remediationRemaining > 0 ? 'text-orange-500' : 'text-frog-green'} font-black text-2xl tracking-tight flex items-center gap-3`}>
                   {isWordDrilling ? <Zap className="w-7 h-7 fill-purple-600"/> : <Award className="w-7 h-7" />} {isWordDrilling ? 'Phase 1 Clear!' : remediationRemaining > 0 ? 'Phase 2 Success' : 'Quote Complete!'}
                </div>
                <div className="grid grid-cols-2 gap-8 w-full border-y border-stone-100 py-4">
                   <div className="text-center"><span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Speed</span><span className="font-mono font-bold text-2xl text-stone-800">{wpm} WPM</span></div>
                   <div className="text-center"><span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">XP Gain</span><span className="font-mono font-bold text-2xl text-frog-green">+{isWordDrilling || remediationRemaining > 0 ? '5' : '??'}</span></div>
                </div>
                <button ref={nextButtonRef} onClick={handleNext} className={`flex items-center gap-2 px-10 py-3.5 rounded-full transition shadow-lg font-bold text-sm tracking-wide uppercase transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full justify-center ${isWordDrilling ? 'bg-purple-600 text-white' : remediationRemaining > 0 ? 'bg-orange-500 text-white' : 'bg-frog-green text-white'}`}>
                   {/* Using QUOTE_REMEDIATION_REPS constant */}
                   {isWordDrilling ? `Start Phase 2: Quote (0/${QUOTE_REMEDIATION_REPS})` : remediationRemaining > 1 ? `Next Repetition (${QUOTE_REMEDIATION_REPS - remediationRemaining + 1}/${QUOTE_REMEDIATION_REPS})` : 'Mastery Complete'} <ArrowRight className="w-5 h-5" />
                </button>
             </div>
          </div>
        )}

        {status === GameStatus.FAILED && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-stone-900/10 backdrop-blur-sm rounded-[3rem] cursor-pointer" onClick={handleRetry}>
             <div className="bg-white p-7 rounded-3xl shadow-2xl border border-red-100 animate-in zoom-in-95 fade-in duration-300 flex flex-col items-center gap-5 min-w-[280px] cursor-default" onClick={(e) => e.stopPropagation()}>
                <div className="text-red-500 font-black text-xl tracking-tight flex items-center gap-2"><XCircle className="w-6 h-6" /> Attempt Failed</div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center w-full">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">In-a-Row Rule</p>
                    <p className="text-xs text-red-700 font-medium">Mistake detected! Phase reset to zero. Focus on accuracy.</p>
                </div>
                <button ref={retryButtonRef} onClick={handleRetry} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 text-white hover:bg-red-700 rounded-2xl transition shadow-lg font-bold text-xs tracking-wide uppercase">
                  <RotateCcw className="w-4 h-4" /> Start Over
                </button>
             </div>
          </div>
        )}

        <div className="absolute top-5 left-0 right-0 flex justify-center gap-3 z-30 select-none pointer-events-none">
            {capsLock && <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold border border-orange-200 shadow-sm animate-pulse"><Lock className="w-3 h-3" /> CAPS LOCK</div>}
            {/* Using DRILL_REPS constant */}
            {isWordDrilling && status === GameStatus.PLAYING && <div className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full text-xs font-black tracking-widest border border-purple-700 shadow-lg ring-4 ring-white"><Zap className="w-4 h-4" /> DRILL PROGRESS: {currentWordTypedCount}/{DRILL_REPS}</div>}
            {/* Using QUOTE_REMEDIATION_REPS constant */}
            {remediationRemaining > 0 && !isWordDrilling && status === GameStatus.PLAYING && <div className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full text-xs font-black tracking-widest border border-orange-600 shadow-lg ring-4 ring-white"><RefreshCcw className="w-4 h-4 animate-spin-slow" /> QUOTE MASTERY: {QUOTE_REMEDIATION_REPS - remediationRemaining + 1}/{QUOTE_REMEDIATION_REPS}</div>}
        </div>

        <div className="absolute top-12 left-0 right-0 px-10 md:px-20 flex justify-between text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] select-none font-sans z-10 text-stone-500">
          <span>{quote.source}</span>
          <span className="text-right max-w-[250px] truncate">{quote.author}</span>
        </div>

        <div ref={textContainerRef} className={`font-mono tracking-wide break-words whitespace-pre-wrap mb-10 mt-10 relative z-10 outline-none select-none ${isWordDrilling ? 'text-2xl md:text-3xl font-medium' : 'text-xl md:text-2xl'} leading-relaxed`} onClick={() => inputRef.current?.focus()}>
          <div className="absolute bg-frog-green w-[3px] rounded-full transition-all duration-1000 ease-out z-20 pointer-events-none caret-blink shadow-[0_0_10px_rgba(64,214,114,0.5)]"
             style={{ left: caretPos.left - 1, top: caretPos.top + 2, height: caretPos.height - 4, opacity: caretPos.opacity }}
          />
          {renderText()}
        </div>

        <textarea ref={inputRef} value={input} onChange={handleChange} onBlur={() => setIsFocused(false)} onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} onPaste={(e) => e.preventDefault()}
          className="absolute opacity-0 top-0 left-0 h-full w-full cursor-default resize-none" autoFocus disabled={status === GameStatus.COMPLETED || status === GameStatus.FAILED}
        />
      </div>
      
      <div className="text-center mt-8 h-4 text-stone-400 text-xs font-bold tracking-widest uppercase transition-opacity duration-500 font-sans">
        {status === GameStatus.FAILED ? <span className="text-red-500">Mastery Protocol Reset</span> : 
         status === GameStatus.COMPLETED ? <span className="text-frog-green">Accuracy Confirmed</span> :
         isFocused ? (isWordDrilling ? "Phase 1: Zero Mistakes Allowed" : remediationRemaining > 0 ? "Phase 2: Reinforcing Pattern" : "Maintain Rhythm • One Mistake Fails") : ""}
      </div>
    </div>
  );
};

export default TypingArea;
