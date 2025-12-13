import { Level, ReadAheadLevel } from '../types';

export const LEVELS: Level[] = [
  // 1. Egg (Stone/Grey) - Tutorial Phase
  // Focus: Basic familiarity. Short quotes.
  { name: 'Egg III', tier: 'Egg', minXP: 0, color: 'stone', shade: '700', requiredWpm: 0 }, 
  { name: 'Egg II', tier: 'Egg', minXP: 500, color: 'stone', shade: '600', requiredWpm: 10 },
  { name: 'Egg I', tier: 'Egg', minXP: 1200, color: 'stone', shade: '500', requiredWpm: 15 },

  // 2. Tadpole (Lime/Green) - Beginner
  // Focus: Rhythm. Slightly longer sentences.
  { name: 'Tadpole III', tier: 'Tadpole', minXP: 2000, color: 'lime', shade: '700', requiredWpm: 20 },
  { name: 'Tadpole II', tier: 'Tadpole', minXP: 3200, color: 'lime', shade: '600', requiredWpm: 25 },
  { name: 'Tadpole I', tier: 'Tadpole', minXP: 4800, color: 'lime', shade: '500', requiredWpm: 30 },

  // 3. Polliwog (Emerald/Teal) - Intermediate
  // Focus: Punctuation introduction.
  { name: 'Polliwog III', tier: 'Polliwog', minXP: 6500, color: 'emerald', shade: '700', requiredWpm: 35 },
  { name: 'Polliwog II', tier: 'Polliwog', minXP: 8500, color: 'emerald', shade: '600', requiredWpm: 40 },
  { name: 'Polliwog I', tier: 'Polliwog', minXP: 11000, color: 'emerald', shade: '500', requiredWpm: 45 },

  // 4. Froglet (Cyan/Sky) - Advanced
  // Focus: Speed and consistency.
  { name: 'Froglet III', tier: 'Froglet', minXP: 14000, color: 'cyan', shade: '700', requiredWpm: 50 },
  { name: 'Froglet II', tier: 'Froglet', minXP: 17500, color: 'cyan', shade: '600', requiredWpm: 55 },
  { name: 'Froglet I', tier: 'Froglet', minXP: 21500, color: 'cyan', shade: '500', requiredWpm: 60 },

  // 5. Hopper (Blue) - Pro
  // Focus: Complex words.
  { name: 'Hopper III', tier: 'Hopper', minXP: 26000, color: 'blue', shade: '700', requiredWpm: 65 },
  { name: 'Hopper II', tier: 'Hopper', minXP: 31000, color: 'blue', shade: '600', requiredWpm: 70 },
  { name: 'Hopper I', tier: 'Hopper', minXP: 37000, color: 'blue', shade: '500', requiredWpm: 75 },

  // 6. Tree Frog (Violet/Purple) - Elite
  // Focus: Endurance.
  { name: 'Tree Frog III', tier: 'Tree Frog', minXP: 44000, color: 'violet', shade: '700', requiredWpm: 80 },
  { name: 'Tree Frog II', tier: 'Tree Frog', minXP: 52000, color: 'violet', shade: '600', requiredWpm: 85 },
  { name: 'Tree Frog I', tier: 'Tree Frog', minXP: 61000, color: 'violet', shade: '500', requiredWpm: 90 },

  // 7. Bullfrog (Orange) - Legendary
  // Focus: Mastery of all aspects.
  { name: 'Bullfrog', tier: 'Bullfrog', minXP: 75000, color: 'orange', shade: '500', requiredWpm: 95 },

  // 8. Frog Sage (Red) - Mythic (Capstone)
  // Focus: Perfection.
  { name: 'Frog Sage', tier: 'Frog Sage', minXP: 100000, color: 'red', shade: '600', requiredWpm: 100 }, 
];

export const getCurrentLevel = (xp: number): Level => {
  // Find the highest level where xp >= minXP
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
  return null; // Max level reached
};

export const calculateXP = (wpm: number, length: number, streak: number = 0, isPerfect: boolean = false, readAheadLevel: ReadAheadLevel = 'NONE'): number => {
  // Formula: XP = MAX(10, FLOOR((WPM * Letters) / 10))
  // Divided by 10 to decrease progression speed significantly per user request
  const base = (wpm * length) / 10;
  let xp = Math.max(10, Math.floor(base));

  // Streak Bonus (1.05^streak)
  if (streak > 0) {
    xp = Math.floor(xp * Math.pow(1.05, streak));
  }

  // Perfect Bonus (1.5x)
  if (isPerfect) {
    xp = Math.floor(xp * 1.5);
  }

  // Read Ahead Bonus
  if (readAheadLevel === 'FOCUS') {
      xp = Math.floor(xp * 1.1); // 10% Bonus
  } else if (readAheadLevel === 'ULTRA') {
      xp = Math.floor(xp * 1.2); // 20% Bonus
  } else if (readAheadLevel === 'BLIND') {
      xp = Math.floor(xp * 1.3); // 30% Bonus
  }

  return xp;
};

export const getAverageWPM = (history: number[]): number => {
  if (history.length === 0) return 0;
  const sum = history.reduce((a, b) => a + b, 0);
  return Math.round(sum / history.length);
};

export const checkLevelProgress = (xp: number, avgWpm: number, mistakeCount: number) => {
  const currentLevel = getCurrentLevel(xp);
  const nextLevel = getNextLevel(currentLevel);
  
  let isGated = false;
  let reason: 'SPEED' | 'MASTERY' | null = null;
  let requirement: string | null = null;

  if (nextLevel) {
    // Check if user is at the threshold of the next level
    // We consider them "at the gate" if they have enough XP or are capped just below it
    const xpThreshold = nextLevel.minXP;
    
    // Determine if we should apply gates. 
    // Gates apply if the user *would* be at the next level but conditions aren't met.
    // However, the XP is capped at minXP - 1 if gated.
    // So we check if they are at or above minXP - 1.
    if (xp >= xpThreshold - 1) {
       // Logic Update: Only gate Egg tier when transitioning to Tadpole (or generally strictly between tiers for Egg)
       const isEggInternal = currentLevel.tier === 'Egg' && nextLevel.tier === 'Egg';
       
       if (!isEggInternal) {
           if (mistakeCount > 0) {
               isGated = true;
               reason = 'MASTERY';
               requirement = `Fix ${mistakeCount} Mistakes`;
           } else if (avgWpm < nextLevel.requiredWpm) {
               isGated = true;
               reason = 'SPEED';
               requirement = `${nextLevel.requiredWpm} Avg WPM`;
           }
       }
    }
  }

  return { currentLevel, nextLevel, isGated, reason, requirement };
};