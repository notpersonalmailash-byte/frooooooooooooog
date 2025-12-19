
import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import ProgressBar from './components/ProgressBar';
import TypingArea from './components/TypingArea';
import SettingsModal from './components/SettingsModal';
import HelpModal from './components/HelpModal';
import StatsModal from './components/StatsModal';
import ThemeModal from './components/ThemeModal';
import AchievementsModal from './components/AchievementsModal';
import AchievementToast from './components/AchievementToast';
import SurvivalGame from './components/SurvivalGame';
import TimeAttackGame from './components/TimeAttackGame';
import CosmicDefenseGame from './components/CosmicDefenseGame';
import BlitzGame from './components/BlitzGame';
import MiniGameMenu from './components/MiniGameMenu';
import { MusicPlayer } from './components/MusicPlayer';
import { Quote, Settings, GameMode, TestResult, NotificationItem, ReadAheadLevel, PracticeWord, AchievementStats, TTSMode, WordPerformance } from './types';
import { fetchQuotes } from './services/quoteService';
import { getCurrentLevel, getNextLevel, getAverageWPM, LEVELS, calculateXP, checkLevelProgress } from './utils/gameLogic';
import { soundEngine } from './utils/soundEngine';
import { Loader2, Settings as SettingsIcon, Music, CircleHelp, Skull, BookOpen, Eraser, TrendingUp, Palette, Award, Radio, Lock, Eye, EyeOff, Flame, AlertTriangle, ArrowRight, Keyboard, ArrowUpCircle, Gamepad2, Brain, RefreshCcw, FileText, User, Leaf, Sparkles, Speech, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { THEMES } from './data/themes';
import { ACHIEVEMENTS } from './data/achievements';
import { RADIO_STATIONS } from './data/radioStations';

const DRILL_BATCH_SIZE = 30;

const App: React.FC = () => {
  // User Stats Persistence
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('frogType_userName') || 'Froggy');
  const [joinDate, setJoinDate] = useState<string>(() => {
      const stored = localStorage.getItem('frogType_joinDate');
      if (stored) return stored;
      const now = new Date().toISOString();
      localStorage.setItem('frogType_joinDate', now);
      return now;
  });
  const [totalTimePlayed, setTotalTimePlayed] = useState<number>(() => {
      const stored = localStorage.getItem('frogType_totalTime');
      return stored ? parseInt(stored, 10) : 0;
  });
  const [userXP, setUserXP] = useState<number>(() => {
    const saved = localStorage.getItem('frogXP');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const currentLevel = getCurrentLevel(userXP);
  const [unlockedTiers, setUnlockedTiers] = useState<string[]>(() => {
    const saved = localStorage.getItem('frogType_unlockedTiers');
    return saved ? JSON.parse(saved) : [];
  });

  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('frogType_streak');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [dailyStreak, setDailyStreak] = useState<number>(() => {
     const saved = localStorage.getItem('frogType_dailyStreak');
     return saved ? parseInt(saved, 10) : 0;
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    const saved = localStorage.getItem('frogType_achievements');
    return saved ? JSON.parse(saved) : [];
  });
  const [practiceLevel, setPracticeLevel] = useState<number>(() => parseInt(localStorage.getItem('frogType_practiceLevel') || '0', 10));
  const [smartPracticeQueue, setSmartPracticeQueue] = useState<PracticeWord[]>(() => {
      const saved = localStorage.getItem('frogType_smartQueue');
      return saved ? JSON.parse(saved) : [];
  });
  const [failedQuoteRepetitions, setFailedQuoteRepetitions] = useState<Record<string, number>>(() => {
      const saved = localStorage.getItem('frogType_remediations');
      return saved ? JSON.parse(saved) : {};
  });

  // --- REMEDIATION STATE ---
  const [remediationRemaining, setRemediationRemaining] = useState<number>(0);
  const [drillingWord, setDrillingWord] = useState<string | null>(null);
  const [wordDrillRemaining, setWordDrillRemaining] = useState<number>(0);
  const [remediationQueue, setRemediationQueue] = useState<string[]>([]);
  const [remediationSource, setRemediationSource] = useState<'QUOTE' | 'BLITZ' | null>(null);
  const [totalQueueSize, setTotalQueueSize] = useState<number>(0);

  const [notificationQueue, setNotificationQueue] = useState<NotificationItem[]>([]);
  const [wpmHistory, setWpmHistory] = useState<number[]>(() => {
    const saved = localStorage.getItem('frogType_wpmHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [testHistory, setTestHistory] = useState<TestResult[]>(() => {
    const saved = localStorage.getItem('frogType_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastWpm, setLastWpm] = useState<number>(() => parseInt(localStorage.getItem('frogType_lastWpm') || '0', 10));
  const [mistakePool, setMistakePool] = useState<string[]>(() => {
    const saved = localStorage.getItem('frogType_mistakes');
    return saved ? JSON.parse(saved) : [];
  });
  const [charStats, setCharStats] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('frogType_charStats');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('frogType_settings');
    const parsed = saved ? JSON.parse(saved) : {};
    const mergedSettings: Settings = {
      ghostEnabled: false, 
      readAheadLevel: parsed.readAheadLevel || 'NONE', 
      sfxEnabled: true,
      mechanicalSoundEnabled: false,
      mechanicalSoundPreset: 'THOCK',
      ambientVolume: 0.02, 
      musicConfig: { source: 'NONE', presetId: '' },
      themeId: 'CLASSIC',
      autoStartMusic: true,
      ttsMode: parsed.ttsMode || 'OFF',
      ...parsed
    };
    if (mergedSettings.autoStartMusic && mergedSettings.musicConfig.source === 'NONE') {
        mergedSettings.musicConfig = { source: 'GENERATED', presetId: 'PIANO_SATIE' };
    }
    return mergedSettings;
  });

  const [gameMode, setGameMode] = useState<GameMode>(() => (localStorage.getItem('frogType_gameMode') as GameMode) || 'QUOTES');
  const [isMiniGameMenuOpen, setIsMiniGameMenuOpen] = useState(false);
  const [activeMiniGame, setActiveMiniGame] = useState<string | null>(null);
  const [completedQuotes, setCompletedQuotes] = useState<string[]>(() => {
    const saved = localStorage.getItem('frogType_completedQuotes');
    return saved ? JSON.parse(saved) : [];
  });
  const [quotesQueue, setQuotesQueue] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(() => {
    const saved = localStorage.getItem('frogType_currentQuote');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);
  const [quoteStartTime, setQuoteStartTime] = useState<number | null>(null);
  const isFetchingRef = useRef(false);

  // Persistence
  useEffect(() => { localStorage.setItem('frogXP', userXP.toString()); }, [userXP]);
  useEffect(() => { localStorage.setItem('frogType_unlockedTiers', JSON.stringify(unlockedTiers)); }, [unlockedTiers]);
  useEffect(() => { localStorage.setItem('frogType_streak', streak.toString()); }, [streak]);
  useEffect(() => { localStorage.setItem('frogType_dailyStreak', dailyStreak.toString()); }, [dailyStreak]);
  useEffect(() => { localStorage.setItem('frogType_lastWpm', lastWpm.toString()); }, [lastWpm]);
  useEffect(() => { localStorage.setItem('frogType_wpmHistory', JSON.stringify(wpmHistory)); }, [wpmHistory]);
  useEffect(() => { localStorage.setItem('frogType_history', JSON.stringify(testHistory)); }, [testHistory]);
  useEffect(() => { localStorage.setItem('frogType_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('frogType_mistakes', JSON.stringify(mistakePool)); }, [mistakePool]);
  useEffect(() => { localStorage.setItem('frogType_smartQueue', JSON.stringify(smartPracticeQueue)); }, [smartPracticeQueue]);
  useEffect(() => { localStorage.setItem('frogType_charStats', JSON.stringify(charStats)); }, [charStats]);
  useEffect(() => { localStorage.setItem('frogType_userName', userName); }, [userName]);
  useEffect(() => { localStorage.setItem('frogType_totalTime', totalTimePlayed.toString()); }, [totalTimePlayed]);
  useEffect(() => { localStorage.setItem('frogType_practiceLevel', practiceLevel.toString()); }, [practiceLevel]);
  useEffect(() => { localStorage.setItem('frogType_remediations', JSON.stringify(failedQuoteRepetitions)); }, [failedQuoteRepetitions]);
  useEffect(() => { localStorage.setItem('frogType_gameMode', gameMode); }, [gameMode]);
  useEffect(() => { localStorage.setItem('frogType_completedQuotes', JSON.stringify(completedQuotes)); }, [completedQuotes]);
  useEffect(() => { localStorage.setItem('frogType_achievements', JSON.stringify(unlockedAchievements)); }, [unlockedAchievements]);
  
  useEffect(() => {
    soundEngine.setEnabled(settings.sfxEnabled);
    soundEngine.setMechanicalEnabled(settings.mechanicalSoundEnabled);
    soundEngine.setMechanicalPreset(settings.mechanicalSoundPreset);
    soundEngine.setAmbientVolume(settings.ambientVolume);
    if (settings.musicConfig.source === 'GENERATED') soundEngine.setAmbientMusic(settings.musicConfig.presetId);
    else soundEngine.stopAmbientMusic();
  }, [settings.sfxEnabled, settings.mechanicalSoundEnabled, settings.mechanicalSoundPreset, settings.ambientVolume, settings.musicConfig]);

  useLayoutEffect(() => {
    const theme = THEMES.find(t => t.id === settings.themeId) || THEMES[0];
    const root = document.documentElement;
    root.style.setProperty('--bg-body', theme.colors.background);
    Object.entries(theme.colors.frog).forEach(([key, value]) => root.style.setProperty(`--frog-${key}`, value));
    Object.entries(theme.colors.stone).forEach(([key, value]) => root.style.setProperty(`--stone-${key}`, value));
    root.style.setProperty('--text-body', theme.colors.stone[800]);
  }, [settings.themeId]);

  useEffect(() => {
    if (currentQuote) {
      localStorage.setItem('frogType_currentQuote', JSON.stringify(currentQuote)); 
      setQuoteStartTime(Date.now());
    } else localStorage.removeItem('frogType_currentQuote');
  }, [currentQuote]);

  const handleWordPerformance = useCallback((perf: WordPerformance) => {
      const avgWpm = getAverageWPM(wpmHistory) || 40;
      const slowThreshold = avgWpm * 0.7; // 70% of average is "struggling"
      
      setSmartPracticeQueue(prev => {
          const idx = prev.findIndex(p => p.word === perf.word);
          const isActuallyCorrect = perf.isCorrect && perf.wpm > slowThreshold;
          
          if (idx !== -1) {
              const updated = [...prev];
              if (!isActuallyCorrect) {
                  updated[idx] = { ...updated[idx], proficiency: 0, lastPracticed: Date.now() };
              } else {
                  const newProf = Math.min(3, updated[idx].proficiency + 1);
                  updated[idx] = { ...updated[idx], proficiency: newProf, lastPracticed: Date.now() };
              }
              return updated;
          } else if (!isActuallyCorrect) {
              return [...prev, { word: perf.word, proficiency: 0, lastPracticed: Date.now() }];
          }
          return prev;
      });
  }, [wpmHistory]);

  const loadMoreQuotes = useCallback(async () => {
    if (isFetchingRef.current) return;
    if (gameMode === 'MINIGAMES' || gameMode === 'XWORDS' || gameMode === 'XQUOTES' || gameMode === 'BLITZ') return; 
    isFetchingRef.current = true;
    try {
      const level = getCurrentLevel(userXP);
      const newQuotes = await fetchQuotes(5, completedQuotes, level.name, gameMode, practiceLevel, charStats, smartPracticeQueue);
      setQuotesQueue(prev => [...prev, ...newQuotes]);
    } catch (error) { console.error("Failed to load quotes", error); } 
    finally { isFetchingRef.current = false; }
  }, [completedQuotes, userXP, gameMode, practiceLevel, charStats, smartPracticeQueue]);

  useEffect(() => {
    const init = async () => {
      if (!currentQuote && quotesQueue.length === 0 && !['MINIGAMES', 'XWORDS', 'XQUOTES', 'BLITZ'].includes(gameMode)) {
         setLoading(true); await loadMoreQuotes(); setLoading(false);
      } else if (quotesQueue.length < 3 && !['MINIGAMES', 'XWORDS', 'XQUOTES', 'BLITZ'].includes(gameMode)) loadMoreQuotes();
    };
    init();
  }, [gameMode, currentQuote, quotesQueue.length, loadMoreQuotes]);

  useEffect(() => {
    if (currentQuote || ['MINIGAMES', 'BLITZ'].includes(gameMode)) return;
    if (gameMode === 'XWORDS') {
      const mistakePool = JSON.parse(localStorage.getItem('frogType_mistakes') || '[]');
      if (mistakePool.length > 0) {
          const selected = mistakePool.sort(() => 0.5 - Math.random()).slice(0, 12).join(' ');
          setCurrentQuote({ text: selected, source: "Mastery", author: "Drilling Mistakes" });
      } else setGameMode('QUOTES');
    } else if (gameMode === 'XQUOTES') {
      const keys = Object.keys(failedQuoteRepetitions);
      if (keys.length > 0) {
          const q = keys[0];
          setCurrentQuote({ text: q, source: "Remediation", author: `Retry Required (${failedQuoteRepetitions[q]} left)` });
      } else setGameMode('QUOTES');
    } else if (quotesQueue.length > 0) {
        setCurrentQuote(quotesQueue[0]);
        setQuotesQueue(prev => prev.slice(1));
    }
  }, [currentQuote, quotesQueue, gameMode, failedQuoteRepetitions]);

  const handleXPGain = (amount: number, currentAvgWpm: number) => {
    // Ensure XP gain is a whole number
    let potentialXp = userXP + Math.floor(amount);
    const nextLevelObj = getNextLevel(currentLevel);
    if (nextLevelObj && potentialXp >= nextLevelObj.minXP) {
        const remediationCount = Object.keys(failedQuoteRepetitions).length;
        if (mistakePool.length > 0 || currentAvgWpm < nextLevelObj.requiredWpm || (currentLevel.tier !== nextLevelObj.tier && remediationCount > 0)) {
            potentialXp = nextLevelObj.minXP - 1;
        }
    }
    const newLevel = getCurrentLevel(potentialXp);
    if (newLevel.tier !== currentLevel.tier && potentialXp >= newLevel.minXP) {
          setTimeout(() => {
              confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 }, colors: ['#40D672', '#22c55e', '#fbbf24', '#f59e0b'] });
              soundEngine.playLevelUp(); 
          }, 300);
    }
    setUserXP(Math.floor(potentialXp));
    setStreak(prev => prev + 1);
  };

  const handleQuoteComplete = (xpCalc: number, wpm: number, mistakes: string[], retryCount: number) => {
    const isWordDrilling = wordDrillRemaining > 0;
    const isRemediation = remediationRemaining > 0;
    
    // XP Scaling during remediation - Ensure whole numbers
    const finalXP = (isRemediation || isWordDrilling) ? (remediationRemaining === 1 && !isWordDrilling ? Math.floor(xpCalc * 0.5) : 5) : Math.floor(xpCalc);
    
    handleXPGain(finalXP, getAverageWPM(wpmHistory));
    setWpmHistory(prev => [...prev, wpm].slice(-10));
    setTestHistory(prev => [...prev, { id: Date.now(), date: new Date().toISOString(), wpm, xpEarned: finalXP, mode: gameMode, quoteText: drillingWord || currentQuote?.text || "", mistakes, retryCount }]);
    
    if (isWordDrilling) {
        // Complete the current word and its full 30 reps
        setWordDrillRemaining(0);
        // Check if there are more words in the queue (from Blitz)
        if (remediationQueue.length > 0) {
            const nextWord = remediationQueue[0];
            setRemediationQueue(prev => prev.slice(1));
            setDrillingWord(nextWord);
            setWordDrillRemaining(30);
        } else {
            // If queue empty, finish
            if (remediationSource === 'QUOTE') {
                setRemediationRemaining(3); // Start quote repetitions after word drill
            } else {
                // Blitz source: just end
                setGameMode('QUOTES');
                setCurrentQuote(null);
            }
            setDrillingWord(null);
            setRemediationSource(null);
            setTotalQueueSize(0);
        }
    } else if (isRemediation) {
        const nextRem = remediationRemaining - 1;
        setRemediationRemaining(nextRem);
        if (nextRem === 0) {
            if (currentQuote) setCompletedQuotes(prev => [...prev, currentQuote.text]);
            setCurrentQuote(null);
        }
    } else {
        if (currentQuote && !['XWORDS', 'XQUOTES', 'BLITZ'].includes(gameMode)) setCompletedQuotes(prev => [...prev, currentQuote.text]);
        setLastWpm(wpm);
        setCurrentQuote(null);
    }
    
    setShouldAutoFocus(true);
  };

  const handleFail = (mistakeWord?: string) => {
      setStreak(0);
      // Logic for word drill reset: if already in drill, restart current word (wordDrillRemaining remains 30)
      if (wordDrillRemaining > 0 && drillingWord) {
          setWordDrillRemaining(30);
          soundEngine.playError();
          return;
      }

      if (['QUOTES', 'HARDCORE', 'PRACTICE'].includes(gameMode)) {
          if (mistakeWord) {
              setRemediationSource('QUOTE');
              setDrillingWord(mistakeWord);
              setWordDrillRemaining(30); // 30x word drill
              setTotalQueueSize(1);
          } else {
              setRemediationRemaining(3); // fallback if no word detected
          }
      }
  };

  const handleBlitzComplete = (wpm: number, xp: number, mistakes: string[]) => {
      const finalXp = Math.floor(xp);
      handleXPGain(finalXp, getAverageWPM(wpmHistory));
      setWpmHistory(prev => [...prev, wpm].slice(-10));
      setTestHistory(prev => [...prev, { id: Date.now(), date: new Date().toISOString(), wpm, xpEarned: finalXp, mode: 'BLITZ', quoteText: "Blitz 200 Run", mistakes, retryCount: 0 }]);
      setLastWpm(wpm);

      if (mistakes.length > 0) {
          // Trigger Deep Mastery for Blitz Mistakes
          const uniqueMistakes = Array.from(new Set(mistakes.map(m => m.toLowerCase())));
          setRemediationSource('BLITZ');
          setRemediationQueue(uniqueMistakes.slice(1)); // All but the first
          setDrillingWord(uniqueMistakes[0]);
          setWordDrillRemaining(30);
          setTotalQueueSize(uniqueMistakes.length);
      } else {
          setGameMode('QUOTES');
      }
  };

  const switchMode = useCallback((mode: GameMode) => {
    setShouldAutoFocus(false);
    if (mode === 'MINIGAMES') setIsMiniGameMenuOpen(true);
    else {
        setIsMiniGameMenuOpen(false);
        setActiveMiniGame(null);
        setGameMode(mode);
        setQuotesQueue([]); 
        setCurrentQuote(null); 
        setRemediationRemaining(0);
        setDrillingWord(null);
        setWordDrillRemaining(0);
        setRemediationQueue([]);
        setRemediationSource(null);
        setTotalQueueSize(0);
    }
  }, []);

  const remediationCount = Object.keys(failedQuoteRepetitions).length;
  const avgWpmVal = getAverageWPM(wpmHistory);
  const { isGated, reason } = checkLevelProgress(userXP, avgWpmVal, mistakePool.length, remediationCount);
  const isGatedLocked = isGated && (reason === 'MASTERY' || reason === 'REMEDIATION');

  const queueProgress = totalQueueSize > 0 ? (totalQueueSize - remediationQueue.length) : 0;

  // Prepare the "straight line" drill text by repeating the word 30 times
  const getDrillQuote = () => {
      if (!drillingWord) return null;
      // Show full 30 repetitions in one "straight line"
      const repeatedText = (drillingWord + " ").repeat(DRILL_BATCH_SIZE).trim();
      return {
          text: repeatedText,
          source: "WORD DRILL",
          author: `Remediation (Word ${queueProgress} of ${totalQueueSize})`
      };
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-stone-800 font-sans selection:bg-frog-200">
      <div className="sticky top-0 z-40 flex flex-col shadow-sm transition-all">
          <header className="w-full bg-stone-50/95 backdrop-blur-md border-b border-stone-200 px-6 py-3">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                <h1 className="text-xl font-black text-frog-green tracking-tight flex items-center gap-2 flex-shrink-0">
                  <span className="text-2xl">🐸</span> Frog Type
                </h1>
                <div className="flex gap-1 p-1 bg-stone-100/80 rounded-lg shadow-inner border border-stone-200/50 overflow-x-auto max-w-full">
                  <button onClick={() => switchMode('QUOTES')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${gameMode === 'QUOTES' && !isMiniGameMenuOpen ? 'bg-white text-frog-green shadow-sm ring-1 ring-stone-200' : 'text-stone-400 hover:bg-stone-200/50'}`}>
                      <BookOpen className="w-3.5 h-3.5" /> Quotes
                  </button>
                  <button onClick={() => switchMode('BLITZ')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${gameMode === 'BLITZ' && !isMiniGameMenuOpen ? 'bg-white text-frog-green shadow-sm ring-1 ring-stone-200' : 'text-stone-400 hover:bg-stone-200/50'}`}>
                      <Zap className="w-3.5 h-3.5" /> Blitz
                  </button>
                  <button onClick={() => switchMode('PRACTICE')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${gameMode === 'PRACTICE' && !isMiniGameMenuOpen ? 'bg-white text-frog-green shadow-sm ring-1 ring-stone-200' : 'text-stone-400 hover:bg-stone-200/50'}`}>
                      <FileText className="w-3.5 h-3.5" /> Words
                  </button>
                  <button onClick={() => switchMode('HARDCORE')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${gameMode === 'HARDCORE' && !isMiniGameMenuOpen ? 'bg-stone-800 text-white' : 'text-stone-400 hover:bg-stone-200/50'}`}>
                      <Skull className="w-3.5 h-3.5" /> Hardcore
                  </button>
                  <button onClick={() => switchMode('MINIGAMES')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${isMiniGameMenuOpen ? 'bg-purple-100 text-purple-600' : 'text-stone-400 hover:bg-stone-200/50'}`}>
                      <Gamepad2 className="w-3.5 h-3.5" /> Arcade
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                   <button onClick={() => setIsMusicOpen(!isMusicOpen)} className={`p-2 rounded-full transition-colors ${settings.musicConfig.source !== 'NONE' ? 'text-frog-green' : 'text-stone-400'}`}><Music className="w-5 h-5" /></button>
                   <button onClick={() => setIsStatsOpen(true)} className="p-2 text-stone-400 hover:text-stone-600"><User className="w-5 h-5" /></button>
                   <button onClick={() => setIsThemeOpen(true)} className="p-2 text-stone-400 hover:text-stone-600"><Palette className="w-5 h-5" /></button>
                   <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-stone-400 hover:text-stone-600"><SettingsIcon className="w-5 h-5" /></button>
              </div>
            </div>
          </header>
      </div>
      
      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 w-full relative pb-32">
        {isGatedLocked && gameMode !== 'XWORDS' && gameMode !== 'XQUOTES' ? (
              <div className="mb-8 w-full max-w-2xl bg-white/80 backdrop-blur-xl border-4 border-frog-100 p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center gap-6 z-50">
                  <div className="p-5 bg-white rounded-full text-frog-500 shadow-lg ring-4 ring-frog-50"><Lock className="w-8 h-8" /></div>
                  <h3 className="text-3xl font-black text-frog-800 tracking-tight">Mastery Required</h3>
                  <p className="text-stone-500 font-medium text-lg max-w-md">Drill your mistakes before advancing.</p>
                  <div className="flex gap-4 w-full">
                      <button onClick={() => switchMode('XWORDS')} className="flex-1 px-6 py-4 bg-frog-green text-white font-black rounded-2xl flex items-center justify-center gap-2"><Eraser className="w-5 h-5" /> Drill Words</button>
                      <button onClick={() => switchMode('XQUOTES')} className="flex-1 px-6 py-4 bg-stone-600 text-white font-black rounded-2xl flex items-center justify-center gap-2"><RefreshCcw className="w-5 h-5" /> Retry Quotes</button>
                  </div>
              </div>
        ) : (
            <>
                {isMiniGameMenuOpen ? <MiniGameMenu onSelect={(id) => { setActiveMiniGame(id); setIsMiniGameMenuOpen(false); }} onBack={() => setIsMiniGameMenuOpen(false)} /> :
                 activeMiniGame ? (activeMiniGame === 'SURVIVAL_SWAMP' ? <SurvivalGame variant="SWAMP" onGameOver={handleXPGain} onExit={() => setActiveMiniGame(null)} /> : 
                                   activeMiniGame === 'SURVIVAL_ZOMBIE' ? <SurvivalGame variant="ZOMBIE" onGameOver={handleXPGain} onExit={() => setActiveMiniGame(null)} /> :
                                   activeMiniGame === 'COSMIC_DEFENSE' ? <CosmicDefenseGame onGameOver={(s, x, w) => handleXPGain(x, avgWpmVal)} onExit={() => setActiveMiniGame(null)} /> :
                                   activeMiniGame === 'TIME_ATTACK' ? <TimeAttackGame onGameOver={(s, x) => handleXPGain(x, avgWpmVal)} onExit={() => setActiveMiniGame(null)} /> : null) :
                 gameMode === 'BLITZ' && !drillingWord ? <BlitzGame smartQueue={smartPracticeQueue} onGameOver={handleBlitzComplete} onWordPerformance={handleWordPerformance} onExit={() => setGameMode('QUOTES')} /> :
                 drillingWord || currentQuote ? <TypingArea quote={drillingWord ? getDrillQuote()! : currentQuote!} onComplete={handleQuoteComplete} onFail={handleFail} onMistake={() => {}} onWordComplete={handleWordPerformance} onRequestNewQuote={() => { setCurrentQuote(null); setRemediationRemaining(0); setDrillingWord(null); setRemediationQueue([]); setTotalQueueSize(0); }} streak={streak} ghostWpm={avgWpmVal} settings={settings} gameMode={gameMode} autoFocus={shouldAutoFocus} remediationRemaining={remediationRemaining} wordDrillRemaining={wordDrillRemaining} /> :
                 <div className="flex flex-col items-center text-stone-400"><Loader2 className="w-10 h-10 animate-spin mb-4 text-frog-green" /><p className="font-mono text-xs">Hatching wisdom...</p></div>}
            </>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-body)] border-t border-stone-200/50 px-6 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <div className="max-w-[1400px] mx-auto"><ProgressBar xp={userXP} avgWpm={avgWpmVal} mistakeCount={mistakePool.length} remediationCount={remediationCount} /></div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} setSettings={setSettings} />
      <ThemeModal isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} currentThemeId={settings.themeId} setThemeId={(id) => setSettings({ ...settings, themeId: id })} currentLevel={currentLevel} allLevels={LEVELS} />
      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} avgWpm={avgWpmVal} history={testHistory} onPractice={() => switchMode('XWORDS')} totalTime={totalTimePlayed} joinDate={joinDate} streak={dailyStreak} userName={userName} setUserName={setUserName} completedTestsCount={testHistory.length} userXP={userXP} />
      <MusicPlayer isOpen={isMusicOpen} onClose={() => setIsMusicOpen(false)} settings={settings} setSettings={setSettings} userXP={userXP} />
    </div>
  );
};

export default App;
