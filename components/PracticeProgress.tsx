import React from 'react';
import { PRACTICE_ORDER } from '../services/quoteService';
import { Lock, ChevronRight } from 'lucide-react';

interface PracticeProgressProps {
  level: number;
}

const PracticeProgress: React.FC<PracticeProgressProps> = ({ level }) => {
  const unlockedCount = Math.min(6 + level, PRACTICE_ORDER.length);
  const currentLetter = PRACTICE_ORDER[Math.min(unlockedCount - 1, PRACTICE_ORDER.length - 1)].toUpperCase();

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
       <div className="bg-white/80 backdrop-blur-md border border-stone-200 rounded-full h-12 pl-5 pr-2 shadow-sm flex items-center gap-4">
          
          {/* Left Label Section */}
          <div className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col leading-none">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Practice</span>
                  <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-stone-700">Lvl {level + 1}</span>
                      <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                      <span className="text-xs font-bold text-frog-green">Focus: {currentLetter}</span>
                  </div>
              </div>
              <div className="h-6 w-px bg-stone-200 mx-1"></div>
          </div>
          
          {/* Scrollable Keys Section */}
          <div className="flex-grow overflow-x-auto custom-scrollbar no-scrollbar mask-linear-fade">
             <div className="flex flex-nowrap items-center gap-1 pr-4">
                 {PRACTICE_ORDER.map((char, index) => {
                     const isUnlocked = index < unlockedCount;
                     const isFocus = index === unlockedCount - 1;
                     const isNext = index === unlockedCount;

                     return (
                       <div 
                          key={char}
                          className={`
                             w-6 h-8 flex flex-col items-center justify-center rounded text-[10px] font-mono font-bold transition-all duration-300 relative select-none shrink-0
                             ${isFocus 
                                 ? 'bg-frog-green text-white shadow-sm scale-110 z-10' 
                                 : isUnlocked 
                                     ? 'bg-stone-50 text-stone-500 border border-stone-100' 
                                     : 'bg-transparent text-stone-300 border border-transparent dashed-border'
                             }
                          `}
                       >
                          {isNext ? <Lock className="w-2.5 h-2.5 opacity-40" /> : char.toUpperCase()}
                       </div>
                     );
                 })}
             </div>
          </div>

          {/* Right End Decor */}
          <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-stone-50 border border-stone-100 shrink-0 text-stone-300">
              <ChevronRight className="w-4 h-4" />
          </div>

       </div>
    </div>
  );
};

export default PracticeProgress;