import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';
import { post } from '../../services/api.js';

export default function DriverChat() {
  const { data, setData } = useApi('/driver/chat', []);
  const [text, setText] = useState('');
  const send = async () => {
    const result = await post('/driver/chat', { text });
    setData(result.messages);
    setText('');
  };
  return (
    <div className="dash-stack">
      <SectionHeader title="AI Chat Assistant" />
      <section className="chat-panel">{data.map((msg) => <p className={`bubble ${msg.role}`} key={msg.id}>{msg.text}</p>)}</section>
      <div className="chat-input"><input value={text} placeholder="Describe your car problem..." onChange={(e) => setText(e.target.value)} /><button className="primary-btn" onClick={send}>Send</button></div>
    </div>
  );
}
