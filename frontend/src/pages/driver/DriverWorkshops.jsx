import { MapPinned, Star } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function DriverWorkshops() {
  const { data } = useApi('/driver/workshops', []);
  return (
    <div className="dash-stack">
      <SectionHeader title="Nearby Workshops">List and map-style marketplace for verified auto service partners.</SectionHeader>
      <div className="map-layout">
        <div className="map-panel"><MapPinned size={44} /><p>Cairo service coverage map</p></div>
        <div className="workshop-list">{data.map((workshop) => <article className="compact-card" key={workshop.id}><h3>{workshop.name}</h3><p>{workshop.address}</p><p><Star size={16} fill="currentColor" /> {workshop.rating} · {workshop.distance}</p><StatusBadge value={workshop.open ? 'open' : 'closed'} /><button className="primary-btn">Book</button></article>)}</div>
      </div>
    </div>
  );
}
