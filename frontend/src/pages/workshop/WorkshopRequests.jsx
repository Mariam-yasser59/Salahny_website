import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { patch } from '../../services/api.js';

export default function WorkshopRequests() {
  const { data, setData } = useApi('/workshop/requests', []);
  const update = async (id, status) => {
    await patch(`/workshop/requests/${id}/status`, { status, label: status === 'accepted' ? 'Accepted by workshop' : 'Rejected' });
    setData(data.filter((item) => item.id !== id));
  };
  return (
    <div className="dash-stack">
      <SectionHeader title="Incoming Requests" />
      <div className="feature-grid two">{data.map((item) => <article className="feature-card" key={item.id}><h3>{item.driver?.name}</h3><p>{item.vehicle?.make} {item.vehicle?.model} · {item.issue}</p><StatusBadge value={item.status} /><div className="actions"><button className="primary-btn" onClick={() => update(item.id, 'accepted')}>Accept</button><button className="ghost-btn" onClick={() => update(item.id, 'rejected')}>Reject</button></div></article>)}</div>
    </div>
  );
}
