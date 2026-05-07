import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function DriverServices() {
  const { data } = useApi('/driver/services', []);
  return (
    <div className="dash-stack">
      <SectionHeader title="Services" />
      {data.length ? <div className="service-grid">{data.map((service) => (
        <article className="compact-card" key={service.id}>
          <Wrench />
          <h3>{service.name}</h3>
          <p>{service.description || service.category}</p>
          <strong>{service.price || 0} EGP</strong>
          <Link className="primary-btn" to="/driver/booking">Book service</Link>
        </article>
      ))}</div> : <EmptyState title="No services found" />}
    </div>
  );
}
