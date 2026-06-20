import { BadgeCheck, BarChart3, CalendarClock, ClipboardCheck, Star, Wrench } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import DataTable from '../../components/DataTable.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Loading from '../../components/Loading.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function WorkshopDashboard() {
  const { data, loading, refresh } = useApi('/workshop/dashboard', { recentRequests: [] });
  if (loading) return <Loading />;
  const requests = data.recentRequests || [];
  const pending = requests.filter((item) => item.status === 'pending').slice(0, 4);
  const active = requests.filter((item) => ['accepted', 'in_progress', 'diagnostics_ready', 'repair_in_progress'].includes(item.status)).slice(0, 4);
  return (
    <div className="dash-stack">
      <section className="panel profile-strip">
        <div>
          <span className="eyebrow">Workshop command center</span>
          <h2>Welcome back, {data.workshop?.name || data.workshopName || 'Workshop'}</h2>
          <p>{data.workshop?.address || data.address || 'Workshop address is not set yet.'}</p>
        </div>
        <div className="actions">
          <StatusBadge value={data.workshop?.open || data.workshop?.isOpen || data.isOpen ? 'open' : 'closed'} />
          <StatusBadge value={data.verificationStatus || (data.workshop?.verified || data.workshop?.isVerified ? 'verified' : 'pending')} />
          <button className="ghost-btn" onClick={refresh}>Refresh</button>
        </div>
      </section>
      <div className="stats-grid">
        <StatCard label="Pending Requests" value={data.pendingRequestCount ?? data.pendingRequests?.length ?? 0} hint="Awaiting response" icon={ClipboardCheck} />
        <StatCard label="Active Jobs" value={data.activeJobCount ?? data.activeJobs?.length ?? 0} hint="In service workflow" icon={Wrench} />
        <StatCard label="Today Jobs" value={data.todayJobs ?? 0} hint="Scheduled today" icon={BadgeCheck} />
        <StatCard label="Open Slots" value={data.availableSlots ?? 0} hint="Available for booking" icon={CalendarClock} />
        <StatCard label="Revenue" value={`${data.revenueSummary?.total ?? data.revenue ?? 0} EGP`} hint="Current summary" icon={BarChart3} />
        <StatCard label="Rating" value={data.rating} hint="Customer reviews" icon={Star} />
      </div>
      <div className="two-col">
        <section>
          <SectionHeader title="Latest Pending Requests" />
          <DataTable rows={pending} empty="No pending requests" columns={[
            { key: 'driver', label: 'Customer', render: (row) => row.driver?.name || row.customerName },
            { key: 'vehicle', label: 'Vehicle', render: (row) => `${row.vehicle?.make || ''} ${row.vehicle?.model || row.vehicleInfo || ''}` },
            { key: 'service', label: 'Service', render: (row) => row.service?.name || row.serviceName },
            { key: 'date', label: 'Slot', render: (row) => `${row.date || ''} ${row.time || ''}` },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> }
          ]} />
        </section>
        <section>
          <SectionHeader title="Active Jobs" />
          <div className="dash-stack">
            {active.length ? active.map((job) => (
              <article className="compact-card" key={job.id}>
                <div className="profile-strip">
                  <div>
                    <h3>{job.service?.name || job.serviceName || 'Workshop job'}</h3>
                    <p>{job.customerName || job.driver?.name} - {job.vehicleInfo || `${job.vehicle?.make || ''} ${job.vehicle?.model || ''}`}</p>
                  </div>
                  <StatusBadge value={job.status} />
                </div>
                <div className="meter"><span style={{ width: `${job.progress > 1 ? job.progress : Math.round((job.progress || 0) * 100)}%` }} /></div>
              </article>
            )) : <article className="state-card"><strong>No active jobs</strong><span>Accepted and in-progress bookings appear here.</span></article>}
          </div>
        </section>
      </div>
    </div>
  );
}
