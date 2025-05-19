// src/components/Chat/ChatMessage.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface ChatMessageProps {
  sender: 'user' | 'ai';
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
  isThinking?: boolean; // NEW: for AI thinking placeholder
  onCopy?: () => void;
  onFeedback?: (up: boolean) => void;
  onRegenerate?: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, content, timestamp, isStreaming, isThinking, onCopy, onFeedback, onRegenerate }) => {
  return (
    <div className={`flex flex-col gap-1 ${sender === 'ai' ? 'items-start' : 'items-end'}`}>
      <div className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap flex items-center gap-2 ${sender === 'ai' ? 'bg-gray-100 dark:bg-gray-800 text-left' : 'bg-psychy-green text-white text-right'}`}>
        {sender === 'ai' && (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-psychy-green text-white mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5"><circle cx="12" cy="12" r="10" fill="#10b981"/><path d="M9 10a3 3 0 1 1 6 0v2a3 3 0 1 1-6 0v-2Z" fill="#fff"/><circle cx="9.5" cy="10.5" r="1" fill="#10b981"/><circle cx="14.5" cy="10.5" r="1" fill="#10b981"/></svg>
          </span>
        )}
        {isThinking ? (
          <span className="flex items-center gap-2">
            <span className="animate-pulse">...</span>
            <span className="text-gray-500">Psychy AI is thinking...</span>
          </span>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        )}
        {isStreaming && <span className="ml-2 animate-pulse">...</span>}
      </div>
      {!isThinking && (
        <div className="flex gap-2 text-xs text-gray-400 items-center">
          {timestamp && <span>{timestamp}</span>}
          <button onClick={onCopy} className="hover:underline">Copy</button>
          <button onClick={() => onFeedback?.(true)} aria-label="Thumbs up">👍</button>
          <button onClick={() => onFeedback?.(false)} aria-label="Thumbs down">👎</button>
          {sender === 'ai' && onRegenerate && <button onClick={onRegenerate} className="ml-2 text-psychy-green">Regenerate</button>}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
