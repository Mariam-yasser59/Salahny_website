import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { put } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';

export default function WorkshopAvailability() {
  const { data, setData, refresh } = useApi('/workshop/slots', []);
  const slots = Array.isArray(data) ? data : [];
  const [slot, setSlot] = useState({ date: '', time: '' });
  const [editingId, setEditingId] = useState('');

  const saveLocalSlot = () => {
    if (!slot.date || !slot.time) return;
    const next = { id: `${slot.date}T${slot.time}:00.000Z`, ...slot, booked: false };
    setData(editingId ? slots.map((item) => (item.id === editingId ? next : item)) : [...slots, next]);
    setSlot({ date: '', time: '' });
    setEditingId('');
  };

  const edit = (item) => {
    setSlot({ date: item.date, time: item.time });
    setEditingId(item.id);
  };
  const remove = (id) => setData(slots.filter((item) => item.id !== id));
  const save = async () => setData(await put('/workshop/slots', { slots: slots.filter((item) => !item.booked) }));

  return (
    <div className="dash-stack">
      <SectionHeader title="Availability Slots" />
      <section className="panel form-grid">
        <input type="date" value={slot.date} onChange={(e) => setSlot({ ...slot, date: e.target.value })} />
        <input type="time" value={slot.time} onChange={(e) => setSlot({ ...slot, time: e.target.value })} />
        <button className="primary-btn" onClick={saveLocalSlot}>{editingId ? 'Update slot' : 'Add slot'}</button>
        <button className="ghost-btn" onClick={save}>Save slots</button>
        <button className="ghost-btn" onClick={refresh}>Refresh</button>
      </section>
      {slots.length ? <div className="feature-grid three">
        {slots.map((item) => (
          <article className="compact-card" key={item.id || `${item.date}-${item.time}`}>
            <h3>{item.date}</h3>
            <p>{item.time} {item.booked ? '- booked' : '- available'}</p>
            {!item.booked && <div className="actions"><button className="ghost-btn" onClick={() => edit(item)}>Edit</button><button className="ghost-btn" onClick={() => remove(item.id)}>Delete</button></div>}
          </article>
        ))}
      </div> : <article className="state-card"><strong>No Available Slots</strong><span>Add times drivers can book.</span></article>}
    </div>
  );
}
