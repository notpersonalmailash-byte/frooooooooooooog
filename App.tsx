import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import ProgressBar from './components/ProgressBar';
import TypingArea from './components/TypingArea';
import SettingsModal from './components/SettingsModal';
import HelpModal from './components/HelpModal';
import StatsModal from './components/StatsModal';
import ThemeModal from './components/ThemeModal';
import AchievementsModal from './components/AchievementsModal';
import AchievementToast from './components/AchievementToast';
import PracticeProgress from './components/PracticeProgress';
import SurvivalGame from './components/SurvivalGame';
import TimeAttackGame from './components/TimeAttackGame';
import CosmicDefenseGame from './components/CosmicDefenseGame';
import MiniGameMenu from './components/MiniGameMenu';
import { MusicPlayer } from './components/MusicPlayer';
import { Quote, Settings, GameMode, TestResult, NotificationItem, ReadAheadLevel, PracticeWord } from './types';
import { fetchQuotes, getPracticeLetter } from './services/quoteService';
import { getCurrentLevel, getNextLevel, getAverageWPM, LEVELS, calculateXP, checkLevelProgress } from './utils/gameLogic';
import { soundEngine } from './utils/soundEngine';
import { Loader2, Settings as SettingsIcon, Music, CircleHelp, Skull, BookOpen, Eraser, TrendingUp, Palette, Award, Radio, Lock, Eye, EyeOff, Flame, AlertTriangle, ArrowRight, Keyboard, ArrowUpCircle, Gamepad2, Brain, RefreshCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { THEMES } from './data/themes';
import { ACHIEVEMENTS } from './data/achievements';
import { RADIO_STATIONS } from './data/radioStations';

const App: React.FC = () => {
  // User Stats Persistence
  const [userName, setUserName] = useState<string>(() => {
      return localStorage.getItem('frogType_userName') || 'Froggy';
  });

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
    const legacy = localStorage.getItem('frogType_xp');
    if (saved) return parseInt(saved, 10);
    if (legacy) return parseInt(legacy, 10);
    return 0;
  });
  
  const currentLevel = getCurrentLevel(userXP);
  
  // Track unlocked tiers persistently to prevent repeat notifications
  const [unlockedTiers, setUnlockedTiers] = useState<string[]>(() => {
    const saved = localStorage.getItem('frogType_unlockedTiers');
    return saved ? JSON.parse(saved) : [];
  });

  // Session Streak (Consecutive Quotes)
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('frogType_streak');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Daily Streak Logic
  const [dailyStreak, setDailyStreak] = useState<number>(() => {
     const saved = localStorage.getItem('frogType_dailyStreak');
     return saved ? parseInt(saved, 10) : 0;
  });

  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    const saved = localStorage.getItem('frogType_achievements');
    return saved ? JSON.parse(saved) : [];
  });
  
  // PRACTICE MODE STATE
  const [practiceLevel, setPracticeLevel] = useState<number>(() => {
      const saved = localStorage.getItem('frogType_practiceLevel');
      return saved ? parseInt(saved, 10) : 0;
  });

  // Smart Practice Queue (Leitner-ish system)
  const [smartPracticeQueue, setSmartPracticeQueue] = useState<PracticeWord[]>(() => {
      const saved = localStorage.getItem('frogType_smartQueue');
      return saved ? JSON.parse(saved) : [];
  });

  // Failed Quotes Remediation Queue (New)
  // Maps quote text -> number of successful repetitions required (starts at 3)
  const [failedQuoteRepetitions, setFailedQuoteRepetitions] = useState<Record<string, number>>(() => {
      const saved = localStorage.getItem('frogType_remediations');
      return saved ? JSON.parse(saved) : {};
  });

  const [notificationQueue, setNotificationQueue] = useState<NotificationItem[]>([]);

  // Track history for average WPM calculation (Last 10)
  const [wpmHistory, setWpmHistory] = useState<number[]>(() => {
    const saved = localStorage.getItem('frogType_wpmHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Track full history of tests
  const [testHistory, setTestHistory] = useState<TestResult[]>(() => {
    const saved = localStorage.getItem('frogType_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [lastWpm, setLastWpm] = useState<number>(() => {
    const saved = localStorage.getItem('frogType_lastWpm');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [mistakePool, setMistakePool] = useState<string[]>(() => {
    const saved = localStorage.getItem('frogType_mistakes');
    return saved ? JSON.parse(saved) : [];
  });

  // New: Specific Character Statistics (e.g. {'a': 5, 'b': 2})
  const [charStats, setCharStats] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('frogType_charStats');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('frogType_settings');
    const parsed = saved ? JSON.parse(saved) : {};
    
    // Legacy migration helper values
    const legacyBrownNoiseEnabled = parsed.brownNoiseEnabled === true;
    const legacyVolume = parsed.brownNoiseVolume ?? 0.5;
    
    let initialReadAhead = parsed.readAheadLevel;
    if (parsed.readAheadEnabled === true && !initialReadAhead) initialReadAhead = 'FOCUS';
    if (!initialReadAhead) initialReadAhead = 'NONE';

    // Construct settings with defaults
    const mergedSettings: Settings = {
      ghostEnabled: false, 
      readAheadLevel: initialReadAhead, 
      sfxEnabled: true,
      mechanicalSoundEnabled: false,
      mechanicalSoundPreset: 'THOCK',
      ambientVolume: 0.02, 
      musicConfig: { source: 'NONE', presetId: '' },
      themeId: 'CLASSIC',
      autoStartMusic: true, // Default to true
      ...parsed // Overwrite with saved values
    };

    // --- MIGRATION & LOGIC OVERRIDES ---

    // 1. Recover legacy brown noise setting if musicConfig wasn't explicitly saved
    if (legacyBrownNoiseEnabled && (!parsed.musicConfig || parsed.musicConfig.source === 'NONE')) {
        mergedSettings.musicConfig = { source: 'GENERATED', presetId: 'BROWN_NOISE' };
        mergedSettings.ambientVolume = legacyVolume;
    }

    // 2. Auto-Start Logic
    if (mergedSettings.autoStartMusic) {
        mergedSettings.musicConfig = { source: 'GENERATED', presetId: 'PIANO_SATIE' };
    } else {
        mergedSettings.musicConfig = { source: 'NONE', presetId: '' };
    }

    return mergedSettings;
  });

  const [gameMode, setGameMode] = useState<GameMode>(() => {
    const saved = localStorage.getItem('frogType_gameMode');
    // Default fallback
    return (saved as GameMode) || 'QUOTES';
  });

  // UI state for Mini Game Menu vs Actual Game
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
  
  // Start time tracking for current quote
  const [quoteStartTime, setQuoteStartTime] = useState<number | null>(null);

  const isFetchingRef = useRef(false);

  // Derive Lock State
  const uniqueTiers = Array.from(new Set(LEVELS.map(l => l.tier)));
  const currentTierIndex = uniqueTiers.indexOf(currentLevel.tier);
  
  const polliwogIndex = uniqueTiers.indexOf('Polliwog');
  const isHardcoreLocked = currentTierIndex < polliwogIndex;
  
  const frogletIndex = uniqueTiers.indexOf('Froglet');
  const isArcadeLocked = currentTierIndex < frogletIndex;
  
  // Practice Lock: Require 20 matches to gather data
  const isPracticeLocked = testHistory.length < 20;

  // Gating Check
  const avgWpmVal = getAverageWPM(wpmHistory);
  const remediationCount = Object.keys(failedQuoteRepetitions).length;
  const { isGated, reason } = checkLevelProgress(userXP, avgWpmVal, mistakePool.length, remediationCount);

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
  
  // Game Mode Persistence & Lock Check
  useEffect(() => { 
      if (gameMode === 'HARDCORE' && isHardcoreLocked) {
          setGameMode('QUOTES');
      }
      if (gameMode === 'PRACTICE' && isPracticeLocked) {
          setGameMode('QUOTES');
      }
      if (gameMode === 'MINIGAMES' && isArcadeLocked) {
          setGameMode('QUOTES');
      }
      localStorage.setItem('frogType_gameMode', gameMode); 
  }, [gameMode, isHardcoreLocked, isPracticeLocked, isArcadeLocked]);

  useEffect(() => { localStorage.setItem('frogType_completedQuotes', JSON.stringify(completedQuotes)); }, [completedQuotes]);
  useEffect(() => { localStorage.setItem('frogType_achievements', JSON.stringify(unlockedAchievements)); }, [unlockedAchievements]);
  
  // Audio Settings Sync
  useEffect(() => {
    soundEngine.setEnabled(settings.sfxEnabled);
    soundEngine.setMechanicalEnabled(settings.mechanicalSoundEnabled);
    soundEngine.setMechanicalPreset(settings.mechanicalSoundPreset);
    soundEngine.setAmbientVolume(settings.ambientVolume);

    if (settings.musicConfig.source === 'GENERATED') {
      soundEngine.setAmbientMusic(settings.musicConfig.presetId);
    } else {
      soundEngine.stopAmbientMusic();
    }
  }, [settings.sfxEnabled, settings.mechanicalSoundEnabled, settings.mechanicalSoundPreset, settings.ambientVolume, settings.musicConfig]);

  useLayoutEffect(() => {
    const theme = THEMES.find(t => t.id === settings.themeId) || THEMES[0];
    const root = document.documentElement;
    root.style.setProperty('--bg-body', theme.colors.background);
    Object.entries(theme.colors.frog).forEach(([key, value]) => {
       root.style.setProperty(`--frog-${key}`, value);
    });
    Object.entries(theme.colors.stone).forEach(([key, value]) => {
       root.style.setProperty(`--stone-${key}`, value);
    });
    root.style.setProperty('--text-body', theme.colors.stone[800]);
  }, [settings.themeId]);

  useEffect(() => {
    const handleInteraction = () => {
      soundEngine.resumeContext();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
    
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  useEffect(() => { 
    if (currentQuote) {
      localStorage.setItem('frogType_currentQuote', JSON.stringify(currentQuote)); 
      setQuoteStartTime(Date.now());
    } else {
      localStorage.removeItem('frogType_currentQuote');
    }
  }, [currentQuote]);

  // Check Daily Streak on Mount
  useEffect(() => {
      const today = new Date().toDateString();
      const lastVisit = localStorage.getItem('frogType_lastVisitDate');
      
      // If user hasn't visited today, check if streak should break
      if (lastVisit && lastVisit !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (yesterday.toDateString() !== lastVisit) {
              // Streak broken if last visit was not yesterday
              setDailyStreak(0);
          }
      } else if (!lastVisit) {
          setDailyStreak(0);
      }
  }, []);

  const updateDailyStreakActivity = () => {
      const today = new Date().toDateString();
      const lastVisit = localStorage.getItem('frogType_lastVisitDate');
      
      if (lastVisit !== today) {
          // New day activity
          let newStreak = 1;
          if (lastVisit) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              if (yesterday.toDateString() === lastVisit) {
                  newStreak = dailyStreak + 1;
              }
          }
          setDailyStreak(newStreak);
          localStorage.setItem('frogType_lastVisitDate', today);
          
          // Toast for streak
          setNotificationQueue(prev => [...prev, {
              id: `daily_${Date.now()}`,
              title: "Daily Streak!",
              description: `You're on a ${newStreak} day streak.`,
              icon: <Flame className="w-5 h-5 text-orange-500" />,
              type: "INFO"
          }]);
      } else {
          // Already played today, ensure streak is at least 1 if it was 0
          if (dailyStreak === 0) {
              setDailyStreak(1);
              localStorage.setItem('frogType_lastVisitDate', today);
          }
      }
  };

  const generateMistakeQuote = useCallback((): Quote | null => {
    if (mistakePool.length === 0) return null;
    let pool = [...mistakePool];
    // Allow random selection including duplicates to reinforce learning
    while (pool.length < 15) {
       pool = [...pool, ...mistakePool];
    }
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 15);
    const text = selected.join(' ');
    
    return {
      text,
      source: "Personal Training",
      author: "Your Mistakes"
    };
  }, [mistakePool]);

  const loadMoreQuotes = useCallback(async () => {
    if (isFetchingRef.current) return;
    if (gameMode === 'MINIGAMES') return; 
    
    isFetchingRef.current = true;
    
    try {
      const level = getCurrentLevel(userXP);
      
      // 1. Fetch Standard Quotes
      const newQuotes = await fetchQuotes(5, completedQuotes, level.name, gameMode, practiceLevel, charStats, smartPracticeQueue);
      
      // 2. Inject Remediation Quotes (High Priority)
      // If we have failed quotes that need clearing, inject them.
      const pendingRemediations = Object.keys(failedQuoteRepetitions);
      
      if (pendingRemediations.length > 0 && gameMode === 'QUOTES') {
          // Shuffle remediations
          const toInject = pendingRemediations.sort(() => 0.5 - Math.random()).slice(0, 2);
          
          const injectionQuotes: Quote[] = toInject.map(text => ({
              text: text,
              source: "Remediation",
              author: `Repeat Required (${failedQuoteRepetitions[text]} left)`
          }));
          
          // Mix them in: 2 remediations + 3 new quotes
          const mixed = [...injectionQuotes, ...newQuotes.slice(0, 3)];
          // Shuffle again so it's not always first
          setQuotesQueue(prev => [...prev, ...mixed.sort(() => 0.5 - Math.random())]);
      } else {
          setQuotesQueue(prev => [...prev, ...newQuotes]);
      }

    } catch (error) {
      console.error("Failed to load quotes", error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [completedQuotes, userXP, gameMode, practiceLevel, charStats, smartPracticeQueue, failedQuoteRepetitions]);

  useEffect(() => {
    const init = async () => {
      if (!currentQuote && quotesQueue.length === 0 && gameMode !== 'MINIGAMES') {
         setLoading(true);
         await loadMoreQuotes();
         setLoading(false);
      } else if (quotesQueue.length < 3 && gameMode !== 'MINIGAMES') {
         loadMoreQuotes();
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentQuote || gameMode === 'MINIGAMES') return;

    if (gameMode === 'FIX_MISTAKE') {
      const mistakeQuote = generateMistakeQuote();
      if (mistakeQuote) {
        setCurrentQuote(mistakeQuote);
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
  }, [currentQuote, quotesQueue, gameMode, generateMistakeQuote, loadMoreQuotes]);

  const checkAchievements = (wpm: number) => {
    const newNotifications: NotificationItem[] = [];
    const newUnlockIds: string[] = [];

    const stats = {
       wpm,
       totalQuotes: completedQuotes.length + 1, 
       maxStreak: Math.max(streak + 1, streak + 1),
       currentStreak: streak + 1,
       mode: gameMode,
       practiceLevel
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

    // --- REMEDIATION SUCCESS LOGIC ---
    if (gameMode === 'QUOTES' && currentQuote) {
        const key = currentQuote.text;
        // Check if this quote was in the remediation list
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
                    setNotificationQueue(prevQ => [...prevQ, {
                        id: `remediate_${Date.now()}`,
                        title: "Progress Saved",
                        description: `${newVal} successful repetitions left.`,
                        icon: <RefreshCcw className="w-5 h-5 text-orange-500" />,
                        type: 'INFO'
                    }]);
                }
                return newObj;
            });
        }
    }

    // Fix Mistake Mode Logic - Updated to remove only one instance per successful type
    if (gameMode === 'FIX_MISTAKE' && currentQuote) {
      const wordsFixed = currentQuote.text.split(' '); // Keep all instances
      setMistakePool(prev => {
          const newPool = [...prev];
          wordsFixed.forEach(fixedWord => {
              const idx = newPool.indexOf(fixedWord);
              if (idx > -1) newPool.splice(idx, 1);
          });
          return newPool;
      });
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
                        newQueue[index] = { ...newQueue[index], proficiency: 0, lastPracticed: Date.now() };
                        changed = true;
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

    // Practice Mode Level Up Logic
    if (gameMode === 'PRACTICE') {
        if (retryCount === 0 && mistakes.length === 0 && wpm > 30) {
            const nextLevel = practiceLevel + 1;
            setPracticeLevel(nextLevel);
            const newLetter = getPracticeLetter(nextLevel);
            
            setNotificationQueue(prev => [...prev, {
                id: `practice_level_${nextLevel}`,
                title: "Practice Level Up!",
                description: `Unlocked letter: ${newLetter}`,
                icon: <ArrowUpCircle className="w-5 h-5 text-frog-green" />,
                type: 'INFO'
            }]);
            
            setQuotesQueue([]);
        }
    }

    if (currentQuote && gameMode !== 'FIX_MISTAKE' && gameMode !== 'PRACTICE') {
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

    // Calculate XP and Handle Gates/Unlocks
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
      setNotificationQueue(prev => [...prev, {
          id: `survival_${Date.now()}`,
          title: "Arcade Run Complete",
          description: `Score: ${score} | +${xp} XP`,
          icon: <Skull className="w-5 h-5 text-red-500" />,
          type: 'INFO'
      }]);
  };

  const handleXPGain = (xpAmount: number, currentAvgWpm: number) => {
    const currentLevelObj = getCurrentLevel(userXP);
    const nextLevelObj = getNextLevel(currentLevelObj);
    let potentialXp = userXP + xpAmount;
    
    // Pass current remediation count to checkLevelProgress
    const currentRemediationCount = Object.keys(failedQuoteRepetitions).length;

    if (nextLevelObj && potentialXp >= nextLevelObj.minXP) {
         let effectiveMistakeCount = mistakePool.length;
         if (gameMode === 'FIX_MISTAKE' && currentQuote) {
             const wordsFixed = [...new Set(currentQuote.text.split(' '))];
             effectiveMistakeCount = mistakePool.filter(word => !wordsFixed.includes(word)).length;
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

  const handleQuoteFail = () => {
    // --- REMEDIATION TRIGGER ---
    if (gameMode === 'QUOTES' && currentQuote) {
        const key = currentQuote.text;
        setFailedQuoteRepetitions(prev => {
            // Strict: Failing resets debt to 3.
            return { ...prev, [key]: 3 }; 
        });
        
        setNotificationQueue(prev => [...prev, {
            id: `fail_${Date.now()}`,
            title: "Quote Failed",
            description: "You must now pass this quote 3 times to proceed.",
            icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
            type: 'INFO'
        }]);
    }

    setStreak(0);
  };

  const handleMistake = (word?: string, expectedChar?: string, typedChar?: string) => {
    let penaltyMultiplier = 0.85; 

    if (gameMode === 'HARDCORE') {
        penaltyMultiplier = 0.5;
    } else if (gameMode === 'FIX_MISTAKE') {
        penaltyMultiplier = 0.95;
    }

    setUserXP(prev => Math.floor(prev * penaltyMultiplier));

    // Note: streak is reset in handleQuoteFail for consistency when the entire quote fails
    // But mistakes in 'QUOTES' mode cause instant failure via TypingArea logic which calls onFail.
    // However, onMistake is called *before* onFail in TypingArea.
    // So we reset streak here too just in case.
    setStreak(0);

    // Track Words for FIX MISTAKE mode (Classic) - REQUIRE 3 REPETITIONS TO CLEAR
    if (word && word.length > 1) {
       setMistakePool(prev => {
         // Reset this word's debt to 3 if mistakenly typed
         const clean = prev.filter(w => w !== word);
         return [...clean, word, word, word];
       });
       
       const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
       if (cleanWord.length > 1) {
           setSmartPracticeQueue(prev => {
               const idx = prev.findIndex(p => p.word === cleanWord);
               if (idx !== -1) {
                   const updated = [...prev];
                   updated[idx] = { ...updated[idx], proficiency: 0, lastPracticed: Date.now() };
                   return updated;
               } else {
                   return [...prev, { word: cleanWord, proficiency: 0, lastPracticed: Date.now() }];
               }
           });
       }
    }

    // Track Specific Characters for Smart Practice
    if (expectedChar && /[a-zA-Z]/.test(expectedChar)) {
        const lowerChar = expectedChar.toLowerCase();
        setCharStats(prev => {
            const currentCount = prev[lowerChar] || 0;
            return { ...prev, [lowerChar]: currentCount + 1 };
        });
    }
  };

  const handlePracticeFromHistory = (mistakes: string[]) => {
      setMistakePool(prev => {
          const newSet = new Set([...prev, ...mistakes]);
          return Array.from(newSet);
      });
      switchMode('FIX_MISTAKE');
  };

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
  const toggleMusic = () => setIsMusicOpen(!isMusicOpen);
  const toggleHelp = () => setIsHelpOpen(!isHelpOpen);
  const toggleStats = () => setIsStatsOpen(!isStatsOpen);
  const toggleTheme = () => setIsThemeOpen(!isThemeOpen);
  const toggleAchievements = () => setIsAchievementsOpen(!isAchievementsOpen);

  const cycleReadAhead = () => {
      const levels: ReadAheadLevel[] = ['NONE', 'FOCUS', 'ULTRA', 'BLIND'];
      const currentIndex = levels.indexOf(settings.readAheadLevel);
      const nextIndex = (currentIndex + 1) % levels.length;
      setSettings({ ...settings, readAheadLevel: levels[nextIndex] });
      soundEngine.playKeypress(); // Feedback
  };

  const switchMode = useCallback((mode: GameMode) => {
    if (mode === 'FIX_MISTAKE' && mistakePool.length === 0) return;
    if (mode === 'HARDCORE' && isHardcoreLocked) return;
    if (mode === 'PRACTICE' && isPracticeLocked) return;
    if (mode === 'MINIGAMES' && isArcadeLocked) return;
    
    setShouldAutoFocus(false);

    if (mode === 'MINIGAMES') {
        setIsMiniGameMenuOpen(true);
        setActiveMiniGame(null);
    } else {
        setIsMiniGameMenuOpen(false);
        setActiveMiniGame(null);
        setGameMode(mode);
        setQuotesQueue([]); 
        setCurrentQuote(null); 
    }
  }, [mistakePool.length, isHardcoreLocked, isPracticeLocked, isArcadeLocked]);
  
  const handleMiniGameSelect = (gameId: string) => {
      setGameMode('MINIGAMES');
      setActiveMiniGame(gameId);
      setIsMiniGameMenuOpen(false);
  };

  const handleRequestNextQuote = async () => {
      setCurrentQuote(null);
      setQuoteStartTime(null);
  };

  const clearToast = useCallback(() => {
    setNotificationQueue(prev => prev.slice(1));
  }, []);

  const getReadAheadConfig = () => {
      switch(settings.readAheadLevel) {
          case 'FOCUS': return { label: 'Focus', color: 'text-frog-green', bg: 'bg-frog-100', bonus: '+10%' };
          case 'ULTRA': return { label: 'Ultra', color: 'text-purple-600', bg: 'bg-purple-100', bonus: '+20%' };
          case 'BLIND': return { label: 'Blind', color: 'text-red-600', bg: 'bg-red-100', bonus: '+30%' };
          default: return { label: 'Off', color: 'text-stone-400', bg: 'hover:bg-stone-100', bonus: '' };
      }
  };
  const raConfig = getReadAheadConfig();

  const renderMiniGame = () => {
      if (activeMiniGame === 'SURVIVAL_SWAMP') {
          return (
              <SurvivalGame 
                  variant="SWAMP"
                  onGameOver={(score, xp) => handleMiniGameOver(score, xp, 0)} 
                  onExit={() => { setIsMiniGameMenuOpen(true); setActiveMiniGame(null); }} 
              />
          );
      }
      if (activeMiniGame === 'SURVIVAL_ZOMBIE') {
          return (
              <SurvivalGame 
                  variant="ZOMBIE"
                  onGameOver={(score, xp) => handleMiniGameOver(score, xp, 0)} 
                  onExit={() => { setIsMiniGameMenuOpen(true); setActiveMiniGame(null); }} 
              />
          );
      }
      if (activeMiniGame === 'TIME_ATTACK') {
          return (
              <TimeAttackGame
                  onGameOver={(score, xp) => handleMiniGameOver(score, xp)} 
                  onExit={() => { setIsMiniGameMenuOpen(true); setActiveMiniGame(null); }} 
              />
          );
      }
      if (activeMiniGame === 'COSMIC_DEFENSE') {
          return (
              <CosmicDefenseGame
                  onGameOver={handleMiniGameOver} 
                  onExit={() => { setIsMiniGameMenuOpen(true); setActiveMiniGame(null); }} 
              />
          );
      }
      // Fallback
      return (
          <div className="text-stone-400 p-10 text-center">
              Unknown Game Mode
              <button onClick={() => { setIsMiniGameMenuOpen(true); setActiveMiniGame(null); }} className="block mx-auto mt-4 text-frog-green underline">Return</button>
          </div>
      );
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-stone-800 font-sans selection:bg-frog-200">
      <div className="sticky top-0 z-40 flex flex-col shadow-sm transition-all">
          <header className="w-full bg-stone-50/95 backdrop-blur-md border-b border-stone-200 px-6 py-3">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              
              <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                <div className="flex flex-col items-center md:items-start flex-shrink-0">
                  <h1 className="text-xl font-black text-frog-green tracking-tight flex items-center gap-2">
                    <span className="text-2xl">🐸</span> Frog Type
                  </h1>
                </div>

                <div className="flex gap-1 p-1 bg-stone-100/80 rounded-lg shadow-inner border border-stone-200/50 overflow-x-auto max-w-full">
                  <button 
                      onClick={() => switchMode('QUOTES')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-2 ${gameMode === 'QUOTES' && !isMiniGameMenuOpen && !activeMiniGame ? 'bg-white text-frog-green shadow-sm ring-1 ring-stone-200' : 'text-stone-400 hover:bg-stone-200/50 hover:text-stone-600'}`}
                  >
                      <BookOpen className="w-3.5 h-3.5" /> Quotes
                  </button>
                  <button 
                      onClick={() => switchMode('PRACTICE')}
                      disabled={isPracticeLocked}
                      title={isPracticeLocked ? `Calibrating skill profile... (${testHistory.length}/20)` : "Smart Practice Mode"}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-2 
                        ${gameMode === 'PRACTICE' && !isMiniGameMenuOpen && !activeMiniGame 
                            ? 'bg-white text-frog-green shadow-sm ring-1 ring-stone-200' 
                            : isPracticeLocked 
                                ? 'opacity-50 cursor-not-allowed text-stone-400 bg-stone-100 border border-stone-200' 
                                : 'text-stone-400 hover:bg-stone-200/50 hover:text-stone-600'}`}
                  >
                      {isPracticeLocked ? <Lock className="w-3.5 h-3.5" /> : <Keyboard className="w-3.5 h-3.5" />} 
                      Practice
                  </button>
                  <button 
                      onClick={() => switchMode('HARDCORE')}
                      disabled={isHardcoreLocked}
                      title={isHardcoreLocked ? "Unlocks at Polliwog level" : "High risk, high reward"}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-2 
                        ${gameMode === 'HARDCORE' && !isMiniGameMenuOpen && !activeMiniGame
                          ? 'bg-stone-800 text-white shadow-sm ring-1 ring-stone-900' 
                          : isHardcoreLocked 
                              ? 'opacity-50 cursor-not-allowed text-stone-400 bg-stone-100' 
                              : 'text-stone-400 hover:bg-stone-200/50 hover:text-stone-600'}`}
                  >
                      {isHardcoreLocked ? <Lock className="w-3.5 h-3.5" /> : <Skull className="w-3.5 h-3.5" />} 
                      Hardcore
                  </button>
                  <button 
                      onClick={() => switchMode('MINIGAMES')}
                      disabled={isArcadeLocked}
                      title={isArcadeLocked ? "Unlocks at Froglet level" : "Minigames & Boss Battles"}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-2 
                        ${gameMode === 'MINIGAMES' || isMiniGameMenuOpen || activeMiniGame 
                            ? 'bg-purple-100 text-purple-600 shadow-sm ring-1 ring-purple-200' 
                            : isArcadeLocked 
                                ? 'opacity-50 cursor-not-allowed text-stone-400 bg-stone-100' 
                                : 'text-stone-400 hover:bg-stone-200/50 hover:text-stone-600'}`}
                  >
                      {isArcadeLocked ? <Lock className="w-3.5 h-3.5" /> : <Gamepad2 className="w-3.5 h-3.5" />} 
                      Arcade
                  </button>
                  <button 
                      onClick={() => switchMode('FIX_MISTAKE')}
                      disabled={mistakePool.length === 0}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-2 
                        ${gameMode === 'FIX_MISTAKE' && !isMiniGameMenuOpen && !activeMiniGame ? 'bg-red-500 text-white shadow-sm ring-1 ring-red-600' : 'text-stone-400 hover:bg-stone-200/50 hover:text-stone-600'}
                        ${mistakePool.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                        ${isGated && reason === 'MASTERY' && gameMode !== 'FIX_MISTAKE' ? 'ring-2 ring-orange-200 bg-orange-200 text-orange-900 animate-pulse shadow-[0_0_10px_rgba(253,186,116,0.6)]' : ''}
                      `}
                      title={mistakePool.length === 0 ? "No mistakes recorded yet" : `${mistakePool.length} words to fix`}
                  >
                      <Eraser className="w-3.5 h-3.5" /> Fix ({mistakePool.length})
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                   <button 
                     onClick={cycleReadAhead}
                     className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-2 group relative ${raConfig.bg} ${raConfig.color}`}
                     title={`Read Ahead: ${raConfig.label} (${raConfig.bonus ? raConfig.bonus + ' XP' : 'No Bonus'})`}
                   >
                      {settings.readAheadLevel === 'NONE' ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      {raConfig.bonus && (
                          <span className="absolute -top-1 -right-1 bg-frog-green text-white text-[8px] px-1 rounded-full font-bold">
                              {raConfig.bonus.replace('+','')}
                          </span>
                      )}
                   </button>

                   <button 
                     onClick={toggleAchievements} 
                     className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-2 ${isAchievementsOpen ? 'bg-stone-100 text-frog-green' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'}`}
                     title="Achievements"
                   >
                      <Award className="w-5 h-5" />
                   </button>
                   <button 
                     onClick={toggleTheme} 
                     className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-2 ${isThemeOpen ? 'bg-stone-100 text-frog-green' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'}`}
                     title="Themes"
                   >
                      <Palette className="w-5 h-5" />
                   </button>
                   <button 
                     onClick={toggleStats} 
                     className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-2 ${isStatsOpen ? 'bg-stone-100 text-frog-green' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'}`}
                     title="Statistics & History"
                   >
                      <TrendingUp className="w-5 h-5" />
                   </button>
                   <button 
                     onClick={toggleHelp} 
                     className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-2 ${isHelpOpen ? 'bg-stone-100 text-stone-700' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'}`}
                     title="How to Play"
                   >
                      <CircleHelp className="w-5 h-5" />
                   </button>
                   <button 
                     onClick={toggleMusic} 
                     className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-2 ${isMusicOpen || settings.musicConfig.source !== 'NONE' ? 'bg-stone-100 text-frog-green' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'}`}
                     title="Background Music"
                   >
                      <Music className="w-5 h-5" />
                   </button>
                   <button onClick={toggleSettings} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition-colors focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-2">
                      <SettingsIcon className="w-5 h-5" />
                   </button>
              </div>

            </div>
          </header>

          <div className="w-full bg-white/95 backdrop-blur-md border-b border-stone-200 px-6 py-2">
               <div className="max-w-[1400px] mx-auto">
                   <ProgressBar 
                     xp={userXP} 
                     avgWpm={getAverageWPM(wpmHistory)} 
                     mistakeCount={mistakePool.length} 
                     remediationCount={Object.keys(failedQuoteRepetitions).length}
                   />
               </div>
          </div>
      </div>
      
      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 w-full relative">
        <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
          {isGated && reason === 'MASTERY' && gameMode !== 'FIX_MISTAKE' ? (
              <div className="mb-8 w-full max-w-2xl relative overflow-hidden bg-orange-50 border-2 border-orange-200 p-8 rounded-3xl shadow-xl flex flex-col items-center text-center gap-6 animate-in slide-in-from-top-5 duration-500 z-50">
                  <div className="absolute top-0 left-0 w-full h-2 bg-orange-400/20"></div>
                  
                  <div className="p-4 bg-orange-100 rounded-full text-orange-500 ring-4 ring-orange-50">
                      <AlertTriangle className="w-10 h-10" />
                  </div>
                  
                  <div className="space-y-2">
                      <h3 className="text-3xl font-black text-orange-900 uppercase tracking-tight">Evolution Blocked</h3>
                      <p className="text-orange-800 font-medium text-lg max-w-md leading-relaxed">
                          You cannot evolve to the next level until you prove mastery over your mistakes.
                      </p>
                      <div className="bg-orange-100/50 px-4 py-2 rounded-lg border border-orange-200 inline-block">
                          <p className="text-orange-700 text-sm font-bold">
                              Requirement: Correctly type {mistakePool.length} words (3x each)
                          </p>
                      </div>
                  </div>

                  <button 
                    onClick={() => switchMode('FIX_MISTAKE')}
                    className="mt-2 px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-xl rounded-2xl shadow-lg shadow-orange-200 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 ring-4 ring-orange-500/20"
                  >
                      <RefreshCcw className="w-6 h-6" />
                      FIX MISTAKES
                  </button>
              </div>
          ) : (
             <>
                {isGated && reason === 'REMEDIATION' && gameMode === 'QUOTES' && (
                    <div className="mb-8 relative group overflow-hidden bg-orange-500 text-white px-8 py-4 rounded-3xl shadow-xl shadow-orange-200 flex items-center gap-5 transition-all transform hover:-translate-y-1 hover:shadow-2xl ring-4 ring-orange-100 animate-pulse z-50 cursor-default">
                        <div className="bg-white/20 p-3 rounded-full shadow-inner">
                            <RefreshCcw className="w-8 h-8 text-white fill-white/20" />
                        </div>
                        <div className="text-left">
                            <div className="font-black text-xl uppercase tracking-tight leading-none text-white">Tier Gated!</div>
                            <div className="font-medium text-sm text-orange-100 mt-1">
                                Remediate <span className="font-black text-white border-b-2 border-orange-300/50">{Object.keys(failedQuoteRepetitions).length} failed quotes</span>
                            </div>
                        </div>
                    </div>
                )}

                {gameMode === 'PRACTICE' && !isMiniGameMenuOpen && !activeMiniGame && (
                    <div className="w-full flex flex-col items-center">
                        {smartPracticeQueue.length > 0 && (
                            <div className="mb-4 flex items-center gap-2 text-stone-500 text-xs font-bold uppercase tracking-wide bg-stone-100 px-4 py-1.5 rounded-full">
                                <Brain className="w-4 h-4 text-purple-500" />
                                <span>Smart Queue: {smartPracticeQueue.length} words to master</span>
                            </div>
                        )}
                        <PracticeProgress level={practiceLevel} />
                    </div>
                )}

                {isMiniGameMenuOpen ? (
                    <MiniGameMenu 
                        onSelect={handleMiniGameSelect} 
                        onBack={() => setIsMiniGameMenuOpen(false)} 
                    />
                ) : activeMiniGame ? (
                    renderMiniGame()
                ) : (
                   <>
                      {loading && !currentQuote ? (
                          <div className="flex flex-col items-center justify-center text-stone-400 animate-pulse">
                          <Loader2 className="w-10 h-10 animate-spin mb-4 text-frog-green" />
                          <p className="font-mono text-xs">
                              Hatching wisdom...
                          </p>
                          </div>
                      ) : currentQuote ? (
                          <TypingArea 
                          quote={currentQuote} 
                          onComplete={handleQuoteComplete} 
                          onFail={handleQuoteFail}
                          onMistake={handleMistake}
                          onRequestNewQuote={handleRequestNextQuote}
                          streak={streak}
                          ghostWpm={getAverageWPM(wpmHistory)}
                          settings={settings}
                          gameMode={gameMode}
                          onInteract={() => setIsMusicOpen(false)}
                          autoFocus={shouldAutoFocus}
                          />
                      ) : (
                          <div className="flex flex-col items-center justify-center text-stone-400">
                          <Loader2 className="w-10 h-10 animate-spin mb-4 text-frog-green" />
                          <p className="font-mono text-xs">Fetching wisdom...</p>
                          </div>
                      )}
                   </>
                )}
             </>
          )}
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings} 
        setSettings={setSettings} 
      />

      <ThemeModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        currentThemeId={settings.themeId}
        setThemeId={(id) => setSettings({ ...settings, themeId: id })}
        currentLevel={getCurrentLevel(userXP)}
        allLevels={LEVELS}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        unlockedIds={unlockedAchievements}
      />

      <AchievementToast 
        notifications={notificationQueue}
        onClear={clearToast}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        avgWpm={getAverageWPM(wpmHistory)}
        history={testHistory}
        onPractice={handlePracticeFromHistory}
        totalTime={totalTimePlayed}
        joinDate={joinDate}
        streak={dailyStreak} 
        userName={userName}
        setUserName={setUserName}
        completedTestsCount={testHistory.length}
      />

      <MusicPlayer 
        isOpen={isMusicOpen} 
        onClose={() => setIsMusicOpen(false)} 
        settings={settings}
        setSettings={setSettings}
        userXP={userXP}
      />

      <footer className="p-6 text-center text-stone-300 text-[10px]">
        <p>© {new Date().getFullYear()} Frog Type. Wisdom from the Ages.</p>
      </footer>
    </div>
  );
};

export default App;