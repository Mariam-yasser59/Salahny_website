import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useApi } from '../../hooks/useApi.js';
import { assignServiceImages } from '../../utils/serviceImages.js';

export default function DriverServices() {
  const { data } = useApi('/driver/services', []);
  const services = assignServiceImages(data);

  return (
    <div className="dash-stack">
      <SectionHeader title="Services" />
      {services.length ? <div className="service-grid">{services.map((service) => (
        <article className="compact-card media-card" key={service.id || service._id || service.name}>
          <img src={service.image} alt={`${service.name} service`} />
          <Wrench />
          <h3>{service.name}</h3>
          <p>{service.description || service.category}</p>
          <strong>{service.price || 0} EGP</strong>
          <Link
            className="primary-btn"
            to="/driver/booking"
            state={{ serviceId: service.id || service._id || service.name }}
          >
            Book service
          </Link>
        </article>
      ))}</div> : <EmptyState title="No services found" />}
    </div>
  );
}
