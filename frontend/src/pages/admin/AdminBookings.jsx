import DataTable from '../../components/DataTable.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function AdminBookings() {
  const { data } = useApi('/admin/bookings', []);
  return <div className="dash-stack"><SectionHeader title="Bookings Management" /><DataTable rows={data} columns={[{ key: 'id', label: 'ID' }, { key: 'driver', label: 'Driver', render: (row) => row.driver?.name }, { key: 'workshop', label: 'Workshop', render: (row) => row.workshop?.name }, { key: 'service', label: 'Service', render: (row) => row.service?.name }, { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> }, { key: 'price', label: 'Price', render: (row) => `${row.price} EGP` }]} /></div>;
}
