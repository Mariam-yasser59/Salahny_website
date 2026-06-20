import { useState } from 'react';
import { Bot, Send, User } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { post } from '../../services/api.js';

export default function DriverChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hi, I am Salahny AI Assistant. Tell me what problem you have with your car.'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input
    };

    setMessages((old) => [...old, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await post('/chatbot/message', {
        message: userMessage.text
      });

      const botText =
        response?.reply ||
        response?.data?.reply ||
        'Sorry, I could not understand that. Please try again.';

      setMessages((old) => [
        ...old,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botText
        }
      ]);
    } catch (err) {
      setMessages((old) => [
        ...old,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: err.message || 'AI assistant is currently unavailable.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="AI Chat Assistant">
        Ask Salahny AI about car problems, warnings, sounds, and recommended services.
      </SectionHeader>

      <section className="panel" style={{ minHeight: 520, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                className="compact-card"
                style={{
                  maxWidth: '70%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10
                }}
              >
                {message.sender === 'bot' ? <Bot size={20} /> : <User size={20} />}
                <p style={{ margin: 0 }}>{message.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="compact-card" style={{ maxWidth: 220 }}>
              <Bot size={20} /> Thinking...
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <input
            placeholder="Type your car problem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1 }}
          />

          <button className="primary-btn" onClick={sendMessage} disabled={loading}>
            <Send size={16} />
            Send
          </button>
        </div>
      </section>
    </div>
  );
}