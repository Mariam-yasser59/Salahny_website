import { useState } from 'react';
import { Car, Droplets, Fuel, Siren } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { post } from '../../services/api.js';

const requestTypes = [
  { key: 'emergency', title: 'Emergency Help', icon: Siren, endpoint: '/driver/emergency/emergency' },
  { key: 'towing', title: 'Towing', icon: Car, endpoint: '/driver/emergency/towing' },
  { key: 'car-wash', title: 'Car Wash', icon: Droplets, endpoint: '/driver/emergency/car-wash' },
  { key: 'fuel-delivery', title: 'Fuel Delivery', icon: Fuel, endpoint: '/driver/emergency/fuel-delivery' }
];

export default function DriverEmergency() {
  const [form, setForm] = useState({ location: '', description: '', vehicleInfo: '', phone: '' });
  const [message, setMessage] = useState('');

  const submit = async (type) => {
    await post(type.endpoint, form);
    setMessage(`${type.title} request sent successfully.`);
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Roadside & Special Requests">
        Send emergency, towing, car wash, and fuel delivery requests to your Salahny backend.
      </SectionHeader>
      <section className="panel form-grid">
        <input placeholder="Current location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input placeholder="Vehicle info" value={form.vehicleInfo} onChange={(e) => setForm({ ...form, vehicleInfo: e.target.value })} />
        <textarea placeholder="Describe what you need" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </section>
      <div className="feature-grid two">
        {requestTypes.map((type) => {
          const Icon = type.icon;
          return (
            <article className="feature-card" key={type.key}>
              <Icon />
              <h3>{type.title}</h3>
              <p>Creates a real request through {type.endpoint.replace('/driver/emergency', '/api')}.</p>
              <button className="primary-btn" onClick={() => submit(type)}>Send request</button>
            </article>
          );
        })}
      </div>
      {message && <article className="success-card">{message}</article>}
    </div>
  );
}
