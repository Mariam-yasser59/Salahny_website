import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';
import { post } from '../../services/api.js';

export default function DriverBooking() {
  const { data: vehicles } = useApi('/driver/vehicles', []);
  const { data: services } = useApi('/driver/services', []);
  const { data: workshops } = useApi('/driver/workshops', []);
  const [form, setForm] = useState({ serviceId: '', vehicleId: '', workshopId: '', date: '2026-04-28', time: '10:30', issue: '' });
  const [created, setCreated] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setCreated(await post('/driver/bookings', form));
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Services Booking">Choose service, vehicle, workshop, and a preferred appointment time.</SectionHeader>
      <form className="panel form-grid" onSubmit={submit}>
        <select required onChange={(e) => setForm({ ...form, serviceId: e.target.value })}><option value="">Choose service</option>{services.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select>
        <select required onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}><option value="">Choose vehicle</option>{vehicles.map((item) => <option value={item.id} key={item.id}>{item.make} {item.model}</option>)}</select>
        <select required onChange={(e) => setForm({ ...form, workshopId: e.target.value })}><option value="">Choose workshop</option>{workshops.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        <textarea placeholder="Problem description" onChange={(e) => setForm({ ...form, issue: e.target.value })} />
        <button className="primary-btn">Confirm booking</button>
      </form>
      {created && <article className="success-card">Booking confirmed: {created.service?.name} at {created.workshop?.name}</article>}
    </div>
  );
}
