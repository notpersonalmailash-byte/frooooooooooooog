
import React from 'react';
import { getCurrentLevel, LEVELS, checkLevelProgress } from '../utils/gameLogic';
import { Gauge } from 'lucide-react';

interface ProgressBarProps {
  xp: number;
  avgWpm: number;
  mistakeCount: number;
  remediationCount?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ xp, avgWpm, mistakeCount, remediationCount = 0 }) => {
  const { currentLevel, nextLevel } = checkLevelProgress(xp, avgWpm, mistakeCount, remediationCount);
  const currentLevelIndex = LEVELS.indexOf(currentLevel);
  const totalLevels = LEVELS.length;

  let levelProgress = 0;

  if (nextLevel) {
    const xpInLevel = xp - currentLevel.minXP;
    const levelSpan = nextLevel.minXP - currentLevel.minXP;
    levelProgress = Math.min(1, Math.max(0, xpInLevel / levelSpan));
  } else {
    levelProgress = 1;
  }

  const percentPerLevel = 100 / totalLevels;
  const globalProgress = (currentLevelIndex + levelProgress) * percentPerLevel;

  return (
    <div className="w-full flex flex-col justify-center">
      <div className="flex justify-between items-end mb-1 px-1">
        <div className="flex items-baseline gap-2">
          <span className={`text-xs font-black transition-colors duration-500 text-frog-500 uppercase tracking-widest`}>
             {currentLevel.name}
          </span>
          <span className="text-[9px] text-stone-400 font-mono opacity-80">{xp.toLocaleString()} / 1,000 XP</span>
        </div>
        
        <div className="text-right flex items-center gap-2">
           {nextLevel ? (
             <>
               <span className="text-[9px] text-stone-300 font-bold uppercase tracking-wider">Next:</span>
               <span className="text-[10px] font-black text-stone-500 uppercase">{nextLevel.name}</span>
               <span className="flex items-center gap-0.5 text-[9px] text-stone-300 ml-1 font-mono" title={`Target Speed: ${nextLevel.requiredWpm} WPM`}>
                  <Gauge className="w-2.5 h-2.5" /> {nextLevel.requiredWpm}
               </span>
             </>
           ) : (
               <span className="text-[10px] font-black text-frog-500 uppercase tracking-widest animate-pulse">Frog Sage Master</span>
           )}
        </div>
      </div>
      
      <div className="relative w-full h-5">
          <div className="absolute bottom-0 left-0 right-0 h-1.5 flex rounded-full overflow-hidden shadow-inner bg-stone-200/50 ring-1 ring-stone-200/20">
             {LEVELS.map((level, idx) => {
                 const isPassed = idx < currentLevelIndex;
                 const isCurrent = idx === currentLevelIndex;
                 
                 // Use static tier-based color if not at the current level, 
                 // but ensure the current progress is themed
                 let bgStyle = { backgroundColor: `var(--stone-${idx * 100 + 100})` };
                 if (isPassed || isCurrent) {
                    bgStyle = { backgroundColor: 'var(--frog-400)' };
                 }

                 return (
                     <div 
                        key={level.name}
                        style={bgStyle}
                        className={`flex-1 transition-all duration-300 border-r border-white/10 last:border-0 ${idx > currentLevelIndex ? 'opacity-20' : 'opacity-100'}`}
                        title={level.name}
                     />
                 );
             })}
          </div>

          <div 
            className="absolute top-0 bottom-0 z-10 flex flex-col items-center justify-end pointer-events-none transition-all duration-700 ease-out"
            style={{ 
                left: `${globalProgress}%`,
                transform: `translateX(-50%)`
            }}
          >
             <div className="relative mb-0.5 transform-gpu hover:scale-110 transition-transform">
                 <span className="text-base block filter drop-shadow-[0_0_8px_var(--frog-300)] animate-pulse">
                    🐸
                 </span>
             </div>
             <div className="w-0.5 h-1 bg-stone-900/30 rounded-full mb-0.5"></div>
          </div>
      </div>
    </div>
  );
};

export default ProgressBar;
