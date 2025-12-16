// This service has been converted to local-only mode.
// AI dependencies have been removed.

import { Quote } from '../types';

export interface StoryGenerationResult {
  text: string;
  topic: string;
}

// Local placeholder for story generation
export const generateStorySegment = async (topic: string, previousContext: string = ""): Promise<StoryGenerationResult> => {
  return {
      text: "The library is quiet. The story rests within your own imagination for now.",
      topic: topic
  };
};

// Local fallback for practice words (Deprecated, logic moved to quoteService)
export const generatePracticeWords = async (allowedLetters: string[], focusLetters: string[]): Promise<string[]> => {
    return ["tent", "net", "rent", "tenet", "letter", "enter", "center", "recent", "tree", "street"]; 
};

// Local fallback for tier quotes (Deprecated, logic moved to quoteService)
export const generateQuoteForTier = async (tier: string): Promise<Quote> => {
    return {
        text: "The journey of a thousand miles begins with a single step.",
        author: "Lao Tzu",
        source: "Local Wisdom"
    };
};