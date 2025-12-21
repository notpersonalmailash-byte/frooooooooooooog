
import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, BookOpen, RotateCcw, Trash2, Settings, Check, X, Loader2, Feather } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { BookSection, WordProficiency } from '../types';
import ePub from 'epubjs';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs`;

const PAGE_SIZE = 800; // Chars per page
const XP_PER_CHARS = 200; // Award 1 XP per this many chars

// --- Chapter Modal Component ---
interface ChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  structure: BookSection[];
  onSave: (newStructure: BookSection[]) => void;
}

const ChapterModal: React.FC<ChapterModalProps> = ({ isOpen, onClose, structure, onSave }) => {
  const [localStructure, setLocalStructure] = useState(structure);

  useEffect(() => {
    setLocalStructure(structure);
  }, [structure, isOpen]);

  if (!isOpen) return null;

  const handleToggle = (id: number) => {
    setLocalStructure(prev => prev.map(s => s.id === id ? { ...s, included: !s.included } : s));
  };
  
  const handleSelectAll = (select: boolean) => {
    setLocalStructure(prev => prev.map(s => ({ ...s, included: select })));
  };

  const handleSave = () => {
    onSave(localStructure);
    onClose();
  };

  const includedCount = localStructure.filter(s => s.included).length;

  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
           <div className="p-4 border-b border-stone-200">
              <h3 className="font-bold text-lg text-stone-800">Manage Chapters</h3>
              <p className="text-xs text-stone-500">{includedCount} of {localStructure.length} sections included.</p>
           </div>
           <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-2">
              <div className="flex gap-2 mb-2">
                  <button onClick={() => handleSelectAll(true)} className="text-xs font-bold bg-stone-100 hover:bg-stone-200 px-3 py-1 rounded">Select All</button>
                  <button onClick={() => handleSelectAll(false)} className="text-xs font-bold bg-stone-100 hover:bg-stone-200 px-3 py-1 rounded">Deselect All</button>
              </div>
              {localStructure.map(section => (
                 <div key={section.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${section.included ? 'bg-green-50' : 'bg-stone-50'}`}>
                    <input type="checkbox" checked={section.included} onChange={() => handleToggle(section.id)} className="w-5 h-5 accent-frog-green" />
                    <label className="text-sm font-medium text-stone-700 cursor-pointer flex-1" onClick={() => handleToggle(section.id)}>
                       {section.title}
                       <span className="text-xs text-stone-400 ml-2">({section.content.length.toLocaleString()} chars)</span>
                    </label>
                 </div>
              ))}
           </div>
           <div className="p-4 border-t border-stone-200 flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-bold text-white bg-frog-green hover:bg-green-500 rounded-lg flex items-center gap-1"><Check className="w-4 h-4" /> Apply Changes</button>
           </div>
        </div>
     </div>
  );
};


// --- Main BookMode Component ---
interface BookModeProps {
  bookContent: string | null;
  setBookContent: (content: string | null) => void;
  bookProgress: number;
  setBookProgress: (progress: number) => void;
  bookStructure: BookSection[] | null;
  setBookStructure: (structure: BookSection[] | null) => void;
  onXpEarned: (xp: number) => void;
  updateWordProficiency: (word: string, isCorrect: boolean) => void;
}

const BookMode: React.FC<BookModeProps> = ({ bookContent, setBookContent, bookProgress, setBookProgress, bookStructure, setBookStructure, onXpEarned, updateWordProficiency }) => {
  const [userInput, setUserInput] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const [lastXpAwardedAt, setLastXpAwardedAt] = useState(bookProgress);
  const [isLoading, setIsLoading] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const customTextRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Award XP based on progress
    const progressSinceLastAward = bookProgress - lastXpAwardedAt;
    if (progressSinceLastAward >= XP_PER_CHARS) {
      const xpEarned = Math.floor(progressSinceLastAward / XP_PER_CHARS);
      if (xpEarned > 0) {
        onXpEarned(xpEarned);
        setLastXpAwardedAt(bookProgress);
      }
    }
  }, [bookProgress, lastXpAwardedAt, onXpEarned]);
  
  const rebuildContentFromStructure = (structure: BookSection[]) => {
      const newContent = structure
          .filter(s => s.included)
          .map(s => s.content)
          .join('\n\n');
      setBookContent(newContent);
  };

  const handleCustomText = (text: string) => {
    if (!text.trim()) return;
    const sections = text.split(/\n\s*\n+/);
    const structure: BookSection[] = sections.map((content, i) => ({
      id: i,
      title: `Pasted Section ${i + 1}`,
      content: content.trim(),
      included: true,
    }));
    setBookStructure(structure);
    rebuildContentFromStructure(structure);
    setBookProgress(0);
    setUserInput('');
    setLastXpAwardedAt(0);
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    setIsLoading(true);

    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    try {
        let structure: BookSection[] = [];
        if (fileType === 'txt') {
            const text = await file.text();
            const sections = text.split(/\n\s*\n\s*\n+/); // Split by 3+ newlines
            structure = sections.map((content, i) => ({
                id: i,
                title: `Section ${i + 1}`,
                content: content.trim(),
                included: true
            }));
        } else if (fileType === 'epub') {
            const book = ePub(file.arrayBuffer());
            await book.ready;
            const toc = book.navigation.toc;
            
            const sectionPromises = toc.map(async (item, i) => {
                const section = await book.load(item.href);
                const contents = await section.render();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = contents;
                return {
                    id: i,
                    title: item.label.trim(),
                    content: (tempDiv.textContent || '').trim(),
                    included: true
                };
            });
            structure = await Promise.all(sectionPromises);

        } else if (fileType === 'pdf') {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const numPages = pdf.numPages;
            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
                structure.push({
                    id: i,
                    title: `Page ${i}`,
                    content: pageText.trim(),
                    included: true
                });
            }
        } else {
            alert('Unsupported file type. Please use .txt, .epub, or .pdf');
            setIsLoading(false);
            return;
        }

        setBookStructure(structure);
        rebuildContentFromStructure(structure);
        setBookProgress(0);
        setUserInput('');
        setLastXpAwardedAt(0);

    } catch (error) {
        console.error("Error parsing file:", error);
        alert("Could not read or parse the uploaded file. It may be corrupted or in an unsupported format.");
    } finally {
        setIsLoading(false);
    }
  };


  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files[0]);
  };

  const clearBook = () => {
    if (window.confirm('Are you sure you want to clear this book? Your progress will be lost.')) {
      setBookContent(null);
      setBookProgress(0);
      setBookStructure(null);
      setUserInput('');
      setLastXpAwardedAt(0);
    }
  };
  
  const resetProgress = () => {
    if (window.confirm('Are you sure you want to reset your progress for this book?')) {
      setBookProgress(0);
      setUserInput('');
      setLastXpAwardedAt(0);
    }
  };

  const currentPageIndex = Math.floor(bookProgress / PAGE_SIZE);
  const totalPages = bookContent ? Math.ceil(bookContent.length / PAGE_SIZE) : 0;
  const pageStart = currentPageIndex * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const currentPageText = bookContent ? bookContent.substring(pageStart, pageEnd) : '';

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!currentPageText) return;
    const val = e.target.value;
    const prevVal = userInput;
    setUserInput(val);
    
    if (val.length > prevVal.length) {
        soundEngine.playKeypress();
    }
    
    const lastChar = val.slice(-1);
    if (lastChar === ' ' && prevVal.slice(-1) !== ' ') {
        const typedWords = val.trim().split(/\s+/);
        const sourceWords = currentPageText.split(/\s+/);
        const wordIndex = typedWords.length - 1;

        if (wordIndex < sourceWords.length) {
            const sourceWord = sourceWords[wordIndex];
            const typedWord = typedWords[wordIndex];
            const isCorrect = sourceWord === typedWord;
            updateWordProficiency(sourceWord, isCorrect);
        }
    }
    
    // Page complete
    if (val === currentPageText) {
      soundEngine.playSuccess();
      // FIX: Use direct value update for setBookProgress as its prop type doesn't support a function updater.
      setBookProgress(Math.min(bookProgress + currentPageText.length, bookContent?.length || 0));
      setUserInput('');
    }
  };
  
  const renderPageText = () => {
    return currentPageText.split('').map((char, i) => {
      let colorClass = 'text-stone-400';
      if (i < userInput.length) {
        colorClass = userInput[i] === char ? 'text-frog-500' : 'text-red-500 bg-red-100';
      }
      return <span key={i} className={colorClass}>{char}</span>;
    });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-8 h-[400px]">
        <Loader2 className="w-16 h-16 text-stone-300 animate-spin" />
        <p className="text-stone-500 mt-4 font-bold">Processing your book...</p>
      </div>
    );
  }

  if (!bookContent) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-8" onDragOver={handleDragOver} onDrop={handleDrop}>
        <div className="w-full p-8 bg-stone-50 rounded-3xl border border-stone-200 shadow-sm text-center">
            <UploadCloud className="w-16 h-16 text-stone-300 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-stone-700">Upload a File</h2>
            <p className="text-stone-500 mt-2 mb-6">Drag & drop or select a <code className="bg-stone-200 text-stone-700 px-1 py-0.5 rounded">.txt, .epub, or .pdf</code> file.</p>
            <input type="file" accept=".txt,.epub,.pdf" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} className="hidden" id="book-upload" />
            <label htmlFor="book-upload" className="px-6 py-3 bg-frog-green text-white font-bold rounded-lg cursor-pointer hover:bg-green-500 transition-colors">Select File</label>
        </div>
        <div className="text-center my-6 text-stone-400 font-bold text-sm">OR</div>
        <div className="w-full p-8 bg-stone-50 rounded-3xl border border-stone-200 shadow-sm text-center">
            <Feather className="w-12 h-12 text-stone-300 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-stone-700">Paste Your Own Text</h2>
            <textarea
                ref={customTextRef}
                placeholder="Paste any text you want to practice here..."
                className="w-full h-32 p-4 mt-4 bg-stone-100 border-2 border-dashed border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-frog-green"
            />
            <button onClick={() => handleCustomText(customTextRef.current?.value || '')} className="mt-4 px-6 py-3 bg-stone-700 text-white font-bold rounded-lg hover:bg-stone-800 transition-colors">Practice This Text</button>
        </div>
      </div>
    );
  }
  
  const progressPercent = bookContent.length > 0 ? (bookProgress / bookContent.length) * 100 : 0;

  return (
    <>
      <ChapterModal 
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        structure={bookStructure || []}
        onSave={(newStructure) => {
            setBookStructure(newStructure);
            rebuildContentFromStructure(newStructure);
            // Reset progress if content changes
            setBookProgress(0); 
            setUserInput('');
        }}
      />
      <div className="w-full max-w-5xl mx-auto flex flex-col bg-stone-50 rounded-3xl border border-stone-200 shadow-sm overflow-hidden h-[60vh] min-h-[500px]">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <BookOpen className="w-5 h-5 text-frog-500" />
                <div className="w-64">
                    <div className="flex justify-between text-[10px] font-bold text-stone-400 mb-1">
                        <span>Book Progress</span>
                        <span>{progressPercent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-frog-500 transition-all" style={{width: `${progressPercent}%`}}></div>
                    </div>
                </div>
                <span className="text-xs text-stone-400 font-mono">Page {currentPageIndex + 1} / {totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsChapterModalOpen(true)} className="px-3 py-1.5 text-xs font-bold text-stone-500 hover:bg-stone-200 rounded-lg flex items-center gap-1"><Settings className="w-3 h-3"/> Manage Chapters</button>
              <button onClick={resetProgress} className="px-3 py-1.5 text-xs font-bold text-stone-500 hover:bg-stone-200 rounded-lg flex items-center gap-1"><RotateCcw className="w-3 h-3"/> Reset</button>
              <button onClick={clearBook} className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100 rounded-lg flex items-center gap-1"><Trash2 className="w-3 h-3"/> Clear Book</button>
            </div>
        </div>
        
        {/* Typing Area */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar relative" onClick={() => inputRef.current?.focus()}>
          <div className="font-serif text-2xl leading-relaxed tracking-wide whitespace-pre-wrap select-none">
            {renderPageText()}
          </div>
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-default resize-none"
            autoFocus
          />
        </div>
      </div>
    </>
  );
};

export default BookMode;
