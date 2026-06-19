import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { patch } from '../../services/api.js';

export default function WorkshopRequests() {
  const { data, setData } = useApi('/workshop/requests', { pending: [], current: [], completed: [], closed: [] });
  const groups = Array.isArray(data) ? { pending: data, current: [], completed: [], closed: [] } : data;

  const update = async (id, status) => {
    await patch(`/workshop/bookings/${id}/status`, { status, label: status === 'accepted' ? 'Accepted by workshop' : 'Declined by workshop' });
    setData({ ...groups, pending: (groups.pending || []).filter((item) => item.id !== id) });
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Incoming Requests" />
      <div className="tabs-row">
        {['pending', 'current', 'completed', 'closed'].map((group) => <span key={group}>{group}: {groups[group]?.length || 0}</span>)}
      </div>
      <div className="feature-grid two">
        {(groups.pending || []).map((item) => (
          <article className="feature-card booking-card" key={item.id}>
            <h3>{item.driver?.name || item.customerName || 'Customer'}</h3>
            <p>{item.vehicle?.make} {item.vehicle?.model} - {item.notes || item.issue || 'Service request'}</p>
            <p>{item.date} {item.time} - {item.price || item.total || 0} EGP</p>
            <StatusBadge value={item.status} />
            <div className="actions">
              <button className="primary-btn" onClick={() => update(item.id, 'accepted')}>Accept</button>
              <button className="ghost-btn" onClick={() => update(item.id, 'cancelled')}>Decline</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
