
import React from 'react';
import { 
  X, BookOpen, Crown, Gauge, AlertTriangle, ArrowRight
} from 'lucide-react';
import { Level } from '../types';
import { LEVELS } from '../utils/gameLogic';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: Level;
  completedTestsCount: number;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, currentLevel }) => {
  if (!isOpen) return null;

  // Group levels by tier
  const tiers = LEVELS.reduce((acc, level) => {
    if (!acc[level.tier]) acc[level.tier] = [];
    acc[level.tier].push(level);
    return acc;
  }, {} as Record<string, Level[]>);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-stone-100 bg-white sticky top-0 z-10 shrink-0">
          <div>
             <h2 className="text-2xl font-black text-frog-green tracking-tight flex items-center gap-3">
               <Crown className="w-6 h-6" /> Frog Evolution Journey
             </h2>
             <p className="text-sm text-stone-400 font-medium mt-1">From a humble egg to a mythic Frog Sage.</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-50 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto p-8 custom-scrollbar bg-stone-50/30 flex-1">
           <div className="space-y-8">
               <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                  <h3 className="text-lg font-black text-stone-800 mb-3 flex items-center gap-2">
                     <AlertTriangle className="w-5 h-5 text-orange-500" /> How to Evolve
                  </h3>
                  <div className="space-y-3 text-sm text-stone-600">
                     <p>
                        To climb the evolutionary ladder, you must gain <strong>XP</strong> by completing quotes perfectly. 
                     </p>
                     <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Accuracy is key:</strong> Mistakes give no points. Perfect runs multiply your XP.</li>
                        <li><strong>Speed requirements:</strong> Notice the Target WPM for each phase. </li>
                        <li><strong>Drill Mistakes to progress:</strong> <span className="font-bold text-red-500">Crucial Rule!</span> Every single time you are about to reach a new evolutionary level (e.g., passing from Egg II to Egg I), your progression is <strong>blocked</strong> if you have any recorded mistakes in your pool. You must complete the <strong>Drill Mistakes</strong> mode to clear your pool before evolving!</li>
                     </ul>
                  </div>
               </section>

               <section>
                  <h3 className="text-lg font-black text-stone-800 mb-4 flex items-center gap-2">
                     <BookOpen className="w-5 h-5 text-frog-green" /> The Tier List
                  </h3>
                  
                  <div className="space-y-4">
                     {Object.entries(tiers).map(([tierName, levels]) => {
                         const baseLevel = levels[levels.length - 1]; // The lowest level of the tier
                         const capLevel = levels[0]; // The highest level of the tier
                         return (
                             <div key={tierName} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-6">
                                <div className="text-4xl w-12 text-center" style={{ filter: `drop-shadow(0 0 10px var(--${baseLevel.color}-300))` }}>
                                   {tierName === 'Egg' ? '🥚' : 
                                    tierName === 'Tadpole' ? '🦠' : 
                                    tierName === 'Polliwog' ? '🐟' : 
                                    tierName === 'Froglet' ? '🐲' : 
                                    tierName === 'Hopper' ? '🐸' : 
                                    tierName === 'Tree Frog' ? '🦎' : 
                                    tierName === 'Bullfrog' ? '🐢' : '🐉'}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-lg" style={{ color: `var(--${baseLevel.color}-600)` }}>{tierName}</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {levels.reverse().map(l => (
                                            <div key={l.name} className={`px-2 py-1 rounded bg-stone-100 text-stone-600 text-xs font-bold border border-stone-200 flex items-center gap-1 ${currentLevel.name === l.name ? 'ring-2 ring-frog-green bg-green-50' : ''}`}>
                                                {l.name} <ArrowRight className="w-3 h-3 text-stone-300" /> <span className="font-mono text-[10px] bg-stone-200 px-1 rounded">{l.minXP} XP</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center gap-2 text-stone-400 font-mono text-sm">
                                    <Gauge className="w-4 h-4" />
                                    <span>{baseLevel.requiredWpm}-{capLevel.requiredWpm} WPM</span>
                                </div>
                             </div>
                         );
                     })}
                  </div>
               </section>
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-100 bg-stone-50 shrink-0 flex justify-center">
           <button 
             onClick={onClose}
             className="px-12 py-3 bg-frog-green hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-frog-green/20 transform active:scale-95"
           >
             Close Manual
           </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
