import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function DriverTracking() {
  const { data } = useApi('/driver/bookings', []);
  const booking = data.find((item) => item.status !== 'completed') || data[0];
  return (
    <div className="dash-stack">
      <SectionHeader title="Booking Tracking" />
      {booking && <section className="panel tracking"><h2>{booking.service?.name}</h2><p>{booking.workshop?.name} · {booking.price} EGP</p><StatusBadge value={booking.status} /><div className="timeline">{booking.timeline.map((step) => <span key={step}>{step}</span>)}</div><div className="meter"><span style={{ width: `${booking.progress}%` }} /></div></section>}
    </div>
  );
}
