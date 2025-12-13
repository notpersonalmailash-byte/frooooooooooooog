import { Quote } from '../types';
import { QUOTES } from '../data/quotes';
import { generateQuoteForTier, generatePracticeWords } from './geminiService';

// Helper to sanitize text for standard keyboards
const normalizeText = (text: string): string => {
  return text
    .replace(/[\u2013\u2014]/g, "-")      // Replace em-dash and en-dash with standard hyphen
    .replace(/[\u2018\u2019]/g, "'")      // Replace smart single quotes with straight single quote
    .replace(/[\u201C\u201D]/g, '"')      // Replace smart double quotes with straight double quote
    .replace(/…/g, "...")                 // Replace ellipsis character with three dots
    .trim();
};

// Map tiers to difficulty levels (0-6)
const TIER_DIFFICULTY_MAP: Record<string, number> = {
  'Egg': 0,
  'Tadpole': 1,
  'Polliwog': 2,
  'Froglet': 3,
  'Hopper': 4,
  'Tree Frog': 5,
  'Bullfrog': 6,
  'Frog Sage': 6 // Sage shares the hardest pool
};

// Enhanced difficulty scoring
const getQuoteDifficulty = (text: string): number => {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);
  
  const lengthScore = normalized.length;
  const avgWordLength = words.length > 0 ? lengthScore / words.length : 0;
  const complexityScore = avgWordLength * 8; 
  const punctuationCount = (normalized.match(/[.,;?!'"\-:()]/g) || []).length;
  const technicalScore = punctuationCount * 3;

  return lengthScore + complexityScore + technicalScore;
};

// PERFORMANCE OPTIMIZATION: Pre-calculate and sort once
const SORTED_QUOTES = [...QUOTES].map(q => ({
    ...q,
    difficulty: getQuoteDifficulty(q.quoteText),
    normalizedText: normalizeText(q.quoteText)
})).sort((a, b) => a.difficulty - b.difficulty);

// --- PRACTICE MODE GENERATOR ---
export const PRACTICE_ORDER = "enitrlsauoychgmpbkvwjqxz".split('');

export const getPracticeLetter = (level: number) => {
    const idx = Math.min(6 + level - 1, PRACTICE_ORDER.length - 1);
    return PRACTICE_ORDER[idx].toUpperCase();
}


export const fetchQuotes = async (
    count: number = 3, 
    exclude: string[] = [], 
    tier: string = 'Egg', 
    mode: string = 'QUOTES', 
    practiceLevel: number = 0,
    charStats: Record<string, number> = {}
): Promise<Quote[]> => {
  
  if (mode === 'PRACTICE') {
      const unlockedCount = Math.min(6 + practiceLevel, PRACTICE_ORDER.length);
      const unlockedLetters = PRACTICE_ORDER.slice(0, unlockedCount);
      const newLetter = unlockedLetters[unlockedLetters.length - 1];
      
      // Determine weak letters (highest miss count) that are also currently unlocked
      const weakLetters = Object.entries(charStats)
        .filter(([char]) => unlockedLetters.includes(char.toLowerCase()))
        .sort((a, b) => b[1] - a[1]) // Descending order of misses
        .map(([char]) => char)
        .slice(0, 3); // Top 3 weakest
      
      // Focus letters = The new letter + weak letters
      const focusLetters = Array.from(new Set([...weakLetters, newLetter]));

      try {
          // Fetch Real Words from AI
          const words = await generatePracticeWords(unlockedLetters, focusLetters);
          
          // Create a few quotes from these words
          const quotes: Quote[] = [];
          
          // Generate 'count' number of practice strings
          for(let i=0; i<count; i++) {
             // Shuffle words to create a "sentence"
             const shuffledWords = [...words].sort(() => 0.5 - Math.random());
             const sliceLength = Math.min(10, shuffledWords.length);
             const sentence = shuffledWords.slice(0, sliceLength).join(" ");
             
             quotes.push({
                 text: sentence,
                 source: "Smart Practice",
                 author: `Targeting: ${focusLetters.join(', ').toUpperCase()}`
             });
          }
          return quotes;

      } catch (err) {
          // Fallback to old procedural generation if AI fails
          console.warn("Falling back to procedural practice");
          return [{
             text: "tent net rent tenet letter",
             source: "Offline Practice",
             author: "Fallback"
          }];
      }
  }

  // 1. Determine which bucket of quotes to use based on user Tier
  const bucketCount = 7;
  const bucketSize = Math.ceil(SORTED_QUOTES.length / bucketCount);
  
  let difficultyIndex = TIER_DIFFICULTY_MAP[tier] ?? 0;
  
  // Hardcore mode always uses max difficulty
  if (mode === 'HARDCORE') {
      difficultyIndex = 6; 
  }
  
  const startIndex = difficultyIndex * bucketSize;
  const endIndex = Math.min(startIndex + bucketSize, SORTED_QUOTES.length);
  
  // Get the slice of quotes appropriate for this difficulty
  let tierQuotes = SORTED_QUOTES.slice(startIndex, endIndex);

  // Fallback: If slice empty, use previous bucket
  if (tierQuotes.length === 0) {
      tierQuotes = SORTED_QUOTES.slice(Math.max(0, startIndex - bucketSize), startIndex);
  }
  
  const sourcePool = tierQuotes.length > 0 ? tierQuotes : SORTED_QUOTES;

  // 2. Filter out excluded quotes (Strictly exclude previously completed)
  const excludeSet = new Set(exclude.map(normalizeText)); // Normalize exclude list
  const available = sourcePool.filter(q => !excludeSet.has(q.normalizedText));
  
  // 3. Logic for Exhausted Pool (Infinite Mode via AI)
  if (available.length === 0) {
      // If we have no static quotes left for this tier, generate one via AI
      // We generate one at a time for the queue.
      const aiQuotes: Quote[] = [];
      for(let i=0; i < count; i++) {
         // Loop to ensure uniqueness against completed quotes even from AI
         let attempts = 0;
         let uniqueFound = false;
         let candidate: Quote | null = null;
         
         while(attempts < 3 && !uniqueFound) {
             candidate = await generateQuoteForTier(tier);
             if (!excludeSet.has(normalizeText(candidate.text))) {
                 uniqueFound = true;
             }
             attempts++;
         }
         
         if (candidate) {
             aiQuotes.push(candidate);
             // Temporarily add to exclude set to prevent dupes within this batch
             excludeSet.add(normalizeText(candidate.text));
         }
      }
      return aiQuotes;
  }

  // 4. Shuffle and select from static pool if available
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map(q => ({
    text: q.normalizedText,
    source: "Wisdom",
    author: q.quoteAuthor || "Unknown"
  }));
};