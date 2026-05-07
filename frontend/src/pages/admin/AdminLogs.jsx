import DataTable from '../../components/DataTable.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function AdminLogs() {
  const { data } = useApi('/admin/logs', []);
  return <div className="dash-stack"><SectionHeader title="Activity Logs" /><DataTable rows={data} columns={[{ key: 'date', label: 'Date' }, { key: 'type', label: 'Action' }, { key: 'actor', label: 'Actor' }, { key: 'message', label: 'Message' }]} /></div>;
}
