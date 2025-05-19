// src/components/Chat/ChatWindow.tsx
import React from 'react';
import ChatMessage, { ChatMessageProps } from './ChatMessage';

interface ChatWindowProps {
  messages: ChatMessageProps[];
  onCopy: (idx: number) => void;
  onFeedback: (idx: number, up: boolean) => void;
  onRegenerate: (idx: number) => void;
  loading?: boolean; // NEW: show AI thinking placeholder
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onCopy, onFeedback, onRegenerate, loading }) => {
  return (
    <div className="flex-1 flex flex-col gap-2 overflow-y-auto p-2">
      {messages.length === 0 && <div className="text-center text-gray-400">No messages yet.</div>}
      {messages.map((msg, idx) => (
        <ChatMessage
          key={idx}
          {...msg}
          onCopy={() => onCopy(idx)}
          onFeedback={(up) => onFeedback(idx, up)}
          onRegenerate={() => onRegenerate(idx)}
        />
      ))}
      {loading && (
        <ChatMessage
          sender="ai"
          content=""
          isThinking={true}
        />
      )}
    </div>
  );
};

export default ChatWindow;
