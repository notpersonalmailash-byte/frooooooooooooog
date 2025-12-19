
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

const DRILL_REPS = 30;
const QUOTE_REMEDIATION_REPS = 3;

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
  const [remediationQuoteText, setRemediationQuoteText] = useState<string | null>(null);

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
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);
  const isFetchingRef = useRef(false);

  // Persistence
  useEffect(() => { localStorage.setItem('frogXP', userXP.toString()); }, [userXP]);
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
    } else localStorage.removeItem('frogType_currentQuote');
  }, [currentQuote]);

  const handleWordPerformance = useCallback((perf: WordPerformance) => {
      const avgWpm = getAverageWPM(wpmHistory) || 40;
      const slowThreshold = avgWpm * 0.7; 
      setSmartPracticeQueue(prev => {
          const idx = prev.findIndex(p => p.word === perf.word);
          const isActuallyCorrect = perf.isCorrect && perf.wpm > slowThreshold;
          if (idx !== -1) {
              const updated = [...prev];
              if (!isActuallyCorrect) updated[idx] = { ...updated[idx], proficiency: 0, lastPracticed: Date.now() };
              else updated[idx] = { ...updated[idx], proficiency: Math.min(3, updated[idx].proficiency + 1), lastPracticed: Date.now() };
              return updated;
          } else if (!isActuallyCorrect) return [...prev, { word: perf.word, proficiency: 0, lastPracticed: Date.now() }];
          return prev;
      });
  }, [wpmHistory]);

  const loadMoreQuotes = useCallback(async () => {
    if (isFetchingRef.current) return;
    if (['MINIGAMES', 'XWORDS', 'XQUOTES', 'BLITZ'].includes(gameMode)) return; 
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
    if (currentQuote || ['MINIGAMES', 'BLITZ'].includes(gameMode) || drillingWord || remediationRemaining > 0) return;
    if (gameMode === 'XWORDS') {
      const pool = JSON.parse(localStorage.getItem('frogType_mistakes') || '[]');
      if (pool.length > 0) {
          const selected = pool.sort(() => 0.5 - Math.random()).slice(0, 12).join(' ');
          setCurrentQuote({ text: selected, source: "Mastery", author: "Drilling Mistakes" });
      } else setGameMode('QUOTES');
    } else if (gameMode === 'XQUOTES') {
      const keys = Object.keys(failedQuoteRepetitions);
      if (keys.length > 0) {
          setCurrentQuote({ text: keys[0], source: "Remediation", author: `Retry Required` });
      } else setGameMode('QUOTES');
    } else if (quotesQueue.length > 0) {
        setCurrentQuote(quotesQueue[0]);
        setQuotesQueue(prev => prev.slice(1));
    }
  }, [currentQuote, quotesQueue, gameMode, failedQuoteRepetitions, drillingWord, remediationRemaining]);

  const handleXPGain = (amount: number, currentAvgWpm: number) => {
    let potentialXp = userXP + Math.floor(amount);
    const nextLevelObj = getNextLevel(currentLevel);
    if (nextLevelObj && potentialXp >= nextLevelObj.minXP) {
        if (mistakePool.length > 0 || currentAvgWpm < nextLevelObj.requiredWpm) potentialXp = nextLevelObj.minXP - 1;
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
    const isDrill = drillingWord !== null;
    const isRem = remediationRemaining > 0;
    const finalXP = (isDrill || isRem) ? 5 : Math.floor(xpCalc);
    
    handleXPGain(finalXP, getAverageWPM(wpmHistory));
    setWpmHistory(prev => [...prev, wpm].slice(-10));
    setTestHistory(prev => [...prev, { id: Date.now(), date: new Date().toISOString(), wpm, xpEarned: finalXP, mode: gameMode, quoteText: isDrill ? "Mastery Drill" : currentQuote?.text || "", mistakes, retryCount }]);
    
    if (isDrill) {
        setDrillingWord(null);
        setRemediationRemaining(QUOTE_REMEDIATION_REPS);
        if (remediationQuoteText) {
            setCurrentQuote({ text: remediationQuoteText, source: "REMEDIATION", author: "Phase 2: Quote Accuracy" });
        }
    } else if (isRem) {
        const nextRem = remediationRemaining - 1;
        setRemediationRemaining(nextRem);
        if (nextRem === 0) {
            setRemediationQuoteText(null);
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
      if (['QUOTES', 'HARDCORE', 'PRACTICE'].includes(gameMode)) {
          if (!drillingWord && remediationRemaining === 0) {
              // Initial failure: Store quote, start 30 word reps
              if (mistakeWord) {
                  setRemediationQuoteText(currentQuote?.text || null);
                  setDrillingWord(mistakeWord);
              } else {
                  setRemediationRemaining(QUOTE_REMEDIATION_REPS);
              }
          } else if (remediationRemaining > 0) {
              // Failed during 3x quote phase: Reset remediation count to force "3 in a row"
              setRemediationRemaining(QUOTE_REMEDIATION_REPS);
          }
      }
  };

  const handleBlitzComplete = (wpm: number, xp: number, mistakes: string[]) => {
      handleXPGain(Math.floor(xp), getAverageWPM(wpmHistory));
      setWpmHistory(prev => [...prev, wpm].slice(-10));
      setTestHistory(prev => [...prev, { id: Date.now(), date: new Date().toISOString(), wpm, xpEarned: Math.floor(xp), mode: 'BLITZ', quoteText: "Blitz Run", mistakes, retryCount: 0 }]);
      setLastWpm(wpm);
      setGameMode('QUOTES');
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
        setRemediationQuoteText(null);
    }
  }, []);

  const getDrillQuote = () => {
      if (!drillingWord) return null;
      // Normal straight line: Word repeated 30 times with spaces, including a final trailing space
      return {
          text: (drillingWord + " ").repeat(DRILL_REPS),
          source: "MASTERY DRILL",
          author: `Master missed word: ${drillingWord}`
      };
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-stone-800 font-sans selection:bg-frog-200">
      <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 px-6 py-3">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <h1 className="text-xl font-black text-frog-green tracking-tight flex items-center gap-2 flex-shrink-0">🐸 Frog Type</h1>
          <div className="flex gap-1 p-1 bg-stone-100/80 rounded-lg border border-stone-200/50 overflow-x-auto">
            <button onClick={() => switchMode('QUOTES')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${gameMode === 'QUOTES' && !isMiniGameMenuOpen ? 'bg-white text-frog-green shadow-sm' : 'text-stone-400'}`}>Quotes</button>
            <button onClick={() => switchMode('BLITZ')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${gameMode === 'BLITZ' && !isMiniGameMenuOpen ? 'bg-white text-frog-green shadow-sm' : 'text-stone-400'}`}>Blitz</button>
            <button onClick={() => switchMode('PRACTICE')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${gameMode === 'PRACTICE' && !isMiniGameMenuOpen ? 'bg-white text-frog-green shadow-sm' : 'text-stone-400'}`}>Words</button>
            <button onClick={() => switchMode('HARDCORE')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${gameMode === 'HARDCORE' && !isMiniGameMenuOpen ? 'bg-stone-800 text-white' : 'text-stone-400'}`}>Hardcore</button>
            <button onClick={() => switchMode('MINIGAMES')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isMiniGameMenuOpen ? 'bg-purple-100 text-purple-600' : 'text-stone-400'}`}>Arcade</button>
          </div>
          <div className="flex gap-2 shrink-0">
             <button onClick={() => setIsMusicOpen(!isMusicOpen)} className="p-2 text-stone-400"><Music className="w-5 h-5"/></button>
             <button onClick={() => setIsStatsOpen(true)} className="p-2 text-stone-400"><User className="w-5 h-5"/></button>
             <button onClick={() => setIsThemeOpen(true)} className="p-2 text-stone-400"><Palette className="w-5 h-5"/></button>
             <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-stone-400"><SettingsIcon className="w-5 h-5"/></button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 w-full pb-32">
        {isMiniGameMenuOpen ? <MiniGameMenu onSelect={(id) => { setActiveMiniGame(id); setIsMiniGameMenuOpen(false); }} onBack={() => setIsMiniGameMenuOpen(false)} /> :
         activeMiniGame ? (activeMiniGame === 'SURVIVAL_SWAMP' ? <SurvivalGame variant="SWAMP" onGameOver={handleXPGain} onExit={() => setActiveMiniGame(null)} /> : 
                           activeMiniGame === 'SURVIVAL_ZOMBIE' ? <SurvivalGame variant="ZOMBIE" onGameOver={handleXPGain} onExit={() => setActiveMiniGame(null)} /> :
                           activeMiniGame === 'COSMIC_DEFENSE' ? <CosmicDefenseGame onGameOver={(s, x) => handleXPGain(x, getAverageWPM(wpmHistory))} onExit={() => setActiveMiniGame(null)} /> :
                           activeMiniGame === 'TIME_ATTACK' ? <TimeAttackGame onGameOver={(s, x) => handleXPGain(x, getAverageWPM(wpmHistory))} onExit={() => setActiveMiniGame(null)} /> : null) :
         gameMode === 'BLITZ' && !drillingWord ? <BlitzGame smartQueue={smartPracticeQueue} onGameOver={handleBlitzComplete} onWordPerformance={handleWordPerformance} onExit={() => setGameMode('QUOTES')} /> :
         drillingWord || remediationRemaining > 0 || currentQuote ? <TypingArea quote={drillingWord ? getDrillQuote()! : currentQuote!} onComplete={handleQuoteComplete} onFail={handleFail} onMistake={() => {}} onWordComplete={handleWordPerformance} onRequestNewQuote={() => { setCurrentQuote(null); setRemediationRemaining(0); setDrillingWord(null); setRemediationQuoteText(null); }} streak={streak} ghostWpm={getAverageWPM(wpmHistory)} settings={settings} gameMode={gameMode} autoFocus={shouldAutoFocus} remediationRemaining={remediationRemaining} isWordDrilling={!!drillingWord} /> :
         <div className="flex flex-col items-center text-stone-400"><Loader2 className="w-10 h-10 animate-spin mb-4 text-frog-green" /><p className="font-mono text-xs">Hatching wisdom...</p></div>}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-body)] border-t border-stone-200/50 px-6 py-2 shadow-sm">
           <div className="max-w-[1400px] mx-auto"><ProgressBar xp={userXP} avgWpm={getAverageWPM(wpmHistory)} mistakeCount={mistakePool.length} remediationCount={Object.keys(failedQuoteRepetitions).length} /></div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} setSettings={setSettings} />
      <ThemeModal isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} currentThemeId={settings.themeId} setThemeId={(id) => setSettings({ ...settings, themeId: id })} currentLevel={currentLevel} allLevels={LEVELS} />
      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} avgWpm={getAverageWPM(wpmHistory)} history={testHistory} onPractice={() => switchMode('XWORDS')} totalTime={totalTimePlayed} joinDate={joinDate} streak={dailyStreak} userName={userName} setUserName={setUserName} completedTestsCount={testHistory.length} userXP={userXP} />
      <MusicPlayer isOpen={isMusicOpen} onClose={() => setIsMusicOpen(false)} settings={settings} setSettings={setSettings} userXP={userXP} />
    </div>
  );
};

export default App;
