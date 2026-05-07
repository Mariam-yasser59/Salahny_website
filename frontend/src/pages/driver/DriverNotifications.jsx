import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function DriverNotifications() {
  const { data } = useApi('/driver/notifications', []);

  return (
    <div className="dash-stack">
      <SectionHeader title="Notifications" />
      <section className="panel">
        {data.length ? data.map((item, index) => (
          <p className="activity-row" key={item.id || index}>{item.title || item.message || 'Salahny notification'}</p>
        )) : <p>No notifications yet.</p>}
      </section>
    </div>
  );
}
