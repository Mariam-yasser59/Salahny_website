import { useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';
import { del, post } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';

export default function WorkshopServices() {
  const { data, setData } = useApi('/workshop/services', []);
  const [form, setForm] = useState({ name: '', label: '🔧', durationMins: 60, price: 500 });

  const add = async () => {
    if (!form.name.trim()) return;
    const service = await post('/workshop/services', form);
    setData([...data, service]);
    setForm({ name: '', label: '🔧', durationMins: 60, price: 500 });
  };

  const remove = async (id) => {
    await del(`/workshop/services/${id}`);
    setData(data.filter((item) => item.id !== id));
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Service Catalog" />
      <section className="panel form-grid">
        <input placeholder="Service name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Emoji or label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        <input type="number" min="5" placeholder="Duration minutes" value={form.durationMins} onChange={(e) => setForm({ ...form, durationMins: Number(e.target.value) })} />
        <input type="number" min="0" placeholder="Price EGP" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <button className="primary-btn" onClick={add}>Add service</button>
      </section>
      <DataTable rows={data} columns={[
        { key: 'name', label: 'Service', render: (row) => `${row.label || row.emoji || ''} ${row.name}` },
        { key: 'durationMins', label: 'Duration', render: (row) => `${row.durationMins || row.duration || 0} min` },
        { key: 'price', label: 'Price', render: (row) => `${row.price || 0} EGP` },
        { key: 'action', label: 'Action', render: (row) => <button className="ghost-btn" onClick={() => remove(row.id)}>Delete</button> }
      ]} />
    </div>
  );
}
