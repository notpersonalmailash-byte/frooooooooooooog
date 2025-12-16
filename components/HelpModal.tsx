
import React from 'react';
import { 
  X, BookOpen, Skull, Zap, Crown, 
  Gamepad2, Keyboard, Ghost, EyeOff, 
  Database, Music, ShieldAlert, 
  ArrowUpRight, Award, History, 
  GraduationCap 
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-stone-100 bg-white sticky top-0 z-10 shrink-0">
          <div>
             <h2 className="text-2xl font-black text-frog-green tracking-tight flex items-center gap-3">
               <BookOpen className="w-6 h-6" /> Frog Type Manual
             </h2>
             <p className="text-sm text-stone-400 font-medium mt-1">Comprehensive guide to mechanics, modes, and mastery.</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-50 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable Grid */}
        <div className="overflow-y-auto p-8 custom-scrollbar bg-stone-50/30 flex-1">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* LEFT COLUMN: CORE & PROGRESSION */}
              <div className="space-y-8">

                  {/* 1. Core Philosophy */}
                  <section>
                      <h3 className="flex items-center gap-2 text-sm font-black text-stone-800 uppercase tracking-widest mb-4 border-b border-stone-200 pb-2">
                          <Keyboard className="w-4 h-4 text-frog-green" /> Core Mechanics
                      </h3>
                      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                          <div>
                              <h4 className="font-bold text-stone-700 text-sm mb-1">Strict Accuracy Engine</h4>
                              <p className="text-xs text-stone-500 leading-relaxed">
                                  Frog Type operates on a <span className="font-bold text-stone-700">"One Mistake Fails"</span> principle in standard modes. 
                                  Accuracy is paramount. If you press the wrong key, the quote resets immediately. 
                                  This builds muscle memory for perfect typing rather than error correction.
                              </p>
                          </div>
                          <div>
                              <h4 className="font-bold text-stone-700 text-sm mb-1">Experience (XP) & Penalties</h4>
                              <p className="text-xs text-stone-500 leading-relaxed">
                                  XP is calculated based on speed, length, and streaks. 
                                  <br/>
                                  <span className="text-red-500 font-bold">Warning:</span> Failing a quote incurs an XP penalty (-15% Standard, -50% Hardcore). 
                                  Consistency is valued over raw speed.
                              </p>
                          </div>
                      </div>
                  </section>

                  {/* 2. Progression System */}
                  <section>
                      <h3 className="flex items-center gap-2 text-sm font-black text-stone-800 uppercase tracking-widest mb-4 border-b border-stone-200 pb-2">
                          <Crown className="w-4 h-4 text-frog-green" /> Progression Ecosystem
                      </h3>
                      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                                  <div className="font-bold text-stone-700 text-xs mb-1">Evolution Tiers</div>
                                  <p className="text-[10px] text-stone-500">
                                      Start as an <strong>Egg</strong>. Evolve through 8 distinct tiers (Tadpole, Polliwog, Froglet...) to become a <strong>Frog Sage</strong>.
                                  </p>
                              </div>
                              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                                  <div className="font-bold text-stone-700 text-xs mb-1">Speed Gates</div>
                                  <p className="text-[10px] text-stone-500">
                                      High tiers require minimum Average WPM. You cannot evolve to <strong>Bullfrog</strong> without proving 95 WPM speed.
                                  </p>
                              </div>
                          </div>
                          <div>
                              <h4 className="font-bold text-stone-700 text-sm mb-1 flex items-center gap-2">
                                  <ShieldAlert className="w-3.5 h-3.5 text-orange-500" /> Remediation Protocol
                              </h4>
                              <p className="text-xs text-stone-500 leading-relaxed">
                                  To ensure mastery, if you fail a quote in standard mode, you must strictly pass that specific quote <strong>3 times</strong> before you are allowed to evolve to the next major Tier.
                              </p>
                          </div>
                      </div>
                  </section>

                  {/* 3. Training Tools */}
                  <section>
                      <h3 className="flex items-center gap-2 text-sm font-black text-stone-800 uppercase tracking-widest mb-4 border-b border-stone-200 pb-2">
                          <GraduationCap className="w-4 h-4 text-frog-green" /> Smart Training
                      </h3>
                      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                          <div className="flex gap-3 items-start">
                              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0"><Keyboard className="w-4 h-4" /></div>
                              <div>
                                  <h4 className="font-bold text-stone-700 text-sm">Smart Practice Mode</h4>
                                  <p className="text-xs text-stone-500 mt-0.5">
                                      The game tracks every missed character. Practice Mode generates custom sentences using your weakest keys and unlocked letters (Leitner System).
                                  </p>
                              </div>
                          </div>
                          <div className="flex gap-3 items-start">
                              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0"><Ghost className="w-4 h-4" /></div>
                              <div>
                                  <h4 className="font-bold text-stone-700 text-sm">Ghost Replay</h4>
                                  <p className="text-xs text-stone-500 mt-0.5">
                                      Race against a visual ghost representing your average WPM. Perfect for pacing.
                                  </p>
                              </div>
                          </div>
                          <div className="flex gap-3 items-start">
                              <div className="p-2 bg-frog-50 text-frog-600 rounded-lg shrink-0"><EyeOff className="w-4 h-4" /></div>
                              <div>
                                  <h4 className="font-bold text-stone-700 text-sm">Read Ahead Mode</h4>
                                  <p className="text-xs text-stone-500 mt-0.5">
                                      Hides the text you are currently typing to force you to look ahead. Grants up to <strong>+30% XP Bonus</strong>.
                                  </p>
                              </div>
                          </div>
                      </div>
                  </section>

              </div>

              {/* RIGHT COLUMN: MODES & FEATURES */}
              <div className="space-y-8">

                  {/* 4. Game Modes */}
                  <section>
                      <h3 className="flex items-center gap-2 text-sm font-black text-stone-800 uppercase tracking-widest mb-4 border-b border-stone-200 pb-2">
                          <Zap className="w-4 h-4 text-frog-green" /> Standard Modes
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                          <div className="group relative bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:border-frog-green/30 transition-colors">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-stone-800 text-sm">Quotes (Standard)</span>
                                  <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded font-bold">Ranked</span>
                              </div>
                              <p className="text-xs text-stone-500">
                                  Balanced risk/reward. The default way to play.
                              </p>
                          </div>
                          
                          <div className="group relative bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:border-red-500/30 transition-colors">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-stone-800 text-sm">Hardcore</span>
                                  <span className="text-[10px] bg-stone-800 text-white px-2 py-0.5 rounded font-bold">5x XP</span>
                              </div>
                              <p className="text-xs text-stone-500">
                                  Mistakes deduct <span className="text-red-500 font-bold">50% XP</span>. Only for the brave. Unlocks at Polliwog.
                              </p>
                          </div>

                          <div className="group relative bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:border-blue-500/30 transition-colors">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-stone-800 text-sm">Fix Mistakes</span>
                                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold">Recovery</span>
                              </div>
                              <p className="text-xs text-stone-500">
                                  Re-play words you previously failed. Reduced penalty (-5%).
                              </p>
                          </div>
                      </div>
                  </section>

                  {/* 5. Arcade Center */}
                  <section>
                      <h3 className="flex items-center gap-2 text-sm font-black text-stone-800 uppercase tracking-widest mb-4 border-b border-stone-200 pb-2">
                          <Gamepad2 className="w-4 h-4 text-purple-500" /> Arcade Center
                      </h3>
                      <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800 shadow-lg text-stone-300 space-y-4">
                          <p className="text-xs italic opacity-70">
                              Unlocked at <strong>Froglet</strong> rank. These modes test endurance and adaptability.
                          </p>
                          <div className="space-y-3">
                              <div className="flex gap-3">
                                  <div className="mt-1"><Skull className="w-4 h-4 text-red-500" /></div>
                                  <div>
                                      <h4 className="font-bold text-white text-sm">Survival (Swamp & Outbreak Z)</h4>
                                      <p className="text-xs opacity-70 mt-0.5">
                                          Defend against waves of enemies. 
                                          <br/>
                                          <span className="text-red-400 font-mono">1 Mistake = 1 Life Lost.</span>
                                      </p>
                                  </div>
                              </div>
                              <div className="flex gap-3">
                                  <div className="mt-1"><ArrowUpRight className="w-4 h-4 text-cyan-400" /></div>
                                  <div>
                                      <h4 className="font-bold text-white text-sm">Cosmic Defense</h4>
                                      <p className="text-xs opacity-70 mt-0.5">
                                          Vertical scroller. Type words to launch missiles. Defeat bosses.
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </section>

                  {/* 6. System Features */}
                  <section>
                      <h3 className="flex items-center gap-2 text-sm font-black text-stone-800 uppercase tracking-widest mb-4 border-b border-stone-200 pb-2">
                          <Database className="w-4 h-4 text-frog-green" /> System Features
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                              <div className="font-bold text-stone-700 text-xs mb-1 flex items-center gap-1"><Music className="w-3 h-3"/> Audio Engine</div>
                              <p className="text-[10px] text-stone-500">
                                  Procedural music generation (Satie, Jazz, Lofi) and mechanical keyboard sounds.
                              </p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                              <div className="font-bold text-stone-700 text-xs mb-1 flex items-center gap-1"><Database className="w-3 h-3"/> Cloud Save</div>
                              <p className="text-[10px] text-stone-500">
                                  Export your full profile (Stats, History, Settings) to a JSON file to transfer between devices.
                              </p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                              <div className="font-bold text-stone-700 text-xs mb-1 flex items-center gap-1"><History className="w-3 h-3"/> Statistics</div>
                              <p className="text-[10px] text-stone-500">
                                  Detailed history of every run, mistake analysis, and daily streak tracking.
                              </p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                              <div className="font-bold text-stone-700 text-xs mb-1 flex items-center gap-1"><Award className="w-3 h-3"/> Achievements</div>
                              <p className="text-[10px] text-stone-500">
                                  Over 50 unlockable badges for speed, volume, streaks, and mastery.
                              </p>
                          </div>
                      </div>
                  </section>

              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-100 bg-stone-50 shrink-0 flex justify-center">
           <button 
             onClick={onClose}
             className="px-12 py-3 bg-frog-green hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-frog-green/20 transform active:scale-95 flex items-center gap-2"
           >
             I'm Ready to Type
           </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
