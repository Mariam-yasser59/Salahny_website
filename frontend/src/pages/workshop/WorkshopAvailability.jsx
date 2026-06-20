import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { put } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';

export default function WorkshopAvailability() {
  const { data, setData, refresh } = useApi('/workshop/slots', []);

  const slots = Array.isArray(data) ? data : [];

  const [slot, setSlot] = useState({ date: '', time: '' });
  const [editingId, setEditingId] = useState('');
  const [saving, setSaving] = useState(false);

  const persistSlots = async (nextSlots) => {
    setSaving(true);
    try {
      const slotValues = nextSlots
        .filter((item) => !item.booked)
        .map((item) => item.value || item.id || `${item.date}T${item.time}:00.000Z`);
      const saved = await put('/workshop/slots', { slots: slotValues });
      setData(Array.isArray(saved) ? saved : []);
    } finally {
      setSaving(false);
    }
  };

  const saveLocalSlot = async () => {
    if (!slot.date || !slot.time) return;

    const value = `${slot.date}T${slot.time}:00.000Z`;

    const next = {
      id: value,
      value,
      date: slot.date,
      time: slot.time,
      booked: false
    };

    const nextSlots = editingId
      ? slots.map((item) => (item.id === editingId ? next : item))
      : [...slots, next];

    await persistSlots(nextSlots);
    setSlot({ date: '', time: '' });
    setEditingId('');
  };

  const edit = (item) => {
    setSlot({ date: item.date, time: item.time });
    setEditingId(item.id);
  };

  const remove = async (id) => {
    await persistSlots(slots.filter((item) => item.id !== id));
  };

  const save = async () => {
    await persistSlots(slots);
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Availability Slots" />

      <section className="panel form-grid">
        <input
          type="date"
          value={slot.date}
          onChange={(e) => setSlot({ ...slot, date: e.target.value })}
        />

        <input
          type="time"
          value={slot.time}
          onChange={(e) => setSlot({ ...slot, time: e.target.value })}
        />

        <button className="primary-btn" onClick={saveLocalSlot} disabled={saving}>
          {saving ? 'Saving...' : editingId ? 'Update slot' : 'Add slot'}
        </button>

        <button className="ghost-btn" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save slots'}
        </button>

        <button className="ghost-btn" onClick={refresh}>
          Refresh
        </button>
      </section>

      {slots.length ? (
        <div className="feature-grid three">
          {slots.map((item) => (
            <article className="compact-card" key={item.id}>
              <h3>{item.date}</h3>
              <p>
                {item.time} {item.booked ? '- booked' : '- available'}
              </p>

              {!item.booked && (
                <div className="actions">
                  <button className="ghost-btn" onClick={() => edit(item)}>
                    Edit
                  </button>
                  <button className="ghost-btn" onClick={() => remove(item.id)}>
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <article className="state-card">
          <strong>No Available Slots</strong>
          <span>Add times drivers can book.</span>
        </article>
      )}
    </div>
  );
}
