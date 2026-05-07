import { Wrench } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import Loading from '../../components/Loading.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function Services() {
  const { data, loading } = useApi('/public/landing', { services: [] });
  if (loading) return <Loading />;

  return (
    <main className="page">
      <SectionHeader eyebrow="Services" title="Complete service marketplace" />
      <div className="service-grid">
        {data.services.map((service) => <article className="compact-card" key={service.id}><Wrench /><h3>{service.name}</h3><p>{service.description}</p><strong>{service.price} EGP · {service.duration}</strong></article>)}
      </div>
    </main>
  );
}
