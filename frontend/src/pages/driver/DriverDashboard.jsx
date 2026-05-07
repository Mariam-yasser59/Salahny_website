import { Activity, Bot, CalendarCheck, Car, MapPinned } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Loading from '../../components/Loading.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function DriverDashboard() {
  const { data, loading } = useApi('/driver/dashboard', { vehicles: [], recentBookings: [], diagnostics: [], nearbyWorkshops: [] });
  if (loading) return <Loading />;
  const vehicle = data.vehicles[0];
  const insight = data.diagnostics[0];

  return (
    <div className="dash-stack">
      <div className="stats-grid">
        <StatCard label="Vehicle Health" value={`${vehicle?.health || 0}%`} hint={vehicle?.obdStatus} icon={Car} />
        <StatCard label="Active Booking" value={data.activeBooking?.service?.name || 'None'} hint={data.activeBooking?.date} icon={CalendarCheck} />
        <StatCard label="AI Insight" value={insight?.possibleFault || 'Ready'} hint={insight?.recommendation} icon={Bot} />
        <StatCard label="Nearby Workshops" value={data.nearbyWorkshops.length} hint="Verified service partners" icon={MapPinned} />
      </div>
      <section className="panel">
        <SectionHeader title="Quick Actions" />
        <div className="action-grid">
          {['Book Service', 'Run AI Diagnostic', 'Request Emergency Help', 'Chat with Assistant'].map((item) => <button className="ghost-btn" key={item}>{item}</button>)}
        </div>
      </section>
      <div className="two-col">
        <section className="panel">
          <SectionHeader title="Active Booking" />
          {data.activeBooking ? <div className="booking-card"><h3>{data.activeBooking.service?.name}</h3><p>{data.activeBooking.workshop?.name}</p><StatusBadge value={data.activeBooking.status} /><div className="meter"><span style={{ width: `${data.activeBooking.progress}%` }} /></div></div> : <p>No active booking.</p>}
        </section>
        <section className="panel">
          <SectionHeader title="Recent Activity" />
          {data.activity?.map((item) => <p className="activity-row" key={item.id}><Activity size={16} /> {item.message}</p>)}
        </section>
      </div>
    </div>
  );
}
