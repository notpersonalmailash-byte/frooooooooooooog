import { Quote, PracticeWord } from '../types';
import { QUOTES } from '../data/quotes';

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

// Build a dictionary of all words found in quotes for Practice Mode
const WORD_DATABASE = Array.from(new Set(
    SORTED_QUOTES
        .map(q => q.normalizedText.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/))
        .flat()
        .filter(w => w.length > 2)
));

// --- PRACTICE MODE GENERATOR ---
export const PRACTICE_ORDER = "enitrlsauoychgmpbkvwjqxz".split('');

export const getPracticeLetter = (level: number) => {
    const idx = Math.min(6 + level - 1, PRACTICE_ORDER.length - 1);
    return PRACTICE_ORDER[idx].toUpperCase();
}

const getLocalPracticeWords = (allowedLetters: string[], count: number = 20): string[] => {
    // Filter the global word database for words that ONLY contain allowed letters
    const validWords = WORD_DATABASE.filter(word => {
        return word.split('').every(char => allowedLetters.includes(char));
    });

    if (validWords.length < 5) {
        // Fallback if strict filtering is too restrictive (early levels)
        return ["tee", "ten", "net", "tin", "rent", "tent", "test", "rest", "sent", "nest", "site", "rise", "tire"];
    }

    return validWords;
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
  
  // --- PRACTICE MODE LOGIC (LOCAL) ---
  if (mode === 'PRACTICE') {
      const unlockedCount = Math.min(6 + practiceLevel, PRACTICE_ORDER.length);
      const unlockedLetters = PRACTICE_ORDER.slice(0, unlockedCount);
      const newLetter = unlockedLetters[unlockedLetters.length - 1];
      
      const unlockedSet = new Set(unlockedLetters);
      
      // 1. Get Trouble Words from Smart Queue (Lowest proficiency first)
      const troubleWords = smartPracticeQueue
          .sort((a, b) => a.proficiency - b.proficiency)
          .slice(0, 5) // Focus on top 5 worst words
          .map(pw => pw.word);

      // 2. Determine weak letters from stats
      const weakLetters = Object.entries(charStats)
        .filter(([char]) => unlockedLetters.includes(char.toLowerCase()))
        .sort((a, b) => b[1] - a[1]) // Descending order of misses
        .map(([char]) => char)
        .slice(0, 3); // Top 3 weakest
      
      const focusLetters = Array.from(new Set([...weakLetters, newLetter]));

      // 3. Get generic words based on unlocked letters
      let practiceWords = getLocalPracticeWords(unlockedLetters);
      
      // Prioritize words containing focus letters
      const focusedWords = practiceWords.filter(w => 
          w.split('').some(c => focusLetters.includes(c))
      );
      
      // Use focused words if we have enough, otherwise mix
      const wordPool = focusedWords.length > 10 ? focusedWords : practiceWords;

      const quotes: Quote[] = [];
      
      // Generate 'count' number of practice strings
      for(let i=0; i<count; i++) {
         // Create a sentence mixing trouble words and practice pool
         const sentenceComponents = [];
         
         // Inject 1-2 trouble words if available
         if (troubleWords.length > 0) {
             const tWord = troubleWords[Math.floor(Math.random() * troubleWords.length)];
             sentenceComponents.push(tWord);
             if (Math.random() > 0.5) {
                 sentenceComponents.push(troubleWords[Math.floor(Math.random() * troubleWords.length)]);
             }
         }

         // Fill rest with 4-6 random pool words
         const fillCount = 4 + Math.floor(Math.random() * 3);
         for(let j=0; j<fillCount; j++) {
             sentenceComponents.push(wordPool[Math.floor(Math.random() * wordPool.length)]);
         }

         // Shuffle the sentence
         const finalSentence = sentenceComponents.sort(() => 0.5 - Math.random()).join(" ");
         
         quotes.push({
             text: finalSentence,
             source: "Smart Practice",
             author: troubleWords.length > 0 ? "Focus: Weak Words & Keys" : `Level ${practiceLevel + 1}: ${unlockedLetters.join('').toUpperCase()}`
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