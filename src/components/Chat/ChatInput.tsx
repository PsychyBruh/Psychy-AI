// src/components/Chat/ChatInput.tsx
import React, { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSend(value);
      setValue('');
    }
  };

  return (
    <form className="flex gap-2 mt-4" onSubmit={handleSubmit}>
      <input
        type="text"
        className="flex-1 rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-psychy-green dark:bg-gray-800 dark:border-gray-700"
        placeholder="Type your message..."
        value={value}
        onChange={e => setValue(e.target.value)}
        disabled={disabled}
      />
      <button
        type="submit"
        className="bg-psychy-green text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
        disabled={disabled || !value.trim()}
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
