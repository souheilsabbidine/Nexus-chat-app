
import React, { useState, useMemo, memo } from 'react';
import { Message } from '../types';
import { Icons } from '../constants';

interface MessageBubbleProps {
  message: Message;
  onReplyClick?: (msg: Message) => void;
  onForward?: (msg: Message) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, reaction: string) => void;
  highlight?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onReplyClick, onReact, highlight }) => {
  const isMe = message.sender === 'me';
  const isSystem = message.type === 'system';
  const [menuOpen, setMenuOpen] = useState(false);

  // Search Highlighting
  const content = useMemo(() => {
    if (!highlight || message.type !== 'text') return message.text;
    const parts = message.text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() 
        ? <span key={i} className="bg-yellow-500/50 text-white rounded px-0.5 shadow-[0_0_10px_rgba(234,179,8,0.3)]">{part}</span> 
        : part
    );
  }, [message.text, highlight, message.type]);

  if (isSystem) {
    return (
      <div className="flex justify-center my-4 animate-in fade-in duration-500">
        <div className="bg-[#1e2139]/50 border border-white/5 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-green-500/50 rounded-full animate-pulse"></span>
             {message.text}
           </p>
        </div>
      </div>
    );
  }

  return (
    <div 
        className={`group flex w-full mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}
        onMouseLeave={() => setMenuOpen(false)}
    >
      <div className="relative max-w-[85%] sm:max-w-[70%]">
        
        {/* Interaction Menu */}
        <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-500 hover:text-white ${isMe ? '-left-8' : '-right-8'}`}
        >
            <Icons.More />
        </button>

        {menuOpen && (
            <div className={`absolute -top-12 z-50 flex bg-[#0a0e27] border border-white/10 rounded-full p-1.5 shadow-2xl animate-in zoom-in-95 ${isMe ? 'right-0' : 'left-0'}`}>
                {['👍', '❤️', '😂', '🔥', '👋'].map(emoji => (
                    <button key={emoji} onClick={() => { onReact?.(message.id, emoji); setMenuOpen(false); }} className="p-1 hover:bg-white/10 rounded-full transition-transform hover:scale-125 text-lg">
                        {emoji}
                    </button>
                ))}
            </div>
        )}

        {/* Bubble */}
        <div className={`
            relative px-3 py-2 rounded-2xl shadow-md border transition-all duration-200
            ${isMe 
                ? 'bg-gradient-to-br from-[var(--accent-primary)] to-[#4f46e5] text-white rounded-tr-sm border-transparent' 
                : 'bg-[#1e2139] text-white rounded-tl-sm border-white/5 hover:border-white/10'}
        `}>
            
            {/* Reply Context */}
            {message.replyToText && (
                <div className={`text-[10px] mb-1.5 p-2 rounded-lg border-l-2 opacity-80 truncate cursor-pointer flex flex-col ${isMe ? 'bg-black/20 border-white/30' : 'bg-black/20 border-[var(--accent-primary)]'}`}>
                    <span className="font-bold uppercase text-[8px] opacity-70 mb-0.5">Reply to:</span>
                    {message.replyToText}
                </div>
            )}

            {/* Render Content */}
            {message.type === 'image' ? (
                <div className="mb-1 rounded-lg overflow-hidden bg-black/20 min-w-[200px] min-h-[150px] border border-white/5">
                    <img src={message.text} alt="attachment" className="w-full h-full object-cover" />
                </div>
            ) : message.type === 'audio' ? (
                <div className="flex items-center gap-3 py-2 min-w-[180px]">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                        <Icons.Mic />
                    </div>
                    <div className="flex-1">
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden w-full">
                            <div className="h-full bg-white w-[40%]"></div>
                        </div>
                        <p className="text-[9px] mt-1 opacity-70 font-mono">{message.text.match(/\((.*?)\)/)?.[1] || '0:00'}</p>
                    </div>
                </div>
            ) : (
                <div className="text-[14px] leading-relaxed whitespace-pre-wrap break-words font-medium tracking-wide">
                    {content}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-1.5 mt-1 select-none">
                <span className="text-[9px] opacity-50 font-bold">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isMe && <Icons.MessageStatus status={message.status} />}
            </div>

            {/* Reactions */}
            {message.reaction && (
                <div className={`absolute -bottom-2.5 ${isMe ? 'left-0' : 'right-0'} bg-[#0a0e27] border border-white/20 rounded-full px-1.5 py-0.5 text-[10px] shadow-lg scale-90`}>
                    {message.reaction}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default memo(MessageBubble);
