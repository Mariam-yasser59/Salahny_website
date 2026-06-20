import { Activity, Bot, CalendarCheck, Car, MapPinned } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Loading from '../../components/Loading.jsx';
import { useApi } from '../../hooks/useApi.js';

const getServiceName = (booking) =>
  typeof booking?.service === 'object'
    ? booking.service?.name
    : booking?.service || booking?.serviceName || 'Workshop service';

const getWorkshopName = (booking) =>
  typeof booking?.workshop === 'object'
    ? booking.workshop?.name
    : booking?.workshopName || booking?.workshop || 'Workshop';

const getProgress = (status) => {
  if (status === 'completed') return 100;
  if (status === 'repair_in_progress') return 85;
  if (status === 'diagnostics_ready') return 70;
  if (status === 'in_progress') return 55;
  if (status === 'accepted') return 35;
  return 20;
};

export default function DriverDashboard() {
  const navigate = useNavigate();

  const { data, loading } = useApi('/driver/dashboard', {
    vehicles: [],
    recentBookings: [],
    diagnostics: [],
    nearbyWorkshops: [],
    activity: []
  });

  if (loading) return <Loading />;

  const vehicles = data.vehicles || [];
  const bookings = data.recentBookings || [];

  const activeBooking =
    data.activeBooking ||
    bookings.find((booking) => !['completed', 'cancelled', 'rejected'].includes(booking.status));

  const vehicle = vehicles[0];
  const insight = data.diagnostics?.[0];

  const quickActions = [
    { label: 'Book Service', path: '/driver/booking' },
    { label: 'Run AI Diagnostic', path: '/driver/diagnostics' },
    { label: 'Request Emergency Help', path: '/driver/emergency' },
    { label: 'Chat with Assistant', path: '/driver/chat' }
  ];

  return (
    <div className="dash-stack">
      <div className="stats-grid">
        <StatCard label="Vehicle Health" value={`${vehicle?.health || 0}%`} hint={vehicle?.obdStatus} icon={Car} />

        <StatCard
          label="Active Booking"
          value={activeBooking ? getServiceName(activeBooking) : 'None'}
          hint={activeBooking?.date ? new Date(activeBooking.date).toLocaleString() : ''}
          icon={CalendarCheck}
        />

        <StatCard label="AI Insight" value={insight?.possibleFault || 'Ready'} hint={insight?.recommendation} icon={Bot} />

        <StatCard label="Nearby Workshops" value={data.nearbyWorkshops?.length || 0} hint="Verified service partners" icon={MapPinned} />
      </div>

      <section className="panel">
        <SectionHeader title="Quick Actions" />
        <div className="action-grid">
          {quickActions.map((item) => (
            <button className="ghost-btn" key={item.label} onClick={() => navigate(item.path)}>
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <div className="two-col">
        <section className="panel">
          <SectionHeader title="Active Booking" />

          {activeBooking ? (
            <div className="booking-card">
              <h3>{getServiceName(activeBooking)}</h3>
              <p>{getWorkshopName(activeBooking)}</p>
              <StatusBadge value={activeBooking.status || 'pending'} />
              <div className="meter">
                <span style={{ width: `${activeBooking.progress || getProgress(activeBooking.status)}%` }} />
              </div>
            </div>
          ) : (
            <p>No active booking.</p>
          )}
        </section>

        <section className="panel">
          <SectionHeader title="Recent Activity" />
          {data.activity?.length ? (
            data.activity.map((item) => (
              <p className="activity-row" key={item.id}>
                <Activity size={16} /> {item.message}
              </p>
            ))
          ) : (
            <p>No recent activity.</p>
          )}
        </section>
      </div>
    </div>
  );
}