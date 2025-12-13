import React from 'react';
import { Skull, ArrowLeft, Gamepad2, Biohazard, Zap, Clock, Rocket } from 'lucide-react';
import { GameMode } from '../types';

interface MiniGameMenuProps {
  onSelect: (gameId: string) => void;
  onBack: () => void;
}

const MiniGameMenu: React.FC<MiniGameMenuProps> = ({ onSelect, onBack }) => {
  return (
    <div className="w-full max-w-5xl mx-auto animate-in slide-in-from-bottom-5 duration-500 py-4">
       <div className="flex items-center gap-4 mb-8 px-4">
           <button 
             onClick={onBack}
             className="p-2 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-500 transition-colors"
           >
               <ArrowLeft className="w-5 h-5" />
           </button>
           <h2 className="text-3xl font-black text-stone-800 tracking-tight flex items-center gap-3">
               <Gamepad2 className="w-8 h-8 text-purple-500" /> Arcade Center
           </h2>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
           
           {/* Swamp Survival */}
           <button 
             onClick={() => onSelect('SURVIVAL_SWAMP')}
             className="group relative h-80 rounded-3xl overflow-hidden text-left shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl ring-4 ring-transparent hover:ring-frog-green bg-stone-900"
           >
               {/* Background */}
               <div className="absolute inset-0 bg-stone-900 group-hover:bg-stone-800 transition-colors">
                   <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-frog-green to-transparent"></div>
               </div>
               
               <div className="relative z-10 p-8 flex flex-col h-full justify-between">
                   <div>
                       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800/80 text-frog-green font-bold text-xs uppercase tracking-wider mb-4 border border-frog-green/20">
                           <Skull className="w-3 h-3" /> Classic
                       </div>
                       <h3 className="text-3xl font-black text-white mb-2 leading-none">Swamp<br/>Survival</h3>
                       <p className="text-stone-400 text-sm mt-4 leading-relaxed">
                           Defend the pond from flies and ghosts. The classic survival experience.
                       </p>
                   </div>
                   <div className="flex -space-x-3 mt-4">
                       <div className="w-10 h-10 rounded-full bg-stone-800 border-2 border-stone-900 flex items-center justify-center text-xl shadow-lg">🐸</div>
                       <div className="w-10 h-10 rounded-full bg-stone-800 border-2 border-stone-900 flex items-center justify-center text-xl shadow-lg">🪰</div>
                   </div>
               </div>
           </button>

           {/* Zombie Outbreak */}
           <button 
             onClick={() => onSelect('SURVIVAL_ZOMBIE')}
             className="group relative h-80 rounded-3xl overflow-hidden text-left shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl ring-4 ring-transparent hover:ring-red-600 bg-red-950"
           >
               {/* Background */}
               <div className="absolute inset-0 bg-red-950 group-hover:bg-red-900 transition-colors">
                   <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-red-500 to-black"></div>
               </div>
               
               <div className="relative z-10 p-8 flex flex-col h-full justify-between">
                   <div>
                       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/50 text-red-200 font-bold text-xs uppercase tracking-wider mb-4 border border-red-500/30">
                           <Biohazard className="w-3 h-3" /> Horror Mode
                       </div>
                       <h3 className="text-3xl font-black text-white mb-2 leading-none">Outbreak<br/>Z-Type</h3>
                       <p className="text-red-200/70 text-sm mt-4 leading-relaxed">
                           The horde is approaching. Type fast to shoot. Don't get bitten.
                       </p>
                   </div>
                   <div className="flex -space-x-3 mt-4">
                       <div className="w-10 h-10 rounded-full bg-red-900 border-2 border-red-950 flex items-center justify-center text-xl shadow-lg">🧟</div>
                       <div className="w-10 h-10 rounded-full bg-red-900 border-2 border-red-950 flex items-center justify-center text-xl shadow-lg">🧠</div>
                   </div>
               </div>
           </button>

           {/* Cosmic Defense (ZType) */}
           <button 
             onClick={() => onSelect('COSMIC_DEFENSE')}
             className="group relative h-80 rounded-3xl overflow-hidden text-left shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl ring-4 ring-transparent hover:ring-indigo-500 bg-black"
           >
               {/* Background */}
               <div className="absolute inset-0 bg-black group-hover:bg-indigo-950 transition-colors">
                   <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                   <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 to-transparent"></div>
               </div>
               
               <div className="relative z-10 p-8 flex flex-col h-full justify-between">
                   <div>
                       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/80 text-cyan-300 font-bold text-xs uppercase tracking-wider mb-4 border border-cyan-500/30">
                           <Rocket className="w-3 h-3" /> Shooter
                       </div>
                       <h3 className="text-3xl font-black text-white mb-2 leading-none">Cosmic<br/>Defense</h3>
                       <p className="text-indigo-200 text-sm mt-4 leading-relaxed">
                           Vertical scrolling shooter. Type words to launch missiles at the alien fleet.
                       </p>
                   </div>
                   <div className="mt-auto flex justify-end">
                       <Rocket className="w-16 h-16 text-cyan-400 opacity-20 group-hover:opacity-100 group-hover:translate-y-[-10px] transition-all transform rotate-[-45deg]" />
                   </div>
               </div>
           </button>

           {/* Time Attack */}
           <button 
             onClick={() => onSelect('TIME_ATTACK')}
             className="group relative h-80 rounded-3xl overflow-hidden text-left shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl ring-4 ring-transparent hover:ring-yellow-400 bg-white border border-stone-200"
           >
               {/* Background */}
               <div className="absolute inset-0 bg-white group-hover:bg-yellow-50 transition-colors"></div>
               
               <div className="relative z-10 p-8 flex flex-col h-full justify-between">
                   <div>
                       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold text-xs uppercase tracking-wider mb-4 border border-yellow-200">
                           <Clock className="w-3 h-3" /> Speed
                       </div>
                       <h3 className="text-3xl font-black text-stone-800 mb-2 leading-none">Speed<br/>Rush</h3>
                       <p className="text-stone-500 text-sm mt-4 leading-relaxed">
                           60 Seconds. Infinite words. How fast can your fingers fly?
                       </p>
                   </div>
                   <div className="mt-auto flex justify-end">
                       <Zap className="w-16 h-16 text-yellow-400 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                   </div>
               </div>
           </button>

       </div>
    </div>
  );
};

export default MiniGameMenu;