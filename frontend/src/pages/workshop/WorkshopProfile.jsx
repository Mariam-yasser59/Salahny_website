import { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { put, uploadDocument } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import { fileToDataUrl } from '../../utils/fileToDataUrl.js';
import { STORAGE_KEYS } from '../../config/api.js';

export default function WorkshopProfile() {
  const { data, setData } = useApi('/workshop/profile', {});
  const { data: documents, setData: setDocuments } = useApi('/workshop/documents', []);
  const documentList = Array.isArray(documents) ? documents : [];
  const performance = data.performance || {};
  const completionRate = data.completionRate ?? performance.completionRate ?? data.stats?.completionRate ?? 0;
  const repeatClients = data.repeatClients ?? performance.repeatClients ?? 0;
  const avgResponse = data.averageResponseTime || data.avgResponseTime || performance.averageResponseTime || (performance.averageResponseMins ? `${performance.averageResponseMins}m` : 'N/A');
  const [form, setForm] = useState({ name: '', address: '', lat: '', lng: '', profileImage: '' });
  const [documentForm, setDocumentForm] = useState({ kind: 'commercial_registration', file: null });

  useEffect(() => {
    setForm({
      name: data.name || data.workshopName || '',
      address: data.address || data.workshopAddress || '',
      lat: data.location?.lat || data.lat || '',
      lng: data.location?.lng || data.lng || '',
      profileImage: data.profileImage || ''
    });
  }, [data]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => setForm({ ...form, lat: coords.latitude, lng: coords.longitude }));
  };

  const save = async () => {
    const updated = await put('/workshop/profile', { id: data.id || data._id, ...form, location: { lat: Number(form.lat), lng: Number(form.lng) } });
    syncStoredUser(updated);
    setData(updated);
  };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setForm({ ...form, profileImage: await fileToDataUrl(file) });
  };

  const removeImage = async () => {
    const updated = await put('/workshop/profile', { id: data.id || data._id, profileImage: '' });
    setForm({ ...form, profileImage: '' });
    syncStoredUser(updated);
    setData(updated);
  };

  const submitDocument = async () => {
    if (!documentForm.file) return;
    const payload = new FormData();
    payload.append('kind', documentForm.kind);
    payload.append('file', documentForm.file);
    const document = await uploadDocument(payload);
    setDocuments([document, ...documentList]);
    setDocumentForm({ kind: 'commercial_registration', file: null });
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Workshop Profile" />
      <section className="panel profile-panel">
        <div className="profile-strip">
          <div className="profile-identity">
            {form.profileImage ? <img className="avatar image-avatar" src={form.profileImage} alt={form.name || 'Workshop profile'} /> : <div className="avatar">{(form.name || 'WS').slice(0, 2).toUpperCase()}</div>}
            <div>
              <h2>{form.name || 'Workshop'}</h2>
              <p>{form.address || 'Address not set'} - Rating {data.rating || 0}</p>
            </div>
          </div>
          <div>
            <StatusBadge value={data.verificationStatus || (data.verified ? 'verified' : 'pending')} />
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card"><div><p>Completion rate</p><strong>{completionRate}%</strong><span>Completed service jobs</span></div></div>
          <div className="stat-card"><div><p>Repeat clients</p><strong>{repeatClients}</strong><span>Returning drivers</span></div></div>
          <div className="stat-card"><div><p>Avg response</p><strong>{avgResponse}</strong><span>Request handling</span></div></div>
          <div className="stat-card"><div><p>Account</p><strong>{data.accountStatus || 'pending'}</strong><span>Admin status</span></div></div>
        </div>
        <div className="chips">{(data.services || data.specialties || []).map((item) => <span key={item.name || item}>{item.name || item}</span>)}</div>
        <div className="map-layout">
          <section className="map-panel">
            <div>
              <strong>Workshop Location</strong>
              <p>{form.lat && form.lng ? `${form.lat}, ${form.lng}` : 'Pick a point or use current GPS'}</p>
            </div>
          </section>
          <section>
            <h3>Update location</h3>
            <p>Type an address, search it externally if needed, pick coordinates, or use current GPS.</p>
            <div className="actions">
              <a className="ghost-btn" href={`https://www.google.com/maps/search/${encodeURIComponent(form.address || 'Cairo workshop')}`} target="_blank" rel="noreferrer">Search address</a>
              <button className="ghost-btn" onClick={useCurrentLocation}>Use current GPS</button>
            </div>
          </section>
        </div>
        <div className="form-grid">
          <input placeholder="Workshop name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input placeholder="Latitude" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
          <input placeholder="Longitude" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
          <label className="field-card">
            <span>Workshop Profile Picture</span>
            <small>Upload a workshop logo, storefront, or service bay image. It appears on workshop cards and profile screens.</small>
            <input type="file" accept="image/*" onChange={uploadImage} />
          </label>
          <button className="ghost-btn" onClick={useCurrentLocation}>Use current GPS</button>
          <button className="primary-btn" onClick={save}>Save profile</button>
          <button className="ghost-btn" onClick={removeImage}>Remove profile picture</button>
        </div>
        <section className="form-grid">
          <select value={documentForm.kind} onChange={(e) => setDocumentForm({ ...documentForm, kind: e.target.value })}>
            <option value="commercial_registration">Commercial registration</option>
          </select>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setDocumentForm({ ...documentForm, file: e.target.files?.[0] || null })} />
          <button className="primary-btn" disabled={!documentForm.file} onClick={submitDocument}>Upload verification document</button>
        </section>
        <div className="feature-grid two">
          {documentList.map((document) => (
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
          <a className="ghost-btn" href="/workshop/verification-documents">Verification Documents</a>
        </div>
      </section>
    </div>
  );
}

const syncStoredUser = (user) => {
  const current = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.user) || '{}');
  window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify({ ...current, profileImage: user.profileImage }));
};
