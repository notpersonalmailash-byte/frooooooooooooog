import React from 'react';
import { Achievement } from '../types';
import { Zap, Flame, Award, Hash, Crosshair, Skull, Crown, Footprints, Wind, CheckCircle2, Turtle, Rabbit, Rocket, Brain, Eraser, Star, Keyboard, Target, Clock, Trophy, FileText, Calendar, Hourglass, Gamepad2, Shield } from 'lucide-react';

export const ACHIEVEMENTS: Achievement[] = [
  // --- VOLUME (The Journey) ---
  // Spaced out significantly. Removed 5, 25.
  { id: 'FIRST_HOP', title: 'First Hop', description: 'Complete your first quote.', icon: <Footprints className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes }) => totalQuotes >= 1 },
  { id: 'POND_DWELLER', title: 'Pond Dweller', description: 'Complete 50 quotes.', icon: <Hash className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes }) => totalQuotes >= 50 },
  { id: 'CENTURION', title: 'Centurion', description: 'Complete 100 quotes.', icon: <Award className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes }) => totalQuotes >= 100 },
  { id: 'SCHOLAR', title: 'The Scholar', description: 'Complete 500 quotes.', icon: <Brain className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes }) => totalQuotes >= 500 },
  { id: 'CURATOR', title: 'The Curator', description: 'Complete 1,000 quotes.', icon: <Crown className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes }) => totalQuotes >= 1000 },
  { id: 'MYTH', title: 'The Myth', description: 'Complete 5,000 quotes.', icon: <Trophy className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes }) => totalQuotes >= 5000 },

  // --- SPEED (The Sprint) ---
  // Removed 10, 20, 40, 70, 80. Larger gaps between tiers.
  { id: 'MOMENTUM', title: 'Momentum', description: 'Reach 30 WPM.', icon: <Wind className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 30 },
  { id: 'SPRINTER', title: 'Sprinter', description: 'Reach 60 WPM.', icon: <Rabbit className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 60 },
  { id: 'VELOCITY', title: 'Velocity', description: 'Reach 90 WPM.', icon: <Rocket className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 90 },
  { id: 'SUPERSONIC', title: 'Supersonic', description: 'Reach 120 WPM.', icon: <Zap className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 120 },
  { id: 'LIGHT_SPEED', title: 'Light Speed', description: 'Reach 150 WPM.', icon: <Star className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 150 },
  { id: 'SINGULARITY', title: 'The Singularity', description: 'Reach 200 WPM.', icon: <Star className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 200 },

  // --- CONSISTENCY (Daily Streaks) ---
  // New Category
  { id: 'WEEKENDER', title: 'Weekender', description: 'Maintain a 3-day daily streak.', icon: <Calendar className="w-5 h-5 text-stone-900" />, category: 'CONSISTENCY', condition: ({ dailyStreak }) => dailyStreak >= 3 },
  { id: 'COMMITTED', title: 'Committed', description: 'Maintain a 7-day daily streak.', icon: <Calendar className="w-5 h-5 text-stone-900" />, category: 'CONSISTENCY', condition: ({ dailyStreak }) => dailyStreak >= 7 },
  { id: 'HABITUAL', title: 'Habitual', description: 'Maintain a 14-day daily streak.', icon: <Flame className="w-5 h-5 text-stone-900" />, category: 'CONSISTENCY', condition: ({ dailyStreak }) => dailyStreak >= 14 },
  { id: 'DISCIPLINED', title: 'Disciplined', description: 'Maintain a 30-day daily streak.', icon: <Trophy className="w-5 h-5 text-stone-900" />, category: 'CONSISTENCY', condition: ({ dailyStreak }) => dailyStreak >= 30 },

  // --- TIME INVESTMENT ---
  // New Category
  { id: 'NOVICE_TIME', title: 'Initiate', description: 'Play for 1 hour total.', icon: <Clock className="w-5 h-5 text-stone-900" />, category: 'TIME', condition: ({ totalTime }) => totalTime >= 3600 },
  { id: 'DEDICATED_TIME', title: 'Dedicated', description: 'Play for 10 hours total.', icon: <Clock className="w-5 h-5 text-stone-900" />, category: 'TIME', condition: ({ totalTime }) => totalTime >= 36000 },
  { id: 'TIME_KEEPER', title: 'Time Keeper', description: 'Play for 24 hours total.', icon: <Hourglass className="w-5 h-5 text-stone-900" />, category: 'TIME', condition: ({ totalTime }) => totalTime >= 86400 },

  // --- STREAK (Session Flow) ---
  // Harder to get. Removed 2, 5, 10.
  { id: 'IN_THE_ZONE', title: 'In The Zone', description: 'Reach a session streak of 20.', icon: <Flame className="w-5 h-5 text-stone-900" />, category: 'STREAK', condition: ({ currentStreak }) => currentStreak >= 20 },
  { id: 'UNSTOPPABLE', title: 'Unstoppable', description: 'Reach a session streak of 50.', icon: <Flame className="w-5 h-5 text-stone-900" />, category: 'STREAK', condition: ({ currentStreak }) => currentStreak >= 50 },
  { id: 'FOCUS_MASTER', title: 'Focus Master', description: 'Reach a session streak of 100.', icon: <CheckCircle2 className="w-5 h-5 text-stone-900" />, category: 'STREAK', condition: ({ currentStreak }) => currentStreak >= 100 },

  // --- WORDS MODE ---
  { id: 'ALPHABET_SOUP', title: 'Alphabet Soup', description: 'Complete 10 Words Mode sessions.', icon: <FileText className="w-5 h-5 text-stone-900" />, category: 'PRACTICE', condition: ({ mode, totalQuotes }) => mode === 'PRACTICE' && totalQuotes >= 10 },
  { id: 'EXPANDING', title: 'Vocabulary Expansion', description: 'Complete 50 Words Mode sessions.', icon: <FileText className="w-5 h-5 text-stone-900" />, category: 'PRACTICE', condition: ({ mode, totalQuotes }) => mode === 'PRACTICE' && totalQuotes >= 50 },
  { id: 'FULL_KEYBOARD', title: 'The Lexicographer', description: 'Complete 250 Words Mode sessions.', icon: <FileText className="w-5 h-5 text-stone-900" />, category: 'PRACTICE', condition: ({ mode, totalQuotes }) => mode === 'PRACTICE' && totalQuotes >= 250 },
  
  // --- MASTERY (Hardcore) ---
  { id: 'HARDCORE_SURVIVOR', title: 'Survivor', description: 'Complete 10 quotes in Hardcore Mode.', icon: <Skull className="w-5 h-5 text-stone-900" />, category: 'MASTERY', condition: ({ mode, totalQuotes }) => mode === 'HARDCORE' && totalQuotes >= 10 },
  { id: 'HARDCORE_LEGEND', title: 'Legend', description: 'Complete 50 quotes in Hardcore Mode.', icon: <Crown className="w-5 h-5 text-stone-900" />, category: 'MASTERY', condition: ({ mode, totalQuotes }) => mode === 'HARDCORE' && totalQuotes >= 50 },
  { id: 'HARDCORE_TITAN', title: 'Hardcore Titan', description: 'Complete 100 quotes in Hardcore Mode.', icon: <Shield className="w-5 h-5 text-stone-900" />, category: 'MASTERY', condition: ({ mode, totalQuotes }) => mode === 'HARDCORE' && totalQuotes >= 100 },
  { id: 'ABSOLUTE_UNIT', title: 'Daredevil', description: 'Complete a quote with 120+ WPM in Hardcore Mode.', icon: <Crosshair className="w-5 h-5 text-stone-900" />, category: 'MASTERY', condition: ({ wpm, mode }) => wpm >= 120 && mode === 'HARDCORE' },

  // --- ARCADE (New) ---
  { id: 'SURVIVAL_NOVICE', title: 'Defender', description: 'Score 500 in any Survival mode.', icon: <Gamepad2 className="w-5 h-5 text-stone-900" />, category: 'ARCADE', condition: ({ arcadeScore }) => (arcadeScore || 0) >= 500 },
  { id: 'SURVIVAL_EXPERT', title: 'Last Stand', description: 'Score 2000 in any Survival mode.', icon: <Gamepad2 className="w-5 h-5 text-stone-900" />, category: 'ARCADE', condition: ({ arcadeScore }) => (arcadeScore || 0) >= 2000 },
  { id: 'WAVE_MASTER', title: 'Wave Master', description: 'Reach Wave 10 in Cosmic Defense.', icon: <Rocket className="w-5 h-5 text-stone-900" />, category: 'ARCADE', condition: ({ arcadeWave }) => (arcadeWave || 0) >= 10 },
];
