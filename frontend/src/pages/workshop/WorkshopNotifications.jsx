import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function WorkshopNotifications() {
  const { data } = useApi('/workshop/notifications', []);

  return (
    <div className="dash-stack">
      <SectionHeader title="Notifications" />
      <section className="panel">
        {data.map((item) => (
          <div className="activity-row" key={item.id || item.createdAt}>
            <strong>{item.title || item.type || 'Update'}</strong>
            <span>{item.message || item.body}</span>
            <small>{item.createdAt || item.date}</small>
          </div>
        ))}
      </section>
    </div>
  );
}
