"use client";

import React, { useState } from "react";
import axios from "axios";
import ChatWindow from "../components/Chat/ChatWindow";
import ChatInput from "../components/Chat/ChatInput";
import type { ChatMessageProps } from "../components/Chat/ChatMessage";
import Link from "next/link";

// Chat session type for sidebar management
interface ChatSession {
  id: string;
  title: string;
  archived: boolean;
  messages: ChatMessageProps[];
}

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: '1', title: 'New Chat', archived: false, messages: [] }
  ]);
  const [activeSessionId, setActiveSessionId] = useState('1');
  const [loading, setLoading] = useState(false);

  const activeSession = sessions.find(s => s.id === activeSessionId)!;

  // Auto-generate chat title from first user message if still 'New Chat'
  const autoTitleChat = (id: string, messages: ChatMessageProps[]) => {
    if (!messages.length) return;
    setSessions(prev => prev.map(s => {
      if (s.id !== id) return s;
      if (s.title !== 'New Chat') return s;
      // Use first 6 words of first user message as title
      const firstUserMsg = messages.find(m => m.sender === 'user')?.content || '';
      if (!firstUserMsg) return s;
      const summary = firstUserMsg.split(' ').slice(0, 6).join(' ');
      return { ...s, title: summary + (firstUserMsg.split(' ').length > 6 ? '...' : '') };
    }));
  };

  // Call autoTitleChat after each send
  const handleSend = async (msg: string) => {
    setSessions(prev => prev.map(s =>
      s.id === activeSessionId
        ? { ...s, messages: [...s.messages, { sender: 'user', content: msg }] }
        : s
    ));
    setTimeout(() => {
      const session = sessions.find(s => s.id === activeSessionId);
      if (session) autoTitleChat(activeSessionId, [...session.messages, { sender: 'user', content: msg }]);
    }, 0);
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      if (!response.ok) {
        let errText = '';
        try { errText = await response.text(); } catch {}
        throw new Error(errText || 'AI error');
      }
      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error('Failed to parse AI response');
      }
      setSessions(prev => prev.map(s =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, { sender: 'ai', content: data.reply }] }
          : s
      ));
    } catch (e: any) {
      setSessions(prev => prev.map(s =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, { sender: 'ai', content: `Error: ${e.message}` }] }
          : s
      ));
    } finally {
      setLoading(false);
    }
  };

  // Chat management: create, delete, rename, archive, unarchive
  const createChat = () => {
    const newId = Date.now().toString();
    setSessions(prev => [
      { id: newId, title: 'New Chat', archived: false, messages: [] },
      ...prev
    ]);
    setActiveSessionId(newId);
  };
  const deleteChat = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id && sessions.length > 1) {
      setActiveSessionId(sessions.find(s => s.id !== id)!.id);
    }
  };
  const renameChat = (id: string, title: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title } : s));
  };
  const archiveChat = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, archived: true } : s));
    if (activeSessionId === id && sessions.filter(s => !s.archived).length > 1) {
      setActiveSessionId(sessions.find(s => s.id !== id && !s.archived)!.id);
    }
  };
  const unarchiveChat = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, archived: false } : s));
  };

  // Sidebar UI (inline for now)
  return (
    <div className="flex h-full w-full">
      <aside className="w-64 h-full bg-gray-50 dark:bg-gray-900 border-r flex flex-col" role="navigation" aria-label="Chat conversations">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Conversations</span>
          <button className="text-psychy-green font-bold" onClick={createChat} aria-label="Create new chat">+ New Chat</button>
        </div>
        <ul className="flex-1 overflow-y-auto" tabIndex={0} aria-label="Chat list">
          {sessions.filter(s => !s.archived).map(s => (
            <li key={s.id} className={`p-3 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between ${activeSessionId === s.id ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
                onClick={() => setActiveSessionId(s.id)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActiveSessionId(s.id); }}
                tabIndex={0}
                aria-current={activeSessionId === s.id ? 'page' : undefined}
                onContextMenu={e => {
                  e.preventDefault();
                  // Simple context menu: delete, rename, archive
                  const action = window.prompt('Type: delete, rename, archive');
                  if (action === 'delete') deleteChat(s.id);
                  if (action === 'rename') {
                    const newTitle = window.prompt('New title:', s.title);
                    if (newTitle) renameChat(s.id, newTitle);
                  }
                  if (action === 'archive') archiveChat(s.id);
                }}
            >
              <span>{s.title}</span>
              <button className="text-xs text-gray-500" onClick={e => { e.stopPropagation(); archiveChat(s.id); }} aria-label="Archive chat">...</button>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t">
          <button className="w-full text-left text-sm text-gray-500" onClick={() => {
            const id = window.prompt('Unarchive chat ID?');
            if (id) unarchiveChat(id);
          }} aria-label="Show archived chats">Archived</button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="flex w-full justify-end mb-2">
          <Link href="/account" className="text-sm text-psychy-green underline mr-4">Account</Link>
          <Link href="/settings" className="text-sm text-psychy-green underline mr-4">Settings</Link>
          <Link href="/release-notes" className="text-sm text-psychy-green underline mr-4">Release Notes</Link>
          <Link href="/terms" className="text-sm text-psychy-green underline mr-4">Terms</Link>
          <Link href="/privacy" className="text-sm text-psychy-green underline">Privacy</Link>
        </div>
        <div className="text-2xl font-bold mb-4">Psychy AI Chat</div>
        <div className="text-base text-gray-600 dark:text-gray-300 mb-8">
          Start a new chat or select a conversation from the sidebar.
        </div>
        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow p-6 min-h-[300px] flex flex-col gap-4">
          <ChatWindow
            messages={activeSession.messages}
            onCopy={() => {}}
            onFeedback={() => {}}
            onRegenerate={() => {}}
            loading={loading}
          />
          <ChatInput onSend={handleSend} disabled={loading} />
        </div>
      </main>
    </div>
  );
}

// TODO: Integrate 2FA and passkey setup/verification UI in account page and login flow.
// This will include:
// - 2FA enable/verify buttons and QR code display (using /api/account/enable-2fa, /api/account/verify-2fa)
// - Passkey registration/authentication buttons (using /api/account/passkey/* endpoints)
// - Session management and security activity display
