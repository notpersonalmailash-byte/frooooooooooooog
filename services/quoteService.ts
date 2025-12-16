
import { Quote, PracticeWord } from '../types';
import { QUOTES } from '../data/quotes';
import { COMMON_WORDS } from '../data/commonWords';

// Helper to sanitize text for standard keyboards
const normalizeText = (text: string): string => {
  return text
    .replace(/[\u2013\u2014]/g, "-")      // Replace em-dash and en-dash with standard hyphen
    .replace(/[\u2018\u2019]/g, "'")      // Replace smart single quotes with straight single quote
    .replace(/[\u201C\u201D]/g, '"')      // Replace smart double quotes with straight double quote
    .replace(/…/g, "...")                 // Replace ellipsis character with three dots
    .trim();
};

// Precise 1-20 Level Mapping
const LEVEL_ORDER = [
  'Egg III', 'Egg II', 'Egg I',
  'Tadpole III', 'Tadpole II', 'Tadpole I',
  'Polliwog III', 'Polliwog II', 'Polliwog I',
  'Froglet III', 'Froglet II', 'Froglet I',
  'Hopper III', 'Hopper II', 'Hopper I',
  'Tree Frog III', 'Tree Frog II', 'Tree Frog I',
  'Bullfrog', 'Frog Sage'
];

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

// Legacy Export needed for types? No, but maybe used elsewhere. keeping for safety but not logic.
export const PRACTICE_ORDER = "enitrlsauoychgmpbkvwjqxz".split('');
export const getPracticeLetter = (level: number) => {
    return ""; // Deprecated logic
}

const getDifficultyConfig = (tier: string) => {
    switch(tier) {
        case 'Egg': return { minLen: 2, maxLen: 4, punctProb: 0, count: 8 };
        case 'Tadpole': return { minLen: 3, maxLen: 6, punctProb: 0, count: 10 };
        case 'Polliwog': return { minLen: 4, maxLen: 8, punctProb: 0.1, count: 12 };
        case 'Froglet': return { minLen: 4, maxLen: 10, punctProb: 0.3, count: 15 };
        case 'Hopper': return { minLen: 5, maxLen: 12, punctProb: 0.5, count: 15 };
        case 'Tree Frog': return { minLen: 5, maxLen: 15, punctProb: 0.7, count: 18 };
        case 'Bullfrog': return { minLen: 6, maxLen: 20, punctProb: 0.9, count: 20 };
        case 'Frog Sage': return { minLen: 6, maxLen: 99, punctProb: 1.0, count: 25 };
        default: return { minLen: 2, maxLen: 5, punctProb: 0, count: 10 };
    }
};

const applyPunctuation = (word: string, prob: number) => {
    if (Math.random() > prob) return word;
    
    const r = Math.random();
    if (r < 0.4) return word + ',';
    if (r < 0.7) return word + '.';
    if (r < 0.8) return word + '?';
    if (r < 0.9) return word + '!';
    if (r < 0.95) return `"${word}"`;
    return word + ';';
};

export const fetchQuotes = async (
    count: number = 3, 
    exclude: string[] = [], 
    levelName: string = 'Egg III', 
    mode: string = 'QUOTES', 
    practiceLevel: number = 0,
    charStats: Record<string, number> = {},
    smartPracticeQueue: PracticeWord[] = []
): Promise<Quote[]> => {
  
  // --- WORDS MODE LOGIC (Formerly Practice) ---
  if (mode === 'PRACTICE') {
      // Determine complexity based on Tier name extraction
      const tier = levelName.split(' ')[0] || 'Egg';
      const config = getDifficultyConfig(tier);
      
      // Get words from the new COMMON_WORDS database
      let availableWords = COMMON_WORDS.filter(w => w.length >= config.minLen && w.length <= config.maxLen);
      
      // Fallback if filter is too aggressive
      if (availableWords.length < 50) {
          availableWords = COMMON_WORDS.filter(w => w.length <= config.maxLen);
      }

      // Filter mastery words (Words incorrectly typed that haven't reached 3 successes)
      const masteryWords = smartPracticeQueue
          .filter(pw => pw.proficiency < 3)
          .sort((a,b) => a.lastPracticed - b.lastPracticed); // Oldest practice first

      const quotes: Quote[] = [];
      
      for(let i=0; i<count; i++) {
         const sentenceWords: string[] = [];
         
         // Select ~30% words from Mastery Queue, rest from Common Pool
         const masteryCount = Math.min(masteryWords.length, Math.ceil(config.count * 0.3));
         const commonCount = config.count - masteryCount;
         
         // 1. Add Mastery Words (if any)
         if (masteryCount > 0) {
             // Shuffle the top 10 oldest mastery words to pick from
             const candidates = masteryWords.slice(0, 10).sort(() => 0.5 - Math.random());
             for(let k=0; k<masteryCount; k++) {
                 if (candidates[k]) sentenceWords.push(candidates[k].word);
             }
         }

         // 2. Add Common Words
         for(let j=0; j<commonCount; j++) {
             let word = availableWords[Math.floor(Math.random() * availableWords.length)];
             // Apply punctuation logic scaling with level
             word = applyPunctuation(word, config.punctProb);
             sentenceWords.push(word);
         }

         // Shuffle the sentence so mastery words aren't always at start
         const shuffledSentence = sentenceWords.sort(() => 0.5 - Math.random()).join(" ");
         
         quotes.push({
             text: shuffledSentence,
             source: "Words Mode",
             author: `Level: ${tier} | Review: ${masteryCount}`
         });
      }
      return quotes;
  }

  // --- STANDARD MODE LOGIC (LOCAL BUCKETS) ---
  
  // 1. Determine which bucket of quotes to use based on specific Level Name
  // We split sorted quotes into 20 granular buckets
  const bucketCount = 20;
  const bucketSize = Math.ceil(SORTED_QUOTES.length / bucketCount);
  
  let difficultyIndex = LEVEL_ORDER.indexOf(levelName);
  
  // Fallback if level name not found
  if (difficultyIndex === -1) difficultyIndex = 0;
  
  // Hardcore mode always uses max difficulty
  if (mode === 'HARDCORE') {
      difficultyIndex = 19; 
  }
  
  const startIndex = difficultyIndex * bucketSize;
  const endIndex = Math.min(startIndex + bucketSize, SORTED_QUOTES.length);
  
  // Get the slice of quotes appropriate for this specific difficulty level
  let tierQuotes = SORTED_QUOTES.slice(startIndex, endIndex);

  // Fallback: If slice is empty or too small (edge case), try to include previous bucket
  if (tierQuotes.length < 3 && difficultyIndex > 0) {
      const expandedStart = Math.max(0, startIndex - bucketSize);
      tierQuotes = SORTED_QUOTES.slice(expandedStart, endIndex);
  }
  
  // Safety fallback
  if (tierQuotes.length === 0) tierQuotes = SORTED_QUOTES.slice(0, 20);
  
  const sourcePool = tierQuotes;

  // 2. Filter out excluded quotes (Strictly exclude previously completed)
  const excludeSet = new Set(exclude.map(normalizeText)); 
  let available = sourcePool.filter(q => !excludeSet.has(q.normalizedText));
  
  // 3. Logic for Exhausted Pool (Recycle)
  if (available.length === 0) {
      // If we've done all quotes in this specific level bucket, reset availability
      // This forces players to re-master quotes at this level if they stay here too long
      available = sourcePool;
  }

  // 4. Shuffle and select
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map(q => ({
    text: q.normalizedText,
    source: "Wisdom",
    author: q.quoteAuthor || "Unknown"
  }));
};
