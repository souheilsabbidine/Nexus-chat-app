
import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../constants';
import { User, UserRole } from '../types';

interface OwnerPanelProps {
  onClose: () => void;
  user: User;
  onSpawnBot: () => void;
}

const AVAILABLE_ROLES: UserRole[] = [
  'user', 'supporter', 'helper', 'admin', 'manager', 'owner'
];

const OwnerPanel: React.FC<OwnerPanelProps> = ({ onClose, user }) => {
  const [view, setView] = useState<'dashboard' | 'users'>('dashboard');
  const [announcement, setAnnouncement] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadUsers = useCallback(() => {
    const db = JSON.parse(localStorage.getItem('nexus_users_db') || '[]');
    setUsers(db.filter((u: any) => u && typeof u === 'object'));
  }, []);

  useEffect(() => {
    loadUsers();
    const interval = setInterval(loadUsers, 3000);
    return () => clearInterval(interval);
  }, [loadUsers]);

  const updateDbAndSync = (updatedDb: any) => {
    localStorage.setItem('nexus_users_db', JSON.stringify(updatedDb));
    window.dispatchEvent(new Event('storage'));
    loadUsers();
  };

  const handleBroadcast = () => {
    if (!announcement) return;
    alert(`[SYSTEM BROADCAST]: ${announcement}`);
    setAnnouncement('');
  };

  const setRole = (targetId: string, role: UserRole) => {
    const db = JSON.parse(localStorage.getItem('nexus_users_db') || '[]');
    const updatedDb = db.map((u: any) => u.id === targetId ? { ...u, role } : u);
    updateDbAndSync(updatedDb);
    setShowRoleModal(false);
  };

  const deleteUser = (targetId: string) => {
    const db = JSON.parse(localStorage.getItem('nexus_users_db') || '[]');
    const updatedDb = db.filter((u: any) => u.id !== targetId);
    updateDbAndSync(updatedDb);
    setShowDeleteModal(false);
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.id?.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col h-full w-full glass-effect animate-in slide-in-from-right duration-300 relative overflow-hidden bg-[#1a0b14]/80">
      
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-[var(--header-h)] border-b border-white/10 shrink-0 bg-black/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-amber-500/20 rounded-md text-amber-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-[11px] font-black text-white uppercase truncate">God Mode</h2>
            <p className="text-[7px] text-amber-500 font-mono tracking-widest uppercase opacity-60">Architect Access</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 mr-1">
            <button onClick={() => setView('dashboard')} className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all ${view === 'dashboard' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400'}`}>Stats</button>
            <button onClick={() => setView('users')} className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all ${view === 'users' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400'}`}>Users</button>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white transition-colors"><Icons.Close /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3">
        {view === 'dashboard' ? (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                <p className="text-[7px] text-gray-500 font-black uppercase mb-0.5">DB Entries</p>
                <p className="text-sm font-black text-white">{users.length}</p>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                <p className="text-[7px] text-gray-500 font-black uppercase mb-0.5">Core Load</p>
                <p className="text-sm font-black text-white">0.01%</p>
              </div>
            </div>

            <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-3">
              <p className="text-[8px] font-black text-white/50 uppercase tracking-widest mb-2">Global Uplink</p>
              <div className="flex gap-1.5">
                <input value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Signal message..." className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none" />
                <button onClick={handleBroadcast} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase">Send</button>
              </div>
            </div>

            <div className="p-2 border border-red-500/20 rounded-xl space-y-2">
              <p className="text-[7px] font-black text-red-400 uppercase tracking-widest text-center">Critical Systems</p>
              <button onClick={() => { if(confirm('Clear all Dimensional Data?')) {localStorage.clear(); window.location.reload();} }} className="w-full py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 rounded-lg text-[8px] font-bold text-red-500 uppercase transition-all">Format Storage</button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 animate-in fade-in duration-300">
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Find ID..." className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white outline-none" />
            <div className="space-y-1.5 pb-4">
              {filteredUsers.map(u => (
                <div key={u.id} className="bg-white/5 border border-white/5 p-2 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={u.avatar} className="w-7 h-7 rounded-full object-cover" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-black text-white truncate">{u.name}</div>
                      <div className="text-[7px] text-amber-500 font-mono truncate">{u.role?.toUpperCase() || 'USER'} • {u.id}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => { setSelectedUser(u); setShowRoleModal(true); }} className="p-1 bg-white/5 text-amber-400 rounded hover:bg-white/10"><Icons.Settings /></button>
                    <button onClick={() => { setSelectedUser(u); setShowDeleteModal(true); }} className="p-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"><Icons.Trash /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-[200px] bg-[#1e2139] border border-white/10 rounded-xl p-3 shadow-2xl">
            <p className="text-[9px] font-black text-white/50 uppercase mb-2">Role for {selectedUser.name}</p>
            <div className="space-y-0.5 max-h-40 overflow-y-auto custom-scrollbar">
              {AVAILABLE_ROLES.map(role => (
                <button key={role} onClick={() => setRole(selectedUser.id, role)} className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-white/5 text-white rounded transition-colors uppercase font-bold">
                  {role}
                </button>
              ))}
            </div>
            <button onClick={() => setShowRoleModal(false)} className="w-full mt-2 py-1 text-[8px] font-black text-white/30 uppercase">Close</button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-[180px] bg-red-950/20 border border-red-600/40 rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold text-white mb-3 uppercase">Delete Identity?</p>
            <div className="flex gap-1.5">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-1.5 text-[8px] font-black text-white/40 uppercase">No</button>
              <button onClick={() => deleteUser(selectedUser.id)} className="flex-1 py-1.5 bg-red-600 text-white text-[8px] font-black uppercase rounded shadow-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerPanel;
