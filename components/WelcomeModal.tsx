import React, { useState } from 'react';
import { X, PlayCircle, Star, Music, Zap, ChevronRight, ChevronLeft } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const [slide, setSlide] = useState(0);
  
  if (!isOpen) return null;

  const SLIDES = [
    {
      icon: "🐸",
      title: "Welcome to Frog Type!",
      subtitle: "A mindful typing experience that evolves as you type.",
      content: (
        <div className="flex gap-4 items-start bg-frog-50 p-4 rounded-xl border border-frog-100 mt-4 text-left">
           <div className="bg-frog-200 text-frog-600 p-2 rounded-lg mt-1"><Star className="w-5 h-5" /></div>
           <div>
              <h3 className="font-bold text-sm text-stone-800">1. Type to Grow</h3>
              <p className="text-xs text-stone-600">You gain XP based on words typed and correctness. Evolve from an <b>Egg</b> into a <b>Tadpole</b>, then to a <b>Froglet</b>, all the way to a wise <b>Frog Sage</b>!</p>
           </div>
        </div>
      )
    },
    {
      icon: "🎵",
      title: "Unlock Rewards",
      subtitle: "Leveling up isn't just for show!",
      content: (
        <div className="flex gap-4 items-start bg-purple-50 p-4 rounded-xl border border-purple-100 mt-4 text-left">
           <div className="bg-purple-200 text-purple-600 p-2 rounded-lg mt-1"><Music className="w-5 h-5" /></div>
           <div>
              <h3 className="font-bold text-sm text-stone-800">2. Customization</h3>
              <p className="text-xs text-stone-600">Higher ranks unlock beautiful new <b>Themes</b> and exclusive <b>Music Radio Stations</b>. Discover all the hidden secrets as you type!</p>
           </div>
        </div>
      )
    },
    {
      icon: "⌨️",
      title: "Play Your Way",
      subtitle: "Choose your own challenge.",
      content: (
        <div className="flex gap-4 items-start bg-orange-50 p-4 rounded-xl border border-orange-100 mt-4 text-left">
           <div className="bg-orange-200 text-orange-600 p-2 rounded-lg mt-1"><Zap className="w-5 h-5" /></div>
           <div>
              <h3 className="font-bold text-sm text-stone-800">3. Modes & Drills</h3>
              <p className="text-xs text-stone-600">Choose between relaxing <b>Quotes Mode</b> or target your weak points with <b>Drill Mistakes</b>. Your mistakes are recorded!</p>
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-center relative border-4 border-frog-400">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 bg-stone-100 rounded-full p-1.5 transition-colors">
          <X className="w-4 h-4" />
        </button>
        
        <div className="text-5xl mb-2 animate-bounce">{SLIDES[slide].icon}</div>
        <h2 className="text-2xl font-black text-stone-800 tracking-tight leading-tight">{SLIDES[slide].title}</h2>
        <p className="text-stone-500 text-sm font-medium mt-1">{SLIDES[slide].subtitle}</p>

        <div className="min-h-[140px]">
           {SLIDES[slide].content}
        </div>

        <div className="flex justify-center gap-2 mt-4 mb-6">
           {SLIDES.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? 'w-6 bg-frog-500' : 'w-2 bg-stone-200'}`} />
           ))}
        </div>

        <div className="flex gap-2">
           {slide > 0 && (
              <button onClick={() => setSlide(s => s - 1)} className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-xl transition-all">
                  <ChevronLeft className="w-5 h-5" />
              </button>
           )}
           
           {slide < SLIDES.length - 1 ? (
             <button onClick={() => setSlide(s => s + 1)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-frog-500 hover:bg-green-500 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95">
                Next <ChevronRight className="w-4 h-4" />
             </button>
           ) : (
             <button onClick={onClose} className="flex-1 flex items-center justify-center gap-2 py-3 bg-frog-600 hover:bg-green-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-frog-200 transition-all active:scale-95">
                Start Typing <PlayCircle className="w-4 h-4" />
             </button>
           )}
        </div>
      </div>
    </div>
  );
};
