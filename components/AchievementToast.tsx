
import React, { useEffect, useState } from 'react';
import { NotificationItem } from '../types';
import { Award, X, Music } from 'lucide-react';

interface AchievementToastProps {
  notifications: NotificationItem[];
  onClear: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ notifications, onClear }) => {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<NotificationItem | null>(null);
  
  // Get first notification
  const nextNotification = notifications[0];

  useEffect(() => {
    // If we have a notification in queue and aren't currently showing one (or it matches current to keep it alive?)
    // Actually simpler: if queue has items, pick head.
    if (nextNotification) {
      setCurrent(nextNotification);
      setVisible(true);
      
      const timer = setTimeout(() => {
        setVisible(false);
        // Wait for fade out animation before clearing data from queue
        setTimeout(() => {
            onClear();
            setCurrent(null);
        }, 500);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [nextNotification, onClear]);

  if (!current || !visible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[150] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-stone-900 text-white pl-4 pr-10 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-stone-700 min-w-[300px] relative">
         {/* Icon Circle */}
         <div className={`p-2 rounded-full text-stone-900 shadow-lg ${current.type === 'UNLOCK' ? 'bg-frog-green' : 'bg-white'}`}>
            {current.icon || <Award className="w-5 h-5" />}
         </div>
         <div>
            <div className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${current.type === 'UNLOCK' ? 'text-frog-green' : 'text-yellow-400'}`}>
               {current.type === 'UNLOCK' ? 'New Unlock' : 'Achievement'}
            </div>
            <div className="font-bold text-sm">
               {current.title}
            </div>
         </div>
         <button 
           onClick={() => setVisible(false)}
           className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-stone-500 hover:text-white transition-colors"
         >
           <X className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
};

export default AchievementToast;
