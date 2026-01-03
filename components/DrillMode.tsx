
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { WordProficiency } from '../types';
// FIX: Import Trophy icon from lucide-react.
import { Brain, Check, Repeat, X, Trophy } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

const REPS_REQUIRED = 5;

interface DrillModeProps {
  wordProficiency: Record<string, WordProficiency>;
  updateWordProficiency: (word: string, isCorrect: boolean) => void;
  onExit: () => void;
}

const DrillMode: React.FC<DrillModeProps> = ({ wordProficiency, updateWordProficiency, onExit }) => {
  const [drillQueue, setDrillQueue] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [reps, setReps] = useState(0);
  const [input, setInput] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const wordsToDrill = useMemo(() => {
    // Explicitly cast to ensure type safety if inference fails
    return (Object.entries(wordProficiency) as [string, WordProficiency][])
      .filter(([_, stats]) => stats.mistakes > 0 && stats.correct < 100)
      .sort(([, a], [, b]) => (b.mistakes / (b.correct + 1)) - (a.mistakes / (a.correct + 1)))
      .map(([word]) => word);
  }, [wordProficiency]);

  useEffect(() => {
    setDrillQueue(wordsToDrill);
    if (wordsToDrill.length > 0) {
      setCurrentWordIndex(0);
      setReps(0);
      setInput('');
      setIsComplete(false);
    }
  }, [wordsToDrill]);

  const currentWord = drillQueue[currentWordIndex];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentWord || isComplete) return;

    const val = e.target.value;

    if (val.endsWith(' ')) {
      const typedWord = val.trim();
      if (typedWord === currentWord) {
        soundEngine.playSuccess();
        updateWordProficiency(currentWord, true);
        const nextReps = reps + 1;
        if (nextReps >= REPS_REQUIRED) {
          // Word mastered for this session
          const nextIndex = currentWordIndex + 1;
          if (nextIndex >= drillQueue.length) {
            setIsComplete(true);
          } else {
            setCurrentWordIndex(nextIndex);
            setReps(0);
          }
        } else {
          setReps(nextReps);
        }
      } else {
        // Mistake
        soundEngine.playError();
        updateWordProficiency(currentWord, false);
        setReps(0); // Reset progress on this word
      }
      setInput('');
    } else if (!currentWord.startsWith(val)) {
        soundEngine.playError();
        setInput('');
        setReps(0);
    } else {
        setInput(val);
        soundEngine.playKeypress();
    }
  };

  if (wordsToDrill.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-2xl border border-stone-100 shadow-sm">
        <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-stone-800">No Weak Words Found!</h2>
        <p className="text-stone-500 mt-2">Your accuracy is top-notch. Keep typing to build your profile.</p>
      </div>
    );
  }

  if (isComplete) {
    return (
        <div className="text-center p-8 bg-white rounded-2xl border border-stone-100 shadow-sm">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-stone-800">Drill Session Complete!</h2>
            <p className="text-stone-500 mt-2">You've strengthened your weak points. Well done!</p>
            <button onClick={onExit} className="mt-4 px-4 py-2 bg-frog-green text-white font-bold rounded-lg">Return</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-white p-12 rounded-[3rem] border-4 border-red-100 shadow-2xl text-center animate-in zoom-in-95 duration-300">
      <div className="flex flex-col items-center gap-6">
        <Brain className="w-16 h-16 text-red-500" />
        <h2 className="text-4xl font-black text-red-700 tracking-tight">MISTAKE DRILL</h2>
        <p className="text-red-500 font-bold">Type the word <span className="font-black">5 times</span> correctly to master it.</p>
        
        <div className="text-7xl font-mono font-black text-stone-800 tracking-wider my-8">{currentWord}</div>

        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={handleInputChange}
          className="w-full max-w-sm text-center text-4xl font-mono font-bold bg-stone-50 border-2 rounded-2xl py-4 focus:outline-none focus:border-red-500 transition-all"
          placeholder="Type here..."
        />
        
        <div className="mt-8 flex flex-col items-center">
            <div className="flex gap-2 mb-2">
                {Array.from({ length: REPS_REQUIRED }).map((_, i) => (
                    <div key={i} className={`w-8 h-2 rounded-full ${i < reps ? 'bg-red-500' : 'bg-red-100'}`}></div>
                ))}
            </div>
          <div className="text-red-400 font-black text-sm font-mono">
            Word {currentWordIndex + 1} of {drillQueue.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrillMode;
