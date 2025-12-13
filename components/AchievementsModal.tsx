import React from 'react';
import { X, Award, Lock } from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedIds: string[];
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, unlockedIds }) => {
  if (!isOpen) return null;

  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENTS.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

  // Sort achievements: Locked first, then Unlocked at the bottom (as per user request)
  const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
      const isALocked = !unlockedIds.includes(a.id);
      const isBLocked = !unlockedIds.includes(b.id);
      
      // If one is locked and the other isn't, locked comes first (return -1)
      if (isALocked && !isBLocked) return -1;
      if (!isALocked && isBLocked) return 1;
      
      // Secondary sort: Category then difficulty (implied by array order)
      return 0;
  });

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-stone-50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-stone-200 bg-stone-50 sticky top-0 z-10">
          <div>
             <h2 className="text-lg font-black text-stone-800 tracking-tight flex items-center gap-2">
               <Award className="w-6 h-6 text-frog-green" /> Achievements
             </h2>
             <p className="text-xs text-stone-500 font-medium mt-0.5">
               Unlocking Greatness ({unlockedCount}/{totalCount})
             </p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-stone-200">
          <div 
            className="h-full bg-frog-green transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 custom-scrollbar flex-1 min-h-0 bg-stone-100/50">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedAchievements.map((ach) => {
                  const isUnlocked = unlockedIds.includes(ach.id);
                  return (
                    <div 
                      key={ach.id}
                      className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300
                        ${isUnlocked 
                            ? 'bg-white border-frog-green/30 shadow-sm opacity-100' 
                            : 'bg-stone-100 border-stone-200 opacity-60 grayscale'
                        }
                      `}
                    >
                        {/* 
                           Updated Container:
                           Unlocked: Transparent bg, frog-green ring
                           Locked: Stone-200 bg
                        */}
                        <div className={`p-3 rounded-full flex-shrink-0 ${isUnlocked ? 'bg-transparent ring-1 ring-frog-green' : 'bg-stone-200'}`}>
                           {isUnlocked ? <span className="text-frog-green">{ach.icon}</span> : <Lock className="w-5 h-5 text-stone-400" />}
                        </div>
                        
                        <div>
                           <h3 className={`font-bold text-sm ${isUnlocked ? 'text-stone-800' : 'text-stone-500'}`}>
                              {ach.title}
                           </h3>
                           <p className="text-xs text-stone-500 leading-tight mt-0.5">
                              {ach.description}
                           </p>
                           {isUnlocked && (
                             <div className="mt-2 text-[10px] font-bold text-frog-green uppercase tracking-wider bg-frog-green/10 inline-block px-1.5 py-0.5 rounded">
                               Unlocked
                             </div>
                           )}
                        </div>
                    </div>
                  );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsModal;