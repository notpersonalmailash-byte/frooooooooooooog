import React, { useState } from 'react';
import { X, Feather, Sparkles, BookOpen } from 'lucide-react';

interface StoryConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartStory: (topic: string) => void;
}

const StoryConfigModal: React.FC<StoryConfigModalProps> = ({ isOpen, onClose, onStartStory }) => {
  const [topic, setTopic] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onStartStory(topic);
    }
  };

  const suggestions = [
    "A detective frog in London",
    "The history of espresso",
    "Cyberpunk Tokyo",
    "A cozy cabin in the woods",
    "The secret life of clouds"
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-stone-100 bg-stone-50">
          <div>
             <h2 className="text-xl font-black text-frog-green tracking-tight flex items-center gap-2">
               <Feather className="w-5 h-5" /> Frog Tales
             </h2>
             <p className="text-xs text-stone-500 font-medium mt-1">Generate an infinite story with AI</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
           <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    What should we write about?
                </label>
                <div className="relative">
                    <input 
                        type="text" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., A wizard learning to code..."
                        className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frog-green focus:border-transparent transition-all font-medium text-stone-800"
                        autoFocus
                    />
                    <Sparkles className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Suggestions</span>
                <div className="flex flex-wrap gap-2 mt-2">
                    {suggestions.map(s => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setTopic(s)}
                            className="text-xs px-2 py-1 bg-stone-100 hover:bg-frog-green/5 text-stone-600 hover:text-frog-green rounded-md transition-colors border border-stone-200 hover:border-frog-green/20"
                        >
                            {s}
                        </button>
                    ))}
                </div>
              </div>

              <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={!topic.trim()}
                    className="w-full py-3 bg-frog-green hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-frog-green/20 flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" /> Start Story
                  </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default StoryConfigModal;