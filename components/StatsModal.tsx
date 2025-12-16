
import React, { useState, useEffect } from 'react';
import { X, TrendingUp, History, Calendar, ArrowLeft, BookOpen, Eraser, RotateCcw, Clock, Flag, User, Flame, Edit2, Library } from 'lucide-react';
import { TestResult } from '../types';
import { QUOTES } from '../data/quotes';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  avgWpm: number;
  history: TestResult[];
  onPractice: (mistakes: string[]) => void;
  // New Stats Props
  totalTime: number; // in seconds
  joinDate: string;
  streak: number; // This is now Daily Streak
  userName: string;
  setUserName: (name: string) => void;
  completedTestsCount: number;
}

const StatsModal: React.FC<StatsModalProps> = ({ 
  isOpen, onClose, avgWpm, history, onPractice,
  totalTime, joinDate, streak, userName, setUserName, completedTestsCount
}) => {
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(userName);

  // Sync internal edit state when prop changes
  useEffect(() => {
    setEditNameValue(userName);
  }, [userName]);

  if (!isOpen) return null;

  // Calculate some aggregate stats
  const totalQuotesAvailable = QUOTES.length;
  
  // Format date helper
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (seconds: number) => {
     const h = Math.floor(seconds / 3600);
     const m = Math.floor((seconds % 3600) / 60);
     if (h > 0) return `${h}h ${m}m`;
     return `${m}m`;
  };

  const handlePracticeClick = () => {
    if (selectedResult && selectedResult.mistakes && selectedResult.mistakes.length > 0) {
      onPractice(selectedResult.mistakes);
      onClose();
    }
  };

  const handleNameSave = () => {
      const trimmed = editNameValue.trim();
      if (trimmed) {
          setUserName(trimmed);
      } else {
          setEditNameValue(userName); // Revert if empty
      }
      setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleNameSave();
      if (e.key === 'Escape') {
          setEditNameValue(userName);
          setIsEditingName(false);
      }
  };

  // Sub-view: Details
  if (selectedResult) {
    return (
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
        >
             <div className="flex justify-between items-center p-5 border-b border-stone-100 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => setSelectedResult(null)}
                     className="p-1 hover:bg-stone-100 rounded-full transition-colors mr-1"
                   >
                     <ArrowLeft className="w-5 h-5 text-stone-500" />
                   </button>
                   <div>
                       <h2 className="text-lg font-black text-stone-800 tracking-tight">Run Details</h2>
                       <p className="text-xs text-stone-400 font-medium">{formatDateTime(selectedResult.date)}</p>
                   </div>
                </div>
                <button onClick={onClose} className="p-2 -mr-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-50 transition-colors">
                  <X className="w-5 h-5" />
                </button>
             </div>

             <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar bg-stone-50/50">
                {/* Quote Text */}
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                   <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                       <BookOpen className="w-3 h-3" /> Quote Text
                   </div>
                   <p className="font-mono text-lg leading-relaxed text-stone-700">
                      {selectedResult.quoteText || "Quote details unavailable for this run."}
                   </p>
                </div>

                {/* Metrics Grid */}
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

                {/* Mistakes */}
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                   <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
                           <Eraser className="w-3 h-3" /> Mistakes ({selectedResult.mistakes?.length || 0})
                       </div>
                       {(selectedResult.mistakes?.length || 0) > 0 && (
                           <button 
                             onClick={handlePracticeClick}
                             className="text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                           >
                              <RotateCcw className="w-3 h-3" /> Practice These
                           </button>
                       )}
                   </div>
                   
                   {(selectedResult.mistakes?.length || 0) > 0 ? (
                       <div className="flex flex-wrap gap-2">
                          {selectedResult.mistakes?.map((word, i) => (
                              <span key={i} className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded border border-red-100">
                                  {word}
                              </span>
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

  // Main View: History List
  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header with User Profile */}
        <div className="p-6 border-b border-stone-100 bg-white sticky top-0 z-10">
          <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-frog-green/10 rounded-full flex items-center justify-center text-3xl shadow-inner">
                      🐸
                  </div>
                  <div>
                      <div className="flex items-center gap-2">
                          {isEditingName ? (
                              <div className="flex items-center gap-1">
                                  <input 
                                    autoFocus
                                    className="font-black text-xl text-stone-800 bg-stone-50 border-b-2 border-frog-green outline-none w-32"
                                    value={editNameValue}
                                    onChange={(e) => setEditNameValue(e.target.value)}
                                    onBlur={handleNameSave}
                                    onKeyDown={handleKeyDown}
                                  />
                                  <button onClick={handleNameSave} className="text-frog-green text-xs font-bold uppercase hover:bg-frog-green/10 p-1 rounded">Save</button>
                              </div>
                          ) : (
                              <h2 className="font-black text-xl text-stone-800 tracking-tight flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                                  {userName} <Edit2 className="w-3 h-3 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </h2>
                          )}
                      </div>
                      <div className="flex flex-col gap-0.5 mt-1">
                          <p className="text-xs text-stone-400 font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Joined {formatDate(joinDate)}
                          </p>
                          <p className="text-xs text-stone-400 font-medium flex items-center gap-1">
                              <Library className="w-3 h-3" /> {totalQuotesAvailable} Quotes Available
                          </p>
                      </div>
                  </div>
              </div>
              <button onClick={onClose} className="p-2 -mr-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2">
             <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-center">
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1 flex justify-center items-center gap-1"><Flag className="w-3 h-3"/> Tests</div>
                 <div className="font-black text-stone-700 text-lg">{completedTestsCount}</div>
             </div>
             <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-center">
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1 flex justify-center items-center gap-1"><Clock className="w-3 h-3"/> Time</div>
                 <div className="font-black text-stone-700 text-lg">{formatDuration(totalTime)}</div>
             </div>
             <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-center">
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1 flex justify-center items-center gap-1"><Flame className="w-3 h-3 text-orange-400"/> Daily</div>
                 <div className="font-black text-orange-500 text-lg">{streak}</div>
             </div>
             <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-center">
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1 flex justify-center items-center gap-1"><TrendingUp className="w-3 h-3"/> Avg</div>
                 <div className="font-black text-frog-green text-lg">{avgWpm}</div>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-6 custom-scrollbar flex-1 min-h-0 bg-stone-50/50">
          
          {/* History List */}
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-sm font-bold text-stone-700 uppercase tracking-wider">
                <History className="w-4 h-4" /> Recent Tests
             </div>
             
             {history.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-sm border-2 border-dashed border-stone-200 rounded-xl">
                   No tests completed yet. <br/> Start typing to track your progress!
                </div>
             ) : (
                <div className="space-y-2">
                   {history.slice().reverse().map((result) => (
                      <button 
                         key={result.id} 
                         onClick={() => setSelectedResult(result)}
                         className="w-full text-left bg-white p-3 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between transition-transform hover:scale-[1.01] hover:border-frog-green/50 group"
                      >
                          <div className="flex flex-col">
                             <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                                    result.mode === 'HARDCORE' ? 'bg-stone-800' : 
                                    result.mode === 'XWORDS' ? 'bg-red-500' :
                                    result.mode === 'XQUOTES' ? 'bg-orange-500' : 'bg-frog-green'
                                }`}>
                                    {result.mode === 'XWORDS' ? 'XWORDS' : result.mode === 'XQUOTES' ? 'XQUOTES' : result.mode}
                                </span>
                                <span className="text-xs text-stone-400 flex items-center gap-1 group-hover:text-frog-green transition-colors">
                                    <Calendar className="w-3 h-3" /> {formatDateTime(result.date)}
                                </span>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                              <div className="text-right">
                                  <div className="text-xs text-stone-400 font-medium">XP</div>
                                  <div className="text-sm font-bold text-frog-green">+{result.xpEarned}</div>
                              </div>
                              <div className="w-px h-8 bg-stone-100"></div>
                              <div className="text-right w-16">
                                  <div className="text-xs text-stone-400 font-medium">Speed</div>
                                  <div className="text-lg font-black text-stone-700">{result.wpm}</div>
                              </div>
                          </div>
                      </button>
                   ))}
                </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatsModal;
