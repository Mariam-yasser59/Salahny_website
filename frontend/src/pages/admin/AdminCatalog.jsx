import { useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { post } from '../../services/api.js';

export default function AdminCatalog({ type }) {
  const { data, setData } = useApi(`/admin/${type}`, []);
  const [name, setName] = useState('');
  const add = async () => {
    const payload = type === 'packages' ? { name, price: 299, period: 'month', features: ['Custom admin package'] } : { name, category: 'Admin', price: 500, duration: '1 hr', description: 'Admin-created service' };
    setData([...data, await post(`/admin/${type}`, payload)]);
  };
  return (
    <div className="dash-stack">
      <SectionHeader title={`${type === 'packages' ? 'Packages' : 'Services'} Management`} />
      <div className="form-row"><input placeholder={`New ${type.slice(0, -1)} name`} value={name} onChange={(e) => setName(e.target.value)} /><button className="primary-btn" onClick={add}>Add</button></div>
      <DataTable rows={data} columns={[{ key: 'name', label: 'Name' }, { key: 'price', label: 'Price', render: (row) => `${row.price} EGP` }, { key: 'enabled', label: 'Status', render: (row) => <StatusBadge value={row.enabled ? 'enabled' : 'disabled'} /> }]} />
    </div>
  );
}
