import { BarChart3 } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import DataTable from '../../components/DataTable.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function WorkshopEarnings() {
  const { data } = useApi('/workshop/earnings', { series: [] });
  const series = data?.series || [];
  const maxSeriesValue = Math.max(...series.map((value) => Number(value) || 0), 1);
  const items = data?.recent || data?.items || [];
  return (
    <div className="dash-stack">
      <SectionHeader title="Earnings" />
      <div className="stats-grid">
        <StatCard label="Total Earnings" value={`${data.totalEarnings ?? data.monthly ?? 0} EGP`} icon={BarChart3} />
        <StatCard label="Available" value={`${data.availableBalance ?? data.daily ?? 0} EGP`} icon={BarChart3} />
        <StatCard label="Paid" value={`${data.paidAmount ?? data.weekly ?? 0} EGP`} icon={BarChart3} />
        <StatCard label="Completed Jobs" value={data.completedJobs} icon={BarChart3} />
      </div>
      <section className="panel chart-bars">
        {series.length ? series.map((value, index) => (
          <span key={index} title={`${value || 0} EGP`} style={{ height: `${Math.max(8, Math.round(((Number(value) || 0) / maxSeriesValue) * 180))}px` }} />
        )) : <p>No earning trend yet.</p>}
      </section>
      <section className="panel">
        <div className="profile-strip">
          <div>
            <span className="eyebrow">Payouts</span>
            <h3>Payout method</h3>
            <p>{data.payoutMethod || 'Bank transfer is managed by Salahny operations.'}</p>
          </div>
          <StatusBadge value={data.availableBalance > 0 ? 'available' : 'pending'} />
        </div>
      </section>
      <DataTable rows={items} empty="No earning items yet." columns={[
        { key: 'serviceName', label: 'Service', render: (row) => row.description || row.serviceName || 'Completed booking' },
        { key: 'driver', label: 'Customer', render: (row) => row.driverName || row.customerName || row.driverId || '-' },
        { key: 'bookingId', label: 'Booking ID' },
        { key: 'amount', label: 'Amount', render: (row) => `${row.amount || 0} EGP` },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status || 'available'} /> },
        { key: 'createdAt', label: 'Created', render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString() : '-' }
      ]} />
    </div>
  );
}
