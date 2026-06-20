import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';
import { post } from '../../services/api.js';

export default function WorkshopChat() {
  const { state } = useLocation();
  const [bookingId, setBookingId] = useState(state?.bookingId || '');
  const [adminText, setAdminText] = useState('');
  const [driverText, setDriverText] = useState('');
  const { data: adminMessages, setData: setAdminMessages } = useApi('/workshop/admin/messages', []);
  const { data: bookingChat, setData: setBookingChat } = useApi(bookingId ? `/workshop/chat/${bookingId}` : '/workshop/chat/none', { messages: [] });

  const sendAdmin = async () => {
    if (!adminText.trim()) return;
    const message = await post('/workshop/admin/messages', { text: adminText });
    setAdminMessages([...adminMessages, message]);
    setAdminText('');
  };

  const sendDriver = async () => {
    if (!bookingId || !driverText.trim()) return;
    const message = await post(`/workshop/chat/${bookingId}/messages`, { text: driverText });
    setBookingChat({ ...bookingChat, messages: [...(bookingChat.messages || []), message] });
    setDriverText('');
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Workshop Chat" />
      <div className="two-col">
        <section className="chat-panel">
          <h3>Driver booking chat</h3>
          <input placeholder="Booking ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
          {bookingChat.context?.booking && <div className="state-card"><strong>{bookingChat.context.booking.id} - {bookingChat.context.booking.serviceName}</strong><span>{bookingChat.context.booking.status}</span></div>}
          {(bookingChat.messages || []).map((message) => <p className={`bubble ${message.senderRole === 'workshop' ? 'user' : 'assistant'}`} key={message.id || message.createdAt}>{message.text || message.message}<small>{message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : ''}</small></p>)}
          <div className="chat-input">
            <input placeholder="Message driver" value={driverText} onChange={(e) => setDriverText(e.target.value)} />
            <button className="primary-btn" onClick={sendDriver}>Send</button>
          </div>
          {bookingChat.context?.driver?.phone && <a className="ghost-btn" href={`tel:${bookingChat.context.driver.phone}`}>Call customer</a>}
        </section>
        <section className="chat-panel">
          <h3>Admin support</h3>
          {adminMessages.map((message) => <p className={`bubble ${message.senderRole === 'workshop' ? 'user' : 'assistant'} ${message.readByWorkshop === false ? 'unread' : ''}`} key={message.id || message.createdAt}>{message.text || message.message}<small>{message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : ''}</small></p>)}
          <div className="chat-input">
            <input placeholder="Message admin" value={adminText} onChange={(e) => setAdminText(e.target.value)} />
            <button className="primary-btn" onClick={sendAdmin}>Send</button>
          </div>
        </section>
      </div>
    </div>
  );
}
