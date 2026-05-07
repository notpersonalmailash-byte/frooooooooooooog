
import React, { useState, useEffect, useRef } from 'react';
import { Brain, Check, Trophy } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

const REPS_REQUIRED = 5;

interface DrillModeProps {
  mistakePool: string[];
  setMistakePool: React.Dispatch<React.SetStateAction<string[]>>;
  onExit: () => void;
}

const DrillMode: React.FC<DrillModeProps> = ({ mistakePool, setMistakePool, onExit }) => {
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [reps, setReps] = useState(0);
  const [input, setInput] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentWord && mistakePool.length > 0) {
      setCurrentWord(mistakePool[0]);
      setReps(0);
      setInput('');
    }
  }, [mistakePool, currentWord]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentWord) return;

    const val = e.target.value;

    if (val.endsWith(' ')) {
      const typedWord = val.trim();
      if (typedWord === currentWord) {
        soundEngine.playSuccess();
        const nextReps = reps + 1;
        if (nextReps >= REPS_REQUIRED) {
          // Word mastered, remove from pool
          setMistakePool(prev => prev.filter(w => w !== currentWord));
          setCurrentWord(null);
          setReps(0);
        } else {
          setReps(nextReps);
        }
      } else {
        // Mistake
        soundEngine.playError();
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

  if (mistakePool.length === 0 && !currentWord) {
    return (
        <div className="text-center p-8 bg-white rounded-2xl border border-stone-100 shadow-sm max-w-sm mx-auto">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-stone-800">No Mistakes Left!</h2>
            <p className="text-stone-500 mt-2">You've solved all your logged mistakes. Well done!</p>
            <button onClick={onExit} className="mt-6 px-6 py-2 bg-frog-500 hover:bg-frog-600 text-white font-bold rounded-xl transition-all">Return to Quotes</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[500px] bg-white p-8 rounded-[2rem] border-4 border-red-100 shadow-xl text-center animate-in zoom-in-95 duration-300 mx-auto">
      <div className="flex flex-col items-center gap-4">
        <Brain className="w-12 h-12 text-red-500" />
        <h2 className="text-3xl font-black text-red-700 tracking-tight">MISTAKE DRILL</h2>
        <p className="text-red-500 font-bold text-sm">Type the word <span className="font-black">{REPS_REQUIRED} times</span> correctly to remove it from your mistake log.</p>
        
        <div className="w-full max-w-xs mt-2 bg-red-50 text-red-600 font-bold py-2 rounded-lg border border-red-100 uppercase tracking-widest text-sm">
            {mistakePool.length} mistake{mistakePool.length !== 1 ? 's' : ''} left to solve
        </div>

        <div className="text-5xl font-mono font-black text-stone-800 tracking-wider my-6">{currentWord}</div>

        <input
          ref={inputRef}
          autoFocus
           // eslint-disable-next-line jsx-a11y/no-autofocus
          value={input}
          onChange={handleInputChange}
          className="w-full max-w-xs text-center text-3xl font-mono font-bold bg-stone-50 border-2 rounded-xl py-3 focus:outline-none focus:border-red-500 transition-all text-stone-700"
          placeholder="Type here..."
        />
        
        <div className="mt-6 flex flex-col items-center">
            <div className="flex gap-1.5 mb-2">
                {Array.from({ length: REPS_REQUIRED }).map((_, i) => (
                    <div key={i} className={`w-6 h-2 rounded-full ${i < reps ? 'bg-red-500' : 'bg-red-100'}`}></div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DrillMode;
