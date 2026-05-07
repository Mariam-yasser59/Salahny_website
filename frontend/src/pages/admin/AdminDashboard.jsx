import { BadgeCheck, CalendarCheck, DollarSign, Store, Users } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function AdminDashboard() {
  const { data } = useApi('/admin/dashboard', { recentActivity: [] });
  return (
    <div className="dash-stack">
      <div className="stats-grid">
        <StatCard label="Drivers" value={data.totalDrivers} icon={Users} />
        <StatCard label="Workshops" value={data.totalWorkshops} icon={Store} />
        <StatCard label="Bookings" value={data.totalBookings} icon={CalendarCheck} />
        <StatCard label="Revenue" value={`${data.revenue} EGP`} icon={DollarSign} />
        <StatCard label="Pending approvals" value={data.pendingApprovals} icon={BadgeCheck} />
      </div>
      <SectionHeader title="Recent Activity" />
      <section className="panel">{data.recentActivity.map((item) => <p className="activity-row" key={item.id}>{item.date} · {item.message}</p>)}</section>
    </div>
  );
}
