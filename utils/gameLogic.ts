
import { Level, ReadAheadLevel } from '../types';

export const LEVELS: Level[] = [
  // 1. Egg (Stone/Grey) - Tutorial Phase
  { name: 'Egg III', tier: 'Egg', minXP: 0, color: 'stone', shade: '700', requiredWpm: 0 }, 
  { name: 'Egg II', tier: 'Egg', minXP: 10, color: 'stone', shade: '600', requiredWpm: 10 },
  { name: 'Egg I', tier: 'Egg', minXP: 25, color: 'stone', shade: '500', requiredWpm: 15 },

  // 2. Tadpole (Lime/Green) - Beginner
  { name: 'Tadpole III', tier: 'Tadpole', minXP: 50, color: 'lime', shade: '700', requiredWpm: 20 },
  { name: 'Tadpole II', tier: 'Tadpole', minXP: 80, color: 'lime', shade: '600', requiredWpm: 25 },
  { name: 'Tadpole I', tier: 'Tadpole', minXP: 120, color: 'lime', shade: '500', requiredWpm: 30 },

  // 3. Polliwog (Emerald/Teal) - Intermediate
  { name: 'Polliwog III', tier: 'Polliwog', minXP: 170, color: 'emerald', shade: '700', requiredWpm: 35 },
  { name: 'Polliwog II', tier: 'Polliwog', minXP: 230, color: 'emerald', shade: '600', requiredWpm: 40 },
  { name: 'Polliwog I', tier: 'Polliwog', minXP: 300, color: 'emerald', shade: '500', requiredWpm: 45 },

  // 4. Froglet (Cyan/Sky) - Advanced
  { name: 'Froglet III', tier: 'Froglet', minXP: 380, color: 'cyan', shade: '700', requiredWpm: 50 },
  { name: 'Froglet II', tier: 'Froglet', minXP: 470, color: 'cyan', shade: '600', requiredWpm: 55 },
  { name: 'Froglet I', tier: 'Froglet', minXP: 570, color: 'cyan', shade: '500', requiredWpm: 60 },

  // 5. Hopper (Blue) - Pro
  { name: 'Hopper III', tier: 'Hopper', minXP: 680, color: 'blue', shade: '700', requiredWpm: 65 },
  { name: 'Hopper II', tier: 'Hopper', minXP: 800, color: 'blue', shade: '600', requiredWpm: 70 },
  { name: 'Hopper I', tier: 'Hopper', minXP: 900, color: 'blue', shade: '500', requiredWpm: 75 },

  // 6. Tree Frog (Violet/Purple) - Elite
  { name: 'Tree Frog', tier: 'Tree Frog', minXP: 950, color: 'violet', shade: '600', requiredWpm: 85 },

  // 7. Bullfrog (Orange) - Legendary
  { name: 'Bullfrog', tier: 'Bullfrog', minXP: 980, color: 'orange', shade: '500', requiredWpm: 95 },

  // 8. Frog Sage (Red) - Mythic (Capstone)
  { name: 'Frog Sage', tier: 'Frog Sage', minXP: 1000, color: 'red', shade: '600', requiredWpm: 100 }, 
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
  // New granular formula for 1-1000 scale
  // Approx 1-5 base XP per quote
  const base = (wpm + (length / 5)) / 40;
  let xp = Math.max(1, Math.floor(base));

  if (streak > 2) {
    xp += 1;
  }
  
  if (streak > 10) {
    xp += 1;
  }

  if (isPerfect) {
    xp = Math.ceil(xp * 1.5);
  }

  // Cap per single quote at 15 XP to prevent huge jumps in a 1000 XP world
  return Math.min(xp, 15);
};

export const getAverageWPM = (history: number[]): number => {
  if (history.length === 0) return 0;
  const sum = history.reduce((a, b) => a + b, 0);
  return Math.round(sum / history.length);
};

export const checkLevelProgress = (xp: number, avgWpm: number, mistakeCount: number, remediationCount: number = 0) => {
  const currentLevel = getCurrentLevel(xp);
  const nextLevel = getNextLevel(currentLevel);
  
  return { 
    currentLevel, 
    nextLevel, 
    isGated: false, 
    reason: null as 'SPEED' | 'MASTERY' | 'REMEDIATION' | null, 
    requirement: null as string | null 
  };
};
