import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { patch } from '../../services/api.js';

const statuses = ['mechanic_on_the_way', 'arrived', 'in_progress', 'completed'];

export default function WorkshopEmergency() {
  const { data, setData } = useApi('/workshop/emergency', []);

  const update = async (id, action, status) => {
    const updated = await patch(`/workshop/emergency/${id}/${action}`, status ? { status } : {});
    setData(data.map((item) => (item.id === id ? { ...item, ...updated, status: status || action } : item)));
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Assigned Emergency Requests" />
      <div className="feature-grid two">
        {data.map((item) => (
          <article className="feature-card booking-card" key={item.id}>
            <h3>{item.customerName || item.driver?.name || 'Emergency customer'}</h3>
            <p>{item.issue || item.type || 'Roadside assistance'} - {item.location?.address || item.location || 'Location pending'}</p>
            <p>{item.distance || item.distanceKm || ''}</p>
            <StatusBadge value={item.status} />
            <div className="actions">
              <button className="primary-btn" onClick={() => update(item.id, 'accept')}>Accept</button>
              <button className="ghost-btn" onClick={() => update(item.id, 'reject')}>Reject</button>
              {statuses.map((status) => <button className="ghost-btn" key={status} onClick={() => update(item.id, 'status', status)}>{status.replaceAll('_', ' ')}</button>)}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
