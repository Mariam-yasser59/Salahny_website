import { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { put, uploadDocument } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';

export default function WorkshopProfile() {
  const { data, setData } = useApi('/workshop/profile', {});
  const { data: documents, setData: setDocuments } = useApi('/workshop/documents', []);
  const [form, setForm] = useState({ name: '', address: '', lat: '', lng: '' });
  const [documentForm, setDocumentForm] = useState({ kind: 'commercial_registration', file: null });

  useEffect(() => {
    setForm({
      name: data.name || data.workshopName || '',
      address: data.address || data.workshopAddress || '',
      lat: data.location?.lat || data.lat || '',
      lng: data.location?.lng || data.lng || ''
    });
  }, [data]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => setForm({ ...form, lat: coords.latitude, lng: coords.longitude }));
  };

  const save = async () => {
    const updated = await put('/workshop/profile', { id: data.id || data._id, ...form, location: { lat: Number(form.lat), lng: Number(form.lng) } });
    setData(updated);
  };

  const submitDocument = async () => {
    if (!documentForm.file) return;
    const payload = new FormData();
    payload.append('kind', documentForm.kind);
    payload.append('file', documentForm.file);
    const document = await uploadDocument(payload);
    setDocuments([document, ...documents]);
    setDocumentForm({ kind: 'commercial_registration', file: null });
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Workshop Profile" />
      <section className="panel profile-panel">
        <div className="profile-strip">
          <div className="avatar">{(form.name || 'WS').slice(0, 2).toUpperCase()}</div>
          <div>
            <h2>{form.name || 'Workshop'}</h2>
            <p>{form.address || 'Address not set'} - Rating {data.rating || 0}</p>
          </div>
          <StatusBadge value={data.verificationStatus || (data.verified ? 'verified' : 'pending')} />
        </div>
        <div className="chips">{(data.services || data.specialties || []).map((item) => <span key={item.name || item}>{item.name || item}</span>)}</div>
        <div className="form-grid">
          <input placeholder="Workshop name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input placeholder="Latitude" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
          <input placeholder="Longitude" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
          <button className="ghost-btn" onClick={useCurrentLocation}>Use current GPS</button>
          <button className="primary-btn" onClick={save}>Save profile</button>
        </div>
        <section className="form-grid">
          <select value={documentForm.kind} onChange={(e) => setDocumentForm({ ...documentForm, kind: e.target.value })}>
            <option value="commercial_registration">Commercial registration</option>
            <option value="tax_card">Tax card</option>
            <option value="business_license">Business license</option>
          </select>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setDocumentForm({ ...documentForm, file: e.target.files?.[0] || null })} />
          <button className="primary-btn" disabled={!documentForm.file} onClick={submitDocument}>Upload verification document</button>
        </section>
        <div className="feature-grid two">
          {documents.map((document) => (
            <article className="compact-card" key={document.id}>
              <h3>{document.fileName}</h3>
              <p>{String(document.kind || '').replaceAll('_', ' ')}</p>
              <StatusBadge value={document.status || document.cvStatus || 'submitted'} />
            </article>
          ))}
        </div>
        <div className="action-grid">
          <a className="ghost-btn" href="/workshop/earnings">Earnings</a>
          <a className="ghost-btn" href="/workshop/emergency">Emergency</a>
          <a className="ghost-btn" href="/workshop/chat">Admin chat</a>
          <a className="ghost-btn" href="/workshop/availability">Availability</a>
        </div>
      </section>
    </div>
  );
}
