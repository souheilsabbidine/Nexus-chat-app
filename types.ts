
export type ThemeType = 'cosmic' | 'ocean' | 'sunset' | 'custom';

export type UserRole = 
  | 'user' 
  | 'supporter' 
  | 'helper' 
  | 'head_helper' 
  | 'admin' 
  | 'head_admin' 
  | 'manager' 
  | 'head_manager' 
  | 'owner';

export interface UserSettings {
  notifications: boolean;
  sound: boolean;
  readReceipts: boolean;
}

export interface BanDetails {
  reason: string;
  duration: string; // '1h', '24h', '7d', 'permanent'
  bannedAt: number;
}

export interface SavedContact {
  userId: string;
  displayName: string; // The custom name the user saved
  originalName: string; // The user's actual username (for reference)
  avatar: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  password?: string; // Optional for type safety in UI, but present in DB
  avatar: string;
  theme?: ThemeType;
  customColor?: string; // Owner specific custom hex color
  liquidGlass?: boolean; // Toggles the advanced visual effect
  bio?: string;
  status?: string; // 'online', 'offline', 'banned', 'god-mode'
  role?: UserRole;
  visibility?: 'public' | 'hidden' | 'owner-only'; // New field for hiding bots/devs
  settings?: UserSettings;
  savedContacts?: SavedContact[]; // New field for address book
  banDetails?: BanDetails;
  lastIdChange?: number;
}

export interface Message {
  id: string;
  text: string;
  timestamp: number;
  sender: 'me' | 'them';
  status: 'sent' | 'delivered' | 'read';
  replyToId?: string;
  replyToText?: string;
  reaction?: string;
  isForwarded?: boolean;
  isPinned?: boolean;
  type?: 'text' | 'image' | 'audio' | 'system';
  metadata?: any;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
  isAI?: boolean;
  isSelf?: boolean; // For "Saved Messages"
}
