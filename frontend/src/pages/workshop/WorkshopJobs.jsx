import { Link } from 'react-router-dom';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { patch, post } from '../../services/api.js';

const nextSteps = [
  ['accepted', 'in_progress', 'Start service'],
  ['in_progress', 'diagnostics_ready', 'Mark diagnostics ready'],
  ['diagnostics_ready', 'repair_in_progress', 'Start repair'],
  ['repair_in_progress', 'completed', 'Complete job']
];

export default function WorkshopJobs() {
  const { data, setData } = useApi('/workshop/jobs', []);
  const jobs = Array.isArray(data) ? data : data.current || [];

  const update = async (id, status) => {
    const updated = await patch(`/workshop/bookings/${id}/status`, { status, label: status });
    setData(jobs.map((job) => (job.id === id ? updated : job)).filter((job) => job.status !== 'completed'));
  };

  const shareLocation = async (id) => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      await post(`/workshop/tracking/${id}`, { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy });
    });
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Active Jobs" />
      <div className="feature-grid two">
        {jobs.map((job) => {
          const step = nextSteps.find(([from]) => from === job.status) || nextSteps[0];
          return (
            <article className="feature-card booking-card" key={job.id}>
              <h3>{job.service?.name || 'Workshop job'}</h3>
              <p>{job.driver?.name || job.customerName} - {job.driver?.phone || job.customerPhone || 'No phone'}</p>
              <p>{job.vehicle?.make} {job.vehicle?.model} {job.vehicle?.plate ? `- ${job.vehicle.plate}` : ''}</p>
              <StatusBadge value={job.status} />
              <div className="timeline">{(job.timeline || []).map((item) => <span key={item}>{item}</span>)}</div>
              <div className="meter"><span style={{ width: `${job.progress || 25}%` }} /></div>
              <div className="actions">
                <button className="primary-btn" onClick={() => update(job.id, step[1])}>{step[2]}</button>
                <Link className="ghost-btn" to="/workshop/diagnostics" state={{ bookingId: job.id }}>Run diagnostics</Link>
                <Link className="ghost-btn" to="/workshop/chat" state={{ bookingId: job.id }}>Open chat</Link>
                <button className="ghost-btn" onClick={() => shareLocation(job.id)}>Share GPS</button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
