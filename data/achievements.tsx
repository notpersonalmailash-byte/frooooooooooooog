import React from 'react';
import { Achievement } from '../types';
import { Zap, Flame, Award, Hash, Crosshair, Skull, Crown, Footprints, Wind, CheckCircle2, Turtle, Rabbit, Rocket, Brain, Eraser, Star, Keyboard, Target, Clock, Trophy } from 'lucide-react';

export const ACHIEVEMENTS: Achievement[] = [
  // VOLUME (15 Achievements)
  { id: 'FIRST_HOP', title: 'First Hop', description: 'Complete your first quote.', icon: <Footprints className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes }) => totalQuotes >= 1 },
  { id: 'WARM_UP', title: 'Warm Up', description: 'Complete 5 quotes.', icon: <Footprints className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes }) => totalQuotes >= 5 },
  { id: 'GETTING_SERIOUS', title: 'Getting Serious', description: 'Complete 25 quotes.', icon: <Hash className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes }) => totalQuotes >= 25 },
  { id: 'POND_DWELLER', title: 'Pond Dweller', description: 'Complete 50 quotes.', icon: <Hash className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes }) => totalQuotes >= 50 },
  { id: 'CENTURION', title: 'Centurion', description: 'Complete 100 quotes.', icon: <Award className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes }) => totalQuotes >= 100 },
  { id: 'FROG_MARATHON', title: 'Frog Marathon', description: 'Complete 250 quotes.', icon: <Award className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes }) => totalQuotes >= 250 },
  { id: 'LIBRARY', title: 'The Library', description: 'Complete 500 quotes.', icon: <Brain className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes }) => totalQuotes >= 500 },
  { id: 'ARCHIVE', title: 'The Archive', description: 'Complete 1000 quotes.', icon: <Crown className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes }) => totalQuotes >= 1000 },
  { id: 'LEGACY', title: 'The Legacy', description: 'Complete 2000 quotes.', icon: <Trophy className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes }) => totalQuotes >= 2000 },
  { id: 'MYTH', title: 'The Myth', description: 'Complete 5000 quotes.', icon: <Trophy className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes }) => totalQuotes >= 5000 },

  { id: 'FIXER_UPPER', title: 'Fixer Upper', description: 'Complete 1 quote in XWords Mode.', icon: <Eraser className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes, mode }) => mode === 'XWORDS' && totalQuotes >= 1 },
  { id: 'EDITOR', title: 'The Editor', description: 'Complete 10 quotes in XWords Mode.', icon: <Eraser className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes, mode }) => mode === 'XWORDS' && totalQuotes >= 10 },
  { id: 'PROOFREADER', title: 'Proofreader', description: 'Complete 50 quotes in XWords Mode.', icon: <Eraser className="w-5 h-5 text-stone-900" />, category: 'VOLUME', condition: ({ totalQuotes, mode }) => mode === 'XWORDS' && totalQuotes >= 50 },
  
  // PRACTICE MODE (10 Achievements)
  { id: 'STUDENT', title: 'Student', description: 'Complete your first Practice session.', icon: <Keyboard className="w-5 h-5 text-stone-900" />, category: 'PRACTICE', condition: ({ mode, totalQuotes }) => mode === 'PRACTICE' && totalQuotes >= 1 },
  { id: 'ALPHABET_SOUP', title: 'Alphabet Soup', description: 'Reach Practice Level 2 (Unlock 7 letters).', icon: <Keyboard className="w-5 h-5 text-stone-900" />, category: 'PRACTICE', condition: ({ practiceLevel }) => practiceLevel >= 2 },
  { id: 'HOME_ROW', title: 'Home Row Hero', description: 'Reach Practice Level 4.', icon: <Keyboard className="w-5 h-5 text-stone-900" />, category: 'PRACTICE', condition: ({ practiceLevel }) => practiceLevel >= 4 },
  { id: 'EXPANDING', title: 'Expanding', description: 'Reach Practice Level 8.', icon: <Keyboard className="w-5 h-5 text-stone-900" />, category: 'PRACTICE', condition: ({ practiceLevel }) => practiceLevel >= 8 },
  { id: 'HALFWAY', title: 'Halfway There', description: 'Reach Practice Level 12.', icon: <Keyboard className="w-5 h-5 text-stone-900" />, category: 'PRACTICE', condition: ({ practiceLevel }) => practiceLevel >= 12 },
  { id: 'ADVANCED_TYPIST', title: 'Advanced Typist', description: 'Reach Practice Level 15.', icon: <Keyboard className="w-5 h-5 text-stone-900" />, category: 'PRACTICE', condition: ({ practiceLevel }) => practiceLevel >= 15 },
  { id: 'FULL_KEYBOARD', title: 'Full Keyboard', description: 'Unlock all practice letters (Level 18).', icon: <Keyboard className="w-5 h-5 text-stone-900" />, category: 'PRACTICE', condition: ({ practiceLevel }) => practiceLevel >= 18 },
  { id: 'PRACTICE_MAKES_PERFECT', title: 'Practice Makes Perfect', description: 'Complete 50 Practice sessions.', icon: <Target className="w-5 h-5 text-stone-900" />, category: 'PRACTICE', condition: ({ mode, totalQuotes }) => mode === 'PRACTICE' && totalQuotes >= 50 },
  
  // SPEED (15 Achievements)
  { id: 'TINY_HOP', title: 'Tiny Hop', description: 'Reach 10 WPM.', icon: <Turtle className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 10 },
  { id: 'CASUAL_STROLL', title: 'Casual Stroll', description: 'Reach 20 WPM.', icon: <Turtle className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 20 },
  { id: 'PICKING_UP', title: 'Picking Up', description: 'Reach 30 WPM.', icon: <Wind className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 30 },
  { id: 'QUICK_CROAK', title: 'Quick Croak', description: 'Reach 40 WPM.', icon: <Wind className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 40 },
  { id: 'CRUISING', title: 'Cruising', description: 'Reach 50 WPM.', icon: <Rabbit className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 50 },
  { id: 'SPRINTER', title: 'Sprinter', description: 'Reach 60 WPM.', icon: <Rabbit className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 60 },
  { id: 'RAPID_FIRE', title: 'Rapid Fire', description: 'Reach 70 WPM.', icon: <Zap className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 70 },
  { id: 'SPEED_DEMON', title: 'Speed Demon', description: 'Reach 80 WPM.', icon: <Zap className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 80 },
  { id: 'FLASH', title: 'The Flash', description: 'Reach 90 WPM.', icon: <Rocket className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 90 },
  { id: 'HYPER_JUMP', title: 'Hyper Jump', description: 'Reach 100 WPM.', icon: <Rocket className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 100 },
  { id: 'SOUND_BARRIER', title: 'Sound Barrier', description: 'Reach 120 WPM.', icon: <Rocket className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 120 },
  { id: 'WARP_SPEED', title: 'Warp Speed', description: 'Reach 140 WPM.', icon: <Star className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 140 },
  { id: 'LUDICROUS', title: 'Ludicrous Speed', description: 'Reach 160 WPM.', icon: <Star className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 160 },
  { id: 'LIGHT_SPEED', title: 'Light Speed', description: 'Reach 180 WPM.', icon: <Star className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 180 },
  { id: 'SINGULARITY', title: 'The Singularity', description: 'Reach 200 WPM.', icon: <Star className="w-5 h-5 text-stone-900" />, category: 'SPEED', condition: ({ wpm }) => wpm >= 200 },

  // STREAK (10 Achievements)
  { id: 'DOUBLE_TROUBLE', title: 'Double Trouble', description: 'Reach a streak of 2.', icon: <Flame className="w-5 h-5 text-stone-900" />, category: 'STREAK', condition: ({ currentStreak }) => currentStreak >= 2 },
  { id: 'HIGH_FIVE', title: 'High Five', description: 'Reach a streak of 5.', icon: <Flame className="w-5 h-5 text-stone-900" />, category: 'STREAK', condition: ({ currentStreak }) => currentStreak >= 5 },
  { id: 'ON_FIRE', title: 'On Fire', description: 'Reach a streak of 10.', icon: <Flame className="w-5 h-5 text-stone-900" />, category: 'STREAK', condition: ({ currentStreak }) => currentStreak >= 10 },
  { id: 'IN_THE_ZONE', title: 'In The Zone', description: 'Reach a streak of 20.', icon: <Flame className="w-5 h-5 text-stone-900" />, category: 'STREAK', condition: ({ currentStreak }) => currentStreak >= 20 },
  { id: 'MOMENTUM', title: 'Momentum', description: 'Reach a streak of 30.', icon: <Flame className="w-5 h-5 text-stone-900" />, category: 'STREAK', condition: ({ currentStreak }) => currentStreak >= 30 },
  { id: 'UNSTOPPABLE', title: 'Unstoppable', description: 'Reach a streak of 50.', icon: <Flame className="w-5 h-5 text-stone-900" />, category: 'STREAK', condition: ({ currentStreak }) => currentStreak >= 50 },
  { id: 'ZEN_MASTER', title: 'Zen Master', description: 'Reach a streak of 100.', icon: <CheckCircle2 className="w-5 h-5 text-stone-900" />, category: 'STREAK', condition: ({ currentStreak }) => currentStreak >= 100 },
  { id: 'FLOW_STATE', title: 'Flow State', description: 'Reach a streak of 150.', icon: <CheckCircle2 className="w-5 h-5 text-stone-900" />, category: 'STREAK', condition: ({ currentStreak }) => currentStreak >= 150 },
  { id: 'NIRVANA', title: 'Nirvana', description: 'Reach a streak of 200.', icon: <CheckCircle2 className="w-5 h-5 text-stone-900" />, category: 'STREAK', condition: ({ currentStreak }) => currentStreak >= 200 },

  // MASTERY (8 Achievements)
  { id: 'HARDCORE_ROOKIE', title: 'Hardcore Rookie', description: 'Complete 1 quote in Hardcore Mode.', icon: <Skull className="w-5 h-5 text-stone-900" />, category: 'MASTERY', condition: ({ mode, totalQuotes }) => mode === 'HARDCORE' && totalQuotes >= 1 },
  { id: 'HARDCORE_SURVIVOR', title: 'Hardcore Survivor', description: 'Complete 10 quotes in Hardcore Mode.', icon: <Skull className="w-5 h-5 text-stone-900" />, category: 'MASTERY', condition: ({ mode, totalQuotes }) => mode === 'HARDCORE' && totalQuotes >= 10 },
  { id: 'HARDCORE_VET', title: 'Hardcore Veteran', description: 'Complete 25 quotes in Hardcore Mode.', icon: <Skull className="w-5 h-5 text-stone-900" />, category: 'MASTERY', condition: ({ mode, totalQuotes }) => mode === 'HARDCORE' && totalQuotes >= 25 },
  { id: 'HARDCORE_LEGEND', title: 'Hardcore Legend', description: 'Complete 50 quotes in Hardcore Mode.', icon: <Crown className="w-5 h-5 text-stone-900" />, category: 'MASTERY', condition: ({ mode, totalQuotes }) => mode === 'HARDCORE' && totalQuotes >= 50 },
  { id: 'HARDCORE_GOD', title: 'Hardcore God', description: 'Complete 100 quotes in Hardcore Mode.', icon: <Crown className="w-5 h-5 text-stone-900" />, category: 'MASTERY', condition: ({ mode, totalQuotes }) => mode === 'HARDCORE' && totalQuotes >= 100 },
  { id: 'PERFECTIONIST', title: 'Perfectionist', description: 'Complete a quote with 100+ WPM in Hardcore Mode.', icon: <Crosshair className="w-5 h-5 text-stone-900" />, category: 'MASTERY', condition: ({ wpm, mode }) => wpm >= 100 && mode === 'HARDCORE' },
  { id: 'ABSOLUTE_UNIT', title: 'Absolute Unit', description: 'Complete a quote with 120+ WPM in Hardcore Mode.', icon: <Crosshair className="w-5 h-5 text-stone-900" />, category: 'MASTERY', condition: ({ wpm, mode }) => wpm >= 120 && mode === 'HARDCORE' },
];