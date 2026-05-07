import { useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { patch, post } from '../../services/api.js';

export default function WorkshopServices() {
  const { data, setData } = useApi('/workshop/services', []);
  const [name, setName] = useState('');
  const add = async () => setData([...data, await post('/workshop/services', { name, category: 'Workshop', price: 500, duration: '1 hr', description: 'Workshop custom service' })]);
  const toggle = async (row) => setData(data.map((item) => item.id === row.id ? { ...item, enabled: !item.enabled } : item));
  return (
    <div className="dash-stack">
      <SectionHeader title="Services Management" />
      <div className="form-row"><input placeholder="New service name" value={name} onChange={(e) => setName(e.target.value)} /><button className="primary-btn" onClick={add}>Add service</button></div>
      <DataTable rows={data} columns={[
        { key: 'name', label: 'Service' },
        { key: 'price', label: 'Price', render: (row) => `${row.price} EGP` },
        { key: 'duration', label: 'Duration' },
        { key: 'enabled', label: 'Status', render: (row) => <StatusBadge value={row.enabled ? 'enabled' : 'disabled'} /> },
        { key: 'action', label: 'Action', render: (row) => <button className="ghost-btn" onClick={async () => { await patch(`/workshop/services/${row.id}`, { enabled: !row.enabled }); toggle(row); }}>Toggle</button> }
      ]} />
    </div>
  );
}
