
import { Level, ReadAheadLevel } from '../types';

export const LEVELS: Level[] = [
  // 1. Egg (Stone/Grey) - Tutorial Phase
  { name: 'Egg III', tier: 'Egg', minXP: 0, color: 'stone', shade: '700', requiredWpm: 0 }, 
  { name: 'Egg II', tier: 'Egg', minXP: 500, color: 'stone', shade: '600', requiredWpm: 10 },
  { name: 'Egg I', tier: 'Egg', minXP: 1200, color: 'stone', shade: '500', requiredWpm: 15 },

  // 2. Tadpole (Lime/Green) - Beginner
  { name: 'Tadpole III', tier: 'Tadpole', minXP: 2000, color: 'lime', shade: '700', requiredWpm: 20 },
  { name: 'Tadpole II', tier: 'Tadpole', minXP: 3200, color: 'lime', shade: '600', requiredWpm: 25 },
  { name: 'Tadpole I', tier: 'Tadpole', minXP: 4800, color: 'lime', shade: '500', requiredWpm: 30 },

  // 3. Polliwog (Emerald/Teal) - Intermediate
  { name: 'Polliwog III', tier: 'Polliwog', minXP: 6500, color: 'emerald', shade: '700', requiredWpm: 35 },
  { name: 'Polliwog II', tier: 'Polliwog', minXP: 8500, color: 'emerald', shade: '600', requiredWpm: 40 },
  { name: 'Polliwog I', tier: 'Polliwog', minXP: 11000, color: 'emerald', shade: '500', requiredWpm: 45 },

  // 4. Froglet (Cyan/Sky) - Advanced
  { name: 'Froglet III', tier: 'Froglet', minXP: 14000, color: 'cyan', shade: '700', requiredWpm: 50 },
  { name: 'Froglet II', tier: 'Froglet', minXP: 17500, color: 'cyan', shade: '600', requiredWpm: 55 },
  { name: 'Froglet I', tier: 'Froglet', minXP: 21500, color: 'cyan', shade: '500', requiredWpm: 60 },

  // 5. Hopper (Blue) - Pro
  { name: 'Hopper III', tier: 'Hopper', minXP: 26000, color: 'blue', shade: '700', requiredWpm: 65 },
  { name: 'Hopper II', tier: 'Hopper', minXP: 31000, color: 'blue', shade: '600', requiredWpm: 70 },
  { name: 'Hopper I', tier: 'Hopper', minXP: 37000, color: 'blue', shade: '500', requiredWpm: 75 },

  // 6. Tree Frog (Violet/Purple) - Elite
  { name: 'Tree Frog III', tier: 'Tree Frog', minXP: 44000, color: 'violet', shade: '700', requiredWpm: 80 },
  { name: 'Tree Frog II', tier: 'Tree Frog', minXP: 52000, color: 'violet', shade: '600', requiredWpm: 85 },
  { name: 'Tree Frog I', tier: 'Tree Frog', minXP: 61000, color: 'violet', shade: '500', requiredWpm: 90 },

  // 7. Bullfrog (Orange) - Legendary
  { name: 'Bullfrog', tier: 'Bullfrog', minXP: 75000, color: 'orange', shade: '500', requiredWpm: 95 },

  // 8. Frog Sage (Red) - Mythic (Capstone)
  { name: 'Frog Sage', tier: 'Frog Sage', minXP: 100000, color: 'red', shade: '600', requiredWpm: 100 }, 
];

export const getCurrentLevel = (xp: number): Level => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
};

export const getNextLevel = (currentLevel: Level): Level | null => {
  const index = LEVELS.indexOf(currentLevel);
  if (index >= 0 && index < LEVELS.length - 1) {
    return LEVELS[index + 1];
  }
  return null;
};

export const calculateXP = (wpm: number, length: number, streak: number = 0, isPerfect: boolean = false, readAheadLevel: ReadAheadLevel = 'NONE'): number => {
  const base = (wpm * length) / 10;
  let xp = Math.max(10, Math.floor(base));

  if (streak > 0) {
    xp = Math.floor(xp * Math.pow(1.05, streak));
  }

  if (isPerfect) {
    xp = Math.floor(xp * 1.5);
  }

  if (readAheadLevel === 'FOCUS') xp = Math.floor(xp * 1.1);
  else if (readAheadLevel === 'ULTRA') xp = Math.floor(xp * 1.2);
  else if (readAheadLevel === 'BLIND') xp = Math.floor(xp * 1.3);

  return xp;
};

export const getAverageWPM = (history: number[]): number => {
  if (history.length === 0) return 0;
  const sum = history.reduce((a, b) => a + b, 0);
  return Math.round(sum / history.length);
};

export const checkLevelProgress = (xp: number, avgWpm: number, mistakeCount: number, remediationCount: number = 0) => {
  const currentLevel = getCurrentLevel(xp);
  const nextLevel = getNextLevel(currentLevel);
  
  // Logic Fix: Removing level gates entirely. Users can evolve as soon as they have enough XP.
  return { 
    currentLevel, 
    nextLevel, 
    isGated: false, 
    reason: null as 'SPEED' | 'MASTERY' | 'REMEDIATION' | null, 
    requirement: null as string | null 
  };
};
