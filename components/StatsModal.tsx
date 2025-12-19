
import React, { useState, useEffect } from 'react';
import { X, TrendingUp, History, Calendar, ArrowLeft, BookOpen, Eraser, RotateCcw, Clock, Flag, User, Flame, Edit2, Library, Zap, Target, Star, AlertCircle, ChevronRight, BarChart3, LayoutGrid, Trophy, Brain, Activity } from 'lucide-react';
import { TestResult, WeakWord } from '../types';
import { getCurrentLevel } from '../utils/gameLogic';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  avgWpm: number;
  history: TestResult[];
  onPractice: (mistakes: string[]) => void;
  totalTime: number; 
  joinDate: string;
  streak: number; 
  userName: string;
  setUserName: (name: string) => void;
  completedTestsCount: number;
  userXP: number;
}

const StatsModal: React.FC<StatsModalProps> = ({ 
  isOpen, onClose, avgWpm, history, onPractice,
  totalTime, joinDate, streak, userName, setUserName, completedTestsCount, userXP
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HISTORY' | 'WEAK_WORDS'>('OVERVIEW');
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(userName);
  const [weakWords, setWeakWords] = useState<WeakWord[]>([]);

  useEffect(() => {
    setEditNameValue(userName);
    // Load weak words from local storage
    const stored = localStorage.getItem('frogType_weakWords');
    if (stored) {
        setWeakWords(JSON.parse(stored));
    }
  }, [userName, isOpen]);

  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).format(date);
  };
  
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (seconds: number) => {
     const h = Math.floor(seconds / 3600);
     const m = Math.floor((seconds % 3600) / 60);
     if (h > 0) return `${h}h ${m}m`;
     return `${m}m`;
  };

  const handleNameSave = () => {
      const trimmed = editNameValue.trim();
      if (trimmed) setUserName(trimmed);
      else setEditNameValue(userName);
      setIsEditingName(false);
  };

  const currentLevel = getCurrentLevel(userXP);
  const bestWpm = history.length > 0 ? Math.max(...history.map(h => h.wpm)) : 0;
  const totalMistakes = history.reduce((acc, curr) => acc + (curr.mistakes?.length || 0), 0);

  if (selectedResult) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
             <div className="flex justify-between items-center p-5 border-b border-stone-100 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                   <button onClick={() => setSelectedResult(null)} className="p-1 hover:bg-stone-100 rounded-full transition-colors mr-1">
                     <ArrowLeft className="w-5 h-5 text-stone-500" />
                   </button>
                   <div>
                       <h2 className="text-lg font-black text-stone-800 tracking-tight">Run Details</h2>
                       <p className="text-xs text-stone-400 font-medium">{formatDateTime(selectedResult.date)}</p>
                   </div>
                </div>
                <button onClick={onClose} className="p-2 -mr-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-50 transition-colors"><X className="w-5 h-5" /></button>
             </div>
             <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar bg-stone-50/50">
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                   <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider mb-2"><BookOpen className="w-3 h-3" /> Quote Text</div>
                   <p className="font-mono text-lg leading-relaxed text-stone-700">{selectedResult.quoteText || "Details unavailable."}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                   <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm text-center">
                       <div className="text-[10px] font-bold text-stone-400 uppercase">Speed</div>
                       <div className="text-xl font-black text-frog-green">{selectedResult.wpm} WPM</div>
                   </div>
                   <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm text-center">
                       <div className="text-[10px] font-bold text-stone-400 uppercase">Retries</div>
                       <div className="text-xl font-black text-stone-700">{selectedResult.retryCount || 0}</div>
                   </div>
                   <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm text-center">
                       <div className="text-[10px] font-bold text-stone-400 uppercase">XP</div>
                       <div className="text-xl font-black text-stone-700">+{selectedResult.xpEarned}</div>
                   </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                   <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider"><Eraser className="w-3 h-3" /> Mistakes ({selectedResult.mistakes?.length || 0})</div>
                       {(selectedResult.mistakes?.length || 0) > 0 && (
                           <button onClick={() => { onPractice(selectedResult.mistakes); onClose(); }} className="text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm transition-transform active:scale-95"><RotateCcw className="w-3 h-3" /> Practice These</button>
                       )}
                   </div>
                   {(selectedResult.mistakes?.length || 0) > 0 ? (
                       <div className="flex flex-wrap gap-2">
                          {selectedResult.mistakes?.map((word, i) => (
                              <span key={i} className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded border border-red-100">{word}</span>
                          ))}
                       </div>
                   ) : (
                       <p className="text-xs text-stone-400 italic">Perfect run! No mistakes to practice.</p>
                   )}
                </div>
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] h-[600px]" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white border-b border-stone-100 sticky top-0 z-20">
            <div className="flex justify-between items-start p-6 pb-2">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-frog-green/10 rounded-full flex items-center justify-center text-4xl shadow-inner ring-4 ring-white">🐸</div>
                    <div>
                        <div className="flex items-center gap-2">
                            {isEditingName ? (
                                <div className="flex items-center gap-1">
                                    <input autoFocus className="font-black text-2xl text-stone-800 bg-stone-50 border-b-2 border-frog-green outline-none w-40" value={editNameValue} onChange={(e) => setEditNameValue(e.target.value)} onBlur={handleNameSave} onKeyDown={(e) => e.key === 'Enter' && handleNameSave()} />
                                    <button onClick={handleNameSave} className="text-frog-green text-xs font-bold uppercase hover:bg-frog-green/10 p-1 rounded">Save</button>
                                </div>
                            ) : (
                                <h2 className="font-black text-2xl text-stone-800 tracking-tight flex items-center gap-2 group cursor-pointer hover:text-frog-green transition-colors" onClick={() => setIsEditingName(true)}>{userName} <Edit2 className="w-4 h-4 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" /></h2>
                            )}
                        </div>
                        <div className="flex flex-col gap-0.5 mt-1">
                            <p className="text-xs text-stone-400 font-medium flex items-center gap-1"><User className="w-3 h-3" /> {currentLevel.tier} Rank</p>
                            <p className="text-xs text-stone-400 font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {formatDate(joinDate)}</p>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 -mr-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-50 transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex px-6 gap-6 mt-4">
                <button onClick={() => setActiveTab('OVERVIEW')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'OVERVIEW' ? 'text-frog-green border-frog-green' : 'text-stone-400 border-transparent hover:text-stone-600'}`}><LayoutGrid className="w-4 h-4" /> Overview</button>
                <button onClick={() => setActiveTab('HISTORY')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'HISTORY' ? 'text-frog-green border-frog-green' : 'text-stone-400 border-transparent hover:text-stone-600'}`}><History className="w-4 h-4" /> Log</button>
                <button onClick={() => setActiveTab('WEAK_WORDS')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'WEAK_WORDS' ? 'text-red-500 border-red-500' : 'text-stone-400 border-transparent hover:text-stone-600'}`}><Brain className="w-4 h-4" /> Weak Words</button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-stone-50/50 p-6">
            {activeTab === 'OVERVIEW' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className={`bg-gradient-to-br from-${currentLevel.color}-50 to-white p-5 rounded-2xl border border-${currentLevel.color}-100 shadow-sm relative overflow-hidden`}>
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Current Status</div>
                                <div className={`text-3xl font-black text-${currentLevel.color}-600 tracking-tight`}>{currentLevel.name}</div>
                                <div className="text-sm font-medium text-stone-500 mt-1">XP: {userXP.toLocaleString()}</div>
                            </div>
                            <div className={`w-16 h-16 rounded-full bg-${currentLevel.color}-100 flex items-center justify-center text-3xl shadow-inner border-4 border-white`}><Star className={`w-8 h-8 text-${currentLevel.color}-500 fill-current`} /></div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Metrics</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:border-frog-green/30 transition-colors group">
                                <div className="flex items-center gap-2 mb-2 text-stone-400 group-hover:text-frog-green transition-colors"><Zap className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Avg Speed</span></div>
                                <div className="text-2xl font-black text-stone-800">{avgWpm} <span className="text-sm font-medium text-stone-400">WPM</span></div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:border-frog-green/30 transition-colors group">
                                <div className="flex items-center gap-2 mb-2 text-stone-400 group-hover:text-frog-green transition-colors"><Trophy className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Best</span></div>
                                <div className="text-2xl font-black text-stone-800">{bestWpm} <span className="text-sm font-medium text-stone-400">WPM</span></div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:border-frog-green/30 transition-colors group">
                                <div className="flex items-center gap-2 mb-2 text-stone-400 group-hover:text-frog-green transition-colors"><Flame className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Streak</span></div>
                                <div className="text-2xl font-black text-stone-800">{streak} <span className="text-sm font-medium text-stone-400">D</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'HISTORY' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {history.length === 0 ? (
                        <div className="text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50"><History className="w-10 h-10 mx-auto mb-3 opacity-20" /><p className="font-bold">No history yet.</p></div>
                    ) : (
                        <div className="space-y-3">
                            {history.slice().reverse().map((result) => (
                                <button key={result.id} onClick={() => setSelectedResult(result)} className="w-full text-left bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between transition-all hover:scale-[1.01] hover:border-frog-green/50 hover:shadow-md group">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white tracking-wide uppercase ${result.mode === 'HARDCORE' ? 'bg-stone-800' : result.mode === 'XWORDS' ? 'bg-red-500' : result.mode === 'MINIGAMES' ? 'bg-purple-500' : 'bg-frog-green'}`}>{result.mode}</span>
                                            <span className="text-xs text-stone-400 font-mono">{formatDateTime(result.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="font-black text-xl text-stone-800">{result.wpm} <span className="text-xs font-medium text-stone-400">WPM</span></span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-frog-green transition-colors" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'WEAK_WORDS' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-full"><Brain className="w-6 h-6" /></div>
                        <div>
                            <h4 className="font-black text-red-800">Conquer Your Obstacles</h4>
                            <p className="text-xs text-red-600/70">These words are slowing you down. Drill them to perfection.</p>
                        </div>
                    </div>

                    {weakWords.length === 0 ? (
                        <div className="text-center py-12 text-stone-400 bg-white rounded-2xl border border-stone-100">
                            <Star className="w-10 h-10 mx-auto mb-3 text-yellow-400 opacity-50" />
                            <p className="font-bold">No weak words yet!</p>
                            <p className="text-xs">Your accuracy is impressive.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {weakWords.sort((a,b) => b.mistakeCount - a.mistakeCount).map((ww) => (
                                <div key={ww.word} className="bg-white p-4 rounded-xl border border-stone-200 flex items-center justify-between group hover:border-red-300 transition-all">
                                    <div className="flex flex-col">
                                        <span className="font-mono font-bold text-lg text-stone-800">{ww.word}</span>
                                        <span className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1"><Activity className="w-3 h-3" /> {ww.mistakeCount} Mistakes</span>
                                    </div>
                                    <button 
                                        onClick={() => { onPractice([ww.word]); onClose(); }}
                                        className="p-2 bg-stone-50 text-stone-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                        title="Drill this word"
                                    >
                                        <Target className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
