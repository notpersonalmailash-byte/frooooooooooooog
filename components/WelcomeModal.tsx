import React from 'react';
import { X, PlayCircle, Star, Music, Zap, BookOpen } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col p-8 text-center relative border-4 border-frog-400">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 bg-stone-100 rounded-full p-2">
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-6xl mb-4 animate-bounce">🐸</div>
        <h2 className="text-3xl font-black text-stone-800 tracking-tight mb-2">Welcome to Frog Type!</h2>
        <p className="text-stone-500 mb-8 font-medium">A mindful typing experience that evolves as you type.</p>

        <div className="space-y-4 text-left mb-8">
           <div className="flex gap-4 items-start bg-frog-50 p-4 rounded-2xl border border-frog-100">
               <div className="bg-frog-200 text-frog-600 p-2 rounded-xl mt-1"><Star className="w-5 h-5" /></div>
               <div>
                  <h3 className="font-bold text-lg text-stone-800">1. Type to Grow</h3>
                  <p className="text-sm text-stone-600">Every quote you type gives you XP. Earn enough XP to evolve your frog rank from a tiny <b>Egg</b> all the way to a wise <b>Frog Sage</b>.</p>
               </div>
           </div>

           <div className="flex gap-4 items-start bg-purple-50 p-4 rounded-2xl border border-purple-100">
               <div className="bg-purple-200 text-purple-600 p-2 rounded-xl mt-1"><Music className="w-5 h-5" /></div>
               <div>
                  <h3 className="font-bold text-lg text-stone-800">2. Unlock Rewards</h3>
                  <p className="text-sm text-stone-600">Leveling up isn't just for show! Higher ranks unlock beautiful new <b>Themes</b> and exclusive <b>Music Radio Stations</b>.</p>
               </div>
           </div>

           <div className="flex gap-4 items-start bg-orange-50 p-4 rounded-2xl border border-orange-100">
               <div className="bg-orange-200 text-orange-600 p-2 rounded-xl mt-1"><Zap className="w-5 h-5" /></div>
               <div>
                  <h3 className="font-bold text-lg text-stone-800">3. Play Your Way</h3>
                  <p className="text-sm text-stone-600">Choose between relaxing <b>Quotes Mode</b>, intense <b>60s Sprints</b>, or target your weak points with <b>Drill Mistakes</b>.</p>
               </div>
           </div>
        </div>

        <button onClick={onClose} className="w-full flex items-center justify-center gap-2 py-4 bg-frog-500 hover:bg-green-500 text-white rounded-2xl font-black text-xl shadow-lg shadow-frog-200 transition-transform hover:scale-[1.02]">
           Start Typing <PlayCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
