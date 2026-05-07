import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function WorkshopProfile() {
  const { data } = useApi('/workshop/profile', {});
  return (
    <div className="dash-stack">
      <SectionHeader title="Workshop Profile" />
      <section className="panel profile-panel"><h2>{data.name}</h2><p>{data.address}</p><p>{data.phone} · Rating {data.rating}</p><StatusBadge value={data.verified ? 'verified' : 'pending'} /><div className="chips">{data.specialties?.map((item) => <span key={item}>{item}</span>)}</div><button className="primary-btn">Edit profile</button></section>
    </div>
  );
}
