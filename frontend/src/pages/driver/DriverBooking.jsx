import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SectionHeader from '../../components/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';
import { post } from '../../services/api.js';

const NEARBY_RADIUS_KM = 25;

const getWorkshopLocation = (workshop) => {
  const coordinates = workshop.location?.coordinates;
  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    return { longitude: Number(coordinates[0]), latitude: Number(coordinates[1]) };
  }
  return {
    latitude: Number(workshop.latitude || workshop.lat || workshop.location?.latitude),
    longitude: Number(workshop.longitude || workshop.lng || workshop.location?.longitude),
  };
};

const distanceKm = (a, b) => {
  if (!a?.latitude || !a?.longitude || !b?.latitude || !b?.longitude) return null;
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

export default function DriverBooking() {
  const location = useLocation();
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
  const rawWorkshopsList = toList(workshops, 'workshops');

  const [form, setForm] = useState({
    serviceId: '',
    vehicleId: '',
    workshopId: '',
    slotIndex: '',
    address: '',
    latitude: '',
    longitude: '',
    issue: ''
  });

  const [created, setCreated] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const driverPoint = form.latitude && form.longitude
    ? { latitude: Number(form.latitude), longitude: Number(form.longitude) }
    : null;

  const workshopsList = useMemo(() => rawWorkshopsList
    .map((workshop) => {
      const workshopLocation = getWorkshopLocation(workshop);
      return { ...workshop, distanceKm: distanceKm(driverPoint, workshopLocation) };
    })
    .filter((workshop) => driverPoint && workshop.distanceKm != null && workshop.distanceKm <= NEARBY_RADIUS_KM)
    .sort((a, b) => a.distanceKm - b.distanceKm), [rawWorkshopsList, driverPoint]);

  useEffect(() => {
    const selectedWorkshopId = location.state?.workshopId;
    const selectedLocation = location.state?.driverLocation;
    const selectedServiceId = location.state?.serviceId;
    if (selectedWorkshopId) {
      setForm((old) => ({
        ...old,
        workshopId: selectedWorkshopId,
        slotIndex: '',
        latitude: selectedLocation?.latitude ?? old.latitude,
        longitude: selectedLocation?.longitude ?? old.longitude,
        address: selectedLocation
          ? `Current location: ${selectedLocation.latitude}, ${selectedLocation.longitude}`
          : old.address,
      }));
    }
    if (selectedServiceId) {
      setForm((old) => ({ ...old, serviceId: selectedServiceId }));
    }
  }, [location.state?.workshopId, location.state?.serviceId]);

  useEffect(() => {
    if (!driverPoint || !form.workshopId || rawWorkshopsList.length === 0) return;
    const stillNearby = workshopsList.some((item) => String(item._id || item.id) === String(form.workshopId));
    if (!stillNearby) {
      setForm((old) => ({ ...old, workshopId: '', slotIndex: '' }));
    }
  }, [driverPoint, form.workshopId, rawWorkshopsList.length, workshopsList]);

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
    return slot.value || slot.id || slot.date || slot.datetime || slot.time || slot.startTime || slot.start || '';
  };

  const getSlotLabel = (slot) => {
    const value = getSlotValue(slot);
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString();
    return String(value || 'Available slot');
  };

  const selectedSlot = form.slotIndex !== '' ? availableSlots[Number(form.slotIndex)] : null;
  const selectedSlotValue = selectedSlot ? getSlotValue(selectedSlot) : '';

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
    setSubmitting(true);
    setError('');
    setCreated(null);

    const payload = {
      workshop: form.workshopId,
      service: selectedService?.name || form.serviceId,
      serviceId: form.serviceId,
      date: selectedSlotValue,
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

    try {
      const response = await post('/bookings', payload);
      setCreated(response?.data || response);
    } catch (err) {
      setError(err.message || 'Could not create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
          onChange={(e) => setForm({ ...form, workshopId: e.target.value, slotIndex: '' })}
          disabled={!driverPoint}
        >
          <option value="">{driverPoint ? 'Choose nearby workshop' : 'Use location to show nearby workshops'}</option>
          {workshopsList.map((item) => (
            <option value={item._id || item.id} key={item._id || item.id}>
              {item.name}{item.distanceKm != null ? ` - ${item.distanceKm.toFixed(1)} km` : ''}
            </option>
          ))}
        </select>

        <select
          required
          value={form.slotIndex}
          onChange={(e) => setForm({ ...form, slotIndex: e.target.value })}
          disabled={!form.workshopId}
        >
          <option value="">
            {form.workshopId
              ? availableSlots.length
                ? 'Choose available slot'
                : 'No available slots for this workshop'
              : 'Choose workshop first'}
          </option>

          {availableSlots.map((slot, index) => (
            <option value={index} key={`${getSlotValue(slot)}-${index}`}>
              {getSlotLabel(slot)}
            </option>
          ))}
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

        {driverPoint && workshopsList.length === 0 && (
          <p className="form-note">No nearby workshops were found within {NEARBY_RADIUS_KM} km of this location.</p>
        )}

        <textarea
          placeholder="Problem description"
          value={form.issue}
          onChange={(e) => setForm({ ...form, issue: e.target.value })}
        />

        <button className="primary-btn" disabled={submitting}>
          {submitting ? 'Creating booking...' : 'Confirm booking'}
        </button>
      </form>

      {error && <article className="state-card error-state"><strong>Booking failed</strong><p>{error}</p></article>}

      {created && (
        <article className="success-card">
          Booking confirmed successfully. The selected workshop can now see this request in its dashboard.
        </article>
      )}
    </div>
  );
}
