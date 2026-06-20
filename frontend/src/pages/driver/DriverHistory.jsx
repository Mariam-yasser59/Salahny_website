import DataTable from '../../components/DataTable.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function DriverHistory() {
  const { data } = useApi('/driver/bookings', []);

  const bookings = Array.isArray(data)
    ? data
    : data?.bookings || data?.data || [];

  return (
    <div className="dash-stack">
      <SectionHeader title="Booking History" />

      <DataTable
        rows={bookings}
        columns={[
          {
            key: 'service',
            label: 'Service',
            render: (row) =>
              typeof row.service === 'object'
                ? row.service?.name
                : row.service
          },
          {
            key: 'workshop',
            label: 'Workshop',
            render: (row) =>
              typeof row.workshop === 'object'
                ? row.workshop?.name
                : row.workshop
          },
          {
            key: 'date',
            label: 'Date',
            render: (row) =>
              row.date
                ? new Date(row.date).toLocaleString()
                : '-'
          },
          {
            key: 'price',
            label: 'Price',
            render: (row) =>
              `${row.price || row.total || 0} EGP`
          },
          {
            key: 'status',
            label: 'Status',
            render: (row) => (
              <StatusBadge value={row.status || 'pending'} />
            )
          }
        ]}
      />
    </div>
  );
}