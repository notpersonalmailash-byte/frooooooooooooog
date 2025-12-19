
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
  const textColor = `text-${currentLevel.color}-${currentLevel.shade}`;

  return (
    <div className="w-full flex flex-col justify-center">
      <div className="flex justify-between items-end mb-2 px-1">
        <div className="flex items-baseline gap-2">
          <span className={`text-sm font-bold transition-colors duration-500 ${textColor}`}>
             {currentLevel.name}
          </span>
          <span className="text-[10px] text-stone-400 font-mono">{xp.toLocaleString()} XP</span>
        </div>
        
        <div className="text-right flex items-center gap-2">
           {nextLevel ? (
             <>
               <span className="text-[10px] text-stone-300">Next:</span>
               <span className="text-xs font-semibold text-stone-500">{nextLevel.name}</span>
               <span className="flex items-center gap-0.5 text-[10px] text-stone-300 ml-1" title={`Target Speed: ${nextLevel.requiredWpm} WPM`}>
                  <Gauge className="w-3 h-3" /> {nextLevel.requiredWpm}
               </span>
             </>
           ) : (
               <span className="text-xs font-semibold text-frog-600">Frog Sage Mastery</span>
           )}
        </div>
      </div>
      
      <div className="relative w-full h-8">
          <div className="absolute bottom-0 left-0 right-0 h-3 flex rounded-full overflow-hidden shadow-sm ring-1 ring-stone-200/50 bg-stone-100">
             {LEVELS.map((level, idx) => {
                 const isPassed = idx < currentLevelIndex;
                 const isCurrent = idx === currentLevelIndex;
                 const colorClass = `bg-${level.color}-${level.shade}`;
                 let opacityClass = idx > currentLevelIndex ? 'opacity-30' : 'opacity-100';

                 return (
                     <div 
                        key={level.name}
                        className={`flex-1 ${colorClass} ${opacityClass} transition-all duration-300 border-r border-white/20 last:border-0`}
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
             <div className="relative mb-0.5">
                 <span className="text-xl block filter drop-shadow-sm animate-pulse">
                    🐸
                 </span>
             </div>
             <div className="w-0.5 h-1.5 bg-stone-800/20 rounded-full mb-1"></div>
          </div>
      </div>
    </div>
  );
};

export default ProgressBar;
