import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function AdminSettings() {
  const { data } = useApi('/admin/settings', {});
  return <div className="dash-stack"><SectionHeader title="Admin Settings" /><section className="panel profile-panel"><h2>{data.name}</h2><p>{data.email}</p><p>{data.phone}</p><StatusBadge value={data.status} /><input placeholder="New password" type="password" /><button className="primary-btn">Change password</button></section></div>;
}
