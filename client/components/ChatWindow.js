import { useEffect, useRef, useState } from 'react';
import { FaRobot } from 'react-icons/fa';
import MessageInput from '../components/MessageInput'; // Ensure the correct path to MessageInput

export default function ChatWindow({ token, isGuest }) {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [pendingText, setPendingText] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const srcRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, pendingText]);

  const sendMessage = async (text) => {
    const newChat = [...messages, { role: 'user', content: text }];
    setMessages(newChat);
    setStreaming(true);
    setPendingText('');
    setAiThinking(true);
    const res = await fetch('http://localhost:4000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ messages: newChat, isGuest })
    });
    const reader = res.body.getReader();
    let decoder = new TextDecoder(), done = false, buffer = '';
    let assistantText = '';
    let gotFirstToken = false;
    let lastMessageIndex = newChat.length;
    // Add a new assistant message placeholder
    setMessages(m => [...m, { role: 'assistant', content: '' }]);
    while (!done) {
      const { value, done: d } = await reader.read();
      done = d;
      buffer += decoder.decode(value || new Uint8Array, { stream: !done });
      let parts = buffer.split('\n\n');
      buffer = parts.pop();
      for (let part of parts) {
        if (!part.startsWith('data:')) continue;
        const dataStr = part.replace('data: ', '');
        if (dataStr === '[DONE]') { setStreaming(false); setPendingText(''); setAiThinking(false); return; }
        let payload = JSON.parse(dataStr);
        assistantText += payload.chunk;
        setPendingText(assistantText);
        setMessages(m => {
          // Only update the last assistant message
          return m.map((msg, idx) =>
            idx === lastMessageIndex ? { ...msg, content: assistantText } : msg
          );
        });
        if (!gotFirstToken && payload.chunk) {
          setAiThinking(false);
          gotFirstToken = true;
        }
      }
    }
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              (m.role === 'user' ? 'text-right' : 'text-left') +
              ' transition-opacity duration-500 ease-in opacity-100 fade-in-message'
            }
          >
            <div className={m.role === 'user' ? 'inline-block p-2 m-1 rounded bg-gray-200 dark:bg-gray-700' : 'inline-block p-2 m-1 rounded bg-blue-100 dark:bg-blue-800 flex items-center'}>
              {m.role === 'assistant' && <FaRobot className="inline mr-2 text-blue-500" />}
              {m.content}
              {streaming && m.role === 'assistant' && i === messages.length - 1 && (
                <span className="ml-1 animate-pulse">...</span>
              )}
            </div>
          </div>
        ))}
        {/* Typing indicator for AI thinking pause */}
        {aiThinking && (
          <div className="text-left fade-in-message">
            <div className="inline-block p-2 m-1 rounded bg-blue-100 dark:bg-blue-800 flex items-center">
              <FaRobot className="inline mr-2 text-blue-500" />
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSend={sendMessage} disabled={streaming} />
    </div>
  );
}
