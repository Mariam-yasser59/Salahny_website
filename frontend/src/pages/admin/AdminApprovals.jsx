import DataTable from '../../components/DataTable.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { patch } from '../../services/api.js';

export default function AdminApprovals() {
  const { data, setData } = useApi('/admin/approvals', []);
  const decide = async (id, action) => {
    await patch(`/admin/approvals/${id}`, { action });
    setData(data.filter((item) => item.id !== id));
  };
  return (
    <div className="dash-stack"><SectionHeader title="Pending Approvals" /><DataTable rows={data} columns={[
      { key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'email', label: 'Email' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
      { key: 'actions', label: 'Actions', render: (row) => <div className="actions"><button className="primary-btn" onClick={() => decide(row.id, 'approve')}>Approve</button><button className="ghost-btn" onClick={() => decide(row.id, 'reject')}>Reject</button></div> }
    ]} /></div>
  );
}
