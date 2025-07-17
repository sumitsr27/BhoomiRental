import React, { useState, useRef, useEffect } from 'react';

const GEMINI_API_KEY = 'AIzaSyDyjrg8-T4ckGtBXNKMGvli4TeNlkkeoWo';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY;

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am your AI farming assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: input }] }]
        })
      });
      const data = await res.json();
      const botText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not understand.';
      setMessages(prev => [...prev, { sender: 'bot', text: botText }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to Gemini API.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-page">
      <div className="container" style={{ maxWidth: 500, margin: '0 auto' }}>
        <h1>AI Farming Assistant</h1>
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
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask me anything about farming..."
            style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #ccc' }}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot; 