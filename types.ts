
import React from 'react';

export interface Quote {
  text: string;
  source: string;
  author: string;
}

export interface Level {
  name: string;
  tier: string; // The major rank group (e.g. 'Egg', 'Tadpole')
  minXP: number;
  color: string;
  shade: string;
  requiredWpm: number;
}

export interface GameState {
  xp: number;
  completedQuotes: number;
}

export interface TestResult {
  id: number;
  date: string;
  wpm: number;
  xpEarned: number;
  mode: GameMode;
  quoteText: string;      
  mistakes: string[];     
  retryCount: number;     
}

export type MusicSource = 'NONE' | 'YOUTUBE' | 'SPOTIFY' | 'GENERATED' | 'SUNO';

export interface MusicConfig {
  source: MusicSource;
  presetId: string;
}

export type MechanicalSoundPreset = 'THOCK' | 'CLICKY' | 'BUBBLE' | 'TYPEWRITER';

export type ReadAheadLevel = 'NONE' | 'FOCUS' | 'ULTRA' | 'BLIND';

export type TTSMode = 'OFF' | 'QUOTE' | 'WORD' | 'FLOW' | 'NEXT' | 'SCOUT';

export interface Settings {
  ghostEnabled: boolean;
  readAheadLevel: ReadAheadLevel; 
  sfxEnabled: boolean;
  mechanicalSoundEnabled: boolean; 
  mechanicalSoundPreset: MechanicalSoundPreset; 
  ambientVolume: number; 
  musicConfig: MusicConfig;
  themeId: string; 
  autoStartMusic: boolean; 
  ttsMode: TTSMode; 
}

export type GameMode = 'QUOTES' | 'HARDCORE' | 'XWORDS' | 'XQUOTES' | 'PRACTICE' | 'MINIGAMES' | 'BLITZ' | 'DRILL';

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  COMPLETED = 'COMPLETED', 
  FAILED = 'FAILED', 
  DRILLING = 'DRILLING'
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  minTier: string; 
  colors: {
    frog: Record<number, string>; 
    stone: Record<number, string>; 
    background: string;
  };
}

export interface AchievementStats {
  wpm: number;
  totalQuotes: number;
  maxStreak: number; 
  currentStreak: number;
  dailyStreak: number;
  mode: GameMode;
  totalTime: number; 
  arcadeScore?: number;
  arcadeWave?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'SPEED' | 'STREAK' | 'VOLUME' | 'MASTERY' | 'HIDDEN' | 'PRACTICE' | 'TIME' | 'CONSISTENCY' | 'ARCADE';
  condition: (stats: AchievementStats) => boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'ACHIEVEMENT' | 'UNLOCK' | 'INFO';
}

export interface PracticeWord {
  word: string;
  proficiency: number; // 0 to 3 (3 = Mastered)
  lastPracticed: number;
}

export interface WeakWord {
  word: string;
  mistakeCount: number;
  lastMistake: number;
}

export interface WordPerformance {
  word: string;
  wpm: number;
  isCorrect: boolean;
}
