import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Quote, GameMode, Settings, TestResult, AchievementStats, NotificationItem, 
  PracticeWord, Level, Theme 
} from './types';
import { 
  LEVELS, getCurrentLevel, getNextLevel, calculateXP, getAverageWPM, checkLevelProgress 
} from './utils/gameLogic';
import { fetchQuotes } from './services/quoteService';
import { THEMES } from './data/themes';
import { ACHIEVEMENTS } from './data/achievements';
import { RADIO_STATIONS } from './data/radioStations';
import { soundEngine } from './utils/soundEngine';
import TypingArea from './components/TypingArea';
import ProgressBar from './components/ProgressBar';
import SettingsModal from './components/SettingsModal';
import { MusicPlayer } from './components/MusicPlayer';
import StatsModal from './components/StatsModal';
import ThemeModal from './components/ThemeModal';
import AchievementsModal from './components/AchievementsModal';
import HelpModal from './components/HelpModal';
import StoryConfigModal from './components/StoryConfigModal';
import PracticeProgress from './components/PracticeProgress';
import SurvivalGame from './components/SurvivalGame';
import TimeAttackGame from './components/TimeAttackGame';
import CosmicDefenseGame from './components/CosmicDefenseGame';
import MiniGameMenu from './components/MiniGameMenu';
import AchievementToast from './components/AchievementToast';
import { 
  Menu, Settings as SettingsIcon, BarChart2, Radio, Palette, HelpCircle, 
  AlertTriangle, RefreshCcw, Skull, Lock, ArrowLeft, Gamepad2, Play, Eraser, 
  Music, BookOpen, Crown 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DEFAULT_SETTINGS: Settings = {
  ghostEnabled: true,
  readAheadLevel: 'NONE',
  sfxEnabled: true,
  mechanicalSoundEnabled: true,
  mechanicalSoundPreset: 'THOCK',
  ambientVolume: 0.5,
  musicConfig: { source: 'NONE', presetId: '' },
  themeId: 'CLASSIC',
  autoStartMusic: false,
};

const App: React.FC = () => {
  // --- STATE ---
  // Core
  const [userXP, setUserXP] = useState<number>(() => parseInt(localStorage.getItem('frogType_xp') || '0', 10));
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('frogType_userName') || 'Froggy');
  const [joinDate] = useState<string>(() => localStorage.getItem('frogType_joinDate') || new Date().toISOString());
  
  // Progression
  const [streak, setStreak] = useState<number>(0);
  const [dailyStreak, setDailyStreak] = useState<number>(() => parseInt(localStorage.getItem('frogType_dailyStreak') || '0', 10));
  const [lastLoginDate, setLastLoginDate] = useState<string>(() => localStorage.getItem('frogType_lastLoginDate') || '');
  const [totalTimePlayed, setTotalTimePlayed] = useState<number>(() => parseInt(localStorage.getItem('frogType_totalTime') || '0', 10));
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => JSON.parse(localStorage.getItem('frogType_achievements') || '[]'));
  const [unlockedTiers, setUnlockedTiers] = useState<string[]>(() => JSON.parse(localStorage.getItem('frogType_unlockedTiers') || '["Egg"]'));
  
  // Game Logic
  const [gameMode, setGameMode] = useState<GameMode>('QUOTES');
  const [activeMiniGame, setActiveMiniGame] = useState<string | null>(null);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [quotesQueue, setQuotesQueue] = useState<Quote[]>([]);
  const [completedQuotes, setCompletedQuotes] = useState<string[]>(() => JSON.parse(localStorage.getItem('frogType_completedQuotes') || '[]'));
  const [wpmHistory, setWpmHistory] = useState<number[]>(() => JSON.parse(localStorage.getItem('frogType_wpmHistory') || '[]'));
  const [testHistory, setTestHistory] = useState<TestResult[]>(() => JSON.parse(localStorage.getItem('frogType_testHistory') || '[]'));
  const [lastWpm, setLastWpm] = useState<number>(0);
  
  // Remediation & Practice
  const [mistakePool, setMistakePool] = useState<string[]>(() => JSON.parse(localStorage.getItem('frogType_mistakePool') || '[]'));
  const [failedQuoteRepetitions, setFailedQuoteRepetitions] = useState<Record<string, number>>(() => JSON.parse(localStorage.getItem('frogType_failedRepetitions') || '{}'));
  const [smartPracticeQueue, setSmartPracticeQueue] = useState<PracticeWord[]>(() => JSON.parse(localStorage.getItem('frogType_smartPractice') || '[]'));
  const [charStats, setCharStats] = useState<Record<string, number>>({}); 
  const [practiceLevel, setPracticeLevel] = useState(0);

  // Settings & UI
  const [settings, setSettings] = useState<Settings>(() => {
      const saved = localStorage.getItem('frogType_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });
  const [notificationQueue, setNotificationQueue] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [quoteStartTime, setQuoteStartTime] = useState<number | null>(null);
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showStoryConfig, setShowStoryConfig] = useState(false);

  // Refs
  const isFetchingRef = useRef(false);

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => { localStorage.setItem('frogType_xp', userXP.toString()); }, [userXP]);
  useEffect(() => { localStorage.setItem('frogType_userName', userName); }, [userName]);
  useEffect(() => { localStorage.setItem('frogType_dailyStreak', dailyStreak.toString()); }, [dailyStreak]);
  useEffect(() => { localStorage.setItem('frogType_lastLoginDate', lastLoginDate); }, [lastLoginDate]);
  useEffect(() => { localStorage.setItem('frogType_totalTime', totalTimePlayed.toString()); }, [totalTimePlayed]);
  useEffect(() => { localStorage.setItem('frogType_achievements', JSON.stringify(unlockedAchievements)); }, [unlockedAchievements]);
  useEffect(() => { localStorage.setItem('frogType_unlockedTiers', JSON.stringify(unlockedTiers)); }, [unlockedTiers]);
  useEffect(() => { localStorage.setItem('frogType_completedQuotes', JSON.stringify(completedQuotes)); }, [completedQuotes]);
  useEffect(() => { localStorage.setItem('frogType_wpmHistory', JSON.stringify(wpmHistory)); }, [wpmHistory]);
  useEffect(() => { localStorage.setItem('frogType_testHistory', JSON.stringify(testHistory)); }, [testHistory]);
  useEffect(() => { localStorage.setItem('frogType_mistakePool', JSON.stringify(mistakePool)); }, [mistakePool]);
  useEffect(() => { localStorage.setItem('frogType_failedRepetitions', JSON.stringify(failedQuoteRepetitions)); }, [failedQuoteRepetitions]);
  useEffect(() => { localStorage.setItem('frogType_smartPractice', JSON.stringify(smartPracticeQueue)); }, [smartPracticeQueue]);
  useEffect(() => { localStorage.setItem('frogType_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { if (!localStorage.getItem('frogType_joinDate')) localStorage.setItem('frogType_joinDate', joinDate); }, [joinDate]);

  // --- AUDIO SETUP ---
  useEffect(() => {
      soundEngine.setAmbientVolume(settings.ambientVolume);
      soundEngine.setMechanicalEnabled(settings.mechanicalSoundEnabled);
      soundEngine.setMechanicalPreset(settings.mechanicalSoundPreset);
      
      // Auto start music if configured
      if (settings.autoStartMusic && settings.musicConfig.source !== 'NONE') {
          soundEngine.setAmbientMusic(settings.musicConfig.source === 'GENERATED' ? settings.musicConfig.presetId : '');
      }
  }, [settings]);

  // --- DAILY STREAK ---
  const updateDailyStreakActivity = useCallback(() => {
      const today = new Date().toDateString();
      if (lastLoginDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastLoginDate === yesterday.toDateString()) {
              setDailyStreak(prev => prev + 1);
          } else {
              setDailyStreak(1);
          }
          setLastLoginDate(today);
      }
  }, [lastLoginDate]);

  // --- QUOTE LOGIC ---
  
  const generateXWordQuote = useCallback((): Quote | null => {
    if (mistakePool.length < 3) return null;
    const count = Math.min(10, mistakePool.length);
    const shuffled = [...mistakePool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    const text = selected.join(" ");
    
    return {
        text,
        source: "Mistake Remediation",
        author: "Your Past Self"
    };
  }, [mistakePool]);

  // Pasting the Logic from the prompt fragment and completing it
  const generateXQuoteQuote = useCallback((): Quote | null => {
      const keys = Object.keys(failedQuoteRepetitions);
      if (keys.length === 0) return null;
      
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const repsLeft = failedQuoteRepetitions[randomKey];
      
      return {
          text: randomKey,
          source: "Remediation",
          author: `Mastery Required: ${repsLeft} in a row`
      };
  }, [failedQuoteRepetitions]);

  const loadMoreQuotes = useCallback(async () => {
    if (isFetchingRef.current) return;
    if (gameMode === 'MINIGAMES' || gameMode === 'XWORDS' || gameMode === 'XQUOTES') return; 
    
    isFetchingRef.current = true;
    
    try {
      const level = getCurrentLevel(userXP);
      
      // 1. Fetch Standard Quotes
      const newQuotes = await fetchQuotes(5, completedQuotes, level.name, gameMode, practiceLevel, charStats, smartPracticeQueue);
      
      setQuotesQueue(prev => [...prev, ...newQuotes]);

    } catch (error) {
      console.error("Failed to load quotes", error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [completedQuotes, userXP, gameMode, practiceLevel, charStats, smartPracticeQueue]);

  useEffect(() => {
    const init = async () => {
      if (!currentQuote && quotesQueue.length === 0 && gameMode !== 'MINIGAMES' && gameMode !== 'XWORDS' && gameMode !== 'XQUOTES') {
         setLoading(true);
         await loadMoreQuotes();
         setLoading(false);
      } else if (quotesQueue.length < 3 && gameMode !== 'MINIGAMES' && gameMode !== 'XWORDS' && gameMode !== 'XQUOTES') {
         loadMoreQuotes();
      }
    };
    init();
  }, [currentQuote, quotesQueue.length, gameMode, loadMoreQuotes]);

  useEffect(() => {
    if (currentQuote || gameMode === 'MINIGAMES') return;

    if (gameMode === 'XWORDS') {
      const mistakeQuote = generateXWordQuote();
      if (mistakeQuote) {
        setCurrentQuote(mistakeQuote);
      } else {
        setGameMode('QUOTES'); 
      }
    } else if (gameMode === 'XQUOTES') {
      const remediationQuote = generateXQuoteQuote();
      if (remediationQuote) {
          setCurrentQuote(remediationQuote);
      } else {
          setGameMode('QUOTES');
      }
    } else {
      if (quotesQueue.length > 0) {
        const next = quotesQueue[0];
        setCurrentQuote(next);
        setQuotesQueue(prev => prev.slice(1));
      }
      
      if (quotesQueue.length < 3) {
        loadMoreQuotes();
      }
    }
  }, [currentQuote, quotesQueue, gameMode, generateXWordQuote, generateXQuoteQuote, loadMoreQuotes]);

  // Enhanced Achievement Checker
  const checkAchievements = (
      wpm: number, 
      arcadeScore: number = 0, 
      arcadeWave: number = 0
  ) => {
    const newNotifications: NotificationItem[] = [];
    const newUnlockIds: string[] = [];

    const stats: AchievementStats = {
       wpm,
       totalQuotes: completedQuotes.length + 1, 
       maxStreak: Math.max(streak + 1, streak + 1), // Using current streak as session max roughly
       currentStreak: streak + 1,
       mode: gameMode,
       dailyStreak: dailyStreak,
       totalTime: totalTimePlayed,
       arcadeScore: arcadeScore,
       arcadeWave: arcadeWave
    };

    ACHIEVEMENTS.forEach(ach => {
       if (!unlockedAchievements.includes(ach.id)) {
           if (ach.condition(stats)) {
               newUnlockIds.push(ach.id);
               newNotifications.push({
                   id: ach.id,
                   title: ach.title,
                   description: ach.description,
                   icon: ach.icon,
                   type: 'ACHIEVEMENT'
               });
           }
       }
    });

    if (newUnlockIds.length > 0) {
       setUnlockedAchievements(prev => [...prev, ...newUnlockIds]);
       setNotificationQueue(prev => [...prev, ...newNotifications]);
       soundEngine.playLevelUp(); 
    }
  };

  const handleXPGain = (xpAmount: number, currentAvgWpm: number) => {
    const currentLevelObj = getCurrentLevel(userXP);
    const nextLevelObj = getNextLevel(currentLevelObj);
    let potentialXp = userXP + xpAmount;
    
    // Pass current remediation count to checkLevelProgress
    const currentRemediationCount = Object.keys(failedQuoteRepetitions).length;

    if (nextLevelObj && potentialXp >= nextLevelObj.minXP) {
         let effectiveMistakeCount = mistakePool.length;
         // Optimization: If finishing XWORDS, subtract fixed words from gating check immediately
         if (gameMode === 'XWORDS' && currentQuote) {
             const wordsFixed = [...new Set(currentQuote.text.split(' '))];
             effectiveMistakeCount = Math.max(0, mistakePool.length - wordsFixed.length);
         }

         const isMasteryGated = effectiveMistakeCount > 0;
         const isSpeedGated = currentAvgWpm < nextLevelObj.requiredWpm;
         
         const isEggInternal = currentLevelObj.tier === 'Egg' && nextLevelObj.tier === 'Egg';
         const isTierJump = currentLevelObj.tier !== nextLevelObj.tier;
         const isRemediationGated = isTierJump && currentRemediationCount > 0;

         if (!isEggInternal && (isMasteryGated || isSpeedGated || isRemediationGated)) {
            potentialXp = nextLevelObj.minXP - 1; 
         }
    }

    const newLevel = getCurrentLevel(potentialXp);
    
    // Check for Tier Unlocks
    if (!unlockedTiers.includes(newLevel.tier)) {
         setUnlockedTiers(prev => [...prev, newLevel.tier]);
         
         const newStations = RADIO_STATIONS.filter(s => s.tier === newLevel.tier);
         
         if (newStations.length > 0) {
             const musicNotifications: NotificationItem[] = newStations.map(s => ({
                id: `unlock_${s.id}`,
                title: 'New Station Unlocked',
                description: s.name,
                icon: <Radio className="w-5 h-5 text-stone-900" />,
                type: 'UNLOCK'
             }));
             setNotificationQueue(prev => [...prev, ...musicNotifications]);
         }
    }

    const prevLevel = getCurrentLevel(userXP);
    if (newLevel.tier !== prevLevel.tier && potentialXp >= newLevel.minXP) {
          setTimeout(() => {
              confetti({
                particleCount: 200,
                spread: 120,
                origin: { y: 0.6 },
                colors: ['#40D672', '#22c55e', '#fbbf24', '#f59e0b'],
                startVelocity: 45
              });
              soundEngine.playLevelUp(); 
          }, 300);
    }

    setUserXP(potentialXp);
    if (gameMode !== 'MINIGAMES') {
        setStreak(prev => prev + 1);
    }
    
    // Update Daily Streak
    updateDailyStreakActivity();
  };

  const handleQuoteComplete = (xpCalc: number, wpm: number, mistakes: string[], retryCount: number) => {
    let finalXp = xpCalc; 
    setShouldAutoFocus(true);

    // Update Time Played
    if (quoteStartTime) {
        const durationSec = Math.floor((Date.now() - quoteStartTime) / 1000);
        setTotalTimePlayed(prev => prev + durationSec);
    }

    if (gameMode === 'HARDCORE') {
      finalXp = finalXp * 5;
    }

    // --- REMEDIATION SUCCESS LOGIC (XQUOTES MODE) ---
    if (gameMode === 'XQUOTES' && currentQuote) {
        const key = currentQuote.text;
        if (failedQuoteRepetitions[key] !== undefined) {
            setFailedQuoteRepetitions(prev => {
                const currentVal = prev[key];
                const newVal = currentVal - 1;
                const newObj = { ...prev };
                
                if (newVal <= 0) {
                    delete newObj[key];
                    setNotificationQueue(prevQ => [...prevQ, {
                        id: `remediate_${Date.now()}`,
                        title: "Redemption!",
                        description: "Failed quote mastered.",
                        icon: <RefreshCcw className="w-5 h-5 text-green-500" />,
                        type: 'INFO'
                    }]);
                } else {
                    newObj[key] = newVal;
                }
                return newObj;
            });
        }
    }

    // --- XWORDS LOGIC ---
    if (gameMode === 'XWORDS' && currentQuote) {
      const wordsFixed = currentQuote.text.split(' '); 
      setMistakePool(prev => {
          const newPool = [...prev];
          wordsFixed.forEach(fixedWord => {
              const idx = newPool.indexOf(fixedWord);
              if (idx > -1) newPool.splice(idx, 1);
          });
          return newPool;
      });
        finalXp = Math.floor(finalXp * 0.5); 
    }

    // --- SMART PRACTICE LOGIC (MASTERY UPDATE) ---
    if (currentQuote) {
        const quoteWords = currentQuote.text.split(/\s+/).map(w => w.replace(/[^a-zA-Z]/g, '').toLowerCase()).filter(w => w.length > 1);
        
        const runMistakes = new Set(mistakes.map(w => w.toLowerCase()));
        
        setSmartPracticeQueue(prevQueue => {
            const newQueue = [...prevQueue];
            let changed = false;

            quoteWords.forEach(qWord => {
                const index = newQueue.findIndex(pw => pw.word === qWord);
                
                if (index !== -1) {
                    if (runMistakes.has(qWord)) {
                        if (newQueue[index].proficiency !== 0) {
                            newQueue[index] = { ...newQueue[index], proficiency: 0, lastPracticed: Date.now() };
                            changed = true;
                        }
                    } else {
                        const newProficiency = newQueue[index].proficiency + 1;
                        if (newProficiency >= 3) {
                            newQueue.splice(index, 1);
                        } else {
                            newQueue[index] = { ...newQueue[index], proficiency: newProficiency, lastPracticed: Date.now() };
                        }
                        changed = true;
                    }
                }
            });
            
            return changed ? newQueue : prevQueue;
        });
    }

    if (currentQuote && gameMode !== 'XWORDS' && gameMode !== 'PRACTICE' && gameMode !== 'XQUOTES') {
       setCompletedQuotes(prev => [...prev, currentQuote.text]);
    }

    // Update History
    const newHistory = [...wpmHistory, wpm].slice(-10); 
    setWpmHistory(newHistory);
    const avgWpm = getAverageWPM(newHistory);

    const newTestResult: TestResult = {
      id: Date.now(),
      date: new Date().toISOString(),
      wpm,
      xpEarned: finalXp,
      mode: gameMode,
      quoteText: currentQuote?.text || "",
      mistakes: mistakes,
      retryCount: retryCount
    };
    setTestHistory(prev => [...prev, newTestResult]);

    checkAchievements(wpm);
    handleXPGain(finalXp, avgWpm);

    setLastWpm(wpm);
    setCurrentQuote(null); 
    setQuoteStartTime(null);
  };

  const handleMiniGameOver = (score: number, xp: number, wave?: number) => {
      const gameName = activeMiniGame === 'SURVIVAL_SWAMP' ? 'Swamp Survival' 
        : activeMiniGame === 'SURVIVAL_ZOMBIE' ? 'Zombie Outbreak'
        : activeMiniGame === 'COSMIC_DEFENSE' ? 'Cosmic Defense'
        : 'Time Attack';

      const newTestResult: TestResult = {
          id: Date.now(),
          date: new Date().toISOString(),
          wpm: 0, 
          xpEarned: xp,
          mode: 'MINIGAMES',
          quoteText: `${gameName} - Score: ${score}${wave ? ` (Wave ${wave})` : ''}`,
          mistakes: [],
          retryCount: 0
      };
      setTestHistory(prev => [...prev, newTestResult]);

      handleXPGain(xp, getAverageWPM(wpmHistory));
      checkAchievements(0, score, wave);

      setNotificationQueue(prev => [...prev, {
          id: `survival_${Date.now()}`,
          title: "Arcade Run Complete",
          description: `Score: ${score} | +${xp} XP`,
          icon: <Skull className="w-5 h-5 text-red-500" />,
          type: 'INFO'
      }]);
      setActiveMiniGame(null);
  };

  const handleQuoteFail = () => {
    const quoteText = currentQuote?.text;

    // --- REMEDIATION TRIGGER (Standard Fail) ---
    if (gameMode === 'QUOTES' && quoteText) {
        setFailedQuoteRepetitions(prev => {
            return { ...prev, [quoteText]: 3 }; 
        });
        
        setNotificationQueue(prev => [...prev, {
            id: `fail_${Date.now()}`,
            title: "Quote Failed",
            description: "Pass 3 times in a row in XQuotes to recover.",
            icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
            type: 'INFO'
        }]);
    }

    // --- REMEDIATION RESET (XQuotes Fail) ---
    if (gameMode === 'XQUOTES' && quoteText) {
         setFailedQuoteRepetitions(prev => {
            if (prev[quoteText]) {
                 setNotificationQueue(prevQ => [...prevQ, {
                    id: `reset_${Date.now()}`,
                    title: "Streak Broken",
                    description: "Remediation progress reset to 3.",
                    icon: <RotateCcw className="w-5 h-5 text-orange-500" />,
                    type: 'INFO'
                }]);
                return { ...prev, [quoteText]: 3 };
            }
            return prev;
        });
    }

    setStreak(0);
  };

  const handleMistake = (word?: string, expectedChar?: string, typedChar?: string) => {
      if (word) {
          const lowerWord = word.toLowerCase();
          setMistakePool(prev => {
              // Add only if not excessive duplicate (cap at 3 instances)
              const count = prev.filter(w => w === lowerWord).length;
              if (count < 3) return [...prev, lowerWord];
              return prev;
          });
          
          // Smart Practice Queue Update
          setSmartPracticeQueue(prev => {
              const idx = prev.findIndex(pw => pw.word === lowerWord);
              if (idx > -1) {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], proficiency: 0, lastPracticed: Date.now() };
                  return updated;
              }
              return [...prev, { word: lowerWord, proficiency: 0, lastPracticed: Date.now() }];
          });
      }
  };

  // --- RENDERING ---
  const currentTheme = THEMES.find(t => t.id === settings.themeId) || THEMES[0];
  const activeLevel = getCurrentLevel(userXP);

  // Background style
  const bgStyle = {
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.stone[900], // Approximation
  };

  if (activeMiniGame) {
      return (
          <div className="min-h-screen font-sans" style={bgStyle}>
              {activeMiniGame === 'SURVIVAL_SWAMP' && <SurvivalGame variant="SWAMP" onGameOver={handleMiniGameOver} onExit={() => setActiveMiniGame(null)} />}
              {activeMiniGame === 'SURVIVAL_ZOMBIE' && <SurvivalGame variant="ZOMBIE" onGameOver={handleMiniGameOver} onExit={() => setActiveMiniGame(null)} />}
              {activeMiniGame === 'TIME_ATTACK' && <TimeAttackGame onGameOver={handleMiniGameOver} onExit={() => setActiveMiniGame(null)} />}
              {activeMiniGame === 'COSMIC_DEFENSE' && <CosmicDefenseGame onGameOver={handleMiniGameOver} onExit={() => setActiveMiniGame(null)} />}
          </div>
      );
  }

  return (
    <div className="min-h-screen font-sans flex flex-col transition-colors duration-500" style={bgStyle}>
      {/* HEADER */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-black/5 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-2">
              <div className="bg-frog-green/20 p-2 rounded-lg text-2xl">🐸</div>
              <h1 className="font-black text-2xl tracking-tighter text-stone-800 hidden md:block">FROG TYPE</h1>
          </div>

          <div className="flex-1 max-w-xl mx-8">
              <ProgressBar 
                  xp={userXP} 
                  avgWpm={getAverageWPM(wpmHistory)} 
                  mistakeCount={mistakePool.length} 
                  remediationCount={Object.keys(failedQuoteRepetitions).length}
              />
          </div>

          <div className="flex items-center gap-2">
              <button onClick={() => setShowStats(true)} className="p-2 rounded-full hover:bg-black/5 text-stone-600 transition-colors" title="Stats">
                  <BarChart2 className="w-5 h-5" />
              </button>
              <button onClick={() => setShowAchievements(true)} className="p-2 rounded-full hover:bg-black/5 text-stone-600 transition-colors" title="Achievements">
                  <Crown className="w-5 h-5" />
              </button>
              <button onClick={() => setShowThemes(true)} className="p-2 rounded-full hover:bg-black/5 text-stone-600 transition-colors" title="Themes">
                  <Palette className="w-5 h-5" />
              </button>
              <button onClick={() => setShowMusic(true)} className="p-2 rounded-full hover:bg-black/5 text-stone-600 transition-colors" title="Music">
                  <Music className="w-5 h-5" />
              </button>
              <button onClick={() => setShowSettings(true)} className="p-2 rounded-full hover:bg-black/5 text-stone-600 transition-colors" title="Settings">
                  <SettingsIcon className="w-5 h-5" />
              </button>
          </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          
          {/* Mode Selector */}
          {gameMode === 'MINIGAMES' ? (
              <MiniGameMenu onSelect={setActiveMiniGame} onBack={() => setGameMode('QUOTES')} />
          ) : (
              <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
                  {/* Mode Tabs */}
                  <div className="flex justify-center gap-2 mb-4 flex-wrap">
                      <button 
                          onClick={() => setGameMode('QUOTES')} 
                          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${gameMode === 'QUOTES' ? 'bg-frog-green text-white shadow-lg' : 'bg-white/50 text-stone-500 hover:bg-white'}`}
                      >
                          Quotes
                      </button>
                      <button 
                          onClick={() => setGameMode('PRACTICE')} 
                          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${gameMode === 'PRACTICE' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/50 text-stone-500 hover:bg-white'}`}
                      >
                          Words
                      </button>
                      <button 
                          onClick={() => setGameMode('HARDCORE')} 
                          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${gameMode === 'HARDCORE' ? 'bg-stone-800 text-white shadow-lg' : 'bg-white/50 text-stone-500 hover:bg-white'}`}
                      >
                          <Skull className="w-3 h-3" /> Hardcore
                      </button>
                      
                      {(mistakePool.length > 0) && (
                          <button 
                              onClick={() => setGameMode('XWORDS')} 
                              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 animate-pulse ${gameMode === 'XWORDS' ? 'bg-red-500 text-white shadow-lg' : 'bg-white/50 text-red-400 hover:bg-white'}`}
                          >
                              <Eraser className="w-3 h-3" /> XWords ({mistakePool.length})
                          </button>
                      )}
                      
                      {(Object.keys(failedQuoteRepetitions).length > 0) && (
                          <button 
                              onClick={() => setGameMode('XQUOTES')} 
                              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 animate-pulse ${gameMode === 'XQUOTES' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white/50 text-orange-400 hover:bg-white'}`}
                          >
                              <RefreshCcw className="w-3 h-3" /> XQuotes ({Object.keys(failedQuoteRepetitions).length})
                          </button>
                      )}

                      <button 
                          onClick={() => setGameMode('MINIGAMES')} 
                          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${gameMode === 'MINIGAMES' ? 'bg-purple-500 text-white shadow-lg' : 'bg-white/50 text-stone-500 hover:bg-white'}`}
                      >
                          <Gamepad2 className="w-3 h-3" /> Arcade
                      </button>
                  </div>

                  {gameMode === 'PRACTICE' && <PracticeProgress level={practiceLevel} />}

                  {loading ? (
                      <div className="flex justify-center items-center h-64">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-frog-green"></div>
                      </div>
                  ) : currentQuote ? (
                      <TypingArea 
                          quote={currentQuote}
                          onComplete={handleQuoteComplete}
                          onFail={handleQuoteFail}
                          onMistake={handleMistake}
                          onRequestNewQuote={() => setCurrentQuote(null)}
                          streak={streak}
                          ghostWpm={getAverageWPM(wpmHistory)}
                          settings={settings}
                          gameMode={gameMode}
                          onInteract={() => { if (!quoteStartTime) setQuoteStartTime(Date.now()); }}
                          autoFocus={shouldAutoFocus}
                      />
                  ) : (
                      <div className="flex justify-center items-center h-64 text-stone-400">
                          <p>Preparing session...</p>
                      </div>
                  )}
              </div>
          )}
      </main>

      <footer className="p-4 text-center text-[10px] text-stone-400 font-medium">
          <button onClick={() => setShowHelp(true)} className="flex items-center justify-center gap-1 mx-auto hover:text-frog-green transition-colors">
              <HelpCircle className="w-3 h-3" /> How to Play
          </button>
      </footer>

      {/* MODALS */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} settings={settings} setSettings={setSettings} />
      <StatsModal 
          isOpen={showStats} 
          onClose={() => setShowStats(false)} 
          avgWpm={getAverageWPM(wpmHistory)} 
          history={testHistory} 
          onPractice={(mistakes) => {
              setMistakePool(prev => [...prev, ...mistakes]);
              setGameMode('XWORDS');
          }}
          totalTime={totalTimePlayed}
          joinDate={joinDate}
          streak={dailyStreak}
          userName={userName}
          setUserName={setUserName}
          completedTestsCount={testHistory.length}
      />
      <ThemeModal 
          isOpen={showThemes} 
          onClose={() => setShowThemes(false)} 
          currentThemeId={settings.themeId} 
          setThemeId={(id) => setSettings(s => ({ ...s, themeId: id }))} 
          currentLevel={activeLevel}
          allLevels={LEVELS}
      />
      <AchievementsModal isOpen={showAchievements} onClose={() => setShowAchievements(false)} unlockedIds={unlockedAchievements} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} currentLevel={activeLevel} completedTestsCount={testHistory.length} />
      <StoryConfigModal isOpen={showStoryConfig} onClose={() => setShowStoryConfig(false)} onStartStory={(topic) => { /* Placeholder for story */ setShowStoryConfig(false); }} />
      
      <MusicPlayer isOpen={showMusic} onClose={() => setShowMusic(false)} settings={settings} setSettings={setSettings} userXP={userXP} />
      
      <AchievementToast notifications={notificationQueue} onClear={() => setNotificationQueue(prev => prev.slice(1))} />
    </div>
  );
};

export default App;