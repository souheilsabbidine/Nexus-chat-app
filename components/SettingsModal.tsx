
import React, { useState } from 'react';
import { User, ThemeType, SavedContact } from '../types';
import { Icons } from '../constants';

interface SettingsModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onThemeChange: (theme: ThemeType) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ user, onClose, onUpdateUser, onThemeChange }) => {
  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'privacy' | 'contacts'>('account');
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  
  // Custom ID State
  const [isEditingId, setIsEditingId] = useState(false);
  const [customId, setCustomId] = useState(user.id);
  const [idError, setIdError] = useState('');
  
  // Custom Theme State
  const [customColor, setCustomColor] = useState(user.customColor || '#ec4899');
  const [liquidGlass, setLiquidGlass] = useState(user.liquidGlass || false);

  // Contacts State
  const [contacts, setContacts] = useState<SavedContact[]>(user.savedContacts || []);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editingContactName, setEditingContactName] = useState('');

  // Settings state
  const [notifications, setNotifications] = useState(user.settings?.notifications ?? true);
  const [sound, setSound] = useState(user.settings?.sound ?? true);

  // Cooldown Logic based on Role
  let cooldownDays = 30; // Default User
  if (user.role === 'owner') cooldownDays = 0;
  else if (user.role === 'admin') cooldownDays = 10;

  const daysSinceLastChange = user.lastIdChange 
    ? Math.floor((Date.now() - user.lastIdChange) / (1000 * 60 * 60 * 24)) 
    : cooldownDays + 1; // Default to allow if not set
  
  const canChangeId = daysSinceLastChange >= cooldownDays;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to disconnect from the Nexus?')) {
      localStorage.removeItem('nexus_user');
      window.location.reload();
    }
  };

  const handleIdSave = () => {
    setIdError('');
    const trimmedId = customId.trim(); 
    const finalIdCheck = user.role === 'owner' ? trimmedId : trimmedId.toUpperCase();

    if (finalIdCheck === user.id) {
        setIsEditingId(false);
        return;
    }

    if (user.role !== 'owner') {
        if (finalIdCheck.length < 5 || finalIdCheck.length > 15) {
            setIdError('ID must be 5-15 characters.');
            return;
        }

        if (!/^[a-zA-Z0-9]+$/.test(finalIdCheck)) {
            setIdError('Alphanumeric only (A-Z, 0-9). No symbols.');
            return;
        }
    } else {
        if (finalIdCheck.length === 0) {
            setIdError('ID cannot be empty.');
            return;
        }
    }

    // Check availability
    const db = JSON.parse(localStorage.getItem('nexus_users_db') || '[]');
    const taken = db.some((u: User) => u.id === finalIdCheck && u.id !== user.id);
    if (taken) {
        setIdError('ID already taken.');
        return;
    }

    setCustomId(finalIdCheck);
    setIsEditingId(false);
  };

  const handleUpdateContactName = (contactId: string) => {
    if (!editingContactName.trim()) return;
    setContacts(prev => prev.map(c => 
        c.userId === contactId ? { ...c, displayName: editingContactName } : c
    ));
    setEditingContactId(null);
  };

  const handleDeleteContact = (contactId: string) => {
    if (window.confirm('Remove this user from your contact list?')) {
        setContacts(prev => prev.filter(c => c.userId !== contactId));
    }
  };

  const handleSave = () => {
    // Basic validation for ID if still in editing mode or changed
    let finalId = user.id;
    if (customId !== user.id) {
        const trimmedId = customId.trim();
        const finalIdCheck = user.role === 'owner' ? trimmedId : trimmedId.toUpperCase();
        
        let isValid = false;
        if (user.role === 'owner') {
             isValid = finalIdCheck.length > 0;
        } else {
             isValid = canChangeId && finalIdCheck.length >= 5 && finalIdCheck.length <= 15 && /^[a-zA-Z0-9]+$/.test(finalIdCheck);
        }

        if (isValid) {
            const db = JSON.parse(localStorage.getItem('nexus_users_db') || '[]');
            const taken = db.some((u: User) => u.id === finalIdCheck && u.id !== user.id);
            if (!taken) {
                finalId = finalIdCheck;
            }
        }
    }

    const updatedUser: User = {
      ...user,
      id: finalId,
      name,
      bio,
      customColor: user.role === 'owner' && user.theme === 'custom' ? customColor : user.customColor,
      liquidGlass,
      lastIdChange: finalId !== user.id ? Date.now() : user.lastIdChange,
      savedContacts: contacts,
      settings: {
        notifications,
        sound,
        readReceipts: user.settings?.readReceipts ?? true
      }
    };

    // Update DB with new ID if changed
    if (finalId !== user.id) {
         const db = JSON.parse(localStorage.getItem('nexus_users_db') || '[]');
         const newDb = db.map((u: User) => u.id === user.id ? updatedUser : u);
         localStorage.setItem('nexus_users_db', JSON.stringify(newDb));
         
         const chatKey = `nexus_chats_${user.id}`;
         const chats = localStorage.getItem(chatKey);
         if (chats) {
             localStorage.setItem(`nexus_chats_${finalId}`, chats);
             localStorage.removeItem(chatKey);
         }
    }

    onUpdateUser(updatedUser);
    
    if (notifications && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    
    onClose();
  };

  const formattedRole = user.role ? user.role.replace(/_/g, ' ').toUpperCase() : 'DIMENSION TRAVELER';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#131829] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px] md:h-[500px]">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-black/20 p-6 border-b md:border-b-0 md:border-r border-white/5">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="p-1.5 bg-[var(--accent-primary)] rounded-lg"><Icons.Settings /></span>
            Settings
          </h2>
          <nav className="space-y-2">
            {[
              { id: 'account', label: 'My Account', icon: '👤' },
              { id: 'appearance', label: 'Appearance', icon: '🎨' },
              { id: 'privacy', label: 'Privacy & Notifs', icon: '🔒' },
              { id: 'contacts', label: 'Saved Contacts', icon: '📖' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-white/10 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-white/10" alt="Avatar" />
                    <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Change</span>
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-[10px] font-bold uppercase tracking-wider">
                      {formattedRole}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Custom ID Section */}
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-[var(--accent-secondary)] uppercase tracking-widest">Dimensional ID</label>
                          {!isEditingId && canChangeId && (
                              <button onClick={() => setIsEditingId(true)} className="text-xs text-gray-400 hover:text-white underline">Edit</button>
                          )}
                      </div>
                      
                      {isEditingId ? (
                          <div className="space-y-2">
                              <input 
                                  type="text" 
                                  value={customId} 
                                  onChange={(e) => setCustomId(user.role === 'owner' ? e.target.value : e.target.value.toUpperCase())}
                                  placeholder={user.role === 'owner' ? "ANYTHING GOES" : "ENTER CUSTOM ID"}
                                  className="w-full bg-black/30 border border-[var(--accent-primary)] rounded-lg px-3 py-2 text-white font-mono tracking-wider outline-none"
                              />
                              {idError && <p className="text-xs text-red-400">{idError}</p>}
                              <div className="flex gap-2">
                                  <button onClick={handleIdSave} className="text-xs bg-[var(--accent-primary)] text-white px-3 py-1 rounded">Validate</button>
                                  <button onClick={() => { setIsEditingId(false); setCustomId(user.id); setIdError(''); }} className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded">Cancel</button>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1">
                                {user.role === 'owner' 
                                  ? 'Owner Privilege: No restrictions on ID format.'
                                  : 'Alphanumeric only. 30-day cooldown starts after saving.'}
                              </p>
                          </div>
                      ) : (
                          <div>
                              <div className="text-xl font-mono text-white tracking-widest break-all">{user.id}</div>
                              {!canChangeId && (
                                  <p className="text-[10px] text-gray-500 mt-1">
                                      ID locked. Next update available in {cooldownDays - daysSinceLastChange} days.
                                  </p>
                              )}
                          </div>
                      )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--accent-primary)] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bio / Status</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--accent-primary)] outline-none transition-colors resize-none"
                    />
                  </div>
                  
                  {/* Logout Button */}
                  <div className="pt-4 border-t border-white/10">
                     <button 
                       onClick={handleLogout}
                       className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
                     >
                       <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
                       Log Out / Disconnect
                     </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-white mb-4">Interface Theme</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'cosmic', name: 'Cosmic', colors: 'from-blue-900 to-indigo-900' },
                    { id: 'ocean', name: 'Oceanic', colors: 'from-cyan-900 to-blue-900' },
                    { id: 'sunset', name: 'Sunset', colors: 'from-rose-900 to-purple-900' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => onThemeChange(theme.id as ThemeType)}
                      className={`relative overflow-hidden rounded-2xl p-4 border-2 transition-all group ${
                        user.theme === theme.id ? 'border-[var(--accent-primary)] scale-105 shadow-xl' : 'border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.colors} opacity-50`}></div>
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-white/10 mb-2 backdrop-blur-md"></div>
                        <span className="text-sm font-bold text-white">{theme.name}</span>
                      </div>
                    </button>
                  ))}
                  
                  {/* Owner Custom Theme Option */}
                  {user.role === 'owner' && (
                    <button
                      onClick={() => onThemeChange('custom')}
                      className={`relative overflow-hidden rounded-2xl p-4 border-2 transition-all group ${
                        user.theme === 'custom' ? 'border-[var(--accent-primary)] scale-105 shadow-xl' : 'border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="absolute inset-0 bg-black/40 opacity-50"></div>
                      <div className="relative z-10 flex flex-col items-center">
                         <div className="w-8 h-8 rounded-full mb-2 backdrop-blur-md border border-white/20 shadow-inner flex items-center justify-center" style={{ backgroundColor: customColor }}>
                            <Icons.Settings />
                         </div>
                         <span className="text-sm font-bold text-white">Custom</span>
                      </div>
                    </button>
                  )}
                </div>

                {/* Liquid Glass Toggle */}
                <div className="mt-6 flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                   <div>
                      <h4 className="font-bold text-white flex items-center gap-2">
                        💧 Liquid Glass Mode
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">BETA</span>
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">Enable high-fidelity reflections and fluid animations.</p>
                   </div>
                   <button 
                      onClick={() => setLiquidGlass(!liquidGlass)}
                      className={`w-12 h-6 rounded-full transition-all relative shadow-inner ${liquidGlass ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-white/10'}`}
                   >
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${liquidGlass ? 'left-7' : 'left-1'}`}></div>
                   </button>
                </div>

                {/* Color Picker for Custom Theme (Owner Only) */}
                {user.role === 'owner' && user.theme === 'custom' && (
                    <div className="mt-2 p-4 bg-white/5 rounded-xl border border-white/10 animate-in slide-in-from-bottom-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Owner Custom Color Override</label>
                        <div className="flex items-center gap-4">
                            <input 
                              type="color" 
                              value={customColor}
                              onChange={(e) => {
                                  setCustomColor(e.target.value);
                              }}
                              className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none p-0"
                            />
                            <div className="flex-1">
                                <input 
                                  type="text" 
                                  value={customColor}
                                  onChange={(e) => setCustomColor(e.target.value)}
                                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white font-mono uppercase"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2">Pick any color to override the system accent.</p>
                    </div>
                )}
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <h4 className="font-bold text-white">Desktop Notifications</h4>
                        <p className="text-xs text-gray-400">Receive alerts when the app is in the background.</p>
                      </div>
                      <button 
                        onClick={() => setNotifications(!notifications)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-[var(--accent-primary)]' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'left-7' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <h4 className="font-bold text-white">Interface Sounds</h4>
                        <p className="text-xs text-gray-400">Play subtle SFX for messages and interactions.</p>
                      </div>
                      <button 
                         onClick={() => setSound(!sound)}
                         className={`w-12 h-6 rounded-full transition-colors relative ${sound ? 'bg-[var(--accent-primary)]' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${sound ? 'left-7' : 'left-1'}`}></div>
                      </button>
                    </div>
                 </div>
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-lg font-bold text-white mb-2">Saved Contacts</h3>
                    <p className="text-xs text-gray-500 mb-4">Rename your friends for easier recognition.</p>
                    
                    {contacts.length === 0 ? (
                        <div className="bg-white/5 rounded-xl p-8 text-center border border-white/5">
                            <span className="text-2xl mb-2 block opacity-50">📇</span>
                            <p className="text-gray-400 text-sm">No saved contacts yet.</p>
                            <p className="text-[10px] text-gray-600">Start a chat to add people.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {contacts.map((contact) => (
                                <div key={contact.userId} className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <img src={contact.avatar} className="w-10 h-10 rounded-full bg-white/10" />
                                        <div>
                                            {editingContactId === contact.userId ? (
                                                <input 
                                                    autoFocus
                                                    type="text" 
                                                    value={editingContactName}
                                                    onChange={(e) => setEditingContactName(e.target.value)}
                                                    className="bg-black/40 text-white text-sm px-2 py-1 rounded border border-[var(--accent-primary)] outline-none w-32"
                                                />
                                            ) : (
                                                <div className="font-bold text-white text-sm">{contact.displayName}</div>
                                            )}
                                            
                                            <div className="text-[10px] text-gray-500 font-mono">
                                                ID: {contact.userId} • Orig: {contact.originalName}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {editingContactId === contact.userId ? (
                                            <button 
                                                onClick={() => handleUpdateContactName(contact.userId)}
                                                className="p-2 bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-lg hover:bg-[var(--accent-primary)] hover:text-white transition-all text-xs font-bold"
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => { setEditingContactId(contact.userId); setEditingContactName(contact.displayName); }}
                                                className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                                                title="Rename"
                                            >
                                                <span className="text-xs">✎</span>
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDeleteContact(contact.userId)}
                                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                                            title="Delete Contact"
                                        >
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-8 py-2.5 rounded-xl font-bold text-sm text-white bg-[var(--accent-primary)] hover:brightness-110 shadow-lg transition-all transform hover:scale-105 active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
