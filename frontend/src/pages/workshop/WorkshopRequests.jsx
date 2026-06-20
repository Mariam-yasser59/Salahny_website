import { Link } from 'react-router-dom';
import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { api, patch } from '../../services/api.js';

const nextActions = {
  pending: ['accepted', 'Accept'],
  accepted: ['in_progress', 'Start service'],
  in_progress: ['diagnostics_ready', 'Mark diagnostics ready'],
  diagnostics_ready: ['repair_in_progress', 'Start repair'],
  repair_in_progress: ['completed', 'Complete job']
};

export default function WorkshopRequests() {
  const { data, setData } = useApi('/workshop/requests', { pending: [], current: [], completed: [], closed: [] });
  const [selected, setSelected] = useState(null);
  const [detailError, setDetailError] = useState('');
  const groups = Array.isArray(data) ? { pending: data, current: [], completed: [], closed: [] } : data;

  const update = async (id, status) => {
    setDetailError('');
    try {
      const updated = await patch(`/workshop/bookings/${id}/status`, { status, label: status === 'accepted' ? 'Accepted by workshop' : status });
      const withoutBooking = Object.fromEntries(Object.entries(groups).map(([group, items]) => [group, (items || []).filter((item) => item.id !== id)]));
      const targetGroup = status === 'completed' ? 'completed' : ['cancelled', 'rejected'].includes(status) ? 'closed' : status === 'accepted' || status === 'in_progress' || status === 'diagnostics_ready' || status === 'repair_in_progress' ? 'current' : 'pending';
      setData({ ...withoutBooking, [targetGroup]: [updated, ...(withoutBooking[targetGroup] || [])] });
      setSelected(updated);
    } catch (err) {
      setDetailError(err.message);
    }
  };

  const openDetail = async (item) => {
    setDetailError('');
    setSelected(item);
    try {
      setSelected(await api(`/workshop/requests/${item.id}`));
    } catch (_err) {
      setSelected(item);
    }
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Incoming Requests" />
      <div className="tabs-row">
        {['pending', 'current', 'completed', 'closed'].map((group) => <span key={group}>{group}: {groups[group]?.length || 0}</span>)}
      </div>
      <div className="feature-grid two">
        {['pending', 'current', 'completed', 'closed'].flatMap((group) => (groups[group] || []).map((item) => (
          <article className="feature-card booking-card" key={item.id}>
            <h3>{item.driver?.name || item.customerName || 'Customer'}</h3>
            <p>{item.vehicle?.make} {item.vehicle?.model} - {item.notes || item.issue || 'Service request'}</p>
            <p>{item.date} {item.time} - {item.price || item.total || 0} EGP</p>
            <StatusBadge value={item.status} />
            <div className="actions">
              <button className="ghost-btn" onClick={() => openDetail(item)}>Details</button>
              {item.status === 'pending' && <button className="primary-btn" onClick={() => update(item.id, 'accepted')}>Accept</button>}
              {item.status === 'pending' && <button className="ghost-btn" onClick={() => update(item.id, 'cancelled')}>Decline</button>}
            </div>
          </article>
        )))}
      </div>
      {selected && (
        <section className="panel">
          <div className="profile-strip">
            <div>
              <span className="eyebrow">Request detail</span>
              <h2>{selected.service?.name || selected.serviceName || 'Workshop service'}</h2>
              <p>{selected.driver?.name || selected.customerName} - {selected.driver?.phone || selected.customerPhone || 'No phone'}</p>
            </div>
            <StatusBadge value={selected.status} />
          </div>
          <div className="feature-grid three">
            <article className="compact-card"><h3>Vehicle</h3><p>{selected.vehicle?.make} {selected.vehicle?.model} {selected.vehicle?.plate || selected.vehicleInfo || ''}</p></article>
            <article className="compact-card"><h3>Slot</h3><p>{selected.date || ''} {selected.time || ''}</p></article>
            <article className="compact-card"><h3>Price</h3><p>{selected.price || selected.total || 0} EGP</p></article>
          </div>
          <p>{selected.notes || selected.issue || 'No service notes provided.'}</p>
          <div className="timeline">{(selected.timeline || []).map((item) => <span key={item}>{item}</span>)}</div>
          {detailError && <p className="error">{detailError}</p>}
          <div className="actions">
            {nextActions[selected.status] && <button className="primary-btn" onClick={() => update(selected.id, nextActions[selected.status][0])}>{nextActions[selected.status][1]}</button>}
            {selected.status === 'pending' && <button className="ghost-btn" onClick={() => update(selected.id, 'cancelled')}>Decline</button>}
            <Link className="ghost-btn" to="/workshop/chat" state={{ bookingId: selected.id }}>Open chat</Link>
            <Link className="ghost-btn" to="/workshop/diagnostics" state={{ bookingId: selected.id }}>Run diagnostics</Link>
          </div>
        </section>
      )}
    </div>
  );
}
