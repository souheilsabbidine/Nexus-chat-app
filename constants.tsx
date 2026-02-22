
import React from 'react';
import { Chat } from './types';

// Initial chats are now handled dynamically in App.tsx based on user ID to ensure isolation.
// Keeping an empty array here as fallback type reference.
export const INITIAL_CHATS: Chat[] = [];

export const Icons = {
  Search: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.2 5.2 0 1 0-5.209 5.2 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.002 3.998 1.194-1.194-3.993-3.999zm-4.809 0a3.605 3.605 0 0 1-3.6-3.6 3.605 3.605 0 0 1 3.6-3.6 3.605 3.605 0 0 1-3.6 3.6z"></path></svg>
  ),
  More: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 4.001A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 4.001A2 2 0 0 0 12 15z"></path></svg>
  ),
  Attach: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M1.816 15.556v.002c0 3.864 3.138 7.002 7.002 7.002 3.863 0 7.001-3.138 7.001-7.002v-13.24a4.89 4.89 0 0 0-4.885-4.885c-2.697 0-4.885 2.188-4.885 4.885v13.24c0 1.626 1.318 2.943 2.943 2.943s2.943-1.317 2.943-2.943v-12.02h1.581v12.02c0 2.497-2.025 4.524-4.524 4.524s-4.524-2.027-4.524-4.524v-13.24c0-3.566 2.901-6.466 6.466-6.466s6.466 2.9 6.466 6.466v13.24c0 4.735-3.848 8.583-8.583 8.583s-8.583-3.848-8.583-8.583V5.417h1.581v10.139z"></path></svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
  ),
  Emoji: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M9.153 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm5.694 0c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-2.847 4.871c1.108 0 2.108-.321 2.874-.851.333-.23.358-.535.223-.78s-.45-.377-.752-.294c-.718.2-1.507.313-2.345.313-.838 0-1.627-.113-2.345-.313-.302-.083-.618.049-.752.294s-.11.55.223.78c.766.53 1.766.851 2.874.851zm-.001-14.475C6.414 2.001 2.001 6.414 2.001 12s4.413 9.999 9.999 9.999c5.587 0 9.999-4.412 9.999-9.999s-4.412-9.999-9.999-9.999zm0 18.232c-4.54 0-8.233-3.693-8.233-8.233s3.693-8.233 8.233-8.233 8.233 3.693 8.233 8.233-3.693 8.233-8.233 8.233z"></path></svg>
  ),
  VideoCall: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18 7c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3.33l4 4V6.33l-4 4V7z"></path></svg>
  ),
  AudioCall: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"></path></svg>
  ),
  Pin: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"></path></svg>
  ),
  Reply: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"></path></svg>
  ),
  Forward: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z"></path></svg>
  ),
  Star: (props: { filled?: boolean }) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill={props.filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
  ),
  Mic: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"></path><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"></path></svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
  ),
  NewChat: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821v11.02c0 1.012.642 1.617 1.674 1.617h9.781L19 21.074v-3.616h.005c1.03 0 1.638-.605 1.638-1.617V4.821c.005-1.032-.604-1.646-1.638-1.646zm-3.391 7.315h-6.83c-.304 0-.458-.147-.458-.453s.154-.465.458-.465h6.83c.302 0 .462.151.462.465s-.16.453-.462.453z"></path></svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
  ),
  MessageStatus: ({ status }: { status: 'sent' | 'delivered' | 'read' }) => {
    // Vivid blue for read receipts to stand out
    const readColor = "#60a5fa"; 
    
    if (status === 'sent') {
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
           <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    }
    
    // Delivered / Read (Double Check)
    const activeColor = status === 'read' ? readColor : "currentColor";
    const opacity = status === 'read' ? "1" : "0.6";

    return (
      <div className="flex items-center" style={{ color: activeColor }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity, zIndex: 10 }}>
           <path d="M20 6L9 17l-5-5" />
        </svg>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity, marginLeft: '-8px' }}>
           <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
    );
  },
  Close: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
    </svg>
  ),
  Theme: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0 .59-.22l1.92-3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"></path></svg>
  )
};
