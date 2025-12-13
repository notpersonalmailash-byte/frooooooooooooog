import React from 'react';
import { X, Palette, Lock, Check, Crown } from 'lucide-react';
import { Theme, Level } from '../types';
import { THEMES } from '../data/themes';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  setThemeId: (id: string) => void;
  currentLevel: Level;
  allLevels: Level[];
}

const ThemeModal: React.FC<ThemeModalProps> = ({ 
  isOpen, 
  onClose, 
  currentThemeId, 
  setThemeId, 
  currentLevel,
  allLevels 
}) => {
  if (!isOpen) return null;

  const getLevelIndex = (tier: string) => {
    // Find the first level with this tier to determine order
    return allLevels.findIndex(l => l.tier === tier);
  };

  const currentTierIndex = getLevelIndex(currentLevel.tier);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-stone-100 bg-white sticky top-0 z-10">
          <div>
             <h2 className="text-lg font-black text-stone-800 tracking-tight flex items-center gap-2">
               <Palette className="w-5 h-5 text-frog-green" /> Visual Themes
             </h2>
             <p className="text-xs text-stone-400 font-medium mt-0.5">Customize your typing sanctuary</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 custom-scrollbar flex-1 min-h-0 bg-stone-50/50">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {THEMES.map((theme) => {
                  const requiredTierIndex = getLevelIndex(theme.minTier);
                  const isLocked = currentTierIndex < requiredTierIndex && currentLevel.tier !== theme.minTier;
                  const isActive = currentThemeId === theme.id;

                  return (
                    <button
                      key={theme.id}
                      onClick={() => !isLocked && setThemeId(theme.id)}
                      disabled={isLocked}
                      className={`relative group flex flex-col items-start text-left p-4 rounded-xl border-2 transition-all duration-300 w-full overflow-hidden
                        ${isActive 
                            ? 'border-frog-green bg-white ring-2 ring-frog-green/20 shadow-md transform scale-[1.02]' 
                            : isLocked 
                                ? 'border-stone-100 bg-stone-100/50 opacity-70 cursor-not-allowed grayscale' 
                                : 'border-stone-200 bg-white hover:border-frog-green/50 hover:shadow-md'
                        }
                      `}
                    >
                        {/* Color Preview Strips */}
                        <div className="absolute top-0 right-0 left-0 h-2 flex opacity-80">
                            <div className="flex-1" style={{ backgroundColor: theme.colors.frog[500] }}></div>
                            <div className="flex-1" style={{ backgroundColor: theme.colors.frog[300] }}></div>
                            <div className="flex-1" style={{ backgroundColor: theme.colors.stone[500] }}></div>
                            <div className="flex-1" style={{ backgroundColor: theme.colors.background }}></div>
                        </div>

                        <div className="flex justify-between w-full mt-2 mb-2">
                           <span className={`font-bold text-sm ${isActive ? 'text-frog-green' : 'text-stone-700'}`}>
                              {theme.name}
                           </span>
                           {isActive && <div className="bg-frog-green text-white p-1 rounded-full"><Check className="w-3 h-3" /></div>}
                           {isLocked && <div className="bg-stone-200 text-stone-500 p-1 rounded-full"><Lock className="w-3 h-3" /></div>}
                        </div>

                        <p className="text-xs text-stone-400 mb-4 line-clamp-2 min-h-[2.5em]">
                            {theme.description}
                        </p>

                        {/* Unlock Requirement Label */}
                        <div className={`mt-auto text-[10px] font-mono uppercase tracking-wider py-1 px-2 rounded-md font-bold flex items-center gap-1.5 w-full justify-center
                            ${isLocked 
                                ? 'bg-stone-200 text-stone-500' 
                                : isActive 
                                    ? 'bg-frog-green/10 text-frog-green' 
                                    : 'bg-stone-100 text-stone-400 group-hover:bg-frog-green/5 group-hover:text-frog-green'
                            }
                        `}>
                            {isLocked ? (
                                <>
                                  <Lock className="w-3 h-3" /> Requires {theme.minTier}
                                </>
                            ) : (
                                <>
                                  <Crown className="w-3 h-3" /> Unlocked
                                </>
                            )}
                        </div>

                        {/* Decoration Background Circle */}
                        <div 
                           className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 pointer-events-none transition-transform group-hover:scale-150"
                           style={{ backgroundColor: theme.colors.frog[500] }}
                        ></div>
                    </button>
                  );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;