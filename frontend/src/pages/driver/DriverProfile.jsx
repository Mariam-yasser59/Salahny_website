import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function DriverProfile() {
  const { data } = useApi('/driver/profile', {});
  return (
    <div className="dash-stack">
      <SectionHeader title="Profile & Settings" />
      <section className="panel profile-panel">
        <h2>{data.name}</h2><p>{data.email}</p><p>{data.phone} · {data.city}</p><StatusBadge value={data.status} />
        <label><input type="checkbox" defaultChecked /> Booking notifications</label>
        <label><input type="checkbox" defaultChecked /> Diagnostic alerts</label>
        <label><input type="checkbox" /> Private profile mode</label>
      </section>
    </div>
  );
}
