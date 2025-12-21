
import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import ProgressBar from './components/ProgressBar';
import TypingArea from './components/TypingArea';
import SettingsModal from './components/SettingsModal';
import StatsModal from './components/StatsModal';
import ThemeModal from './components/ThemeModal';
import BookMode from './components/BookMode';
import TenFastGame from './components/BlitzGame';
import DrillMode from './components/DrillMode';
import { MusicPlayer } from './components/MusicPlayer';
import { Quote, Settings, GameMode, TestResult, StrictRemediation, WordDrill, WordPerformance, BookSection, WordProficiency } from './types';
import { fetchQuotes } from './services/quoteService';
import { getCurrentLevel, getAverageWPM, LEVELS } from './utils/gameLogic';
import { soundEngine } from './utils/soundEngine';
import { Loader2, Settings as SettingsIcon, Music, Library, BookOpen, Eraser, Palette, Brain, Zap, Lock, RotateCcw, ShieldAlert, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { THEMES } from './data/themes';

const App: React.FC = () => {
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('frogType_userName') || 'Froggy');
  const [joinDate, setJoinDate] = useState<string>(() => localStorage.getItem('frogType_joinDate') || new Date().toISOString());
  const [userXP, setUserXP] = useState<number>(() => parseInt(localStorage.getItem('frogXP') || '0', 10));
  
  const [masteredQuotes, setMasteredQuotes] = useState<string[]>(() => {
    const saved = localStorage.getItem('frogType_masteredQuotes');
    return saved ? JSON.parse(saved) : [];
  });

  const [strictRemediation, setStrictRemediation] = useState<StrictRemediation | null>(() => {
    const saved = localStorage.getItem('frogType_strictRemediation');
    return saved ? JSON.parse(saved) : null;
  });

  const [pendingWordDrill, setPendingWordDrill] = useState<WordDrill | null>(() => {
    const saved = localStorage.getItem('frogType_pendingWordDrill');
    return saved ? JSON.parse(saved) : null;
  });

  const [streak, setStreak] = useState<number>(() => parseInt(localStorage.getItem('frogType_streak') || '0', 10));
  const [wpmHistory, setWpmHistory] = useState<number[]>(() => JSON.parse(localStorage.getItem('frogType_wpmHistory') || '[]'));
  const [testHistory, setTestHistory] = useState<TestResult[]>(() => JSON.parse(localStorage.getItem('frogType_history') || '[]'));
  const [mistakePool, setMistakePool] = useState<string[]>(() => JSON.parse(localStorage.getItem('frogType_mistakes') || '[]'));
  const [gameMode, setGameMode] = useState<GameMode>(() => (localStorage.getItem('frogType_gameMode') as GameMode) || 'QUOTES');
  
  // Book Mode State
  const [bookContent, setBookContent] = useState<string | null>(() => localStorage.getItem('frogType_bookContent'));
  const [bookProgress, setBookProgress] = useState<number>(() => parseInt(localStorage.getItem('frogType_bookProgress') || '0', 10));
  const [bookStructure, setBookStructure] = useState<BookSection[] | null>(() => JSON.parse(localStorage.getItem('frogType_bookStructure') || 'null'));
  
  // Word Proficiency State
  const [wordProficiency, setWordProficiency] = useState<Record<string, WordProficiency>>(() => JSON.parse(localStorage.getItem('frogType_wordProficiency') || '{}'));

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('frogType_settings');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      ghostEnabled: false, 
      readAheadLevel: 'NONE', 
      sfxEnabled: true,
      mechanicalSoundEnabled: false,
      mechanicalSoundPreset: 'THOCK',
      masterVolume: 1.0,
      ambientVolume: 0.02, 
      musicConfig: { source: 'NONE', presetId: '' },
      themeId: 'CLASSIC',
      autoStartMusic: true,
      ttsMode: 'OFF',
      ...parsed
    };
  });

  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [quotesQueue, setQuotesQueue] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  useEffect(() => { localStorage.setItem('frogXP', userXP.toString()); }, [userXP]);
  useEffect(() => { localStorage.setItem('frogType_masteredQuotes', JSON.stringify(masteredQuotes)); }, [masteredQuotes]);
  useEffect(() => { localStorage.setItem('frogType_strictRemediation', JSON.stringify(strictRemediation)); }, [strictRemediation]);
  useEffect(() => { localStorage.setItem('frogType_pendingWordDrill', JSON.stringify(pendingWordDrill)); }, [pendingWordDrill]);
  useEffect(() => { localStorage.setItem('frogType_history', JSON.stringify(testHistory)); }, [testHistory]);
  useEffect(() => { localStorage.setItem('frogType_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('frogType_mistakes', JSON.stringify(mistakePool)); }, [mistakePool]);
  useEffect(() => { localStorage.setItem('frogType_streak', streak.toString()); }, [streak]);
  useEffect(() => { localStorage.setItem('frogType_wpmHistory', JSON.stringify(wpmHistory)); }, [wpmHistory]);
  useEffect(() => { localStorage.setItem('frogType_gameMode', gameMode); }, [gameMode]);
  
  useEffect(() => { 
    if (bookContent) localStorage.setItem('frogType_bookContent', bookContent);
    else localStorage.removeItem('frogType_bookContent');
  }, [bookContent]);
  
  useEffect(() => { 
    localStorage.setItem('frogType_bookProgress', bookProgress.toString());
  }, [bookProgress]);
  
  useEffect(() => {
    if (bookStructure) localStorage.setItem('frogType_bookStructure', JSON.stringify(bookStructure));
    else localStorage.removeItem('frogType_bookStructure');
  }, [bookStructure]);
  
  useEffect(() => {
    localStorage.setItem('frogType_wordProficiency', JSON.stringify(wordProficiency));
  }, [wordProficiency]);

  const updateWordProficiency = useCallback((word: string, isCorrect: boolean) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z'-]/g, '');
    if (cleanWord.length < 2 || !isNaN(Number(cleanWord))) return;

    setWordProficiency(prev => {
        const current = prev[cleanWord] || { correct: 0, mistakes: 0 };
        if (isCorrect) {
            current.correct += 1;
        } else {
            current.mistakes += 1;
        }
        return { ...prev, [cleanWord]: current };
    });
  }, []);

  useLayoutEffect(() => {
    const theme = THEMES.find(t => t.id === settings.themeId) || THEMES[0];
    const root = document.documentElement;
    root.style.setProperty('--bg-body', theme.colors.background);
    Object.entries(theme.colors.frog).forEach(([key, value]) => root.style.setProperty(`--frog-${key}`, value));
    Object.entries(theme.colors.stone).forEach(([key, value]) => root.style.setProperty(`--stone-${key}`, value));
    root.style.setProperty('--text-body', theme.colors.stone[800]);
  }, [settings.themeId]);
  
  // Centralized Sound Engine Controller
  useEffect(() => {
    soundEngine.setMasterVolume(settings.masterVolume);
    soundEngine.setEnabled(settings.sfxEnabled);
    soundEngine.setMechanicalEnabled(settings.mechanicalSoundEnabled);
    soundEngine.setMechanicalPreset(settings.mechanicalSoundPreset);
    soundEngine.setAmbientVolume(settings.ambientVolume);
    
    if (settings.musicConfig.source === 'GENERATED') {
        soundEngine.setAmbientMusic(settings.musicConfig.presetId);
    } else {
        soundEngine.stopAmbientMusic();
    }
  }, [settings]);

  const loadMoreQuotes = useCallback(async () => {
    if (loading || strictRemediation || gameMode !== 'QUOTES') return;
    setLoading(true);
    try {
      const newQuotes = await fetchQuotes(5, masteredQuotes);
      setQuotesQueue(prev => [...prev, ...newQuotes]);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  }, [masteredQuotes, strictRemediation, loading, gameMode]);

  useEffect(() => {
    if (gameMode === 'QUOTES' && !currentQuote && !strictRemediation && !pendingWordDrill && quotesQueue.length === 0) {
        loadMoreQuotes();
    }
  }, [currentQuote, strictRemediation, pendingWordDrill, quotesQueue.length, loadMoreQuotes, gameMode]);

  useEffect(() => {
    if (gameMode === 'QUOTES' && !currentQuote && !pendingWordDrill) {
        if (strictRemediation) {
            setCurrentQuote({ text: strictRemediation.quoteText, source: strictRemediation.source, author: `Repetition ${strictRemediation.currentCount + 1}/${strictRemediation.requiredCount}` });
        } else if (quotesQueue.length > 0) {
            setCurrentQuote(quotesQueue[0]);
            setQuotesQueue(prev => prev.slice(1));
        }
    }
  }, [currentQuote, quotesQueue, strictRemediation, pendingWordDrill, gameMode]);

  const handleMistake = useCallback((word?: string) => {
    if (word) {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        if (cleanWord.length > 0) {
          setPendingWordDrill({ word: cleanWord, requiredCount: 15, currentCount: 0 });
          soundEngine.playError();
        }
    }
  }, []);

  const handleQuoteComplete = (xp: number, wpm: number, mistakes: string[], retryCount: number) => {
    const isPerfect = mistakes.length === 0 && retryCount === 0;

    if (strictRemediation) {
        const nextCount = strictRemediation.currentCount + 1;
        if (nextCount >= strictRemediation.requiredCount) {
            setStrictRemediation(null);
            soundEngine.playLevelUp();
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        } else {
            setStrictRemediation({ ...strictRemediation, currentCount: nextCount });
        }
        setCurrentQuote(null);
    } else {
        if (isPerfect) {
            setMasteredQuotes(prev => [...prev, currentQuote?.text || ""]);
            setUserXP(prev => prev + xp);
            setStreak(prev => prev + 1);
            soundEngine.playSuccess();
        } else {
            setStrictRemediation({
                quoteText: currentQuote?.text || "",
                author: currentQuote?.author || "",
                source: "Strict Mastery Required",
                requiredCount: 3,
                currentCount: 0
            });
            setStreak(0);
        }
        setWpmHistory(prev => [...prev, wpm].slice(-10));
        setTestHistory(prev => [...prev, { id: Date.now(), date: new Date().toISOString(), wpm, xpEarned: xp, mode: gameMode, quoteText: currentQuote?.text || "", mistakes, retryCount }]);
        setCurrentQuote(null);
    }
  };

  const handleDrillInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!pendingWordDrill) return;
    const val = e.target.value;
    const target = pendingWordDrill.word;

    if (val.endsWith(' ')) {
        const typed = val.trim().toLowerCase();
        if (typed === target) {
            const nextCount = pendingWordDrill.currentCount + 1;
            if (nextCount >= pendingWordDrill.requiredCount) {
                setPendingWordDrill(null);
                soundEngine.playSuccess();
            } else {
                setPendingWordDrill({ ...pendingWordDrill, currentCount: nextCount });
                soundEngine.playKeypress();
            }
        } else {
            setPendingWordDrill({ ...pendingWordDrill, currentCount: 0 });
            soundEngine.playError();
        }
        e.target.value = '';
    } else if (!target.startsWith(val.toLowerCase())) {
        setPendingWordDrill({ ...pendingWordDrill, currentCount: 0 });
        soundEngine.playError();
        e.target.value = '';
    } else {
        soundEngine.playKeypress();
    }
  };

  const isLocked = !!pendingWordDrill || !!strictRemediation;
  const avgWpmVal = getAverageWPM(wpmHistory);

  const renderGameMode = () => {
    switch(gameMode) {
      case 'TEN_FAST':
        return <TenFastGame 
            smartQueue={[]} 
            onGameOver={(wpm, xp) => {
                setUserXP(prev => prev + xp);
                setWpmHistory(prev => [...prev, wpm].slice(-10));
                soundEngine.playSuccess();
            }}
            onWordPerformance={() => {}}
            onExit={() => setGameMode('QUOTES')}
            onMistake={handleMistake}
        />;
      case 'BOOK':
        return <BookMode
          bookContent={bookContent}
          setBookContent={setBookContent}
          bookProgress={bookProgress}
          setBookProgress={setBookProgress}
          bookStructure={bookStructure}
          setBookStructure={setBookStructure}
          onXpEarned={(xp) => setUserXP(prev => prev + xp)}
          updateWordProficiency={updateWordProficiency}
        />;
      case 'DRILL':
        return <DrillMode
          wordProficiency={wordProficiency}
          updateWordProficiency={updateWordProficiency}
          onExit={() => setGameMode('QUOTES')}
        />;
      case 'QUOTES':
      default:
        return <>
            {strictRemediation && (
                <div className="mb-8 flex items-center gap-3 bg-amber-100 text-amber-800 px-6 py-3 rounded-full border border-amber-200 animate-bounce">
                    <ShieldAlert className="w-5 h-5" />
                    <span className="font-black tracking-tight uppercase text-sm">Strict Mastery Required: Complete 3x perfectly to unlock.</span>
                </div>
            )}
            {currentQuote ? (
                <TypingArea 
                    quote={currentQuote} 
                    onComplete={handleQuoteComplete} 
                    onFail={() => { setStreak(0); if (!strictRemediation) setStrictRemediation({ quoteText: currentQuote.text, author: currentQuote.author, source: "Mistake Penalty", requiredCount: 3, currentCount: 0 }); }}
                    onMistake={handleMistake} 
                    onRequestNewQuote={() => setCurrentQuote(null)}
                    streak={streak} 
                    ghostWpm={avgWpmVal} 
                    settings={settings} 
                    gameMode={gameMode} 
                    updateWordProficiency={updateWordProficiency}
                />
            ) : (
                <div className="flex flex-col items-center text-stone-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-frog-500" />
                    <p className="font-mono text-xs italic opacity-60">Seeking wisdom...</p>
                </div>
            )}
        </>;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-transparent text-stone-800 font-sans selection:bg-frog-200 transition-colors duration-1000 ${isLocked ? 'bg-stone-100' : ''}`}>
      <header className={`sticky top-0 z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/50 px-6 py-3 transition-all ${isLocked ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black text-frog-500 tracking-tight flex items-center gap-2 select-none">
            <span className="text-2xl drop-shadow-sm">🐸</span> Frog Type
          </h1>
          <div className="flex gap-2">
             <button onClick={() => setGameMode('QUOTES')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${gameMode === 'QUOTES' ? 'bg-stone-200 text-frog-500 shadow-inner ring-1 ring-stone-300' : 'text-stone-400 hover:bg-stone-200 hover:text-stone-600'}`} title="Quotes Mode"><BookOpen className="w-4 h-4" /></button>
             <button onClick={() => setGameMode('TEN_FAST')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${gameMode === 'TEN_FAST' ? 'bg-stone-200 text-frog-500 shadow-inner ring-1 ring-stone-300' : 'text-stone-400 hover:bg-stone-200 hover:text-stone-600'}`} title="10 Fast Sprint"><Zap className="w-4 h-4" /></button>
             <button onClick={() => setGameMode('BOOK')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${gameMode === 'BOOK' ? 'bg-stone-200 text-frog-500 shadow-inner ring-1 ring-stone-300' : 'text-stone-400 hover:bg-stone-200 hover:text-stone-600'}`} title="Book Mode"><Library className="w-4 h-4" /></button>
             <button onClick={() => setGameMode('DRILL')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${gameMode === 'DRILL' ? 'bg-stone-200 text-frog-500 shadow-inner ring-1 ring-stone-300' : 'text-stone-400 hover:bg-stone-200 hover:text-stone-600'}`} title="Drill Mistakes"><Brain className="w-4 h-4" /></button>
             <button onClick={() => setIsMusicOpen(true)} className={`p-2 transition-all rounded-xl ${isMusicOpen || settings.musicConfig.source !== 'NONE' ? 'text-frog-500 bg-frog-50 shadow-sm ring-1 ring-frog-100' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'}`} title="Music Player"><Music className="w-5 h-5" /></button>
             <button onClick={() => setIsStatsOpen(true)} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-all" title="User Stats"><User className="w-5 h-5" /></button>
             <button onClick={() => setIsThemeOpen(true)} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-all" title="Themes"><Palette className="w-5 h-5" /></button>
             <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-all" title="Settings"><SettingsIcon className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 relative">
        {pendingWordDrill ? (
            <div className="w-full max-w-2xl bg-red-50 p-12 rounded-[3rem] border-4 border-red-100 shadow-2xl text-center animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center gap-6">
                    <Brain className="w-16 h-16 text-red-500 animate-pulse" />
                    <h2 className="text-4xl font-black text-red-700 tracking-tight">STRICT DISCIPLINE</h2>
                    <p className="text-red-500 font-bold">Repeat the word <span className="underline font-black text-2xl">{pendingWordDrill.word}</span> 15 times to continue.</p>
                    <div className="relative mt-8 group">
                        <div className="text-7xl font-black text-red-200/40 tracking-widest uppercase">{pendingWordDrill.word}</div>
                        <input autoFocus className="absolute inset-0 bg-transparent text-center text-7xl font-black tracking-widest text-red-600 outline-none uppercase" onChange={handleDrillInput} />
                    </div>
                    <div className="mt-8 flex flex-col items-center">
                        <div className="text-red-400 font-black text-3xl font-mono">{pendingWordDrill.currentCount} / {pendingWordDrill.requiredCount}</div>
                        <div className="w-64 h-3 bg-red-100 rounded-full mt-2 overflow-hidden border border-red-200">
                            <div className="h-full bg-red-500 transition-all" style={{ width: `${(pendingWordDrill.currentCount/15)*100}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        ) : renderGameMode()}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-stone-50/80 backdrop-blur-md border-t border-stone-200/50">
           <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                <ProgressBar xp={userXP} avgWpm={avgWpmVal} mistakeCount={mistakePool.length} />
                <div className="flex gap-8 ml-8 shrink-0">
                    <div className="flex flex-col"><span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Mastered</span><span className="font-bold text-frog-500">{masteredQuotes.length}</span></div>
                    <div className="flex flex-col"><span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Streak</span><span className="font-bold text-orange-500">{streak}</span></div>
                </div>
           </div>
      </footer>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} setSettings={setSettings} />
      <ThemeModal isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} currentThemeId={settings.themeId} setThemeId={(id) => setSettings({ ...settings, themeId: id })} currentLevel={getCurrentLevel(userXP)} allLevels={LEVELS} />
      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} avgWpm={avgWpmVal} history={testHistory} onPractice={() => {}} totalTime={0} joinDate={joinDate} streak={streak} userName={userName} setUserName={setUserName} completedTestsCount={testHistory.length} userXP={userXP} />
      <MusicPlayer isOpen={isMusicOpen} onClose={() => setIsMusicOpen(false)} settings={settings} setSettings={setSettings} userXP={userXP} />
    </div>
  );
};

export default App;
