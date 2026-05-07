import DataTable from '../../components/DataTable.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { patch } from '../../services/api.js';

export default function AdminDrivers() {
  const { data, setData } = useApi('/admin/drivers', []);
  const status = async (row, value) => { await patch(`/admin/drivers/${row.id}/status`, { status: value }); setData(data.map((item) => item.id === row.id ? { ...item, status: value } : item)); };
  return <div className="dash-stack"><SectionHeader title="Drivers Management" /><DataTable rows={data} columns={[{ key: 'name', label: 'Driver' }, { key: 'email', label: 'Email' }, { key: 'city', label: 'City' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> }, { key: 'actions', label: 'Actions', render: (row) => <div className="actions"><button className="ghost-btn" onClick={() => status(row, 'suspended')}>Suspend</button><button className="primary-btn" onClick={() => status(row, 'active')}>Activate</button></div> }]} /></div>;
}
