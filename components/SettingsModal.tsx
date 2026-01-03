
import React, { useRef } from 'react';
import { Settings, MechanicalSoundPreset, ReadAheadLevel, TTSMode } from '../types';
import { X, Ghost, EyeOff, Volume2, Music, Download, Upload, Database, Keyboard, Eye, PlayCircle, AlertTriangle, CheckCircle2, Speech, ShieldAlert } from 'lucide-react';
import { getCurrentLevel } from '../utils/gameLogic';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  setSettings: (s: Settings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, setSettings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const toggleGhost = () => setSettings({ ...settings, ghostEnabled: !settings.ghostEnabled });
  const setReadAheadLevel = (level: ReadAheadLevel) => setSettings({ ...settings, readAheadLevel: level });
  const toggleSfx = () => setSettings({ ...settings, sfxEnabled: !settings.sfxEnabled });
  const toggleMechanical = () => setSettings({ ...settings, mechanicalSoundEnabled: !settings.mechanicalSoundEnabled });
  const setMechanicalPreset = (preset: MechanicalSoundPreset) => setSettings({ ...settings, mechanicalSoundPreset: preset });
  const toggleAutoStart = () => setSettings({ ...settings, autoStartMusic: !settings.autoStartMusic });
  const toggleStrictDrill = () => setSettings({ ...settings, strictDrillEnabled: !settings.strictDrillEnabled });
  const setTTSMode = (mode: TTSMode) => setSettings({ ...settings, ttsMode: mode });
  
  const handleExport = () => {
    const backupData: Record<string, string> = {};
    let itemCount = 0;

    // 1. Capture all relevant LocalStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Capture all keys related to Frog Type namespace + the legacy/root XP key
      if (key && (key.startsWith('frogType_') || key === 'frogXP')) {
        const value = localStorage.getItem(key);
        if (value !== null) {
            backupData[key] = value;
            itemCount++;
        }
      }
    }
    
    if (itemCount === 0) {
        alert("No game data found to export.");
        return;
    }

    // 2. Wrap in a structured object with metadata
    const payload = {
        meta: {
            version: 2, // Increment version for the new system
            app: "Frog Type",
            timestamp: new Date().toISOString(),
            itemCount: itemCount
        },
        data: backupData
    };

    // 3. Trigger Download
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Filename includes date for version control
    a.download = `frog-type-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonStr = event.target?.result as string;
        const parsed = JSON.parse(jsonStr);
        
        let dataToRestore: Record<string, string> = {};
        
        // --- VALIDATION & DETECTION ---
        
        // Check 1: Is this the new format (v2)?
        if (parsed.meta && parsed.data && parsed.meta.app === "Frog Type") {
            dataToRestore = parsed.data;
        } 
        // Check 2: Is this the legacy flat format?
        else {
            // Check if it has at least one recognizable key
            const keys = Object.keys(parsed);
            const hasValidKeys = keys.some(k => k.startsWith('frogType_') || k === 'frogXP');
            
            if (hasValidKeys) {
                dataToRestore = parsed;
            } else {
                throw new Error("Unrecognized file format");
            }
        }

        // --- PREVIEW LOGIC ---
        // Extract stats from the backup to show the user what they are loading
        const backupXP = parseInt(dataToRestore['frogXP'] || dataToRestore['frogType_xp'] || '0', 10);
        const backupName = dataToRestore['frogType_userName'] || 'Froggy';
        const backupLevel = getCurrentLevel(backupXP);
        const backupStreak = dataToRestore['frogType_dailyStreak'] || '0';
        
        const confirmMessage = `
Found Backup Profile:
👤 Name: ${backupName}
🐸 Rank: ${backupLevel.name}
🔥 Streak: ${backupStreak}
✨ XP: ${backupXP.toLocaleString()}

This will OVERWRITE your current data on this device.
Are you sure you want to restore?
        `.trim();

        if (window.confirm(confirmMessage)) {
            // 1. Clear existing Frog Type data to prevent conflicts
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('frogType_') || key === 'frogXP')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));

            // 2. Write new data
            Object.entries(dataToRestore).forEach(([key, value]) => {
                 // Double check we only write frog keys (security measure)
                 if (key.startsWith('frogType_') || key === 'frogXP') {
                     localStorage.setItem(key, value);
                 }
            });
            
            alert("Backup restored successfully! The page will now reload.");
            window.location.reload();
        }
      } catch (err) {
        alert("Failed to restore backup: Invalid file format or corrupted data.");
        console.error(err);
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-stone-100 bg-white sticky top-0 z-10">
          <h2 className="text-lg font-bold text-stone-700 flex items-center gap-2">
            Settings
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-2 rounded-full p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
          
          {/* Sound Effects Toggle (Teal) */}
          <button 
            onClick={toggleSfx}
            className={`w-full text-left flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${settings.sfxEnabled ? 'bg-teal-50 border-teal-200' : 'bg-stone-50 border-transparent hover:bg-stone-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${settings.sfxEnabled ? 'bg-teal-100 text-teal-600' : 'bg-stone-200 text-stone-500'}`}>
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-stone-700">Sound Effects</div>
                <div className="text-[10px] text-stone-400">Game status sounds</div>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${settings.sfxEnabled ? 'bg-teal-500' : 'bg-stone-300'}`}>
               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.sfxEnabled ? 'left-5' : 'left-1'}`} />
            </div>
          </button>

          {/* Auto-Start Music Toggle (Green) */}
          <button 
            onClick={toggleAutoStart}
            className={`w-full text-left flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-1 ${settings.autoStartMusic ? 'bg-frog-50 border-frog-200' : 'bg-stone-50 border-transparent hover:bg-stone-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${settings.autoStartMusic ? 'bg-frog-100 text-frog-600' : 'bg-stone-200 text-stone-500'}`}>
                <PlayCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-stone-700">Auto-Start Music</div>
                <div className="text-[10px] text-stone-400">Play background music on load</div>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${settings.autoStartMusic ? 'bg-frog-500' : 'bg-stone-300'}`}>
               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoStartMusic ? 'left-5' : 'left-1'}`} />
            </div>
          </button>

          {/* Strict Word Drill Toggle (Red) */}
          <button 
            onClick={toggleStrictDrill}
            className={`w-full text-left flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 ${settings.strictDrillEnabled ? 'bg-red-50 border-red-200' : 'bg-stone-50 border-transparent hover:bg-stone-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${settings.strictDrillEnabled ? 'bg-red-100 text-red-600' : 'bg-stone-200 text-stone-500'}`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-stone-700">Strict Word Drill</div>
                <div className="text-[10px] text-stone-400">Force 15x repetition on error</div>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${settings.strictDrillEnabled ? 'bg-red-500' : 'bg-stone-300'}`}>
               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.strictDrillEnabled ? 'left-5' : 'left-1'}`} />
            </div>
          </button>

          {/* Text-to-Speech Selector (Orange) */}
          <div className={`rounded-xl border transition-all overflow-hidden ${settings.ttsMode !== 'OFF' ? 'bg-orange-50 border-orange-200' : 'bg-stone-50 border-transparent hover:bg-stone-100'}`}>
              <div className="p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${settings.ttsMode !== 'OFF' ? 'bg-orange-100 text-orange-600' : 'bg-stone-200 text-stone-500'}`}>
                    <Speech className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-stone-700">Read Aloud Mode</div>
                    <div className="text-[10px] text-stone-400">Speak words while typing</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-1 p-1 bg-stone-200/50 rounded-lg">
                    {(['OFF', 'QUOTE', 'WORD', 'FLOW', 'NEXT', 'SCOUT'] as TTSMode[]).map(mode => {
                        const labels = { 
                            OFF: 'Off', 
                            QUOTE: 'Full Quote', 
                            WORD: 'Current', 
                            FLOW: 'Flow',
                            NEXT: 'Next',
                            SCOUT: 'Scout (+2)'
                        };
                        const isActive = settings.ttsMode === mode;
                        
                        let activeClass = 'bg-white text-stone-700 shadow-sm';
                        // Orange theme for TTS active states
                        if (isActive && mode !== 'OFF') activeClass = 'bg-orange-500 text-white shadow-sm';

                        return (
                           <button
                             key={mode}
                             onClick={() => setTTSMode(mode)}
                             className={`
                                text-[9px] font-bold py-1.5 px-1 rounded-md transition-all flex flex-col items-center justify-center
                                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1
                                ${isActive ? activeClass : 'text-stone-500 hover:bg-white/50'}
                             `}
                           >
                               <span>{labels[mode]}</span>
                           </button>
                        );
                    })}
                </div>
              </div>
          </div>

          {/* Mechanical Sounds Toggle (Amber) */}
          <div className={`rounded-xl border transition-all overflow-hidden ${settings.mechanicalSoundEnabled ? 'bg-amber-50 border-amber-200' : 'bg-stone-50 border-transparent hover:bg-stone-100'}`}>
              <button 
                onClick={toggleMechanical}
                className="w-full text-left flex items-center justify-between p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-inset"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${settings.mechanicalSoundEnabled ? 'bg-amber-100 text-amber-600' : 'bg-stone-200 text-stone-500'}`}>
                    <Keyboard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-stone-700">Mechanical Keys</div>
                    <div className="text-[10px] text-stone-400">Typewriter click sounds</div>
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full relative transition-colors ${settings.mechanicalSoundEnabled ? 'bg-amber-500' : 'bg-stone-300'}`}>
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.mechanicalSoundEnabled ? 'left-5' : 'left-1'}`} />
                </div>
              </button>
              
              {/* Preset Selector */}
              {settings.mechanicalSoundEnabled && (
                  <div className="px-3 pb-3 pt-0 animate-in slide-in-from-top-2">
                      <div className="grid grid-cols-4 gap-1 p-1 bg-amber-100/50 rounded-lg">
                          {(['THOCK', 'CLICKY', 'BUBBLE', 'TYPEWRITER'] as MechanicalSoundPreset[]).map(preset => (
                              <button
                                key={preset}
                                onClick={(e) => { e.stopPropagation(); setMechanicalPreset(preset); }}
                                className={`
                                    text-[10px] font-bold py-1.5 px-1 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1
                                    ${settings.mechanicalSoundPreset === preset 
                                        ? 'bg-white text-amber-600 shadow-sm' 
                                        : 'text-amber-700/60 hover:bg-amber-100/50'}
                                `}
                              >
                                  {preset === 'TYPEWRITER' ? 'TYPE' : preset}
                              </button>
                          ))}
                      </div>
                  </div>
              )}
          </div>

          {/* Ghost Mode Toggle */}
          <button 
            onClick={toggleGhost}
            className={`w-full text-left flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${settings.ghostEnabled ? 'bg-purple-50 border-purple-200' : 'bg-stone-50 border-transparent hover:bg-stone-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${settings.ghostEnabled ? 'bg-purple-100 text-purple-600' : 'bg-stone-200 text-stone-500'}`}>
                <Ghost className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-stone-700">Ghost Replay</div>
                <div className="text-[10px] text-stone-400">Race against your previous speed</div>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${settings.ghostEnabled ? 'bg-purple-500' : 'bg-stone-300'}`}>
               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.ghostEnabled ? 'left-5' : 'left-1'}`} />
            </div>
          </button>

          {/* Read Ahead Selector */}
          <div className={`rounded-xl border transition-all overflow-hidden ${settings.readAheadLevel !== 'NONE' ? 'bg-frog-green/5 border-frog-green/20' : 'bg-stone-50 border-transparent hover:bg-stone-100'}`}>
              <div className="p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${settings.readAheadLevel !== 'NONE' ? 'bg-frog-green/10 text-frog-green' : 'bg-stone-200 text-stone-500'}`}>
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-stone-700">Read Ahead Mode</div>
                    <div className="text-[10px] text-stone-400">Hide text to force focus</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-1 p-1 bg-stone-200/50 rounded-lg">
                    {(['NONE', 'FOCUS', 'ULTRA', 'BLIND'] as ReadAheadLevel[]).map(level => {
                        const labels = { NONE: 'Off', FOCUS: 'Focus', ULTRA: 'Ultra', BLIND: 'Blind' };
                        const bonuses = { NONE: '', FOCUS: '+10%', ULTRA: '+20%', BLIND: '+30%' };
                        const isActive = settings.readAheadLevel === level;
                        
                        let activeClass = 'bg-white text-stone-700 shadow-sm';
                        if (isActive && level === 'FOCUS') activeClass = 'bg-frog-green text-white shadow-sm';
                        if (isActive && level === 'ULTRA') activeClass = 'bg-purple-500 text-white shadow-sm';
                        if (isActive && level === 'BLIND') activeClass = 'bg-red-500 text-white shadow-sm';

                        return (
                           <button
                             key={level}
                             onClick={() => setReadAheadLevel(level)}
                             className={`
                                text-[10px] font-bold py-1.5 px-1 rounded-md transition-all flex flex-col items-center justify-center gap-0.5
                                focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-1
                                ${isActive ? activeClass : 'text-stone-500 hover:bg-white/50'}
                             `}
                           >
                               <span>{labels[level]}</span>
                               {bonuses[level] && <span className="text-[8px] opacity-80">{bonuses[level]}</span>}
                           </button>
                        );
                    })}
                </div>
              </div>
          </div>
          
          {/* Backup & Restore Section */}
          <div className="pt-4 border-t border-stone-100">
             <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-stone-700 font-bold text-xs uppercase tracking-wider">
                    <Database className="w-3.5 h-3.5 text-frog-green" /> Cloud Save (Manual)
                </div>
                <div className="flex items-center gap-1 text-[9px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                    <span>v2.0</span>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleExport}
                  className="group flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-stone-50 border border-stone-200 hover:bg-frog-green/5 hover:border-frog-green/30 transition-all text-stone-600 hover:text-frog-green focus:outline-none focus:ring-2 focus:ring-frog-green focus:ring-offset-1"
                >
                    <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="text-xs font-bold">Backup File</span>
                </button>
                <button 
                  onClick={handleImportClick}
                  className="group flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-stone-50 border border-stone-200 hover:bg-purple-50 hover:border-purple-200 transition-all text-stone-600 hover:text-purple-600 relative focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                >
                    <Upload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="text-xs font-bold">Restore</span>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleImportFile}
                        accept=".json"
                        className="hidden"
                    />
                </button>
             </div>
             
             <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded-lg flex gap-2">
                <div className="shrink-0 pt-0.5"><CheckCircle2 className="w-3 h-3 text-blue-500" /></div>
                <p className="text-[10px] text-blue-700 leading-tight">
                    Includes <strong>everything</strong>: XP, streaks, settings, history, unlocked themes, and stats. Safe to transfer between devices.
                </p>
             </div>
          </div>

        </div>
        
        <div className="p-4 bg-stone-50 text-center border-t border-stone-100">
            <button onClick={onClose} className="text-xs font-bold text-stone-500 hover:text-stone-700 focus:outline-none focus:underline">Close</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
