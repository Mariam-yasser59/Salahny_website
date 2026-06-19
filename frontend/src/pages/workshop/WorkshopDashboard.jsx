import { BadgeCheck, BarChart3, CalendarClock, ClipboardCheck, Star, Wrench } from 'lucide-react';
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
      <section className="panel profile-strip">
        <div>
          <span className="eyebrow">{data.verificationStatus || (data.workshop?.verified ? 'verified' : 'pending')}</span>
          <h2>{data.workshop?.name || data.workshopName || 'Workshop profile'}</h2>
          <p>{data.workshop?.address || data.address || 'Workshop address is not set yet.'}</p>
        </div>
        <StatusBadge value={data.workshop?.open || data.isOpen ? 'open' : 'closed'} />
      </section>
      <div className="stats-grid">
        <StatCard label="Pending Requests" value={data.pendingRequestCount ?? data.pendingRequests?.length ?? 0} hint="Awaiting response" icon={ClipboardCheck} />
        <StatCard label="Active Jobs" value={data.activeJobCount ?? data.activeJobs?.length ?? 0} hint="In service workflow" icon={Wrench} />
        <StatCard label="Today Jobs" value={data.todayJobs ?? 0} hint="Scheduled today" icon={BadgeCheck} />
        <StatCard label="Open Slots" value={data.availableSlots ?? 0} hint="Available for booking" icon={CalendarClock} />
        <StatCard label="Revenue" value={`${data.revenueSummary?.total ?? data.revenue ?? 0} EGP`} hint="Current summary" icon={BarChart3} />
        <StatCard label="Rating" value={data.rating} hint="Customer reviews" icon={Star} />
      </div>
      <SectionHeader title="Recent Requests" />
      <DataTable rows={data.recentRequests || []} columns={[
        { key: 'driver', label: 'Customer', render: (row) => row.driver?.name || row.customerName },
        { key: 'vehicle', label: 'Vehicle', render: (row) => `${row.vehicle?.make || ''} ${row.vehicle?.model || ''}` },
        { key: 'service', label: 'Service', render: (row) => row.service?.name },
        { key: 'date', label: 'Slot', render: (row) => `${row.date || ''} ${row.time || ''}` },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> }
      ]} />
    </div>
  );
}
