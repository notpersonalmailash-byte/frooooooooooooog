import { GoogleGenAI } from "@google/genai";
import { Quote } from '../types';

const MODEL_NAME = 'gemini-2.5-flash';

// Helper to safely get client
const getAiClient = (): GoogleGenAI | null => {
  const key = process.env.API_KEY;
  // Check if key is missing or is the placeholder from index.html
  if (!key || key === 'YOUR_API_KEY_HERE' || key === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
};

export interface StoryGenerationResult {
  text: string;
  topic: string;
}

export const generateStorySegment = async (topic: string, previousContext: string = ""): Promise<StoryGenerationResult> => {
  const ai = getAiClient();
  if (!ai) {
      return {
          text: "The library is closed (Offline Mode). Please add your API Key to continue the story.",
          topic: topic
      };
  }

  try {
    let prompt = "";
    
    if (!previousContext) {
      // Start of story
      prompt = `Write the opening paragraph of a short story about "${topic}". 
      Constraints:
      1. Maximum 35 words.
      2. Do NOT use markdown (no bold, no italics).
      3. Simple, flowing sentence structure suitable for typing practice.
      4. Make it cozy and engaging.`;
    } else {
      // Continuation
      prompt = `Continue the following story: "${previousContext}".
      Write the NEXT paragraph.
      Constraints:
      1. Maximum 35 words.
      2. Do NOT use markdown.
      3. Maintain the tone.
      4. Do not repeat the previous text.`;
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const text = response.text?.trim() || "The frog sat on the lily pad, wondering where the story went.";
    
    // Cleanup any accidental markdown or newlines
    const cleanText = text.replace(/[*_#]/g, '').replace(/\n/g, ' ').trim();

    return {
      text: cleanText,
      topic: topic
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "The magical ink has run dry. Please check your connection or try again later.",
      topic: topic
    };
  }
};

// Generates a list of REAL words for practice
export const generatePracticeWords = async (allowedLetters: string[], focusLetters: string[]): Promise<string[]> => {
    const ai = getAiClient();
    if (!ai) {
        // Offline Fallback for Practice
        return ["tent", "net", "rent", "tenet", "letter", "enter", "center", "recent", "tree", "street"]; 
    }

    try {
        const lettersStr = allowedLetters.join(', ');
        const focusStr = focusLetters.join(', ');
        
        const prompt = `Generate a list of 20 REAL English words for a typing game.
        Constraints:
        1. Words must consist ONLY of the following letters: [${lettersStr}].
        2. Words must NOT contain any other letters.
        3. Prioritize words that use these target letters if possible: [${focusStr}].
        4. Return ONLY a space-separated list of words. No markdown, no explanations.
        5. Words should vary in length (3-8 letters).
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
        });

        const text = response.text?.trim() || "";
        // Clean up text to just get words array
        let words = text.replace(/[^a-zA-Z\s]/g, '').toLowerCase().split(/\s+/);
        
        // Filter out any words that accidentally contain invalid chars (AI safety net)
        words = words.filter(w => {
            return w.split('').every(char => allowedLetters.includes(char.toLowerCase()));
        });

        if (words.length === 0) throw new Error("No valid words generated");
        
        return words;

    } catch (error) {
        console.error("Failed to generate practice words:", error);
        // Fallback fallback
        return ["ten", "net", "tent", "tint", "rent"]; 
    }
};

// Generates a single unique quote for a given difficulty tier
export const generateQuoteForTier = async (tier: string): Promise<Quote> => {
    const ai = getAiClient();
    if (!ai) {
        // Offline Fallback
        return {
            text: "Offline Mode: The internet pond is quiet today. Add an API key for infinite wisdom.",
            author: "System",
            source: "Offline"
        };
    }

    try {
        let constraints = "";
        
        switch (tier) {
            case 'Egg':
            case 'Tadpole':
                constraints = "Short, simple sentences. Common words. No complex punctuation. Max 10-15 words.";
                break;
            case 'Polliwog':
            case 'Froglet':
                constraints = "Moderate length. Some punctuation like commas. Max 15-20 words.";
                break;
            case 'Hopper':
            case 'Tree Frog':
                constraints = "Complex vocabulary. Longer sentences. Varied punctuation. Max 20-30 words.";
                break;
            case 'Bullfrog':
            case 'Frog Sage':
                constraints = "Sophisticated, archaic or technical language. Complex structure. Max 35 words.";
                break;
            default:
                constraints = "Moderate length and complexity.";
        }

        const prompt = `Generate a unique, wise, or philosophical quote suitable for a typing game.
        Difficulty Level: ${tier}
        Constraints: ${constraints}
        Format: JSON with 'text' and 'author' keys.
        Do NOT use markdown.`;
        
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response from AI");
        
        const result = JSON.parse(jsonText);
        
        return {
            text: result.text,
            author: result.author || "Unknown",
            source: "AI Wisdom"
        };

    } catch (error) {
        console.error("Failed to generate quote:", error);
        // Fallback if AI fails
        return {
            text: "To err is human; to forgive, divine.",
            author: "Alexander Pope",
            source: "Fallback"
        };
    }
};