import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { patch } from '../../services/api.js';

export default function AdminEmergency() {
  const { data, setData } = useApi('/admin/emergency', []);
  const requests = Array.isArray(data) ? data : [];
  const { data: workshopsData } = useApi('/admin/workshops', []);
  const workshops = Array.isArray(workshopsData) ? workshopsData : [];
  const [assigningId, setAssigningId] = useState(null);
  const [workshopId, setWorkshopId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');

  const assign = async (requestId) => {
    if (!workshopId) { setError('Select a workshop to assign.'); return; }
    setAssigning(true); setError('');
    try {
      const updated = await patch(`/admin/emergency/${requestId}/assign-workshop`, { workshopId });
      const data_updated = updated?.data || updated;
      setData(requests.map((item) => item.id === requestId ? { ...item, ...data_updated, status: 'assigned' } : item));
      setAssigningId(null);
      setWorkshopId('');
    } catch (err) {
      setError(err.message || 'Could not assign workshop.');
    } finally {
      setAssigning(false);
    }
  };

  const statusColor = (status) => {
    if (['pending', 'pending_admin_assignment'].includes(status)) return '#e65100';
    if (['assigned', 'accepted_by_workshop'].includes(status)) return '#1565c0';
    if (['mechanic_on_the_way', 'arrived', 'in_progress'].includes(status)) return '#2e7d32';
    if (status === 'completed') return '#388e3c';
    if (['cancelled', 'rejected'].includes(status)) return '#757575';
    return undefined;
  };

  const pendingAssignment = requests.filter((r) => ['pending', 'pending_admin_assignment'].includes(r.status));
  const others = requests.filter((r) => !['pending', 'pending_admin_assignment'].includes(r.status));

  return (
    <div className="dash-stack">
      <SectionHeader title="Emergency Management">
        Monitor all emergency requests and manually assign workshops when automatic matching fails.
      </SectionHeader>

      {pendingAssignment.length > 0 && (
        <>
          <SectionHeader title={`Needs Assignment (${pendingAssignment.length})`} />
          <div className="feature-grid two">
            {pendingAssignment.map((item) => (
              <article className="feature-card booking-card" key={item.id} style={{ borderLeft: `4px solid #e65100` }}>
                <h3>{item.emergencyType || item.type || 'Emergency'}</h3>
                <p><strong>Driver:</strong> {item.driver?.name || item.driverId}</p>
                {item.driver?.phone && <p><strong>Phone:</strong> {item.driver.phone}</p>}
                <p>{item.address || 'No address'}</p>
                {item.issueDescription && <p style={{ fontSize: '0.85em', opacity: 0.7 }}>{item.issueDescription}</p>}
                <StatusBadge value={item.status} />
                <p style={{ fontSize: '0.8em', opacity: 0.6 }}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</p>
                {assigningId === item.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    <select value={workshopId} onChange={(e) => setWorkshopId(e.target.value)}>
                      <option value="">Select workshop…</option>
                      {workshops.filter((w) => w.verified || w.accountStatus === 'active').map((w) => (
                        <option key={w.id} value={w.id}>{w.name} – {w.address}</option>
                      ))}
                    </select>
                    {error && <p className="error">{error}</p>}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="primary-btn" disabled={assigning} onClick={() => assign(item.id)}>
                        {assigning ? 'Assigning...' : 'Confirm Assignment'}
                      </button>
                      <button className="ghost-btn" onClick={() => { setAssigningId(null); setWorkshopId(''); setError(''); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="primary-btn" onClick={() => { setAssigningId(item.id); setError(''); }}>
                    Assign Workshop
                  </button>
                )}
              </article>
            ))}
          </div>
        </>
      )}

      <SectionHeader title={`All Requests (${requests.length})`} />
      {requests.length === 0 ? (
        <article className="state-card">
          <strong>No emergency requests</strong>
          <span>Emergency requests from drivers will appear here.</span>
        </article>
      ) : (
        <div className="feature-grid two">
          {others.map((item) => (
            <article className="feature-card booking-card" key={item.id} style={statusColor(item.status) ? { borderLeft: `4px solid ${statusColor(item.status)}` } : {}}>
              <h3>{item.emergencyType || item.type || 'Emergency'}</h3>
              <p><strong>Driver:</strong> {item.driver?.name || item.driverId}</p>
              <p>{item.address || 'No address'}</p>
              {item.workshop && <p><strong>Workshop:</strong> {item.workshop.name}</p>}
              <StatusBadge value={item.status} />
              <p style={{ fontSize: '0.8em', opacity: 0.6 }}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</p>
              {['assigned', 'pending', 'pending_admin_assignment'].includes(item.status) && (
                <button className="ghost-btn" onClick={() => { setAssigningId(item.id); setError(''); }}>
                  Reassign Workshop
                </button>
              )}
              {assigningId === item.id && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  <select value={workshopId} onChange={(e) => setWorkshopId(e.target.value)}>
                    <option value="">Select workshop…</option>
                    {workshops.filter((w) => w.verified || w.accountStatus === 'active').map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                  {error && <p className="error">{error}</p>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="primary-btn" disabled={assigning} onClick={() => assign(item.id)}>Confirm</button>
                    <button className="ghost-btn" onClick={() => { setAssigningId(null); setWorkshopId(''); setError(''); }}>Cancel</button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
