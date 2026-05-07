import DataTable from '../../components/DataTable.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function DriverHistory() {
  const { data } = useApi('/driver/bookings', []);
  return (
    <div className="dash-stack">
      <SectionHeader title="Booking History" />
      <DataTable rows={data} columns={[
        { key: 'service', label: 'Service', render: (row) => row.service?.name },
        { key: 'workshop', label: 'Workshop', render: (row) => row.workshop?.name },
        { key: 'date', label: 'Date' },
        { key: 'price', label: 'Price', render: (row) => `${row.price} EGP` },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> }
      ]} />
    </div>
  );
}
