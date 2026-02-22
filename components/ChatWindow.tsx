
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Chat, Message } from '../types';
import { Icons } from '../constants';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  chat: Chat | null;
  onSendMessage: (text: string, replyTo?: Message, type?: 'text' | 'image' | 'audio', metadata?: any) => void;
  onDeleteMessage: (messageId: string) => void;
  onReact: (messageId: string, reaction: string) => void;
  onMarkAsRead: (chatId: string) => void;
  onForward: (msg: Message) => void;
  onCall: (type: 'video' | 'audio') => void;
  isTyping?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
    chat, onSendMessage, onDeleteMessage, onReact, onMarkAsRead, onForward, onCall, isTyping 
}) => {
  const [text, setText] = useState('');
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  
  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  
  // Refs
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-Scroll to Bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat?.messages.length, isTyping]);

  // Mark Read on Open
  useEffect(() => {
    if (chat) onMarkAsRead(chat.id);
  }, [chat?.id, chat?.messages.length]);

  // Recording Timer Logic
  useEffect(() => {
      if (isRecording) {
          setRecordSeconds(0);
          timerRef.current = setInterval(() => {
              setRecordSeconds(s => s + 1);
          }, 1000);
      } else {
          if (timerRef.current) clearInterval(timerRef.current);
          setRecordSeconds(0);
      }
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const filteredMessages = useMemo(() => {
    if (!chat) return [];
    if (!searchQuery) return chat.messages;
    const lower = searchQuery.toLowerCase();
    return chat.messages.filter(m => m.text.toLowerCase().includes(lower));
  }, [chat?.messages, searchQuery]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text, replyTarget || undefined, 'text');
    setText('');
    setReplyTarget(null);
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop and Send
      setIsRecording(false);
      onSendMessage(`Voice Message (${formatTime(recordSeconds)})`, replyTarget || undefined, 'audio');
    } else {
      // Start
      setIsRecording(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        // Basic size check mock
        if (res.length > 3000000) { 
            alert("Upload failed: File too large for quantum channel."); 
            return;
        }
        onSendMessage(res, replyTarget || undefined, 'image');
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
  };

  if (!chat) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 text-center opacity-30 animate-in fade-in duration-500">
        <div className="w-32 h-32 mb-6 rounded-full border border-dashed border-white/20 flex items-center justify-center bg-white/5 animate-pulse">
            <span className="text-4xl">📡</span>
        </div>
        <h2 className="text-xl font-black uppercase tracking-widest text-white mb-2">Nexus Hub</h2>
        <p className="text-[10px] uppercase font-bold text-gray-500 max-w-[200px] leading-relaxed">
            Select a frequency to initialize secure communication.
        </p>
      </div>
    );
  }

  const isArchitect = chat.id === 'nexus-architect';

  return (
    <div className="flex flex-col h-full flex-1 relative overflow-hidden bg-black/5 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 h-[60px] border-b border-white/10 shrink-0 bg-[#0a0e27]/60 backdrop-blur-xl z-20">
        <div className="flex items-center min-w-0 pl-8 md:pl-0 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="relative shrink-0">
             {chat.isSelf ? (
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white shadow-lg">
                     <Icons.Star filled />
                 </div>
             ) : (
                 <img src={chat.avatar} className="w-10 h-10 rounded-full border border-white/10 object-cover" />
             )}
          </div>
          <div className="ml-3 min-w-0">
             <div className="flex items-center gap-2">
                 <h2 className="text-[14px] font-bold text-white truncate">{chat.name}</h2>
                 {isArchitect && <span className="bg-amber-500/20 text-amber-500 text-[8px] px-1 rounded font-black uppercase">SYS</span>}
             </div>
             <p className="text-[10px] text-gray-400 font-medium truncate">
                {isTyping ? <span className="text-[var(--accent-primary)] font-bold animate-pulse">Thinking...</span> : (chat.isOnline ? 'Online' : 'Offline')}
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-white/50">
           <button onClick={() => onCall('video')} className="p-2.5 hover:bg-white/10 rounded-full hover:text-white transition-colors"><Icons.VideoCall /></button>
           <button onClick={() => onCall('audio')} className="p-2.5 hover:bg-white/10 rounded-full hover:text-white transition-colors"><Icons.AudioCall /></button>
           <div className="w-px h-4 bg-white/10 mx-1"></div>
           <button onClick={() => setIsSearchOpen(!isSearchOpen)} className={`p-2.5 hover:bg-white/10 rounded-full hover:text-white transition-colors ${isSearchOpen ? 'text-[var(--accent-primary)]' : ''}`}><Icons.Search /></button>
        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
         <div className="bg-black/40 border-b border-white/10 p-2 animate-in slide-in-from-top-2">
             <input 
               autoFocus
               placeholder="Search transcript..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[var(--accent-primary)] transition-colors"
             />
         </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar relative">
         {filteredMessages.map((msg, i) => {
             const showDate = i === 0 || (msg.timestamp - filteredMessages[i-1].timestamp > 1000 * 60 * 60);
             return (
                 <React.Fragment key={msg.id}>
                    {showDate && (
                        <div className="flex justify-center my-4 opacity-40">
                            <span className="bg-black/20 text-[9px] font-bold uppercase tracking-widest text-white px-3 py-1 rounded-full border border-white/5 shadow-sm">
                                {new Date(msg.timestamp).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                    <MessageBubble 
                        message={msg} 
                        onReplyClick={setReplyTarget} 
                        onForward={onForward} 
                        onDelete={onDeleteMessage} 
                        onReact={onReact} 
                        highlight={searchQuery} 
                    />
                 </React.Fragment>
             );
         })}
         {isTyping && (
             <div className="flex items-center gap-2 px-2 py-2 opacity-50 animate-pulse">
                 <div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full"></div>
                 <div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animation-delay-200"></div>
                 <div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animation-delay-400"></div>
             </div>
         )}
         <div ref={scrollRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-3 bg-[#0a0e27]/60 backdrop-blur-2xl border-t border-white/5">
         
         {replyTarget && (
             <div className="mb-2 bg-black/40 rounded-xl p-2 flex justify-between items-center border-l-4 border-[var(--accent-primary)] animate-in slide-in-from-bottom-2">
                 <div className="overflow-hidden min-w-0">
                     <p className="text-[9px] font-bold text-[var(--accent-primary)] uppercase mb-0.5">Replying to {replyTarget.sender === 'me' ? 'Yourself' : chat.name}</p>
                     <p className="text-[11px] text-gray-400 truncate">{replyTarget.text}</p>
                 </div>
                 <button onClick={() => setReplyTarget(null)} className="p-1 hover:bg-white/10 rounded-full text-gray-500 hover:text-white shrink-0"><Icons.Close /></button>
             </div>
         )}

         <div className="flex items-end gap-2">
             <div className="flex-1 bg-white/5 rounded-[24px] border border-white/5 flex items-center p-1.5 focus-within:border-[var(--accent-primary)]/50 focus-within:bg-white/10 transition-all shadow-inner relative">
                 
                 {isRecording ? (
                     <div className="flex-1 flex items-center gap-3 px-3 py-2 text-red-400 animate-pulse">
                         <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_red]"></div>
                         <span className="font-mono font-bold text-sm">{formatTime(recordSeconds)}</span>
                         <span className="text-[10px] uppercase font-bold tracking-widest opacity-50 flex-1 text-center">Recording Audio...</span>
                     </div>
                 ) : (
                     <>
                        <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"><Icons.Emoji /></button>
                        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                        <button onClick={() => fileRef.current?.click()} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"><Icons.Attach /></button>
                        <textarea
                            rows={1}
                            placeholder={isArchitect ? "Input command..." : "Type a message..."}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent border-none outline-none text-white text-[14px] px-2 py-2 max-h-[100px] resize-none custom-scrollbar placeholder-white/20 font-medium"
                        />
                     </>
                 )}
             </div>

             <button 
                onClick={text.trim() ? handleSend : toggleRecording}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95
                    ${isRecording ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 
                      text.trim() ? 'bg-[var(--accent-primary)] text-white' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'}`}
             >
                 {isRecording ? <div className="w-3 h-3 bg-current rounded-sm"></div> : text.trim() ? <Icons.Send /> : <Icons.Mic />}
             </button>
         </div>
         <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
};

export default ChatWindow;
