import { MapPinned, Navigation, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';

const NEARBY_RADIUS_KM = 25;

const toList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.workshops)) return data.workshops;
  if (Array.isArray(data?.data?.workshops)) return data.data.workshops;
  return [];
};

const getWorkshopLocation = (workshop) => {
  const coordinates = workshop.location?.coordinates;
  if (Array.isArray(coordinates) && coordinates.length >= 2) return { longitude: Number(coordinates[0]), latitude: Number(coordinates[1]) };
  return {
    latitude: Number(workshop.latitude || workshop.lat || workshop.location?.latitude),
    longitude: Number(workshop.longitude || workshop.lng || workshop.location?.longitude)
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

export default function DriverWorkshops() {
  const navigate = useNavigate();
  const { data } = useApi('/driver/workshops', []);
  const [driverLocation, setDriverLocation] = useState(null);

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => setDriverLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => alert('Please allow location access')
    );
  };

  const workshops = useMemo(() => toList(data)
    .map((workshop) => {
      const workshopLocation = getWorkshopLocation(workshop);
      return { ...workshop, workshopLocation, distanceKm: distanceKm(driverLocation, workshopLocation) };
    })
    .filter((workshop) => driverLocation && workshop.distanceKm != null && workshop.distanceKm <= NEARBY_RADIUS_KM)
    .sort((a, b) => {
      return a.distanceKm - b.distanceKm;
    }), [data, driverLocation]);

  const nearestWorkshop = workshops[0];
  const bookWorkshop = (workshop) => navigate('/driver/booking', {
    state: {
      workshopId: workshop._id || workshop.id,
      workshopName: workshop.name,
      driverLocation,
    },
  });

  return (
    <div className="dash-stack">
      <SectionHeader title="Nearby Workshops">Allow location access to see workshops near your current area.</SectionHeader>
      <div className="map-layout">
        <div className="map-panel">
          <img className="panel-image" src="/images/garage-bay.jpg" alt="Modern automotive workshop bay" />
          <MapPinned size={54} />
          <h3>Cairo service coverage map</h3>
          {driverLocation ? <p>Your location: {driverLocation.latitude.toFixed(4)}, {driverLocation.longitude.toFixed(4)}</p> : <><p>Choose your location first. Nearby workshops will appear after Salahny calculates distance.</p><button className="primary-btn" onClick={getMyLocation}>Use My Location</button></>}
          {driverLocation && nearestWorkshop && (
            <div className="compact-card">
              <Navigation size={20} />
              <strong>Nearest workshop</strong>
              <p>{nearestWorkshop.name}</p>
              <p>{nearestWorkshop.distanceKm != null ? `${nearestWorkshop.distanceKm.toFixed(1)} km away` : 'Distance unavailable'}</p>
            </div>
          )}
        </div>

        <div className="workshop-list">
          {!driverLocation && (
            <article className="state-card">
              <strong>Location required</strong>
              <span>Use your current location so Salahny can show nearby workshops only.</span>
            </article>
          )}
          {driverLocation && workshops.length === 0 && (
            <article className="state-card">
              <strong>No nearby workshops found</strong>
              <span>Try again from another location or check back when more workshops are available nearby.</span>
            </article>
          )}
          {driverLocation && workshops.map((workshop) => {
            const id = workshop._id || workshop.id;
            const isOpen = workshop.open ?? workshop.availability === 'open';
            return (
              <article className="compact-card" key={id}>
                <div className="profile-identity">
                  {workshop.profileImage ? <img className="avatar image-avatar" src={workshop.profileImage} alt={workshop.name} /> : <div className="avatar">{(workshop.name || 'WS').slice(0, 2).toUpperCase()}</div>}
                  <h3>{workshop.name}</h3>
                </div>
                <p>{typeof workshop.location === 'string' ? workshop.location : workshop.address || workshop.location?.address || 'No address available'}</p>
                <p><Star size={16} fill="currentColor" /> {workshop.rating || 0} - {workshop.distanceKm != null ? `${workshop.distanceKm.toFixed(1)} km away` : workshop.distance || 'Distance unavailable'}</p>
                <div className="chips">{(workshop.specialties || workshop.services || []).slice(0, 4).map((item) => <span key={item.name || item}>{item.name || item}</span>)}</div>
                <StatusBadge value={isOpen ? 'open' : 'closed'} />
                <button className="primary-btn" onClick={() => bookWorkshop(workshop)}>Book</button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
