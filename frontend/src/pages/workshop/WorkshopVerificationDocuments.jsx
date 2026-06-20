import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import DataTable from '../../components/DataTable.jsx';
import { useApi } from '../../hooks/useApi.js';
import { uploadDocument } from '../../services/api.js';

export default function WorkshopVerificationDocuments() {
  const { data, setData, refresh, loading, error } = useApi('/workshop/documents', []);
  const [form, setForm] = useState({ kind: 'commercial_registration', file: null });
  const [message, setMessage] = useState('');

  const upload = async () => {
    if (!form.file) return;
    const payload = new FormData();
    payload.append('kind', form.kind);
    payload.append('file', form.file);
    const document = await uploadDocument(payload);
    setData([document, ...data]);
    setForm({ kind: 'commercial_registration', file: null });
    setMessage('Document submitted for verification review.');
  };

  return (
    <div className="dash-stack">
      <SectionHeader eyebrow="Verification" title="Workshop Verification Documents" />
      <section className="panel">
        <div className="profile-strip">
          <div>
            <span className="eyebrow">Permit or business documents</span>
            <h2>Submit documents for CV/OCR and admin approval</h2>
            <p>Commercial registration, tax card, or business license documents can be uploaded as PDF, JPG, or PNG.</p>
          </div>
          <button className="ghost-btn" onClick={refresh}>Refresh</button>
        </div>
        <div className="form-grid">
          <select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })}>
            <option value="commercial_registration">Commercial registration</option>
            <option value="tax_card">Tax card</option>
            <option value="business_license">Business license</option>
            <option value="workshop_permit">Workshop permit</option>
          </select>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setForm({ ...form, file: event.target.files?.[0] || null })} />
          <button className="primary-btn" disabled={!form.file} onClick={upload}>Upload document</button>
        </div>
        {message && <p className="form-note">{message}</p>}
        {error && <p className="error">{error}</p>}
      </section>
      {loading ? (
        <div className="loading">Loading documents...</div>
      ) : (
        <DataTable rows={data} empty="No verification documents submitted yet." columns={[
          { key: 'fileName', label: 'Document' },
          { key: 'kind', label: 'Type', render: (row) => String(row.kind || '').replaceAll('_', ' ') },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status || row.cvStatus || 'pending'} /> },
          { key: 'uploadedAt', label: 'Uploaded', render: (row) => row.uploadedAt ? new Date(row.uploadedAt).toLocaleString() : '-' }
        ]} />
      )}
    </div>
  );
}
