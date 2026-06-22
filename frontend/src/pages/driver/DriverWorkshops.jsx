import { MapPinned, Navigation, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';

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
    .sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    }), [data, driverLocation]);

  const nearestWorkshop = workshops.find((item) => item.distanceKm != null) || workshops[0];
  const bookWorkshop = (workshop) => navigate('/driver/booking', { state: { workshopId: workshop._id || workshop.id, workshopName: workshop.name } });

  return (
    <div className="dash-stack">
      <SectionHeader title="Nearby Workshops">List and map-style marketplace for verified auto service partners.</SectionHeader>
      <div className="map-layout">
        <div className="map-panel">
          <img className="panel-image" src="/images/garage-bay.jpg" alt="Modern automotive workshop bay" />
          <MapPinned size={54} />
          <h3>Cairo service coverage map</h3>
          {driverLocation ? <p>Your location: {driverLocation.latitude.toFixed(4)}, {driverLocation.longitude.toFixed(4)}</p> : <><p>Location not selected</p><button className="primary-btn" onClick={getMyLocation}>Use My Location</button></>}
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
          {workshops.map((workshop) => {
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
