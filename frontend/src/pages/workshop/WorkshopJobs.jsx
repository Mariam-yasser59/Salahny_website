import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { patch } from '../../services/api.js';

export default function WorkshopJobs() {
  const { data, setData } = useApi('/workshop/active-jobs', []);
  const update = async (id, status) => {
    const updated = await patch(`/workshop/requests/${id}/status`, { status, label: status });
    setData(data.map((job) => job.id === id ? updated : job).filter((job) => job.status !== 'completed'));
  };
  return (
    <div className="dash-stack">
      <SectionHeader title="Active Jobs" />
      <div className="feature-grid two">{data.map((job) => <article className="feature-card" key={job.id}><h3>{job.service?.name}</h3><p>{job.driver?.name} · {job.vehicle?.make} {job.vehicle?.model}</p><StatusBadge value={job.status} /><div className="meter"><span style={{ width: `${job.progress}%` }} /></div><button className="primary-btn" onClick={() => update(job.id, job.status === 'accepted' ? 'in_progress' : 'completed')}>Update status</button></article>)}</div>
    </div>
  );
}
