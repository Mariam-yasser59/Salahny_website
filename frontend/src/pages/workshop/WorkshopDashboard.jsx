import { BarChart3, ClipboardCheck, Star, Wrench } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import DataTable from '../../components/DataTable.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Loading from '../../components/Loading.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function WorkshopDashboard() {
  const { data, loading } = useApi('/workshop/dashboard', { recentRequests: [] });
  if (loading) return <Loading />;
  return (
    <div className="dash-stack">
      <div className="stats-grid">
        <StatCard label="Today Jobs" value={data.todayJobs} hint="Scheduled and active" icon={Wrench} />
        <StatCard label="Pending Requests" value={data.pendingRequests.length} hint="Awaiting response" icon={ClipboardCheck} />
        <StatCard label="Revenue" value={`${data.revenue} EGP`} hint="Month to date" icon={BarChart3} />
        <StatCard label="Rating" value={data.rating} hint="Customer reviews" icon={Star} />
      </div>
      <SectionHeader title="Recent Requests" />
      <DataTable rows={data.recentRequests} columns={[
        { key: 'driver', label: 'Customer', render: (row) => row.driver?.name },
        { key: 'vehicle', label: 'Vehicle', render: (row) => `${row.vehicle?.make || ''} ${row.vehicle?.model || ''}` },
        { key: 'service', label: 'Service', render: (row) => row.service?.name },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> }
      ]} />
    </div>
  );
}
