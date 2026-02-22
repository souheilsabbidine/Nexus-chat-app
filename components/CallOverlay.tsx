
import React, { useEffect, useState } from 'react';
import { Icons } from '../constants';

interface CallOverlayProps {
  chatName: string;
  chatAvatar: string;
  isVideo: boolean;
  onEndCall: () => void;
}

const CallOverlay: React.FC<CallOverlayProps> = ({ chatName, chatAvatar, isVideo, onEndCall }) => {
  const [status, setStatus] = useState('Calling...');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('Connected');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status === 'Connected') {
      const interval = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-black/90 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="flex flex-col items-center mb-12">
        <div className="relative mb-8">
           <img src={chatAvatar} className="w-32 h-32 rounded-full border-4 border-white/10 shadow-[0_0_50px_rgba(99,102,241,0.3)] animate-pulse object-cover" />
           {isVideo && (
             <div className="absolute bottom-0 right-0 p-3 bg-[var(--accent-primary)] rounded-full border-4 border-black text-white">
                <Icons.VideoCall />
             </div>
           )}
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight mb-2">{chatName}</h2>
        <p className={`text-sm font-bold uppercase tracking-widest ${status === 'Connected' ? 'text-green-400' : 'text-[var(--accent-secondary)] animate-pulse'}`}>
          {status === 'Connected' ? formatTime(duration) : status}
        </p>
      </div>

      <div className="flex items-center gap-8">
        <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md">
           <Icons.Mic />
        </button>
        <button 
          onClick={onEndCall}
          className="p-5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all transform hover:scale-110 active:scale-95"
        >
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"></path></svg>
        </button>
        {isVideo && (
            <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md">
               <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8a2 2 0 0 0-2-2zm0 14H3V8h18v12zM9 12c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm11 0c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"></path></svg>
            </button>
        )}
      </div>
      <p className="mt-8 text-[10px] text-white/20 font-mono uppercase tracking-[0.2em]">End-to-End Encrypted</p>
    </div>
  );
};

export default CallOverlay;
