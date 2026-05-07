import { useState } from 'react';
import { Car, Plus } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { post, del } from '../../services/api.js';

export default function DriverVehicles() {
  const { data: vehicles, setData } = useApi('/driver/vehicles', []);
  const [form, setForm] = useState({ make: '', model: '', year: 2024, plate: '', vin: '' });
  const add = async () => {
    const vehicle = await post('/driver/vehicles', form);
    setData([...vehicles, vehicle]);
    setForm({ make: '', model: '', year: 2024, plate: '', vin: '' });
  };
  const remove = async (id) => {
    await del(`/driver/vehicles/${id}`);
    setData(vehicles.filter((vehicle) => vehicle.id !== id));
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="My Vehicles" action={<button className="primary-btn" onClick={add}><Plus size={16} /> Add vehicle</button>} />
      <div className="form-row">
        {['make', 'model', 'plate', 'vin'].map((key) => <input key={key} placeholder={key.toUpperCase()} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
        <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
      </div>
      <div className="feature-grid two">
        {vehicles.map((vehicle) => <article className="feature-card" key={vehicle.id}><Car /><h3>{vehicle.make} {vehicle.model}</h3><p>{vehicle.year} · {vehicle.plate} · {vehicle.mileage} km</p><StatusBadge value={vehicle.obdStatus} /><strong>Health {vehicle.health}%</strong><button className="ghost-btn" onClick={() => remove(vehicle.id)}>Delete</button></article>)}
      </div>
    </div>
  );
}
