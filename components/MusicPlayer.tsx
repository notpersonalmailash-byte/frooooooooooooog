
import React, { useState, useEffect, useRef } from 'react';
import { MusicConfig, MusicSource, Settings } from '../types';
import { getCurrentLevel, LEVELS } from '../utils/gameLogic';
import { RADIO_STATIONS, RadioStation } from '../data/radioStations';
import { X, Music, Disc, Youtube, Radio, Sparkles, Wind, Waves, Guitar, Drum, Rocket, Volume2, Power, AudioWaveform, Lock, CloudRain, Trees } from 'lucide-react';

interface MusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  setSettings: (s: Settings) => void;
  userXP: number;
}

const TIER_ORDER = ['Egg', 'Tadpole', 'Polliwog', 'Froglet', 'Hopper', 'Tree Frog', 'Bullfrog', 'Frog Sage'];

const BACKGROUND_PRESETS = [
    { id: 'RAIN', name: 'Rainy Pond', icon: <CloudRain className="w-4 h-4 text-blue-400" /> },
    { id: 'FOREST', name: 'Morning Forest', icon: <Trees className="w-4 h-4 text-emerald-500" /> },
    { id: 'PIANO_SATIE', name: 'Satie (Gymnopédie)', icon: <Music className="w-4 h-4 text-purple-400" /> },
    { id: 'ZEN', name: 'Zen Bells', icon: <Wind className="w-4 h-4 text-teal-500" /> },
    { id: 'PIANO_JAZZ', name: 'Jazz Lounge', icon: <Music className="w-4 h-4 text-orange-400" /> },
    { id: 'PIANO_BEETHOVEN', name: 'Moonlight Piano', icon: <Music className="w-4 h-4 text-purple-500" /> },
    { id: 'GUITAR', name: 'Acoustic Guitar', icon: <Guitar className="w-4 h-4 text-amber-500" /> },
    { id: 'BROWN_NOISE', name: 'Brown Noise', icon: <Waves className="w-4 h-4 text-stone-500" /> },
    { id: 'SYNTH_COSMIC', name: 'Cosmic Synth', icon: <Rocket className="w-4 h-4 text-indigo-500" /> },
    { id: 'DRUMS_HARDCORE', name: 'Hardcore Breakbeat', icon: <Drum className="w-4 h-4 text-red-600" /> },
];

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ isOpen, onClose, settings, setSettings, userXP }) => {
  const [activeTab, setActiveTab] = useState<'BACKGROUND' | 'RADIO'>('BACKGROUND');
  const { musicConfig } = settings;
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLevel = getCurrentLevel(userXP);
  const currentTierIndex = TIER_ORDER.indexOf(currentLevel.tier);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handlePlay = (source: MusicSource, id: string) => {
    setSettings({
      ...settings,
      musicConfig: { source, presetId: id }
    });
  };

  const handleStop = () => {
    setSettings({
      ...settings,
      musicConfig: { source: 'NONE', presetId: '' }
    });
  };
  
  const handleMasterVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, masterVolume: parseFloat(e.target.value) });
  };

  const handleAmbientVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, ambientVolume: parseFloat(e.target.value) });
  };

  const isStationLocked = (preset: RadioStation) => {
    if (preset.minLevelName) {
      const requiredLevel = LEVELS.find((l) => l.name === preset.minLevelName);
      if (requiredLevel) {
        return userXP < requiredLevel.minXP;
      }
    }
    const requiredIndex = TIER_ORDER.indexOf(preset.tier);
    return currentTierIndex < requiredIndex;
  };

  // The actual player render (Persists even when UI is closed)
  const renderEmbed = () => {
    if (musicConfig.source === 'NONE') return null;

    if (musicConfig.source === 'YOUTUBE') {
      const isPlaylist = musicConfig.presetId.startsWith('PL');
      const src = isPlaylist 
        ? `https://www.youtube-nocookie.com/embed/videoseries?list=${musicConfig.presetId}&autoplay=1`
        : `https://www.youtube-nocookie.com/embed/${musicConfig.presetId}?autoplay=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;

      return (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative shadow-inner">
           <iframe 
             width="100%" 
             height="100%" 
             src={src} 
             title="YouTube music player" 
             frameBorder="0" 
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
             allowFullScreen
             className="w-full h-full"
           ></iframe>
        </div>
      );
    }

    if (musicConfig.source === 'SPOTIFY') {
      return (
        <iframe 
          style={{ borderRadius: '12px' }} 
          src={`https://open.spotify.com/embed/playlist/${musicConfig.presetId}`} 
          width="100%" 
          height="152" 
          frameBorder="0" 
          allowFullScreen 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
          className="shadow-sm"
        ></iframe>
      );
    }

    if (musicConfig.source === 'SUNO') {
      return (
        <div className="rounded-xl overflow-hidden shadow-sm border border-stone-200">
           <iframe 
             src={`https://suno.com/embed/playlist/${musicConfig.presetId}`}
             width="100%" 
             height="380" 
             frameBorder="0" 
             allow="clipboard-write; autoplay"
           ></iframe>
        </div>
      );
    }

    if (musicConfig.source === 'GENERATED') {
       // Visualizer for Generated Audio
       const info = BACKGROUND_PRESETS.find(p => p.id === musicConfig.presetId);
       return (
         <div className="w-full h-20 bg-stone-900 rounded-xl flex flex-col items-center justify-center relative overflow-hidden shadow-inner ring-1 ring-stone-800">
            {/* Simple CSS animation for visualizer */}
            <div className="absolute inset-0 opacity-20 flex items-end justify-center gap-0.5 pb-1">
                {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-frog-green rounded-t-sm animate-pulse" 
                      style={{ 
                          height: `${20 + Math.random() * 60}%`,
                          animationDuration: `${0.3 + Math.random() * 0.7}s`
                      }} 
                    />
                ))}
            </div>
            <div className="z-10 text-white font-bold flex flex-col items-center gap-1">
                <div className="p-1.5 bg-stone-800 rounded-full shadow-xl border border-stone-700">
                    {info?.icon || <Sparkles className="w-4 h-4 text-yellow-400" />}
                </div>
                <span className="text-[10px] tracking-wide font-mono">{info?.name}</span>
            </div>
            <div className="absolute top-1.5 right-1.5 text-[8px] text-frog-green font-black uppercase tracking-widest bg-stone-800 px-1 py-0.5 rounded border border-stone-700/50">
               Live
            </div>
         </div>
       );
    }
  };

  // If closed and not playing, don't render anything
  if (!isOpen && musicConfig.source === 'NONE') return null;

  return (
    <div className={`fixed bottom-24 right-6 z-50 transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
      <div ref={containerRef} className="bg-white rounded-2xl shadow-2xl shadow-stone-300/50 w-80 max-w-[calc(100vw-3rem)] border border-stone-100 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-white border-b border-stone-100">
           <div className="flex items-center gap-2 text-stone-700 font-bold">
             <Radio className="w-4 h-4 text-frog-green" />
             <span className="text-sm">Background Audio</span>
           </div>
           <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
             <X className="w-4 h-4" />
           </button>
        </div>

        {/* Content */}
        <div className="p-3 bg-stone-50/50">
          
          {/* Master Volume */}
          <div className="mb-3 px-3 py-2 bg-white rounded-xl border border-stone-100 shadow-sm">
             <div className="flex justify-between text-[10px] text-stone-400 font-bold mb-2 uppercase tracking-wide">
                <span className="flex items-center gap-1.5 text-stone-500"><Volume2 className="w-3.5 h-3.5"/> Master Volume</span>
                <span>{Math.round(settings.masterVolume * 100)}%</span>
             </div>
             <input 
               type="range" 
               min="0" 
               max="1" 
               step="0.01" 
               value={settings.masterVolume}
               onChange={handleMasterVolumeChange}
               className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-frog-green"
             />
          </div>

          {/* Active Player Area */}
          <div className={`transition-all duration-300 ${musicConfig.source === 'NONE' ? 'h-0 overflow-hidden opacity-0' : 'h-auto min-h-[60px] mb-3 opacity-100'}`}>
             {renderEmbed()}
             
             <button 
               onClick={handleStop} 
               className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 text-xs text-red-500 font-bold bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
             >
               <Power className="w-3.5 h-3.5" /> Disable Music
             </button>
          </div>

          {/* Main Source Selection */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button 
              onClick={() => setActiveTab('BACKGROUND')}
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all border-2 ${activeTab === 'BACKGROUND' ? 'border-frog-500 bg-frog-50 text-frog-700 shadow-sm shadow-frog-100' : 'border-stone-100 bg-white text-stone-500 hover:border-stone-200 hover:bg-stone-50'}`}
            >
              <div className={`p-1.5 rounded-full ${activeTab === 'BACKGROUND' ? 'bg-frog-200/50 text-frog-600' : 'bg-stone-100 text-stone-400'}`}>
                 <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">Ambient</span>
            </button>
            <button 
              onClick={() => setActiveTab('RADIO')}
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all border-2 ${activeTab === 'RADIO' ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm shadow-purple-100' : 'border-stone-100 bg-white text-stone-500 hover:border-stone-200 hover:bg-stone-50'}`}
            >
              <div className={`p-1.5 rounded-full relative ${activeTab === 'RADIO' ? 'bg-purple-200/50 text-purple-600' : 'bg-stone-100 text-stone-400'}`}>
                 <div className="absolute -top-1 -right-1 flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                 </div>
                 <Radio className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">Music Radio</span>
            </button>
          </div>

          {/* Volume Control - Visible when in Background tab */}
          {activeTab === 'BACKGROUND' && (
            <div className="mb-3 px-3 py-2 bg-white rounded-xl border border-stone-100 shadow-sm animate-in slide-in-from-top-2 fade-in duration-300">
               <div className="flex justify-between text-[10px] text-stone-400 font-bold mb-2 uppercase tracking-wide">
                  <span className="flex items-center gap-1.5 text-stone-500"><Music className="w-3.5 h-3.5"/> Ambient Volume</span>
                  <span>{Math.round(settings.ambientVolume * 100)}%</span>
               </div>
               <input 
                 type="range" 
                 min="0" 
                 max="1" 
                 step="0.01" 
                 value={settings.ambientVolume}
                 onChange={handleAmbientVolumeChange}
                 className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-frog-green hover:accent-green-500"
               />
            </div>
          )}

          {/* Preset List */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
             {activeTab === 'BACKGROUND' && BACKGROUND_PRESETS.map((preset) => (
               <button
                 key={preset.id}
                 onClick={() => handlePlay('GENERATED', preset.id)}
                 className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between group
                   ${musicConfig.source === 'GENERATED' && musicConfig.presetId === preset.id 
                     ? 'bg-green-50 text-frog-green border border-green-100' 
                     : 'bg-white hover:bg-stone-50 text-stone-600 border border-transparent hover:border-stone-200'
                   }`}
               >
                 <div className="flex items-center gap-2">
                    {preset.icon && <span className="opacity-70">{preset.icon}</span>}
                    <span className="truncate">{preset.name}</span>
                 </div>
                 {musicConfig.source === 'GENERATED' && musicConfig.presetId === preset.id && (
                   <div className="flex space-x-[2px] items-end h-3">
                     <div className="w-[2px] bg-frog-green h-1 animate-[bounce_1s_infinite]" />
                     <div className="w-[2px] bg-frog-green h-2 animate-[bounce_1.2s_infinite]" />
                     <div className="w-[2px] bg-frog-green h-3 animate-[bounce_0.8s_infinite]" />
                   </div>
                 )}
               </button>
             ))}

             {activeTab === 'RADIO' && RADIO_STATIONS.map((preset) => {
               const locked = isStationLocked(preset);
               
               return (
                 <button
                   key={preset.id}
                   onClick={() => !locked && handlePlay(preset.type, preset.id)}
                   disabled={locked}
                   className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between group
                     ${locked
                       ? 'bg-stone-50 text-stone-400 opacity-60 cursor-not-allowed border border-transparent'
                       : musicConfig.source === preset.type && musicConfig.presetId === preset.id 
                         ? 'bg-green-50 text-frog-green border border-green-100' 
                         : 'bg-white hover:bg-stone-50 text-stone-600 border border-transparent hover:border-stone-200'
                     }`}
                 >
                   <div className="flex items-center gap-2">
                      {locked ? <Lock className="w-3.5 h-3.5 opacity-50" /> : (
                         preset.type === 'YOUTUBE' ? <Youtube className="w-3.5 h-3.5 text-red-500 opacity-80" /> : 
                         preset.type === 'SUNO' ? <AudioWaveform className="w-3.5 h-3.5 text-stone-800 opacity-80" /> :
                         <Disc className="w-3.5 h-3.5 text-frog-green opacity-80" />
                      )}
                      <div className="flex flex-col">
                        <span className="truncate">{preset.name}</span>
                        {locked && <span className="text-[9px] text-stone-400 font-normal uppercase tracking-wide">Unlocks at {preset.tier}</span>}
                      </div>
                   </div>
                   {!locked && musicConfig.source === preset.type && musicConfig.presetId === preset.id && (
                     <div className="flex space-x-[2px] items-end h-3">
                       <div className="w-[2px] bg-frog-green h-1 animate-[bounce_1s_infinite]" />
                       <div className="w-[2px] bg-frog-green h-2 animate-[bounce_1.2s_infinite]" />
                       <div className="w-[2px] bg-frog-green h-3 animate-[bounce_0.8s_infinite]" />
                     </div>
                   )}
                 </button>
               );
             })}
          </div>

        </div>
      </div>
    </div>
  );
};
