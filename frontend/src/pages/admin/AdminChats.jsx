import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';
import { post } from '../../services/api.js';

export default function AdminChats() {
  const { data: workshopThreads } = useApi('/admin/chat/workshops', []);
  const { data: driverThreads } = useApi('/admin/chat/drivers', []);
  const [tab, setTab] = useState('workshops');
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const threads = tab === 'workshops' ? (Array.isArray(workshopThreads) ? workshopThreads : []) : (Array.isArray(driverThreads) ? driverThreads : []);

  const sendReply = async () => {
    if (!replyText.trim() || !selectedThread) return;
    setSending(true);
    try {
      const path = tab === 'workshops'
        ? `/admin/chat/workshops/${selectedThread.workshopId || selectedThread.id}`
        : `/admin/chat/drivers/${selectedThread.driverId || selectedThread.id}`;
      await post(path, { text: replyText });
      setReplyText('');
    } catch (err) {
      alert(err.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  const threadName = (thread) => thread.workshopName || thread.driverName || 'Unknown';
  const messages = selectedThread?.messages || [];

  return (
    <div className="dash-stack">
      <SectionHeader title="Chat Monitoring">Monitor and reply to workshop and driver messages.</SectionHeader>

      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        <button className={tab === 'workshops' ? 'primary-btn' : 'ghost-btn'} onClick={() => { setTab('workshops'); setSelectedThread(null); }}>Workshop Chats</button>
        <button className={tab === 'drivers' ? 'primary-btn' : 'ghost-btn'} onClick={() => { setTab('drivers'); setSelectedThread(null); }}>Driver Messages</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' }}>
        <section className="panel" style={{ padding: 0 }}>
          {threads.length === 0 && <p style={{ padding: 16, opacity: 0.6 }}>No conversations yet.</p>}
          {threads.map((thread, i) => (
            <button
              key={i}
              onClick={() => setSelectedThread(thread)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', background: selectedThread === thread ? 'var(--surface-raised)' : 'transparent', cursor: 'pointer', border: 'none' }}
            >
              <strong>{threadName(thread)}</strong>
              <p style={{ margin: 0, fontSize: '0.8em', opacity: 0.6 }}>{thread.messages?.length || 0} messages</p>
            </button>
          ))}
        </section>

        <section className="panel" style={{ minHeight: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!selectedThread ? (
            <article className="state-card"><strong>Select a conversation</strong><span>Choose a thread from the list to view messages.</span></article>
          ) : (
            <>
              <h3 style={{ margin: 0 }}>{threadName(selectedThread)}</h3>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: 400 }}>
                {messages.map((msg) => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.senderRole === 'admin' ? 'flex-end' : 'flex-start' }}>
                    <div className="compact-card" style={{ maxWidth: '70%' }}>
                      <p style={{ margin: 0 }}>{msg.text}</p>
                      <small style={{ opacity: 0.6 }}>{msg.senderRole} · {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}</small>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && <p style={{ opacity: 0.5 }}>No messages in this thread.</p>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Type a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendReply(); }} style={{ flex: 1 }} />
                <button className="primary-btn" onClick={sendReply} disabled={sending}>Send</button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
