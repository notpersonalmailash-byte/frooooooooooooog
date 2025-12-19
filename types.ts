
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
  quoteText: string;      // New: Store the text typed
  mistakes: string[];     // New: Store specific words missed
  retryCount: number;     // New: Store attempts needed
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
  readAheadLevel: ReadAheadLevel; // Changed from boolean
  sfxEnabled: boolean;
  mechanicalSoundEnabled: boolean; // Toggle for typing sounds
  mechanicalSoundPreset: MechanicalSoundPreset; // Sound profile
  ambientVolume: number; // Volume for GENERATED sources (Brown Noise, Piano, etc.)
  musicConfig: MusicConfig;
  themeId: string; // New: Selected Theme ID
  autoStartMusic: boolean; // Control whether music starts automatically on load
  ttsMode: TTSMode; // Text-to-Speech Mode
}

export type GameMode = 'QUOTES' | 'HARDCORE' | 'XWORDS' | 'XQUOTES' | 'PRACTICE' | 'MINIGAMES' | 'BLITZ';

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  COMPLETED = 'COMPLETED', // Successfully typed with 100% accuracy
  FAILED = 'FAILED', // Typed but mistakes were present at the end
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  minTier: string; // Tier required to unlock (e.g. 'Tadpole')
  colors: {
    frog: Record<number, string>; // 50-900
    stone: Record<number, string>; // 50-900 (Used for neutrals)
    background: string;
  };
}

export interface AchievementStats {
  wpm: number;
  totalQuotes: number;
  maxStreak: number; // Session streak
  currentStreak: number;
  dailyStreak: number;
  mode: GameMode;
  totalTime: number; // Seconds
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

export interface WordPerformance {
  word: string;
  wpm: number;
  isCorrect: boolean;
}
