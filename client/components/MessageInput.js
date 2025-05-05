import { useState } from 'react';

// MessageInput component for sending messages
const MessageInput = ({ onSend, disabled }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-input-form">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        placeholder={disabled ? "Login to chat" : "Type your message..."}
        className="message-input"
      />
      <button type="submit" disabled={disabled || !input.trim()} className="send-button">
        Send
      </button>
    </form>
  );
};

export default MessageInput;
