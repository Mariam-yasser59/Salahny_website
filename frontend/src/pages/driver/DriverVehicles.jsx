import { useState } from 'react';
import { Car, Plus } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { post, del } from '../../services/api.js';

export default function DriverVehicles() {
  const { data: vehicles, setData } = useApi('/vehicles', []);

  const [form, setForm] = useState({
    make: '',
    model: '',
    year: 2024,
    plate: '',
    color: '',
    fuel: '',
    mileage: 0
  });

  const vehiclesList = Array.isArray(vehicles)
    ? vehicles
    : vehicles?.data || vehicles?.vehicles || [];

  const add = async () => {
    const response = await post('/vehicles', form);
    const vehicle = response?.data || response?.vehicle || response;

    setData([vehicle, ...vehiclesList]);

    setForm({
      make: '',
      model: '',
      year: 2024,
      plate: '',
      color: '',
      fuel: '',
      mileage: 0
    });
  };

  const remove = async (id) => {
    await del(`/vehicles/${id}`);

    setData(
      vehiclesList.filter(
        (vehicle) => vehicle._id !== id && vehicle.id !== id
      )
    );
  };

  return (
    <div className="dash-stack">
      <SectionHeader
        title="My Vehicles"
        action={
          <button className="primary-btn" onClick={add}>
            <Plus size={16} /> Add vehicle
          </button>
        }
      />

      <div className="form-row">
        {['make', 'model', 'plate', 'color', 'fuel'].map((key) => (
          <input
            key={key}
            placeholder={key.toUpperCase()}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        ))}

        <input
          type="number"
          placeholder="YEAR"
          value={form.year}
          onChange={(e) =>
            setForm({ ...form, year: Number(e.target.value) })
          }
        />

        <input
          type="number"
          placeholder="MILEAGE"
          value={form.mileage}
          onChange={(e) =>
            setForm({ ...form, mileage: Number(e.target.value) })
          }
        />
      </div>

      <div className="feature-grid two">
        {vehiclesList.map((vehicle) => {
          const vehicleId = vehicle._id || vehicle.id;

          return (
            <article className="feature-card" key={vehicleId}>
              <Car />

              <h3>
                {vehicle.make} {vehicle.model}
              </h3>

              <p>
                {vehicle.year} · {vehicle.plate} · {vehicle.mileage || 0} km
              </p>

              {(vehicle.color || vehicle.fuel) && (
                <p>
                  {vehicle.color}
                  {vehicle.color && vehicle.fuel ? ' · ' : ''}
                  {vehicle.fuel}
                </p>
              )}

              <StatusBadge value={vehicle.obdStatus || 'Connected'} />

              <strong>Health {vehicle.health || 100}%</strong>

              <button
                className="ghost-btn"
                onClick={() => remove(vehicleId)}
              >
                Delete
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}