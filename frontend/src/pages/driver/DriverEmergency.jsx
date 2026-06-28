import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { get, post, patch } from '../../services/api.js';

const requestTypes = [
  { value: 'towing', label: 'Towing' },
  { value: 'flat_tire', label: 'Flat Tire' },
  { value: 'battery', label: 'Battery Jump Start' },
  { value: 'fuel_delivery', label: 'Fuel Delivery' },
  { value: 'engine', label: 'Engine Problem' },
  { value: 'other', label: 'Other' }
];

export default function DriverEmergency() {
  const [form, setForm] = useState({ type: 'towing', issueDescription: '', address: '', locationNotes: '', latitude: '', longitude: '', phone: '', vehicleInfo: '' });
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const cachedCoords = useRef(null);

  useEffect(() => {
    get('/driver/emergency').then((data) => {
      if (Array.isArray(data)) setHistory(data);
      else if (Array.isArray(data?.data)) setHistory(data.data);
    }).catch(() => {});

    // Pre-fetch location silently so the button responds instantly
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { cachedCoords.current = pos.coords; },
        () => {},
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }
  }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) { alert('Location is not supported in this browser'); return; }

    const apply = (coords) => {
      setForm((old) => ({
        ...old,
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: old.address || `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
      }));
      setLocationLoading(false);
    };

    if (cachedCoords.current) { apply(cachedCoords.current); return; }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { cachedCoords.current = pos.coords; apply(pos.coords); },
      () => { alert('Please allow location access in your browser settings.'); setLocationLoading(false); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage(''); setError('');
    if (!form.address.trim() || !form.issueDescription.trim()) { setError('Address and issue description are required.'); return; }
    setSending(true);
    try {
      const response = await post('/driver/emergency', {
        emergencyType: form.type,
        issueDescription: form.issueDescription,
        address: form.address,
        locationNotes: form.locationNotes,
        latitude: form.latitude || null,
        longitude: form.longitude || null,
        phone: form.phone,
        vehicleLabel: form.vehicleInfo
      });
      const saved = response?.data || response;
      setHistory((old) => [saved, ...old]);
      setMessage('Emergency request sent successfully. A nearby workshop has been notified.');
      setForm({ type: 'towing', issueDescription: '', address: '', locationNotes: '', latitude: '', longitude: '', phone: '', vehicleInfo: '' });
    } catch (err) {
      setError(err.message || 'Failed to send emergency request.');
    } finally {
      setSending(false);
    }
  };

  const cancel = async (id) => {
    try {
      const updated = await patch(`/driver/emergency/${id}/cancel`, { reason: 'Cancelled by driver' });
      const data = updated?.data || updated;
      setHistory((old) => old.map((item) => item.id === id ? { ...item, ...data, status: 'cancelled' } : item));
    } catch (err) {
      alert(err.message || 'Could not cancel request.');
    }
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Emergency Help">Request roadside assistance using your current location.</SectionHeader>
      <section className="visual-banner">
        <img src="/images/service-trust.jpg" alt="Mechanic and customer confirming vehicle service" />
        <div>
          <span className="eyebrow">Roadside support</span>
          <h3>Send your issue, location, vehicle notes, and phone number to the Salahny emergency workflow.</h3>
          <p>Admins and assigned workshops can track the request status from assignment through completion.</p>
        </div>
      </section>
      <form className="panel form-grid" onSubmit={submit}>
        <h2 style={{ gridColumn: '1 / -1' }}>Request Roadside Assistance</h2>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {requestTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input placeholder="Vehicle info (make, model, plate)" value={form.vehicleInfo} onChange={(e) => setForm({ ...form, vehicleInfo: e.target.value })} />
        <textarea required placeholder="What happened?" value={form.issueDescription} onChange={(e) => setForm({ ...form, issueDescription: e.target.value })} style={{ gridColumn: '1 / -1' }} />
        <input required placeholder="Street, district, landmark" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input placeholder="Near gas station, beside bridge, etc." value={form.locationNotes} onChange={(e) => setForm({ ...form, locationNotes: e.target.value })} />
        <button type="button" className="ghost-btn" onClick={useMyLocation}>
          <MapPin size={16} /> {locationLoading ? 'Getting location...' : 'Use Current Location'}
        </button>
        <button className="primary-btn" disabled={sending}>{sending ? 'Sending...' : 'Send Emergency Request'}</button>
        <div className="panel" style={{ gridColumn: '1 / -1', overflow: 'hidden', padding: 0, minHeight: 260 }}>
          {form.latitude && form.longitude ? (
            <iframe title="Emergency map" width="100%" height="260" style={{ border: 0 }} loading="lazy" src={`https://maps.google.com/maps?q=${form.latitude},${form.longitude}&z=14&output=embed`} />
          ) : (
            <div style={{ padding: 40, textAlign: 'center' }}><MapPin size={44} /><p>Use your location to preview the map.</p></div>
          )}
        </div>
        {message && <article className="success-card" style={{ gridColumn: '1 / -1' }}>{message}</article>}
        {error && <article className="error" style={{ gridColumn: '1 / -1' }}>{error}</article>}
      </form>

      <SectionHeader title="My Emergency Requests" />
      {history.length ? (
        <div className="feature-grid two">
          {history.map((item) => (
            <article className="feature-card booking-card" key={item.id}>
              <h3>{item.emergencyType || item.type || 'Roadside assistance'}</h3>
              <p>{item.address || 'Location not specified'}</p>
              {item.workshop && <p style={{ fontSize: '0.85em', opacity: 0.7 }}>{item.workshop.name}</p>}
              <StatusBadge value={item.status} />
              {item.issueDescription && <p style={{ fontSize: '0.85em' }}>{item.issueDescription}</p>}
              {!['completed', 'cancelled', 'rejected'].includes(item.status) && (
                <button className="ghost-btn" onClick={() => cancel(item.id)}>Cancel</button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <article className="state-card">
          <strong>No emergency requests yet</strong>
          <span>Your requests will appear here.</span>
        </article>
      )}
    </div>
  );
}
