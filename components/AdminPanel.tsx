
import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../constants';
import { User } from '../types';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const loadUsers = useCallback(() => {
    const storedUsers = JSON.parse(localStorage.getItem('nexus_users_db') || '[]');
    setUsers(storedUsers);
  }, []);

  useEffect(() => {
    loadUsers();
    const intervalUsers = setInterval(loadUsers, 2000);

    const intervalLogs = setInterval(() => {
      const actions = ['ENCRYPTING', 'SYNCING', 'MONITORING', 'HANDSHAKE', 'PACKET_LOG'];
      const nodes = ['NODE_A1', 'NODE_B2', 'CORE_SYS', 'DATA_HUB'];
      const newLog = `[${new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ${actions[Math.floor(Math.random() * actions.length)]} -> ${nodes[Math.floor(Math.random() * nodes.length)]}`;
      setLogs(prev => [newLog, ...prev].slice(0, 15));
    }, 1200);

    return () => {
      clearInterval(intervalUsers);
      clearInterval(intervalLogs);
    };
  }, [loadUsers]);

  const toggleBan = (userId: string) => {
    const db = JSON.parse(localStorage.getItem('nexus_users_db') || '[]');
    const updatedDb = db.map((u: any) => {
      if (u.id === userId) {
        return { ...u, status: u.status === 'banned' ? 'online' : 'banned' };
      }
      return u;
    });
    localStorage.setItem('nexus_users_db', JSON.stringify(updatedDb));
    window.dispatchEvent(new Event('storage'));
    loadUsers();
  };

  return (
    <div className="flex flex-col h-full w-full glass-effect animate-in fade-in duration-300 relative overflow-hidden bg-[#0a0e27]/60">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1 h-[var(--header-h)] border-b border-white/10 bg-black/40 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/20 rounded-md text-blue-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <h2 className="text-[11px] font-black text-white uppercase tracking-wider">Admin Center</h2>
            <p className="text-[7px] text-blue-300 font-mono tracking-widest uppercase opacity-60">Level 5 SysOp</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white"><Icons.Close /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
        {/* Compact Stats */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-black/30 p-2 rounded-lg border border-white/5 text-center">
            <p className="text-[7px] text-gray-500 uppercase font-black mb-0.5">Users</p>
            <p className="text-sm font-black text-white">{users.length}</p>
          </div>
          <div className="bg-black/30 p-2 rounded-lg border border-white/5 text-center">
            <p className="text-[7px] text-gray-500 uppercase font-black mb-0.5">Ping</p>
            <p className="text-sm font-black text-green-400">12ms</p>
          </div>
          <div className="bg-black/30 p-2 rounded-lg border border-white/5 text-center">
            <p className="text-[7px] text-gray-500 uppercase font-black mb-0.5">Status</p>
            <p className="text-sm font-black text-blue-400">OK</p>
          </div>
        </div>

        {/* User Card List */}
        <div className="space-y-1.5 pb-4">
          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest px-1">Management</p>
          {users.map((u) => (
            <div key={u.id} className="bg-white/5 border border-white/5 p-2 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <img src={u.avatar} className="w-7 h-7 rounded-full bg-white/5 object-cover" />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate">{u.name}</div>
                  <div className="text-[7px] opacity-30 font-mono uppercase truncate">{u.id}</div>
                </div>
              </div>
              <button 
                onClick={() => toggleBan(u.id)}
                className={`text-[8px] font-black px-2 py-1 rounded border transition-all ${u.status === 'banned' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}
              >
                {u.status === 'banned' ? 'LIFT' : 'BAN'}
              </button>
            </div>
          ))}
        </div>

        {/* Real-time Logs */}
        <div className="bg-black/40 rounded-lg p-2 font-mono text-[8px] h-24 overflow-hidden border border-white/5 flex flex-col shadow-inner">
          <p className="text-[7px] font-black text-white/20 mb-1 tracking-widest uppercase">System Feed</p>
          <div className="flex-1 overflow-hidden relative opacity-50">
             <div className="absolute bottom-0 w-full space-y-0.5">
               {logs.map((log, i) => (
                 <div key={i} className="truncate border-l-2 border-blue-500/20 pl-1">{log}</div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
