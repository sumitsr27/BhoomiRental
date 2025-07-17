import React, { useState, useRef, useEffect } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([
    { sender: 'owner', text: 'Hello! How can I help you?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    setMessages([...messages, { sender: 'user', text: input }]);
    setInput('');
  };

  return (
    <div className="chat-page">
      <div className="container" style={{ maxWidth: 500, margin: '0 auto' }}>
        <h1>Chat with Owner</h1>
        <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, height: 350, overflowY: 'auto', background: '#fafafa', marginBottom: 16 }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '8px 0' }}>
              <span style={{
                display: 'inline-block',
                background: msg.sender === 'user' ? '#d1e7dd' : '#e2e3e5',
                color: '#333',
                borderRadius: 16,
                padding: '8px 16px',
                maxWidth: '70%',
                wordBreak: 'break-word'
              }}>{msg.text}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #ccc' }}
          />
          <button type="submit" className="btn btn-primary">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Chat; 