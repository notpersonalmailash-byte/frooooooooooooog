import React, { useEffect, useRef, useState, useCallback } from 'react';
import { soundEngine } from '../utils/soundEngine';
import { Skull, Heart, Trophy, X, Play, Biohazard, RotateCcw, ShieldPlus, LogOut, Zap } from 'lucide-react';

// --- WORD POOLS ---

const SWAMP_WORDS = [
  "frog", "jump", "pond", "green", "water", "lily", "pad", "swim", "croak", "fly",
  "bug", "tongue", "catch", "swamp", "reed", "mud", "rain", "splash", "hop", "toad",
  "nature", "wild", "forest", "tree", "leaf", "root", "moss", "fern", "stone", "rock",
  "river", "creek", "lake", "stream", "flow", "drift", "float", "sink", "dive", "wet",
  "slime", "slick", "quick", "fast", "slow", "wait", "hide", "seek", "find", "hunt",
  "blue", "teal", "lime", "dark", "light", "sun", "moon", "star", "sky", "cloud"
];

const ZOMBIE_WORDS = [
  "run", "hide", "flee", "dead", "bite", "gore", "fear", "dark", "doom", "grim",
  "tomb", "dust", "bone", "pale", "cold", "rot", "sick", "pain", "hurt", "kill",
  "aim", "gun", "shot", "fire", "load", "clip", "ammo", "bang", "boom", "slam",
  "lock", "door", "safe", "help", "save", "cure", "pill", "heal", "life", "soul",
  "blood", "flesh", "brain", "skull", "spine", "ribs", "limbs", "teeth", "claw", "nail",
  "virus", "toxin", "decay", "grave", "ghost", "haunt", "scare", "panic", "shout", "scream",
  "horror", "terror", "night", "black", "shadow", "creep", "crawl", "stalk", "chase", "hunt",
  "ruins", "ashes", "smoke", "flame", "burn", "torch", "light", "flash", "spark", "ember",
  "survive", "escape", "resist", "defend", "attack", "strike", "smash", "break", "crush", "snap"
];

const HARD_WORDS = [
    "amphibian", "ecosystem", "metamorphosis", "evolution", "biodiversity",
    "photosynthesis", "chlorophyll", "atmosphere", "temperature", "precipitation",
    "apocalypse", "infection", "quarantine", "sanctuary", "barricade",
    "evacuation", "contagion", "mutation", "resurrection", "survivalist",
    "ammunition", "ballistics", "headshot", "marksmanship", "adrenaline",
    "desolation", "abandoned", "nightmare", "hallucination", "psychosis"
];

export type SurvivalVariant = 'SWAMP' | 'ZOMBIE';

interface Enemy {
  id: number;
  word: string;
  typed: string;
  x: number; // Percentage 0-100 
  y: number; // Percentage 10-90
  direction: 'LEFT' | 'RIGHT';
  speed: number;
  type: 'NORMAL' | 'FAST' | 'TANK' | 'SPITTER' | 'JUMPER';
  isLocked: boolean;
  damage: number;
  // Specific enemy state
  lastActionTime: number; // For Jumper (jump) and Spitter (shoot)
  actionState?: 'IDLE' | 'CHARGING' | 'ATTACKING';
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  targetX: number;
  speed: number;
  damage: number;
}

interface SurvivalGameProps {
  variant: SurvivalVariant;
  onGameOver: (score: number, xp: number) => void;
  onExit: () => void;
}

const SurvivalGame: React.FC<SurvivalGameProps> = ({ variant, onGameOver, onExit }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [multiplier, setMultiplier] = useState(1);
  const [wave, setWave] = useState(1);
  const [waveProgress, setWaveProgress] = useState(0);
  const [waveTarget, setWaveTarget] = useState(10);
  const [waveNotification, setWaveNotification] = useState<string | null>(null);
  
  // Game Loop Refs
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const difficultyRef = useRef<number>(1);
  const gameStateRef = useRef<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const livesRef = useRef(5);
  
  // Input Refs
  const activeEnemyIdRef = useRef<number | null>(null);

  // Sync state to refs for game loop
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { livesRef.current = lives; }, [lives]);

  // Theme Configuration
  const isZombie = variant === 'ZOMBIE';
  const PRIMARY_COLOR = isZombie ? 'text-red-500' : 'text-frog-green';
  const BG_CLASS = isZombie ? 'bg-stone-950' : 'bg-stone-900';
  const BORDER_CLASS = isZombie ? 'border-red-900/50' : 'border-stone-800';
  
  // Initialize Game
  const startGame = () => {
    setEnemies([]);
    setProjectiles([]);
    setScore(0);
    setLives(5);
    setMultiplier(1);
    setWave(1);
    setWaveProgress(0);
    setWaveTarget(10);
    setWaveNotification("WAVE 1");
    setGameState('PLAYING');
    
    // Reset Refs
    gameStateRef.current = 'PLAYING';
    livesRef.current = 5;
    activeEnemyIdRef.current = null;
    difficultyRef.current = 1;
    spawnTimerRef.current = 0;
    lastTimeRef.current = performance.now();
    
    setTimeout(() => setWaveNotification(null), 2000);

    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const advanceWave = () => {
      // Heal player
      const newLives = Math.min(5, livesRef.current + 1);
      setLives(newLives);
      livesRef.current = newLives;

      const nextWave = wave + 1;
      setWave(nextWave);
      setWaveProgress(0);
      setWaveTarget(Math.floor(10 + (nextWave * 5))); 
      
      // Increase Difficulty
      difficultyRef.current += 0.5;

      // Show Notification
      setWaveNotification(`WAVE ${nextWave}`);
      soundEngine.playLevelUp();
      
      setTimeout(() => setWaveNotification(null), 2500);
  };

  const spawnEnemy = () => {
    const id = Date.now() + Math.random();
    const hardChance = 0.05 + (wave * 0.02);
    const isHard = Math.random() < hardChance;
    
    const basePool = isZombie ? ZOMBIE_WORDS : SWAMP_WORDS;
    const pool = isHard ? HARD_WORDS : basePool;
    const word = pool[Math.floor(Math.random() * pool.length)];
    
    // Determine Type
    let type: Enemy['type'] = 'NORMAL';
    let speedBase = 0.03; 
    let damage = 1;

    if (isZombie) {
        const rand = Math.random();
        if (word.length > 7 || (wave > 2 && rand > 0.85)) {
            type = 'TANK';
            speedBase = 0.015; // Very slow
            damage = 2;
        } else if (rand > 0.7) {
            type = 'FAST'; // Runner dog
            speedBase = 0.05;
        } else if (wave > 2 && rand > 0.55) {
            type = 'SPITTER'; // Ranged
            speedBase = 0.025;
        } else if (wave > 3 && rand > 0.4) {
            type = 'JUMPER'; // Leaper
            speedBase = 0.02; // Base slow, but jumps
        }
    } else {
        // Swamp logic
        if (word.length > 7) {
            type = 'TANK';
            speedBase = 0.02;
            damage = 2;
        } else if (Math.random() > 0.8) {
            type = 'FAST';
            speedBase = 0.045;
        }
    }

    const finalSpeed = speedBase * (1 + (difficultyRef.current * 0.1));

    // Position Logic
    let startX = 100; // Default Swamp (Right side)
    let direction: 'LEFT' | 'RIGHT' = 'LEFT'; 

    if (isZombie) {
        // 50/50 Spawn from Left or Right
        if (Math.random() > 0.5) {
            startX = 105; 
            direction = 'LEFT';
        } else {
            startX = -5; 
            direction = 'RIGHT';
        }
    }

    const newEnemy: Enemy = {
      id,
      word,
      typed: '',
      x: startX,
      y: 15 + Math.random() * 70, 
      speed: finalSpeed,
      type,
      isLocked: false,
      damage,
      direction,
      lastActionTime: performance.now()
    };

    setEnemies(prev => [...prev, newEnemy]);
  };

  const damagePlayer = (amount: number) => {
      livesRef.current = Math.max(0, livesRef.current - amount);
      setLives(livesRef.current);
      setMultiplier(1);
      soundEngine.playError();
      
      // Visual Shake
      const container = document.getElementById('survival-container');
      if (container) {
          container.classList.add('animate-shake');
          setTimeout(() => container.classList.remove('animate-shake'), 500);
      }
      
      if (livesRef.current <= 0) {
          endGame();
      }
  };

  const gameLoop = (time: number) => {
    if (gameStateRef.current !== 'PLAYING') return;
    
    const deltaTime = time - (lastTimeRef.current || time);
    lastTimeRef.current = time;

    difficultyRef.current += 0.0001;
    
    spawnTimerRef.current += deltaTime;
    const spawnInterval = Math.max(500, 2200 - (difficultyRef.current * 150));
    
    if (spawnTimerRef.current > spawnInterval) {
        spawnEnemy();
        spawnTimerRef.current = 0;
    }

    // --- UPDATE ENEMIES ---
    setEnemies(prevEnemies => {
      const nextEnemies: Enemy[] = [];
      let damageTaken = 0;

      prevEnemies.forEach(enemy => {
         // --- SPECIAL BEHAVIORS ---
         
         // 1. JUMPER Logic
         if (enemy.type === 'JUMPER') {
             if (time - enemy.lastActionTime > 2500) {
                 // LEAP!
                 enemy.lastActionTime = time;
                 const jumpDist = enemy.direction === 'LEFT' ? -15 : 15;
                 enemy.x += jumpDist;
                 // Flash effect handled by react render key/state if needed
             }
         }

         // 2. SPITTER Logic
         if (enemy.type === 'SPITTER') {
             const distToCenter = Math.abs(enemy.x - 50);
             const range = 30; // Stop at 30% distance
             
             if (distToCenter <= range) {
                 // Stop moving
                 // Shoot logic
                 if (time - enemy.lastActionTime > 2000) {
                     enemy.lastActionTime = time;
                     // Spawn Projectile
                     setProjectiles(projs => [...projs, {
                         id: Math.random(),
                         x: enemy.x,
                         y: enemy.y,
                         targetX: 50,
                         speed: 0.03, // Projectile speed
                         damage: 1
                     }]);
                     soundEngine.playError(); // Spit sound
                 }
             } else {
                 // Move normally
                 const moveAmount = (enemy.speed * deltaTime) / 16; 
                 if (enemy.direction === 'LEFT') enemy.x -= moveAmount;
                 else enemy.x += moveAmount;
             }
         } else {
             // Normal Movement for others
             const moveAmount = (enemy.speed * deltaTime) / 16; 
             if (enemy.direction === 'LEFT') enemy.x -= moveAmount;
             else enemy.x += moveAmount;
         }

         // --- COLLISION ---
         let hitPlayer = false;
         if (isZombie) {
             if (Math.abs(enemy.x - 50) < 5) hitPlayer = true;
         } else {
             if (enemy.x <= 10) hitPlayer = true;
         }

         if (hitPlayer) { 
             damageTaken += enemy.damage;
             if (activeEnemyIdRef.current === enemy.id) {
                 activeEnemyIdRef.current = null;
             }
         } else {
             nextEnemies.push(enemy);
         }
      });
      
      if (damageTaken > 0) damagePlayer(damageTaken);

      return nextEnemies;
    });

    // --- UPDATE PROJECTILES ---
    setProjectiles(prev => {
        const next: Projectile[] = [];
        let projectileDamage = 0;

        prev.forEach(p => {
            // Move towards 50 (center)
            const dir = p.targetX > p.x ? 1 : -1;
            p.x += dir * (p.speed * deltaTime);

            // Check collision with center
            if (Math.abs(p.x - 50) < 2) {
                projectileDamage += p.damage;
                // Destroy projectile
            } else {
                next.push(p);
            }
        });

        if (projectileDamage > 0) damagePlayer(projectileDamage);
        return next;
    });

    if (livesRef.current > 0) {
        requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const endGame = () => {
      setGameState('GAMEOVER');
      gameStateRef.current = 'GAMEOVER';
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameStateRef.current !== 'PLAYING') return;

    if (e.key === 'Escape') {
        setEnemies(prev => prev.map(en => ({...en, isLocked: false, typed: ''})));
        activeEnemyIdRef.current = null;
        return;
    }

    if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;
    
    const char = e.key.toLowerCase();

    setEnemies(prev => {
        let newEnemies = [...prev];
        let hit = false;
        let kill = false;
        let mistake = false;

        if (activeEnemyIdRef.current !== null) {
            const idx = newEnemies.findIndex(e => e.id === activeEnemyIdRef.current);
            if (idx !== -1) {
                const enemy = newEnemies[idx];
                const nextChar = enemy.word[enemy.typed.length];
                
                if (nextChar === char) {
                    hit = true;
                    const newTyped = enemy.typed + char;
                    newEnemies[idx] = { ...enemy, typed: newTyped };
                    
                    if (newTyped === enemy.word) {
                        kill = true;
                        newEnemies.splice(idx, 1);
                        activeEnemyIdRef.current = null;
                    }
                } else {
                    mistake = true;
                }
            } else {
                activeEnemyIdRef.current = null;
                mistake = true; 
            }
        } else {
            // Find new target
            // Sort by proximity to danger zone
            const candidates = newEnemies
                .filter(e => e.word.startsWith(char))
                .sort((a, b) => {
                    const distA = isZombie ? Math.abs(a.x - 50) : a.x;
                    const distB = isZombie ? Math.abs(b.x - 50) : b.x;
                    return distA - distB;
                });

            if (candidates.length > 0) {
                const target = candidates[0];
                const idx = newEnemies.findIndex(e => e.id === target.id);
                
                hit = true;
                activeEnemyIdRef.current = target.id;
                
                const newTyped = char;
                newEnemies[idx] = { ...target, isLocked: true, typed: newTyped };
                
                if (newTyped === target.word) {
                     kill = true;
                     newEnemies.splice(idx, 1);
                     activeEnemyIdRef.current = null;
                }
            } else {
                mistake = true;
            }
        }

        if (hit) soundEngine.playKeypress();
        
        if (mistake) {
            // Swamp Mode: Strict Penalty
            // Zombie Mode: Optional penalty, keeping it strictly '1 mistake = 1 life' for Frog
            // For Zombie mode, maybe just score penalty? 
            // Prompt says: "For the frog game, implement a 'one mistake costs one life' system."
            // Implicitly, Zombie game might be different. Let's keep Zombie standard.
            
            if (variant === 'SWAMP') {
                damagePlayer(1);
            } else {
                // Zombie: Just sound/score penalty, or small delay? 
                // Let's deduct score to keep it strategic without being too punishing given the chaos
                setScore(s => Math.max(0, s - 5));
                soundEngine.playError();
                setMultiplier(1);
            }
        }

        if (kill) {
            soundEngine.playSuccess();
            setScore(s => s + (10 * multiplier));
            setMultiplier(m => Math.min(m + 1, 10));
            
            // Handle Wave Progress
            setWaveProgress(current => {
                const next = current + 1;
                if (next >= waveTarget) {
                    setTimeout(advanceWave, 0); 
                    return 0;
                }
                return next;
            });
        }

        return newEnemies;
    });

  }, [multiplier, wave, waveTarget, isZombie, variant]); 

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
     if (score > 0) {
         const xp = Math.floor(score / 2);
         onGameOver(score, xp);
     }
     
     if (action === 'RETRY') {
         startGame();
     } else {
         onExit();
     }
  };

  const renderEnemy = (enemy: Enemy) => {
      let icon = '';
      let colorClass = 'text-white';
      
      if (isZombie) {
          if (enemy.type === 'TANK') { icon = '🧟‍♂️'; colorClass='text-green-700'; }
          else if (enemy.type === 'FAST') { icon = '🐕'; colorClass='text-stone-400'; }
          else if (enemy.type === 'SPITTER') { icon = '🤮'; colorClass='text-lime-400'; }
          else if (enemy.type === 'JUMPER') { icon = '🦗'; colorClass='text-red-400'; }
          else icon = '🧟'; 
      } else {
          if (enemy.type === 'TANK') icon = '👻';
          else if (enemy.type === 'FAST') icon = '🕷️';
          else icon = '🪰';
      }
      
      const untyped = enemy.word.slice(enemy.typed.length);
      const isLocked = enemy.isLocked;
      
      return (
          <div 
            key={enemy.id}
            className="absolute flex flex-col items-center transition-transform"
            style={{ 
                left: `${enemy.x}%`, 
                top: `${enemy.y}%`,
                transform: `scale(${isLocked ? 1.2 : 1}) translateX(-50%)`,
                zIndex: isLocked ? 20 : 10
            }}
          >
              <div className={`
                 text-sm font-mono font-bold px-2 py-0.5 rounded-full mb-1 whitespace-nowrap shadow-sm
                 ${isLocked 
                     ? isZombie ? 'bg-red-600 text-white ring-2 ring-white' : 'bg-frog-green text-white ring-2 ring-white'
                     : 'bg-stone-800/80 text-stone-200'
                 }
              `}>
                  <span className="text-white/50">{enemy.typed}</span>
                  <span className="text-white">{untyped}</span>
              </div>
              <div className={`text-4xl filter drop-shadow-lg ${enemy.type === 'JUMPER' ? 'animate-bounce' : ''}`} >
                  {isZombie && enemy.direction === 'RIGHT' ? (
                      <span className="inline-block transform -scale-x-100">{icon}</span>
                  ) : icon}
              </div>
          </div>
      );
  };

  if (gameState === 'START') {
      return (
          <div className={`w-full max-w-4xl mx-auto h-[500px] rounded-3xl relative overflow-hidden flex flex-col items-center justify-center text-white border-4 shadow-2xl ${BG_CLASS} ${BORDER_CLASS}`}>
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <div className="z-10 text-center space-y-6">
                  <h2 className={`text-5xl font-black tracking-tighter flex items-center gap-4 justify-center ${PRIMARY_COLOR}`}>
                      {isZombie ? <Biohazard className="w-12 h-12" /> : <Skull className="w-12 h-12" />}
                      {isZombie ? 'OUTBREAK Z' : 'SWAMP SURVIVAL'}
                  </h2>
                  <p className="text-stone-400 max-w-md mx-auto text-lg">
                      {isZombie 
                        ? "They come from all sides. Type to survive."
                        : "One mistake = One Life lost. Be accurate!"
                      }
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm max-w-lg mx-auto">
                      <div className="bg-stone-800 p-3 rounded-xl border border-stone-700">
                          <div className={PRIMARY_COLOR + " font-bold"}>Mistakes</div>
                          <div className="text-stone-500">{isZombie ? 'Penalty' : 'FATAL (-1 Life)'}</div>
                      </div>
                      <div className="bg-stone-800 p-3 rounded-xl border border-stone-700">
                          <div className="text-orange-500 font-bold">Waves</div>
                          <div className="text-stone-500">Heal on Complete</div>
                      </div>
                      <div className="bg-stone-800 p-3 rounded-xl border border-stone-700">
                          <div className="text-purple-500 font-bold">Strategy</div>
                          <div className="text-stone-500">{isZombie ? 'Prioritize Range' : 'Accuracy First'}</div>
                      </div>
                  </div>

                  <button 
                    onClick={startGame}
                    className={`px-8 py-4 ${isZombie ? 'bg-red-600 hover:bg-red-500' : 'bg-frog-green hover:bg-green-500'} text-white font-black text-xl rounded-full transition-transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto`}
                  >
                      <Play className="w-6 h-6 fill-current" /> START WAVE 1
                  </button>
                  <button onClick={onExit} className="text-stone-500 hover:text-white text-sm underline decoration-stone-600 underline-offset-4">
                      Return to Menu
                  </button>
              </div>
          </div>
      );
  }

  if (gameState === 'GAMEOVER') {
      return (
          <div className="w-full max-w-4xl mx-auto h-[500px] bg-stone-900 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center text-white border-4 border-red-900 shadow-2xl">
              <div className="z-10 text-center space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="text-red-600 font-black text-6xl tracking-widest mb-2">OVERRUN</div>
                  <div className="text-2xl font-mono mb-4">
                      Reached Wave <span className="text-white font-bold">{wave}</span>
                  </div>
                  <div className="text-3xl font-mono font-black">
                      Final Score: <span className={PRIMARY_COLOR}>{score}</span>
                  </div>
                  <div className="flex gap-4 justify-center mt-8">
                      <button 
                        onClick={() => handleAction('EXIT')}
                        className={`px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors`}
                      >
                          <LogOut className="w-5 h-5" /> Save & Exit
                      </button>
                      <button 
                        onClick={() => handleAction('RETRY')}
                        className="px-6 py-3 bg-stone-100 hover:bg-white text-stone-900 font-bold rounded-xl flex items-center gap-2 transition-transform hover:scale-105"
                      >
                          <RotateCcw className="w-5 h-5" /> Retry
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div id="survival-container" className={`w-full max-w-4xl mx-auto h-[500px] rounded-3xl relative overflow-hidden border-4 shadow-inner cursor-crosshair select-none ${BG_CLASS} ${BORDER_CLASS}`}>
        {/* Background Elements */}
        <div className={`absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${isZombie ? 'from-red-900 via-stone-950 to-black' : 'from-frog-green via-stone-900 to-stone-950'}`}></div>
        <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>

        {/* HUD */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-30">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <div className="bg-stone-800/80 backdrop-blur-sm border border-stone-700 px-4 py-2 rounded-xl flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="font-mono text-xl font-bold text-white">{score}</span>
                    </div>
                    <div className="bg-stone-800/80 backdrop-blur-sm border border-stone-700 px-4 py-2 rounded-xl flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Wave</span>
                        <span className={`font-mono text-xl font-bold ${PRIMARY_COLOR}`}>{wave}</span>
                    </div>
                </div>
                
                {/* Wave Progress */}
                <div className="w-32 h-2 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
                    <div 
                        className={`h-full transition-all duration-300 ${isZombie ? 'bg-red-600' : 'bg-frog-green'}`}
                        style={{ width: `${(waveProgress / waveTarget) * 100}%` }}
                    ></div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 bg-stone-800/80 backdrop-blur-sm border border-stone-700 px-3 py-1.5 rounded-full">
                {Array.from({length: 5}).map((_, i) => (
                    <Heart 
                        key={i} 
                        className={`w-5 h-5 transition-all duration-300 ${i < lives ? 'fill-red-500 text-red-500 scale-100' : 'text-stone-700 scale-75 opacity-50'}`} 
                    />
                ))}
            </div>

            <button onClick={onExit} className="p-2 bg-stone-800/50 hover:bg-red-900/50 rounded-full text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Wave Notification Overlay */}
        {waveNotification && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
                <h3 className={`text-6xl font-black tracking-tighter ${PRIMARY_COLOR} drop-shadow-2xl`}>
                    {waveNotification}
                </h3>
                <div className="text-white font-bold mt-2 flex items-center gap-2">
                    <ShieldPlus className="w-5 h-5 text-green-400" /> Lives Restored
                </div>
            </div>
        )}

        {/* Player */}
        <div 
            className={`absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-500 ease-out flex flex-col items-center
                ${isZombie ? 'left-1/2 -translate-x-1/2' : 'left-8'}
            `}
        >
             <div className={`text-6xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transform ${isZombie ? '' : '-scale-x-100'}`}>
                 {isZombie ? '🏰' : '🐸'}
             </div>
             {isZombie && <div className="w-20 h-2 bg-black/50 rounded-full blur-sm mt-2"></div>}
        </div>

        {/* Danger Zone Lines */}
        {isZombie ? (
            // Zombie: Danger Zone in Middle (Implicit)
            <div className="absolute left-1/2 top-0 bottom-0 w-20 -translate-x-1/2 bg-red-500/5 border-x border-red-500/10 z-0"></div>
        ) : (
            // Swamp: Danger Zone on Left
            <div className="absolute left-[10%] top-0 bottom-0 w-1 bg-red-500/10 border-r border-red-500/10 z-0"></div>
        )}

        {/* Projectiles (Spitter Acid) */}
        {projectiles.map(p => (
            <div 
                key={p.id}
                className="absolute w-3 h-3 bg-lime-400 rounded-full shadow-[0_0_10px_rgba(163,230,53,0.8)] z-30 animate-pulse"
                style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`
                }}
            />
        ))}

        {/* Enemies */}
        {enemies.map(renderEnemy)}
        
    </div>
  );
};

export default SurvivalGame;