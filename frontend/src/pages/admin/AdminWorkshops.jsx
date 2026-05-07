import DataTable from '../../components/DataTable.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function AdminWorkshops() {
  const { data } = useApi('/admin/workshops', []);
  return <div className="dash-stack"><SectionHeader title="Workshops Management" /><DataTable rows={data} columns={[{ key: 'name', label: 'Workshop' }, { key: 'address', label: 'Address' }, { key: 'rating', label: 'Rating' }, { key: 'verified', label: 'Verification', render: (row) => <StatusBadge value={row.verified ? 'verified' : 'pending'} /> }, { key: 'revenue', label: 'Revenue', render: (row) => `${row.revenue} EGP` }]} /></div>;
}
