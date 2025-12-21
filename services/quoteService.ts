
import { Quote, PracticeWord } from '../types';
import { QUOTES } from '../data/quotes';
import { COMMON_WORDS } from '../data/commonWords';

// Added PRACTICE_ORDER export to fix import error in PracticeProgress.tsx
export const PRACTICE_ORDER = [
  'f', 'j', 'd', 'k', 's', 'l', 'a', ';', 'g', 'h', 
  'e', 'i', 'r', 'u', 't', 'y', 'v', 'm', 'b', 'n', 
  'c', ',', 'x', '.', 'z', '/', 'q', 'p', 'w', 'o'
];

const normalizeText = (text: string): string => {
  return text
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/…/g, "...")
    .trim();
};

const SORTED_QUOTES = [...QUOTES].map(q => ({
    ...q,
    normalizedText: normalizeText(q.quoteText)
}));

export const fetchTenFastWords = (count: number = 100, smartQueue: PracticeWord[] = []): string[] => {
    const top200 = COMMON_WORDS.slice(0, 200);
    const masteryWords = smartQueue
        .filter(pw => pw.proficiency < 3)
        .sort((a,b) => a.lastPracticed - b.lastPracticed)
        .map(pw => pw.word);

    const words: string[] = [];
    for (let i = 0; i < count; i++) {
        if (masteryWords.length > 0 && Math.random() < 0.25) {
            const pick = masteryWords[Math.floor(Math.random() * Math.min(masteryWords.length, 10))];
            words.push(pick);
        } else {
            words.push(top200[Math.floor(Math.random() * top200.length)]);
        }
    }
    return words;
};

export const fetchQuotes = async (
    count: number = 3, 
    masteredQuoteTexts: string[] = []
): Promise<Quote[]> => {
  // RANDOM SELECTION: No longer level-based
  const masteredSet = new Set(masteredQuoteTexts);
  const available = SORTED_QUOTES.filter(q => !masteredSet.has(q.normalizedText));
  
  // Fallback if all quotes mastered
  const sourcePool = available.length > 0 ? available : SORTED_QUOTES;
  
  const shuffled = [...sourcePool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map(q => ({
    text: q.normalizedText,
    source: "Random Wisdom",
    author: q.quoteAuthor || "Unknown"
  }));
};
