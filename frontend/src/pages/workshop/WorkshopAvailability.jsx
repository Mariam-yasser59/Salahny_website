import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { put } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';

export default function WorkshopAvailability() {
  const { data, setData } = useApi('/workshop/slots', []);
  const [slot, setSlot] = useState({ date: '', time: '' });

  const add = () => {
    if (!slot.date || !slot.time) return;
    setData([...data, { id: `${slot.date}-${slot.time}`, ...slot, booked: false }]);
    setSlot({ date: '', time: '' });
  };

  const remove = (id) => setData(data.filter((item) => item.id !== id));
  const save = async () => setData(await put('/workshop/slots', { slots: data.filter((item) => !item.booked) }));

  return (
    <div className="dash-stack">
      <SectionHeader title="Availability Slots" />
      <section className="panel form-grid">
        <input type="date" value={slot.date} onChange={(e) => setSlot({ ...slot, date: e.target.value })} />
        <input type="time" value={slot.time} onChange={(e) => setSlot({ ...slot, time: e.target.value })} />
        <button className="primary-btn" onClick={add}>Add slot</button>
        <button className="ghost-btn" onClick={save}>Save slots</button>
      </section>
      <div className="feature-grid three">
        {data.map((item) => (
          <article className="compact-card" key={item.id || `${item.date}-${item.time}`}>
            <h3>{item.date}</h3>
            <p>{item.time} {item.booked ? '- booked' : '- available'}</p>
            {!item.booked && <button className="ghost-btn" onClick={() => remove(item.id)}>Delete</button>}
          </article>
        ))}
      </div>
    </div>
  );
}
