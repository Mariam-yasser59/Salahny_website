import { useMemo, useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';
import { post } from '../../services/api.js';

export default function DriverBooking() {
  const { data: vehicles } = useApi('/vehicles', []);
  const { data: services } = useApi('/services', []);
  const { data: workshops } = useApi('/workshops', []);

  const toList = (data, key) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
    return [];
  };

  const vehiclesList = toList(vehicles, 'vehicles');
  const servicesList = toList(services, 'services');
  const workshopsList = toList(workshops, 'workshops');

  const [form, setForm] = useState({
    serviceId: '',
    vehicleId: '',
    workshopId: '',
    slot: '',
    address: '',
    latitude: '',
    longitude: '',
    issue: ''
  });

  const [created, setCreated] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const selectedWorkshop = workshopsList.find(
    (item) => String(item._id || item.id) === String(form.workshopId)
  );

  const selectedService = servicesList.find(
    (item) => String(item._id || item.id || item.name) === String(form.serviceId)
  );

  const selectedVehicle = vehiclesList.find(
    (item) => String(item._id || item.id) === String(form.vehicleId)
  );

  const availableSlots = useMemo(() => {
    const slots =
      selectedWorkshop?.availableSlots ||
      selectedWorkshop?.slots ||
      selectedWorkshop?.availableTimeSlots ||
      selectedWorkshop?.availability ||
      selectedWorkshop?.availableAppointments ||
      selectedWorkshop?.appointments ||
      selectedWorkshop?.schedule ||
      [];

    if (Array.isArray(slots)) return slots;

    if (Array.isArray(slots?.slots)) return slots.slots;
    if (Array.isArray(slots?.availableSlots)) return slots.availableSlots;

    return [];
  }, [selectedWorkshop]);

  const getSlotValue = (slot) => {
    if (typeof slot === 'string') return slot;
    return slot.date || slot.datetime || slot.time || slot.startTime || slot.start || '';
  };

  const getSlotLabel = (slot) => {
    const value = getSlotValue(slot);
    if (!value) return 'Available slot';

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString();

    return String(value);
  };

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

    const payload = {
      workshop: form.workshopId,
      service: selectedService?.name || form.serviceId,
      serviceId: form.serviceId,
      date: form.slot,
      vehicleId: form.vehicleId,
      vehicleLabel: selectedVehicle
        ? `${selectedVehicle.make} ${selectedVehicle.model} - ${selectedVehicle.plate}`
        : '',
      address: form.address,
      latitude: form.latitude,
      longitude: form.longitude,
      locationNotes: form.issue,
      paymentMethod: 'Cash on Service',
      total: selectedService?.price || 0
    };

    const response = await post('/bookings', payload);
    setCreated(response?.data || response);
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Services Booking">
        Choose service, vehicle, workshop, and available workshop appointment.
      </SectionHeader>

      <form className="panel form-grid" onSubmit={submit}>
        <select
          required
          value={form.serviceId}
          onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
        >
          <option value="">Choose service</option>
          {servicesList.map((item) => (
            <option value={item._id || item.id || item.name} key={item._id || item.id || item.name}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          required
          value={form.vehicleId}
          onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
        >
          <option value="">Choose vehicle</option>
          {vehiclesList.map((item) => (
            <option value={item._id || item.id} key={item._id || item.id}>
              {item.make} {item.model} - {item.plate}
            </option>
          ))}
        </select>

        <select
          required
          value={form.workshopId}
          onChange={(e) => setForm({ ...form, workshopId: e.target.value, slot: '' })}
        >
          <option value="">Choose workshop</option>
          {workshopsList.map((item) => (
            <option value={item._id || item.id} key={item._id || item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          required
          value={form.slot}
          onChange={(e) => setForm({ ...form, slot: e.target.value })}
          disabled={!form.workshopId}
        >
          <option value="">
            {form.workshopId
              ? availableSlots.length
                ? 'Choose available slot'
                : 'No available slots for this workshop'
              : 'Choose workshop first'}
          </option>

          {availableSlots.map((slot, index) => {
            const value = getSlotValue(slot);

            return (
              <option value={value} key={value || index}>
                {getSlotLabel(slot)}
              </option>
            );
          })}
        </select>

        <input
          required
          placeholder="Pickup / service address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <button type="button" className="ghost-btn" onClick={useMyLocation}>
          {locationLoading ? 'Getting location...' : 'Use my current location'}
        </button>

        <textarea
          placeholder="Problem description"
          value={form.issue}
          onChange={(e) => setForm({ ...form, issue: e.target.value })}
        />

        <button className="primary-btn">Confirm booking</button>
      </form>

      {created && (
        <article className="success-card">
          Booking confirmed successfully.
        </article>
      )}
    </div>
  );
}