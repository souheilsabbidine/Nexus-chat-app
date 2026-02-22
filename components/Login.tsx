
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  // Pre-configured identities for the Nexus
  const systemIdentities = [
    {
      id: 'ARCHITECT01',
      name: 'The Architect',
      email: 'ssabbidien71@gmail.com',
      password: 'A5tirfir123@$',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Architect&clothing=blazerAndShirt&accessories=sunglasses',
      theme: 'sunset',
      status: 'god-mode',
      role: 'owner',
      bio: 'Architect of the Nexus.',
      liquidGlass: true,
      savedContacts: [],
      visibility: 'public'
    },
    {
      id: 'SYSADMIN001',
      name: 'System Admin',
      email: 'admin@nexus.com',
      password: 'admin123',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&clothing=hoodie',
      theme: 'ocean',
      status: 'monitoring',
      role: 'admin',
      bio: 'Maintaining dimensional stability.',
      liquidGlass: false,
      savedContacts: [],
      visibility: 'public'
    },
    {
      id: 'DEV_OVERLORD',
      name: 'Nexus Developer',
      email: 'dev@nexus.core',
      password: 'devmasterkey',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=DevOverlord&backgroundColor=transparent',
      theme: 'cosmic',
      status: 'coding',
      role: 'owner',
      bio: 'Building the simulation.',
      liquidGlass: true,
      savedContacts: [],
      visibility: 'owner-only' // Visible only to other owners
    }
  ];

  useEffect(() => {
    // Force DB reset to ensure new system identities exist and clean slate
    const db = JSON.parse(localStorage.getItem('nexus_users_db') || '[]');
    const devExists = db.some((u: any) => u.id === 'DEV_OVERLORD');
    
    // If our new Dev bot isn't there, or if we want to enforce the seed:
    if (!devExists) {
        localStorage.setItem('nexus_users_db', JSON.stringify(systemIdentities));
        console.debug('Nexus DB Reset: System Identities Enforced');
    }
  }, []);

  const generateNexusId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const usersDb = JSON.parse(localStorage.getItem('nexus_users_db') || '[]');
    
    if (isSignup) {
      if (!name.trim() || !email.trim() || !password) {
        setError('All fields are required.');
        return;
      }

      const emailExists = usersDb.some((u: any) => u.email?.toLowerCase() === email.trim().toLowerCase());
      if (emailExists) {
        setError('Email already registered.');
        return;
      }

      const newUser: User = {
        id: generateNexusId(),
        name: name.trim(),
        email: email.trim(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        theme: 'cosmic',
        status: 'online',
        role: 'user',
        liquidGlass: false,
        savedContacts: [],
        lastIdChange: Date.now(),
        visibility: 'public'
      };

      const dbRecord = { ...newUser, password };
      const newDb = [...usersDb, dbRecord];
      localStorage.setItem('nexus_users_db', JSON.stringify(newDb));
      
      onLogin(newUser);
    } else {
      // LOGIN LOGIC
      const userMatch = usersDb.find((u: any) => 
        (u.email?.toLowerCase() === email.trim().toLowerCase() || u.id === email.trim().toUpperCase()) && 
        u.password === password
      );

      if (userMatch) {
        const { password: _, ...safeUser } = userMatch;
        onLogin(safeUser);
      } else {
        setError('Invalid credentials.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20 animate-pulse" 
             style={{ background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 60%)' }}></div>
      </div>

      <div className="glass-effect p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md text-center transform transition-all duration-500 relative z-10">
        <div className="flex justify-center mb-6">
          <div 
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-700 ${isHovered ? 'scale-110 rotate-12' : ''}`}
            style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
             <svg viewBox="0 0 24 24" width="40" height="40" fill="white" className="drop-shadow-lg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"></path>
             </svg>
          </div>
        </div>

        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
          {isSignup ? 'Join Nexus' : 'Welcome Back'}
        </h1>
        <p className="text-sm text-gray-400 mb-8 font-medium">
          {isSignup ? 'Create your dimensional identity.' : 'Enter your credentials to sync.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div className="group">
              <input
                type="text"
                placeholder="Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[var(--accent-primary)] focus:bg-white/10 transition-all"
              />
            </div>
          )}
          
          <div className="group">
            <input
              type="text"
              placeholder={isSignup ? "Email Address" : "Email or Nexus ID"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[var(--accent-primary)] focus:bg-white/10 transition-all"
            />
          </div>

          <div className="group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[var(--accent-primary)] focus:bg-white/10 transition-all"
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs font-bold bg-red-500/10 py-2 rounded-lg animate-pulse">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-bold py-3.5 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all transform hover:shadow-[0_0_20px_rgba(var(--accent-primary-rgb),0.5)]"
          >
            {isSignup ? 'Initialize Identity' : 'Connect Uplink'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-4">
          <button 
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
            className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
          >
            {isSignup ? 'Already have an ID? Login' : "Don't have an ID? Create one"}
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">
         Nexus Protocol v3.0
      </div>
    </div>
  );
};

export default Login;
