
import React, { useState } from 'react';
import { Chat, User } from '../types';
import { Icons } from '../constants';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onChatSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user: User;
  onOpenPanel: (panel: 'admin' | 'owner' | 'settings') => void;
  onOpenAddContact: () => void;
  onStartChat: (user: User) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  chats, activeChatId, onChatSelect, searchQuery, onSearchChange,
  user, onOpenPanel, onOpenAddContact, onStartChat
}) => {
  const [isCopied, setIsCopied] = useState(false);

  // Filter & Sort Chats
  const displayChats = chats
    .filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        chat.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));

  // Global Search (Mock DB Access - purely for display in sidebar if needed, mainly handled by Add Modal now)
  // We only show global results if explicitly searching and no local chats match, or to encourage exploration.
  const globalUsers = searchQuery ? (() => {
      try {
        const db: User[] = JSON.parse(localStorage.getItem('nexus_users_db') || '[]');
        return db.filter(u => {
             if (u.id === user.id) return false;
             // Don't show if already in chat list
             if (chats.some(c => c.id === u.id)) return false;
             
             if (u.visibility === 'owner-only' && user.role !== 'owner') return false;
             if (u.visibility === 'hidden') return false;
             
             return u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.toLowerCase().includes(searchQuery.toLowerCase());
        }).slice(0, 3);
      } catch { return []; }
  })() : [];

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(user.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isAdmin = user.role === 'admin' || user.role === 'head_admin';
  const isOwner = user.role === 'owner';

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0e27]/40 backdrop-blur-3xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onOpenPanel('settings')}>
          <div className="relative">
             <img src={user.avatar} className="w-12 h-12 rounded-full border-2 border-[var(--accent-primary)] group-hover:scale-105 transition-transform object-cover" />
             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#131829]"></div>
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="font-black text-sm text-white truncate max-w-[140px] uppercase tracking-tight">{user.name}</p>
            <div onClick={handleCopyId} className="group/id cursor-pointer flex items-center gap-1">
                <p className={`text-[9px] uppercase font-mono tracking-tighter transition-colors ${isCopied ? 'text-green-400' : 'opacity-40 group-hover/id:opacity-100 group-hover/id:text-[var(--accent-primary)]'}`}>
                    {isCopied ? 'COPIED' : user.id}
                </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button onClick={() => onOpenPanel('admin')} className="w-11 h-11 flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 active:scale-95 transition-all shadow-lg hover:bg-blue-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </button>
          )}
          {isOwner && (
            <button onClick={() => onOpenPanel('owner')} className="w-11 h-11 flex items-center justify-center bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 active:scale-95 transition-all shadow-lg hover:bg-amber-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </button>
          )}
          <button onClick={onOpenAddContact} className="w-11 h-11 flex items-center justify-center bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-2xl border border-[var(--accent-primary)]/20 active:scale-90 transition-all shadow-lg hover:bg-[var(--accent-primary)]/20">
            <Icons.NewChat />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-6 shrink-0">
        <div className="flex items-center bg-white/5 rounded-[1.8rem] px-6 py-4 border border-white/5 focus-within:border-[var(--accent-primary)]/50 transition-all shadow-inner">
          <span className="opacity-30"><Icons.Search /></span>
          <input 
            placeholder="Search dimensional log..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent border-none outline-none text-[13px] w-full ml-4 text-white placeholder-white/20 font-bold"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar pb-10">
        {displayChats.map((chat) => (
          <div 
            key={chat.id} 
            onClick={() => onChatSelect(chat.id)} 
            className={`flex items-center p-4 rounded-[2rem] cursor-pointer transition-all duration-300 group
                ${activeChatId === chat.id 
                    ? 'bg-white/10 shadow-2xl border border-white/10' 
                    : 'hover:bg-white/5 active:scale-95 border border-transparent'}`}
          >
            <div className="relative shrink-0">
              {chat.isSelf ? (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white shadow-xl border border-white/10"><Icons.Star filled /></div>
              ) : (
                <img src={chat.avatar} className="w-12 h-12 rounded-full object-cover bg-white/5 border border-white/10 shadow-lg" />
              )}
              {chat.isOnline && !chat.isSelf && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-[2px] border-[#0a0e27] shadow-sm"></div>}
            </div>
            
            <div className="ml-4 flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <h3 className="text-[14px] font-black truncate text-white tracking-tight uppercase group-hover:text-[var(--accent-primary)] transition-colors">{chat.name}</h3>
                <span className="text-[9px] opacity-30 font-bold uppercase tracking-tighter">
                  {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className={`text-[12px] truncate font-medium ${activeChatId === chat.id ? 'text-white/80' : 'text-white/40'}`}>
                    {chat.lastMessage || 'Link Established'}
                </p>
                {chat.unreadCount > 0 && (
                  <span className="bg-[var(--accent-primary)] text-white text-[9px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-[0_0_10px_var(--accent-primary)] animate-pulse ml-2">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Global Results Section (Optional Discovery) */}
        {searchQuery && globalUsers.length > 0 && (
          <div className="pt-4 animate-in fade-in">
             <div className="px-4 py-2 text-[9px] font-bold text-white/30 uppercase tracking-widest border-t border-white/5">Global Discovery</div>
             {globalUsers.map(u => (
                <div key={u.id} onClick={() => onStartChat(u)} className="flex items-center p-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer opacity-80 hover:opacity-100">
                    <img src={u.avatar} className="w-10 h-10 rounded-full bg-white/5 object-cover grayscale" />
                    <div className="ml-3">
                        <div className="text-[12px] font-bold text-white">{u.name}</div>
                        <div className="text-[8px] opacity-40 uppercase">{u.id}</div>
                    </div>
                </div>
             ))}
          </div>
        )}

        {displayChats.length === 0 && globalUsers.length === 0 && (
          <div className="py-24 text-center opacity-20">
            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-white">No Signals</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
