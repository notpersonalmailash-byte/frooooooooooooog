import React, { useEffect, useRef, useState, useCallback } from 'react';
import { soundEngine } from '../utils/soundEngine';
import { Rocket, RotateCcw, LogOut, Zap } from 'lucide-react';

// --- WORDS ---
const COSMIC_WORDS = [
  "star", "moon", "sun", "mars", "void", "ship", "hull", "warp", "gate", "beam",
  "laser", "pilot", "orbit", "radar", "scan", "data", "core", "fuel", "tank", "crew",
  "alien", "ufo", "grey", "zeta", "nova", "dust", "ring", "belt", "ice", "rock",
  "comet", "pluto", "titan", "luna", "terra", "sol", "vega", "rigel", "mira", "deneb",
  "galaxy", "nebula", "cluster", "pulsar", "quasar", "black", "hole", "event", "horizon",
  "gravity", "physics", "quantum", "photon", "light", "speed", "sound", "wave", "freq",
  "signal", "radio", "video", "screen", "panel", "lever", "button", "switch", "power",
  "shield", "armor", "metal", "alloy", "steel", "iron", "gold", "zinc", "lead", "neon",
  "plasma", "ion", "fusion", "fission", "atomic", "nuclear", "engine", "motor", "drive",
  "thruster", "booster", "rocket", "missile", "torpedo", "cannon", "turret", "blaster",
  "attack", "defend", "patrol", "scout", "fighter", "bomber", "carrier", "frigate", "drone",
  "invader", "raider", "pirate", "bandit", "rogue", "rebel", "empire", "force", "squad"
];

const BOSS_WORDS = [
    "mothership", "dreadnought", "destroyer", "battleship", "interceptor", "juggernaut", "leviathan",
    "constellation", "observatory", "planetarium", "atmosphere", "stratosphere", "exosphere",
    "teleportation", "hyperspace", "wormhole", "singularity", "antimatter", "darkmatter",
    "intelligence", "surveillance", "reconnaissance", "communication", "transmission",
    "extraterrestrial", "interstellar", "intergalactic", "astrophysics", "cosmology"
];

const BOMB_WORDS = [
    "tic", "tac", "toe", "bam", "pow", "zap", "die", "run", "hot", "red", "six", "mix", "fix", "box", "cut", "out", "end", "fin", "bot", "bit"
];

interface Entity {
  id: number;
  word: string;
  typed: string; // What has been typed so far
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100 (Top to Bottom)
  speed: number;
  type: 'SCOUT' | 'FIGHTER' | 'DESTROYER' | 'BOSS' | 'BOMB';
  maxHealth: number; 
  lastAttackTime?: number; // For bosses to track bomb cooldown
}

interface Projectile {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number; // 0 to 1
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface CosmicDefenseGameProps {
  onGameOver: (score: number, xp: number, wave: number) => void;
  onExit: () => void;
}

const CosmicDefenseGame: React.FC<CosmicDefenseGameProps> = ({ onGameOver, onExit }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [enemies, setEnemies] = useState<Entity[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [health, setHealth] = useState(100);
  const [multiplier, setMultiplier] = useState(1);
  const [activeTargetId, setActiveTargetId] = useState<number | null>(null);

  // Refs for loop
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const waveTimerRef = useRef<number>(0);
  
  // Game config refs
  const difficultyRef = useRef(1);
  const gameStateRef = useRef<'START' | 'PLAYING' | 'GAMEOVER'>('START');

  // Sync ref
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const startGame = () => {
    setEnemies([]);
    setProjectiles([]);
    setParticles([]);
    setScore(0);
    setWave(1);
    setHealth(100);
    setMultiplier(1);
    setActiveTargetId(null);
    setGameState('PLAYING');

    difficultyRef.current = 1;
    spawnTimerRef.current = 0;
    waveTimerRef.current = 0;
    lastTimeRef.current = performance.now();

    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const spawnEnemy = () => {
    const id = Date.now() + Math.random();
    
    // Determine type based on random + wave
    const rand = Math.random();
    let type: Entity['type'] = 'SCOUT';
    let pool = COSMIC_WORDS;
    let speed = 5 + (wave * 0.5); // Base speed
    
    // Wave scaling logic
    if (wave > 2 && rand > 0.8) {
        type = 'DESTROYER';
        pool = BOSS_WORDS;
        speed = 2 + (wave * 0.2); // Slower
    } else if (wave > 1 && rand > 0.6) {
        type = 'FIGHTER';
        speed = 7 + (wave * 0.6);
    } else if (wave >= 3 && rand > 0.96) { // Bosses appear from wave 3
        type = 'BOSS';
        pool = BOSS_WORDS;
        speed = 1.0; // Very slow
    }

    const word = pool[Math.floor(Math.random() * pool.length)];
    
    // Spawn X position (avoid edges)
    const x = 10 + Math.random() * 80;

    const newEnemy: Entity = {
        id,
        word,
        typed: '',
        x,
        y: -15, // Start further above screen for bosses
        speed,
        type,
        maxHealth: word.length,
        lastAttackTime: performance.now() + 2000 // Delay first shot
    };

    setEnemies(prev => [...prev, newEnemy]);
  };

  const createExplosion = (x: number, y: number, color: string) => {
      const count = 10;
      const newParticles: Particle[] = [];
      for(let i=0; i<count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 50 + 20;
          newParticles.push({
              id: Math.random(),
              x,
              y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.0,
              color
          });
      }
      setParticles(prev => [...prev, ...newParticles]);
  };

  const gameLoop = (time: number) => {
    if (gameStateRef.current !== 'PLAYING') return;
    
    const deltaTime = (time - (lastTimeRef.current || time)) / 1000;
    lastTimeRef.current = time;

    // --- SPAWNING ---
    spawnTimerRef.current += deltaTime;
    const spawnInterval = Math.max(0.8, 3.0 - (wave * 0.2)); 
    
    if (spawnTimerRef.current > spawnInterval) {
        spawnEnemy();
        spawnTimerRef.current = 0;
    }

    // --- WAVE MANAGEMENT ---
    waveTimerRef.current += deltaTime;
    if (waveTimerRef.current > 30) { // New wave every 30s
        setWave(w => w + 1);
        waveTimerRef.current = 0;
        soundEngine.playLevelUp();
    }

    // --- UPDATE ENEMIES ---
    setEnemies(prev => {
        const next: Entity[] = [];
        const newSpawns: Entity[] = [];
        let hitPlayer = false;

        prev.forEach(e => {
            // Move down
            e.y += e.speed * deltaTime;

            // BOSS/DESTROYER Bomb Logic
            if ((e.type === 'BOSS' || e.type === 'DESTROYER') && e.y > 0 && e.y < 80) {
                // Check cooldown
                if (time - (e.lastAttackTime || 0) > (e.type === 'BOSS' ? 2500 : 4000)) {
                    e.lastAttackTime = time;
                    // Spawn Bomb
                    const bombWord = BOMB_WORDS[Math.floor(Math.random() * BOMB_WORDS.length)];
                    newSpawns.push({
                        id: Date.now() + Math.random(),
                        word: bombWord,
                        typed: '',
                        x: e.x,
                        y: e.y + 5,
                        speed: 18, // Bombs are fast!
                        type: 'BOMB',
                        maxHealth: bombWord.length
                    });
                    soundEngine.playError(); // Use error sound for enemy shoot
                }
            }

            // Check collision with player/bottom
            if (e.y >= 90) {
                hitPlayer = true;
                const damage = e.type === 'BOSS' ? 100 : e.type === 'DESTROYER' ? 40 : e.type === 'BOMB' ? 15 : 20;
                setHealth(h => Math.max(0, h - damage)); 
                createExplosion(e.x, 90, '#ef4444');
                
                // Remove enemy if it crashes
                if (activeTargetId === e.id) setActiveTargetId(null);
            } else {
                next.push(e);
            }
        });

        if (hitPlayer) {
            soundEngine.playError();
            setMultiplier(1);
        }

        return [...next, ...newSpawns];
    });

    // Check Game Over
    setHealth(currentHealth => {
        if (currentHealth <= 0) {
            setGameState('GAMEOVER');
        }
        return currentHealth;
    });

    // --- UPDATE PROJECTILES ---
    setProjectiles(prev => {
        const next: Projectile[] = [];
        prev.forEach(p => {
            p.progress += 5 * deltaTime; // Projectile speed
            if (p.progress < 1) next.push(p);
        });
        return next;
    });

    // --- UPDATE PARTICLES ---
    setParticles(prev => {
        const next: Particle[] = [];
        prev.forEach(p => {
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.life -= 2 * deltaTime;
            if (p.life > 0) next.push(p);
        });
        return next;
    });

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (gameStateRef.current !== 'PLAYING') return;

      if (e.key === 'Escape') {
          setActiveTargetId(null);
          return;
      }

      const char = e.key.toLowerCase();
      if (!/[a-z]/.test(char) || char.length !== 1) return;

      setEnemies(prev => {
          const newEnemies = [...prev];
          let targetIndex = -1;

          // If locked on, find that enemy
          if (activeTargetId !== null) {
              targetIndex = newEnemies.findIndex(e => e.id === activeTargetId);
              // If target died or moved off screen (rare race condition), reset lock
              if (targetIndex === -1) {
                  setActiveTargetId(null);
                  return newEnemies;
              }
          }

          // If no lock or target invalid, try to find a new target
          if (targetIndex === -1) {
              // Priority: BOMBS > CLOSEST
              const candidates = newEnemies
                  .map((e, i) => ({ e, i }))
                  .filter(item => item.e.word.startsWith(char))
                  .sort((a, b) => {
                      // Priority check
                      const scoreA = (a.e.type === 'BOMB' ? 1000 : 0) + a.e.y;
                      const scoreB = (b.e.type === 'BOMB' ? 1000 : 0) + b.e.y;
                      return scoreB - scoreA; // Descending score (Higher Y or Bomb is better)
                  });
              
              if (candidates.length > 0) {
                  targetIndex = candidates[0].i;
                  setActiveTargetId(newEnemies[targetIndex].id);
              }
          }

          // Process Hit
          if (targetIndex !== -1) {
              const enemy = newEnemies[targetIndex];
              const nextChar = enemy.word[enemy.typed.length];

              if (nextChar === char) {
                  // HIT
                  soundEngine.playKeypress(); 
                  
                  // Spawn Projectile
                  setProjectiles(projs => [...projs, {
                      id: Math.random(),
                      startX: 50, // Player center
                      startY: 90,
                      targetX: enemy.x,
                      targetY: enemy.y,
                      progress: 0
                  }]);

                  enemy.typed += char;

                  // Check destruction
                  if (enemy.typed === enemy.word) {
                      soundEngine.playSuccess();
                      createExplosion(enemy.x, enemy.y, '#22c55e');
                      newEnemies.splice(targetIndex, 1);
                      setActiveTargetId(null);
                      
                      const points = enemy.type === 'BOSS' ? 500 : enemy.type === 'BOMB' ? 50 : 10;
                      setScore(s => s + (points * multiplier));
                      setMultiplier(m => Math.min(m + 1, 10));
                  }
              } else {
                  // MISTAKE
                  soundEngine.playError();
                  setMultiplier(1);
                  setScore(s => Math.max(0, s - 5));
              }
          } else {
              soundEngine.playError();
          }

          return newEnemies;
      });

  }, [activeTargetId, multiplier]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const handleAction = (action: 'RETRY' | 'EXIT') => {
    // Save stats
    if (score > 0) {
        onGameOver(score, Math.floor(score * 0.8), wave);
    }
    
    if (action === 'RETRY') {
        startGame();
    } else {
        onExit();
    }
  };

  // --- RENDERERS ---

  if (gameState === 'START') {
      return (
          <div className="w-full max-w-4xl mx-auto h-[600px] bg-black rounded-3xl border-4 border-indigo-900/50 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-white">
              <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
              
              <div className="z-10 text-center space-y-6 animate-in zoom-in-95">
                  <div className="w-24 h-24 bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                      <Rocket className="w-12 h-12 text-indigo-300 transform -rotate-45" />
                  </div>
                  
                  <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tight">
                      COSMIC DEFENSE
                  </h2>
                  
                  <p className="text-indigo-200 text-lg max-w-md mx-auto">
                      Defend the station. Type words to launch missiles. 
                      <br/>
                      <span className="text-sm opacity-70 text-red-300 font-bold mt-2 block">WARNING: MOTHERSHIP DETECTED</span>
                  </p>

                  <div className="flex gap-4 justify-center pt-4">
                      <button onClick={onExit} className="px-6 py-3 text-indigo-400 font-bold hover:text-indigo-200">
                          Back
                      </button>
                      <button 
                        onClick={startGame}
                        className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl rounded-full shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-transform hover:scale-105 flex items-center gap-2"
                      >
                          <Zap className="w-5 h-5 fill-current" /> LAUNCH
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  if (gameState === 'GAMEOVER') {
      return (
          <div className="w-full max-w-4xl mx-auto h-[600px] bg-black rounded-3xl border-4 border-red-900 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-white">
              <div className="z-10 text-center space-y-6 animate-in zoom-in-95">
                  <div className="text-red-500 font-black text-6xl tracking-widest mb-2 shadow-red-500/50 drop-shadow-2xl">
                      BREACH DETECTED
                  </div>
                  <div className="text-2xl font-mono mb-4 text-indigo-200">
                      Wave Reached: <span className="text-white font-bold">{wave}</span>
                  </div>
                  <div className="text-4xl font-mono font-black text-cyan-400">
                      {score} <span className="text-sm text-cyan-700">PTS</span>
                  </div>
                  
                  <div className="flex gap-4 justify-center mt-8">
                      <button 
                        onClick={() => handleAction('EXIT')}
                        className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl flex items-center gap-2"
                      >
                          <LogOut className="w-5 h-5" /> Save & Exit
                      </button>
                      <button 
                        onClick={() => handleAction('RETRY')}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                      >
                          <RotateCcw className="w-5 h-5" /> Re-Deploy
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="w-full max-w-4xl mx-auto h-[600px] bg-black rounded-3xl relative overflow-hidden border-4 border-indigo-900/30 shadow-2xl select-none cursor-crosshair">
        
        {/* Starfield Background */}
        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[pulse_4s_infinite]"></div>
        
        {/* HUD */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-30 font-mono">
            <div className="flex flex-col gap-2">
                <div className="text-cyan-400 text-2xl font-black drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                    {score.toString().padStart(6, '0')}
                </div>
                <div className="text-indigo-400 text-sm font-bold">
                    WAVE {wave}
                </div>
            </div>

            <div className="w-48">
                <div className="flex justify-between text-xs text-indigo-300 mb-1 font-bold uppercase">
                    <span>Hull Integrity</span>
                    <span>{health}%</span>
                </div>
                <div className="h-3 bg-indigo-900/50 rounded-full overflow-hidden border border-indigo-500/30">
                    <div 
                        className={`h-full transition-all duration-300 ${health > 50 ? 'bg-cyan-500' : 'bg-red-500'}`}
                        style={{ width: `${health}%` }}
                    ></div>
                </div>
            </div>
        </div>

        {/* Player Ship */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <div className="w-16 h-16 relative">
                 {/* Turret Body */}
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-indigo-600 rounded-t-lg shadow-[0_0_20px_rgba(79,70,229,0.6)]"></div>
                 {/* Barrel */}
                 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-2 h-8 bg-cyan-300 rounded-full shadow-[0_0_15px_rgba(103,232,249,0.8)]"></div>
                 {/* Shield Effect */}
                 <div className="absolute -inset-4 border border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
            </div>
        </div>

        {/* Projectiles */}
        {projectiles.map(p => {
            const currentX = p.startX + (p.targetX - p.startX) * p.progress;
            const currentY = p.startY + (p.targetY - p.startY) * p.progress;
            return (
                <div 
                    key={p.id}
                    className="absolute w-1 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)] z-10"
                    style={{ 
                        left: `${currentX}%`, 
                        top: `${currentY}%`,
                        transform: 'translate(-50%, -50%) rotate(0deg)' // Ideally calculate angle
                    }}
                />
            );
        })}

        {/* Particles */}
        {particles.map(p => (
            <div 
                key={p.id}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    backgroundColor: p.color,
                    opacity: p.life,
                    boxShadow: `0 0 10px ${p.color}`
                }}
            />
        ))}

        {/* Enemies */}
        {enemies.map(enemy => {
            const isLocked = activeTargetId === enemy.id;
            const untyped = enemy.word.slice(enemy.typed.length);
            
            // Determine Color based on type
            let shipColor = 'text-white';
            let icon = '🛸';
            let scale = 'scale-100';
            
            if (enemy.type === 'BOSS') { 
                shipColor = 'text-red-500'; 
                icon = '🛸'; 
                scale = 'scale-[3.0]'; // MASSIVE BOSS
            }
            else if (enemy.type === 'DESTROYER') { shipColor = 'text-orange-400'; icon = '🚀'; scale = 'scale-150'; }
            else if (enemy.type === 'FIGHTER') { shipColor = 'text-yellow-300'; icon = '✈️'; }
            else if (enemy.type === 'BOMB') { shipColor = 'text-red-500 animate-pulse'; icon = '💣'; scale = 'scale-125'; }

            return (
                <div 
                    key={enemy.id}
                    className="absolute flex flex-col items-center transition-transform will-change-transform"
                    style={{
                        left: `${enemy.x}%`,
                        top: `${enemy.y}%`,
                        transform: 'translate(-50%, 0)',
                        zIndex: isLocked ? 20 : 10
                    }}
                >
                    {/* Word Label */}
                    <div className={`
                        mb-1 px-2 py-0.5 rounded text-sm font-mono font-bold tracking-widest uppercase flex whitespace-nowrap
                        ${isLocked ? 'bg-cyan-500/20 ring-1 ring-cyan-400 scale-110 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-black/50 text-indigo-200'}
                        ${enemy.type === 'BOSS' ? 'scale-150 -translate-y-4' : ''}
                        ${enemy.type === 'BOMB' ? 'text-red-400 ring-1 ring-red-900/50' : ''}
                    `}>
                        <span className="text-cyan-300 opacity-50">{enemy.typed}</span>
                        <span className={isLocked ? 'text-white' : 'text-indigo-100'}>{untyped}</span>
                    </div>

                    {/* Ship Visual */}
                    <div className={`text-4xl filter drop-shadow-lg ${isLocked ? 'animate-pulse' : ''} ${shipColor} ${scale}`}>
                        {icon}
                    </div>

                    {/* Target Reticle if Locked */}
                    {isLocked && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-cyan-500/50 rounded-full animate-ping opacity-20"></div>
                    )}
                </div>
            );
        })}

        {/* Scan lines overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,255,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-40 bg-[length:100%_2px,3px_100%]"></div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-indigo-900/20 to-transparent z-0"></div>

    </div>
  );
};

export default CosmicDefenseGame;