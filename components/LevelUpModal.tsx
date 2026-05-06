import React, { useEffect, useState } from 'react';
import { Level } from '../types';
import { Sparkles, Palette, Radio, ArrowUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LevelUpModalProps {
  newLevel: Level;
  prevLevelName: string | null;
  onClose: () => void;
}

const colorMap: Record<string, { main: string, soft: string }> = {
  stone: { main: '#57534e', soft: '#f5f5f4' },
  lime: { main: '#65a30d', soft: '#ecfccb' },
  emerald: { main: '#059669', soft: '#d1fae5' },
  cyan: { main: '#0891b2', soft: '#cffafe' },
  blue: { main: '#2563eb', soft: '#dbeafe' },
  violet: { main: '#7c3aed', soft: '#ede9fe' },
  orange: { main: '#ea580c', soft: '#ffedd5' },
  red: { main: '#dc2626', soft: '#fee2e2' },
};

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ newLevel, prevLevelName, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (prevLevelName && newLevel.name !== prevLevelName) {
      setIsOpen(true);
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const colors = ['#4ade80', '#22c55e', '#16a34a', '#a855f7', '#fbbf24'];

      const frame = () => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return;
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });
        requestAnimationFrame(frame);
      };
      frame();
    }
  }, [newLevel.name, prevLevelName]);

  if (!isOpen) return null;

  const close = () => {
     setIsOpen(false);
     onClose();
  };

  const levelColor = colorMap[newLevel.color]?.main || '#40D672';
  const levelSoft = colorMap[newLevel.color]?.soft || '#dcfce7';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-8 text-center relative border-4" style={{ borderColor: levelColor }}>
        
        <div className="mx-auto flex items-center justify-center mb-6 relative">
             <div className="absolute w-32 h-32 rounded-full animate-ping opacity-20" style={{ backgroundColor: levelColor }}></div>
             <div className="w-32 h-32 rounded-full flex items-center justify-center border-8 shadow-xl relative z-10" style={{ backgroundColor: levelSoft, borderColor: levelColor, color: levelColor }}>
                 <ArrowUp className="w-16 h-16" />
             </div>
        </div>

        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-stone-400 mb-2">Rank Up!</h3>
        <h2 className="text-4xl font-black tracking-tight mb-2" style={{ color: levelColor }}>{newLevel.name}</h2>
        <p className="text-stone-500 mb-8 font-medium">You have evolved to the {newLevel.tier} tier!</p>

        <div className="bg-stone-50 rounded-2xl p-6 text-left mb-8 border border-stone-100 shadow-inner">
           <h4 className="font-bold text-sm tracking-wide text-stone-700 uppercase mb-4 flex items-center gap-2">
             <Sparkles className="w-4 h-4 text-orange-400" /> New Unlocks
           </h4>
           <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Palette className="w-5 h-5"/></div>
                  <div>
                      <div className="font-bold text-stone-800">New Color Themes</div>
                      <div className="text-xs text-stone-500">Check the Themes menu to see {newLevel.name} colors!</div>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Radio className="w-5 h-5"/></div>
                  <div>
                      <div className="font-bold text-stone-800">New Music Stations</div>
                      <div className="text-xs text-stone-500">More radio stations are now available in the Music tab!</div>
                  </div>
               </div>
           </div>
        </div>

        <button onClick={close} className="w-full flex items-center justify-center gap-2 py-4 text-white rounded-2xl font-black text-xl shadow-lg shadow-stone-200 transition-transform hover:scale-[1.02]" style={{ backgroundColor: levelColor }}>
           Awesome!
        </button>
      </div>
    </div>
  );
};
