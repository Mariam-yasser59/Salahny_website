import { useState } from 'react';
import { MapPin } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { post } from '../../services/api.js';

const requestTypes = [
  { value: 'emergency', label: 'Tire' },
  { value: 'towing', label: 'Towing' },
  { value: 'car-wash', label: 'Battery' },
  { value: 'fuel-delivery', label: 'Fuel Delivery' },
  { value: 'fuel-delivery', label: 'Engine' },
  { value: 'fuel-delivery', label: 'other' },
];

export default function DriverEmergency() {
  const [form, setForm] = useState({
    type: 'towing',
    issueDescription: '',
    address: '',
    locationNotes: '',
    latitude: '',
    longitude: '',
    phone: '',
    vehicleInfo: ''
  });

  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Location is not supported in this browser');
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setForm((old) => ({
          ...old,
          latitude,
          longitude,
          address: `Current location: ${latitude}, ${longitude}`
        }));

        setLocationLoading(false);
      },
      () => {
        alert('Please allow location permission');
        setLocationLoading(false);
      }
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!form.address.trim() || !form.issueDescription.trim()) {
      setError('Address and issue description are required.');
      return;
    }

    setSending(true);

    try {
      const response = await post('/driver/emergency/emergency', {
        type: form.type,
        address: form.address,
        issueDescription: form.issueDescription,
        locationNotes: form.locationNotes,
        latitude: form.latitude,
        longitude: form.longitude,
        phone: form.phone,
        vehicleInfo: form.vehicleInfo
      });

      const savedRequest = response?.data || response;

      setHistory([
        {
          id: savedRequest?._id || savedRequest?.id || Date.now(),
          status: savedRequest?.status || 'pending',
          message: savedRequest?.message || 'Waiting for admin assignment'
        },
        ...history
      ]);

      setMessage('Emergency request sent successfully.');
    } catch (err) {
      setError(err.message || 'Failed to send emergency request.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Emergency Help">
        Request roadside assistance using your current location.
      </SectionHeader>

      <section className="visual-banner">
        <img src="/images/service-trust.jpg" alt="Mechanic and customer confirming vehicle service" />
        <div>
          <span className="eyebrow">Roadside support</span>
          <h3>Send your issue, location, vehicle notes, and phone number to the Salahny emergency workflow.</h3>
          <p>Admins and assigned workshops can track the request status from assignment through completion.</p>
        </div>
      </section>

      <form className="panel form-grid" onSubmit={submit}>
        <h2 style={{ gridColumn: '1 / -1' }}>
          Request Roadside Assistance
        </h2>

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          {requestTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <input
          placeholder="Phone number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          placeholder="Vehicle info"
          value={form.vehicleInfo}
          onChange={(e) => setForm({ ...form, vehicleInfo: e.target.value })}
        />

        <textarea
          required
          placeholder="What happened?"
          value={form.issueDescription}
          onChange={(e) =>
            setForm({ ...form, issueDescription: e.target.value })
          }
        />

        <input
          required
          placeholder="Street, district, landmark"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <input
          placeholder="Near gas station, beside bridge, etc."
          value={form.locationNotes}
          onChange={(e) => setForm({ ...form, locationNotes: e.target.value })}
        />

        <button type="button" className="ghost-btn" onClick={useMyLocation}>
          <MapPin size={16} />
          {locationLoading ? 'Getting location...' : 'Use Current Location'}
        </button>

        <button className="primary-btn" disabled={sending}>
          {sending ? 'Sending...' : 'Send Emergency Request'}
        </button>

        <div
          className="panel"
          style={{
            gridColumn: '1 / -1',
            overflow: 'hidden',
            padding: 0,
            minHeight: 260
          }}
        >
          {form.latitude && form.longitude ? (
            <iframe
              title="Emergency map"
              width="100%"
              height="260"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://maps.google.com/maps?q=${form.latitude},${form.longitude}&z=14&output=embed`}
            />
          ) : (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <MapPin size={44} />
              <p>Use your location to preview the map.</p>
            </div>
          )}
        </div>

        {message && (
          <article className="success-card" style={{ gridColumn: '1 / -1' }}>
            {message}
          </article>
        )}

        {error && (
          <article className="error" style={{ gridColumn: '1 / -1' }}>
            {error}
          </article>
        )}
      </form>

      <SectionHeader title="Emergency History" />

      {history.length ? (
        <div className="feature-grid two">
          {history.map((item) => (
            <article className="feature-card" key={item.id}>
              <h3>{item.message}</h3>
              <StatusBadge value={item.status} />
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
