import React from 'react';
import { 
  X, Ghost, EyeOff, Flame, Keyboard, 
  BookOpen, Skull, Eraser, Crown, 
  Gauge, Settings2, Zap, PlayCircle, Gamepad2, ArrowUpCircle
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-stone-100 bg-white sticky top-0 z-10">
          <div>
             <h2 className="text-xl font-black text-frog-green tracking-tight flex items-center gap-2">
               <span>🐸</span> Game Guide
             </h2>
             <p className="text-xs text-stone-400 font-medium mt-1">Master features & mechanics</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar flex-1 min-h-0">

          {/* 1. How to Play (Foundational) */}
          <div className="space-y-4">
             <h3 className="font-bold text-stone-700 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                <PlayCircle className="w-4 h-4" /> How to Play
             </h3>
             <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-2.5">
                <p><span className="font-bold text-stone-800 bg-white border border-stone-200 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide mr-2">1. Start</span> Type the first character to begin the timer.</p>
                <p><span className="font-bold text-stone-800 bg-white border border-stone-200 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide mr-2">2. Type</span> Enter the quote exactly. Watch for punctuation!</p>
                <p><span className="font-bold text-stone-800 bg-white border border-stone-200 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide mr-2">3. Accuracy</span> In standard modes, <span className="text-red-500 font-bold">one mistake</span> fails the attempt.</p>
                <p><span className="font-bold text-stone-800 bg-white border border-stone-200 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide mr-2">4. Evolve</span> Earn XP to grow from an Egg to a Sage.</p>
             </div>
          </div>

          {/* 2. Maximizing XP (Growth Strategy - Unlocked) */}
           <div className="space-y-4">
             <h3 className="font-bold text-frog-green text-xs uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                <ArrowUpCircle className="w-4 h-4" /> Maximizing XP
             </h3>
             <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="font-bold text-orange-700 text-xs mb-1 flex items-center gap-1"><Flame className="w-3 h-3"/> Streak Bonus</div>
                    <p className="text-[10px] text-orange-600/80">
                        XP grows exponentially with streak. Don't restart!
                        <br/>Multiplier: <strong>1.05<sup className="text-[8px]">streak</sup></strong>
                    </p>
                 </div>
                 <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="font-bold text-blue-700 text-xs mb-1 flex items-center gap-1"><Zap className="w-3 h-3"/> Perfect Master</div>
                    <p className="text-[10px] text-blue-600/80">
                        Get <strong>1.5x XP</strong> instantly for 100% accuracy on your first try of a quote.
                    </p>
                 </div>
                 <div className="p-3 bg-frog-green/5 rounded-xl border border-frog-green/20 col-span-2">
                    <div className="font-bold text-frog-green text-xs mb-1 flex items-center gap-1"><EyeOff className="w-3 h-3"/> Read Ahead (Settings)</div>
                    <div className="text-[10px] text-stone-600 flex justify-between items-center mt-1">
                        <span>Hide text for massive gains:</span>
                        <div className="flex gap-2">
                            <span className="bg-frog-green/10 text-frog-green px-1.5 py-0.5 rounded font-bold">+10%</span>
                            <span className="bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-bold">+20%</span>
                            <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">+30%</span>
                        </div>
                    </div>
                 </div>
             </div>
           </div>

          {/* 3. Core Mechanics (Rules - Unlocked) */}
          <div className="space-y-4">
             <h3 className="font-bold text-stone-700 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                <Keyboard className="w-4 h-4" /> Core Mechanics
             </h3>
             <div className="grid grid-cols-1 gap-3">
                 <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="font-bold text-stone-700 text-sm mb-1">Strict Accuracy</div>
                    <p className="text-xs text-stone-500">
                        100% accuracy required. Any typo fails the run immediately.
                    </p>
                 </div>
                 <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="font-bold text-red-700 text-sm mb-1">XP Penalties</div>
                    <p className="text-xs text-red-600/80">
                        Failing loses XP. Normal: <span className="font-bold">-15%</span>. Fix Mistake: <span className="font-bold">-5%</span>. Hardcore: <span className="font-bold">-50%</span>.
                    </p>
                 </div>
             </div>
          </div>

          {/* 4. Standard Game Modes (Unlocked) */}
          <div className="space-y-4">
             <h3 className="font-bold text-stone-700 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                <Settings2 className="w-4 h-4" /> Standard Modes
             </h3>
             <div className="space-y-2">
                 <div className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 bg-white shadow-sm">
                    <div className="p-2 bg-stone-100 rounded-lg text-stone-600"><BookOpen className="w-4 h-4" /></div>
                    <div>
                        <div className="font-bold text-sm text-stone-700">Quotes (Normal)</div>
                        <div className="text-[10px] text-stone-500">Standard ranked play. Balance of risk and reward.</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 p-3 rounded-xl border border-red-100 bg-red-50 text-red-900 shadow-sm">
                    <div className="p-2 bg-red-100 rounded-lg text-red-500"><Eraser className="w-4 h-4" /></div>
                    <div>
                        <div className="font-bold text-sm text-red-800">Fix Mistakes</div>
                        <div className="text-[10px] text-red-600/70">Practice words you previously failed on. Lower penalty.</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50 text-blue-900 shadow-sm">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-500"><Keyboard className="w-4 h-4" /></div>
                    <div>
                        <div className="font-bold text-sm text-blue-800">Practice Mode</div>
                        <div className="text-[10px] text-blue-600/70">Requires 20 history entries. AI generates drills for your weak keys.</div>
                    </div>
                 </div>
             </div>
          </div>

          {/* 5. Training Tools (Unlocked) */}
          <div className="space-y-4">
             <h3 className="font-bold text-stone-700 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                <Zap className="w-4 h-4" /> Training Tools
             </h3>
             <div className="grid grid-cols-1 gap-3">
                 <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-2 mb-2 text-purple-700 font-bold text-xs">
                        <Ghost className="w-3.5 h-3.5" /> Ghost Replay
                    </div>
                    <p className="text-[10px] text-purple-600/80 leading-relaxed">
                        Race against a "ghost" moving at your average WPM. Enable in Settings.
                    </p>
                 </div>
             </div>
          </div>

          {/* 6. Progression & Gates (Structure) */}
          <div className="space-y-4">
             <h3 className="font-bold text-stone-700 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                <Crown className="w-4 h-4" /> Progression
             </h3>
             <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-start gap-3 mb-4">
                    <Gauge className="w-5 h-5 text-stone-400 mt-0.5" />
                    <div>
                        <div className="font-bold text-sm text-stone-700">Evolution & Speed Gates</div>
                        <p className="text-xs text-stone-500 mt-1">
                            XP alone isn't enough. You must meet specific <strong>WPM requirements</strong> to evolve to higher tiers.
                            XP is capped until speed goals are met.
                        </p>
                    </div>
                </div>
                
                {/* Visual Tier List */}
                <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: 'Egg', color: 'bg-stone-400' },
                      { name: 'Tadpole', color: 'bg-lime-500' },
                      { name: 'Polliwog', color: 'bg-emerald-500' },
                      { name: 'Froglet', color: 'bg-cyan-500' },
                      { name: 'Hopper', color: 'bg-blue-500' },
                      { name: 'Tree Frog', color: 'bg-violet-500' },
                      { name: 'Bullfrog', color: 'bg-orange-500' },
                      { name: 'Sage', color: 'bg-red-500' },
                    ].map((t) => (
                        <div key={t.name} className="flex flex-col items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${t.color}`}></div>
                            <span className="text-[9px] font-mono text-stone-500">{t.name}</span>
                        </div>
                    ))}
                </div>
             </div>
          </div>

          {/* 7. Hardcore Mode (Locked Tier 1) */}
          <div className="space-y-4">
             <h3 className="font-bold text-stone-800 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-stone-200 pb-2">
                <Skull className="w-4 h-4" /> Hardcore Mode (Unlocks @ Polliwog)
             </h3>
             <div className="p-3 bg-stone-900 text-stone-300 rounded-xl border border-stone-700">
                <div className="font-bold text-white text-sm mb-1">High Risk, High Reward</div>
                <p className="text-xs opacity-80">
                    <strong>5x XP Multiplier</strong>. However, mistakes instantly fail the run and deduct <strong>50%</strong> of your current XP. Only for the brave.
                </p>
             </div>
          </div>

          {/* 8. Arcade Center (Locked Tier 2 - The Finale) */}
          <div className="space-y-4">
             <h3 className="font-bold text-purple-600 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-purple-100 pb-2">
                <Gamepad2 className="w-4 h-4" /> Arcade Center (Unlocks @ Froglet)
             </h3>
             <div className="grid grid-cols-1 gap-3">
                 <div className="p-3 bg-stone-900 text-white rounded-xl border border-stone-700">
                    <div className="font-bold text-frog-green text-sm mb-1 flex items-center gap-2">
                        <Skull className="w-3.5 h-3.5" /> Swamp Survival
                    </div>
                    <p className="text-xs text-stone-400">
                        Classic defense. Enemies come from the right. <br/>
                        <span className="text-red-400 font-bold">Rule: 1 Mistake = 1 Life Lost.</span>
                    </p>
                 </div>
                 <div className="p-3 bg-red-950 text-white rounded-xl border border-red-800">
                    <div className="font-bold text-red-400 text-sm mb-1 flex items-center gap-2">
                        <Skull className="w-3.5 h-3.5" /> Zombie Outbreak
                    </div>
                    <p className="text-xs text-red-200/70">
                        Defend the center. Zombies attack from all sides.<br/>
                        Watch out for <span className="text-white font-bold">Spitters</span> (Ranged Acid) and <span className="text-white font-bold">Jumpers</span> (Fast Leaps).
                    </p>
                 </div>
                 <div className="p-3 bg-indigo-950 text-white rounded-xl border border-indigo-800">
                    <div className="font-bold text-cyan-400 text-sm mb-1 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5" /> Cosmic Defense
                    </div>
                    <p className="text-xs text-indigo-200">
                        Vertical scrolling shooter. Type words to launch missiles.<br/>
                        Defeat the <span className="text-white font-bold">Mothership Boss</span> before it bombs your base.
                    </p>
                 </div>
                 <div className="p-3 bg-yellow-50 text-stone-800 rounded-xl border border-yellow-200">
                    <div className="font-bold text-yellow-600 text-sm mb-1 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5" /> Speed Rush
                    </div>
                    <p className="text-xs text-stone-600">
                        60 Seconds. Type fast to gain bonus time (+10s every 15 words).
                    </p>
                 </div>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-100 bg-stone-50 text-center">
           <button 
             onClick={onClose}
             className="w-full py-3 bg-frog-green hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-frog-green/20 transform active:scale-95"
           >
             Got it, let's type!
           </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;