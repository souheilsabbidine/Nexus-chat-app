import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import CallOverlay from './components/CallOverlay';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import OwnerPanel from './components/OwnerPanel';
import SettingsModal from './components/SettingsModal';
import { Chat, Message, User } from './types';
import { getGeminiResponse } from './services/geminiService';
import { Icons } from './constants';

const ARCHITECT_BOT_ID = 'nexus-architect';

/**
 * NexusDB: Reactive Data Layer
 * Handles all persistence and notifies components of changes instantly.
 */
class NexusDB {
  private static EVENTS = new EventTarget();

  static subscribe(callback: () => void) {
    const handler = () => callback();
    this.EVENTS.addEventListener('db_update', handler);
    return () => this.EVENTS.removeEventListener('db_update', handler);
  }

  private static notify() {
    this.EVENTS.dispatchEvent(new Event('db_update'));
  }

  // User Operations
  static getUser(): User | null {
    try {
      const u = localStorage.getItem('nexus_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  }

  static saveUser(user: User) {
    localStorage.setItem('nexus_user', JSON.stringify(user));
    this.notify();
  }

  // Chat Operations
  static getChats(userId: string): Chat[] {
    try {
      const raw = localStorage.getItem(`nexus_chats_${userId}`);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  static saveChats(userId: string, chats: Chat[], notify = true) {
    localStorage.setItem(`nexus_chats_${userId}`, JSON.stringify(chats));
    if (notify) this.notify();
  }

  // Global Directory
  static getDirectory(): User[] {
    try {
      return JSON.parse(localStorage.getItem('nexus_users_db') || '[]');
    } catch { return []; }
  }
}

const App: React.FC = () => {
  // ----------------------------------------------------------------------
  // State
  // ----------------------------------------------------------------------
  const [user, setUser] = useState<User | null>(NexusDB.getUser);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  // UI State
  const [activePanel, setActivePanel] = useState<'admin' | 'owner' | 'settings' | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCall, setActiveCall] = useState<{chatId: string, type: 'video' | 'audio'} | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  // Transient
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addQuery, setAddQuery] = useState('');
  const [directoryResults, setDirectoryResults] = useState<User[]>([]);

  // Refs for async context
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  // ----------------------------------------------------------------------
  // Core Engine
  // ----------------------------------------------------------------------

  const refreshData = useCallback(() => {
    if (!userRef.current) return;
    const freshChats = NexusDB.getChats(userRef.current.id);
    setChats(prev => {
        // Simple diff to avoid re-render if identical stringified
        // In a real app, use deep equality or immutable structures
        if (JSON.stringify(prev) === JSON.stringify(freshChats)) return prev;
        return freshChats;
    });
  }, []);

  // Initialization & Subscription
  useEffect(() => {
    if (!user) return;
    
    // Initial fetch
    refreshData();

    // Subscribe to internal DB events (Instant updates from same tab)
    const unsubscribe = NexusDB.subscribe(refreshData);

    // Subscribe to storage events (Updates from other tabs)
    const handleStorage = (e: StorageEvent) => {
        if (e.key === `nexus_chats_${user.id}` || e.key === 'nexus_users_db') {
            refreshData();
        }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
        unsubscribe();
        window.removeEventListener('storage', handleStorage);
    };
  }, [user, refreshData]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ----------------------------------------------------------------------
  // Actions
  // ----------------------------------------------------------------------

  const handleLogin = (newUser: User) => {
    NexusDB.saveUser(newUser);
    setUser(newUser);
  };

  const startChat = (targetUser: User) => {
    if (!userRef.current) return;
    
    const currentChats = NexusDB.getChats(userRef.current.id);
    if (currentChats.some(c => c.id === targetUser.id)) {
        setActiveChatId(targetUser.id);
        setShowAddModal(false);
        return;
    }

    const newChat: Chat = {
        id: targetUser.id,
        name: targetUser.name,
        avatar: targetUser.avatar,
        unreadCount: 0,
        isOnline: true,
        messages: [{
            id: `sys-${Date.now()}`,
            text: 'SECURE CHANNEL ESTABLISHED.',
            timestamp: Date.now(),
            sender: 'them',
            status: 'read',
            type: 'system'
        }],
        lastMessage: '',
        lastMessageTime: Date.now()
    };

    NexusDB.saveChats(userRef.current.id, [newChat, ...currentChats]);
    setActiveChatId(targetUser.id);
    setShowAddModal(false);
    setAddQuery('');
  };

  const sendMessage = async (text: string, replyTo?: Message, type: 'text' | 'image' | 'audio' | 'system' = 'text', metadata?: any) => {
    if (!activeChatId || !userRef.current) return;

    const timestamp = Date.now();
    const msgId = `msg-${timestamp}-${Math.random().toString(36).substring(2, 9)}`;
    
    const message: Message = {
        id: msgId,
        text,
        timestamp,
        sender: 'me',
        status: 'sent',
        replyToId: replyTo?.id,
        replyToText: replyTo?.text,
        type,
        metadata
    };

    const preview = type === 'image' ? '📸 Image' : type === 'audio' ? '🎤 Voice Message' : text;

    // 1. Local Update
    const myChats = NexusDB.getChats(userRef.current.id);
    const updatedMyChats = myChats.map(c => c.id === activeChatId ? {
        ...c,
        messages: [...c.messages, message],
        lastMessage: preview,
        lastMessageTime: timestamp,
        unreadCount: 0
    } : c);

    // Sort to top
    const chatIndex = updatedMyChats.findIndex(c => c.id === activeChatId);
    if (chatIndex > 0) {
        updatedMyChats.unshift(updatedMyChats.splice(chatIndex, 1)[0]);
    }
    
    NexusDB.saveChats(userRef.current.id, updatedMyChats);

    // 2. Remote Delivery (Simulated)
    const chatConfig = myChats.find(c => c.id === activeChatId);
    if (chatConfig && !chatConfig.isAI && activeChatId !== userRef.current.id) {
        try {
            const theirChats = NexusDB.getChats(activeChatId);
            const theirChatIndex = theirChats.findIndex(c => c.id === userRef.current!.id);
            const incoming: Message = { ...message, sender: 'them', status: 'delivered' };

            if (theirChatIndex >= 0) {
                theirChats[theirChatIndex].messages.push(incoming);
                theirChats[theirChatIndex].lastMessage = preview;
                theirChats[theirChatIndex].lastMessageTime = timestamp;
                theirChats[theirChatIndex].unreadCount++;
                theirChats.unshift(theirChats.splice(theirChatIndex, 1)[0]);
            } else {
                // New Chat for them
                theirChats.unshift({
                    id: userRef.current.id,
                    name: userRef.current.name,
                    avatar: userRef.current.avatar,
                    unreadCount: 1,
                    isOnline: true,
                    messages: [{ id: `sys-init-${Date.now()}`, text: 'SECURE CHANNEL ESTABLISHED.', timestamp: Date.now(), sender: 'them', status: 'read', type: 'system' }, incoming],
                    lastMessage: preview,
                    lastMessageTime: timestamp
                });
            }
            NexusDB.saveChats(activeChatId, theirChats, false); // No local notify needed
        } catch (e) { console.error("Delivery Error", e); }
    }

    // 3. AI Response
    if (chatConfig?.isAI) {
        setIsTyping(true);
        try {
            const history = chatConfig.messages.slice(-10).map(m => ({
                role: m.sender === 'me' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

            const isArchitect = activeChatId === ARCHITECT_BOT_ID;
            const systemPrompt = isArchitect 
                ? "You are The Architect. Omniscient, cryptic, helpful. Use short, impactful sentences." 
                : "You are a helpful assistant.";

            const aiText = await getGeminiResponse(type === 'image' ? '[Image]' : text, history, systemPrompt);
            
            const aiMsg: Message = {
                id: `ai-${Date.now()}`,
                text: aiText,
                timestamp: Date.now(),
                sender: 'them',
                status: 'read'
            };

            // Reload to get latest state (concurrency safety)
            const freshChats = NexusDB.getChats(userRef.current.id);
            const targetChat = freshChats.find(c => c.id === activeChatId);
            if (targetChat) {
                targetChat.messages.push(aiMsg);
                targetChat.lastMessage = aiText;
                targetChat.lastMessageTime = aiMsg.timestamp;
                // Bump
                const idx = freshChats.findIndex(c => c.id === activeChatId);
                if (idx > 0) freshChats.unshift(freshChats.splice(idx, 1)[0]);
                NexusDB.saveChats(userRef.current.id, freshChats);
            }
        } finally {
            setIsTyping(false);
        }
    }
  };

  const deleteMessage = (msgId: string) => {
    if (!activeChatId || !userRef.current) return;
    const chats = NexusDB.getChats(userRef.current.id);
    const updated = chats.map(c => {
        if (c.id === activeChatId) {
            const msgs = c.messages.filter(m => m.id !== msgId);
            const last = msgs[msgs.length - 1];
            return {
                ...c,
                messages: msgs,
                lastMessage: last ? (last.type === 'image' ? '📸 Image' : last.text) : '',
                lastMessageTime: last?.timestamp || c.lastMessageTime
            };
        }
        return c;
    });
    NexusDB.saveChats(userRef.current.id, updated);
  };

  // ----------------------------------------------------------------------
  // Render Helpers
  // ----------------------------------------------------------------------

  useEffect(() => {
    if (!showAddModal) { setDirectoryResults([]); return; }
    const db = NexusDB.getDirectory();
    const q = addQuery.trim().toLowerCase();
    
    setDirectoryResults(db.filter(u => {
        if (!user || u.id === user.id) return false;
        if (u.visibility === 'hidden') return false;
        if (u.visibility === 'owner-only' && user.role !== 'owner') return false;
        return u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
    }));
  }, [showAddModal, addQuery, user]);

  if (!user) return <Login onLogin={handleLogin} />;

  const currentChat = chats.find(c => c.id === activeChatId) || null;
  const showContent = !!activeChatId || !!activePanel;

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden p-0 sm:p-4 lg:p-6 relative bg-black font-inter">
      
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-3
          ${notification.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">{notification.message}</span>
        </div>
      )}

      {/* Call UI */}
      {activeCall && currentChat && (
        <CallOverlay 
          chatName={currentChat.name} 
          chatAvatar={currentChat.avatar} 
          isVideo={activeCall.type === 'video'}
          onEndCall={() => setActiveCall(null)}
        />
      )}

      {/* Modals */}
      {activePanel === 'settings' && (
        <SettingsModal 
            user={user} 
            onClose={() => setActivePanel(null)} 
            onUpdateUser={handleLogin} 
            onThemeChange={(t) => handleLogin({...user, theme: t})} 
        />
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
           <div className="w-full max-w-sm bg-[#131829] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-5 border-b border-white/10 bg-black/20 flex items-center gap-3">
                 <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white transition-colors">
                    <Icons.Close />
                 </button>
                 <div>
                    <h3 className="text-[14px] font-bold text-white">New Transmission</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{directoryResults.length} targets found</p>
                 </div>
              </div>
              
              <div className="p-3">
                <div className="bg-white/5 rounded-xl flex items-center px-3 border border-white/5 focus-within:border-[var(--accent-primary)] transition-all">
                  <span className="opacity-30"><Icons.Search /></span>
                  <input 
                    autoFocus placeholder="Search ID or Name..." value={addQuery} onChange={(e) => setAddQuery(e.target.value)}
                    className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder-white/20"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                 {directoryResults.length === 0 ? (
                    <div className="py-12 text-center opacity-30">
                       <p className="text-[11px] font-medium text-white">No results in range</p>
                    </div>
                 ) : directoryResults.map(u => (
                    <button key={u.id} onClick={() => startChat(u)} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group text-left">
                        <img src={u.avatar} className="w-10 h-10 rounded-full bg-white/5 object-cover border border-white/10" />
                        <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-bold text-white truncate group-hover:text-[var(--accent-primary)] transition-colors">{u.name}</div>
                            <div className="text-[9px] opacity-40 font-mono tracking-tighter uppercase">{u.id}</div>
                        </div>
                    </button>
                 ))}
              </div>
              <div className="p-4 bg-black/20 text-center border-t border-white/5">
                 <p className="text-[9px] text-gray-500 uppercase tracking-widest">My ID: <span className="text-white font-mono">{user.id}</span></p>
              </div>
           </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex w-full h-full glass-effect rounded-none sm:rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative border border-white/5">
        
        {/* Sidebar */}
        <div className={`${showContent ? 'hidden' : 'flex'} md:flex h-full w-full md:w-[380px] shrink-0 border-r border-white/10 z-10 bg-[#0a0e27]/40`}>
           <Sidebar 
             chats={chats} 
             activeChatId={activeChatId} 
             onChatSelect={(id) => { setActiveChatId(id); setActivePanel(null); }} 
             searchQuery={searchQuery} 
             onSearchChange={setSearchQuery} 
             user={user} 
             onOpenPanel={setActivePanel} 
             onOpenAddContact={() => setShowAddModal(true)} 
             onStartChat={startChat}
           />
        </div>
        
        {/* Chat / Panel View */}
        <div className={`${showContent ? 'flex' : 'hidden'} md:flex flex-1 h-full relative bg-[#0a0e27]/20`}>
          {activePanel === 'admin' ? <AdminPanel onClose={() => setActivePanel(null)} /> : 
           activePanel === 'owner' ? <OwnerPanel onClose={() => setActivePanel(null)} user={user} onSpawnBot={() => {}} /> : 
           <ChatWindow 
              chat={currentChat} 
              onSendMessage={sendMessage} 
              onDeleteMessage={deleteMessage} 
              onReact={(mid, r) => sendMessage('', undefined, 'system', { action: 'react', msgId: mid, emoji: r })} 
              onMarkAsRead={() => { /* Handled via view logic implicitly */ }} 
              onForward={() => showToast('Encrypted forwarding not available.', 'info')} 
              isTyping={isTyping} 
              onCall={(type) => activeChatId && setActiveCall({ chatId: activeChatId, type })}
           />}
          
          {/* Mobile Navigation */}
          {showContent && (
            <button onClick={() => { setActiveChatId(null); setActivePanel(null); }} className="absolute top-5 left-5 md:hidden z-[100] bg-black/60 backdrop-blur-2xl p-3 rounded-full border border-white/10 text-white shadow-xl">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;