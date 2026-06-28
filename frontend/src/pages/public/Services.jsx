import { Wrench } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import Loading from '../../components/Loading.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function Services() {
  const { data, loading } = useApi('/public/landing', { services: [] });
  if (loading) return <Loading />;

  const services = buildServiceCatalog(data?.services || []);
  const groupedServices = services.reduce((groups, service) => {
    const category = service.category || 'Maintenance';
    groups[category] = [...(groups[category] || []), service];
    return groups;
  }, {});

  return (
    <main className="page">
      <SectionHeader eyebrow="Services" title="Complete service marketplace">
        Book trusted maintenance, diagnostics, repairs, and roadside support from verified Salahny workshops.
      </SectionHeader>
      {Object.entries(groupedServices).map(([category, items]) => (
        <section className="page-section" key={category}>
          <SectionHeader eyebrow="Category" title={category} />
          <div className="service-grid">
            {items.map((service) => (
              <article className="compact-card media-card" key={service.key || service.id || service.name}>
                <img src={service.image} alt={`${service.name} service`} />
                <Wrench />
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <strong>{formatServiceMeta(service)}</strong>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

const buildServiceCatalog = (apiServices) => {
  const unique = [];
  const seen = new Set();
  const sourceServices = apiServices.length ? apiServices : curatedServices;

  sourceServices.forEach((service) => {
    const name = service?.name || service?.title;
    if (!name) return;

    const canonical = serviceAliases[name.trim().toLowerCase()] || name.trim();
    const key = canonical.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    const fallback = curatedServices.find((item) => item.name.toLowerCase() === key);
    unique.push({
      ...service,
      key,
      name: canonical,
      description:
        service.description ||
        service.details ||
        (!apiServices.length ? fallback?.description : '') ||
        'Professional vehicle service from trusted Salahny workshops.',
      duration: normalizeDuration(service.duration || service.durationMins || (!apiServices.length ? fallback?.duration : '')),
      price: service.price ?? (!apiServices.length ? fallback?.price : 0) ?? 0,
    });
  });

  return unique.map((service, index) => ({
    ...service,
    image: serviceImageByName[service.key] || serviceImages[index % serviceImages.length],
  }));
};

const normalizeDuration = (duration) => {
  if (!duration) return '';
  if (typeof duration === 'number') return `${duration} min`;
  return String(duration);
};

const formatServiceMeta = (service) => {
  const price = Number(service.price || 0);
  const parts = [];

  if (price > 0) parts.push(`${price} EGP`);
  if (service.duration) parts.push(service.duration);

  return parts.length ? parts.join(' - ') : 'Price set by workshop';
};

const curatedServices = [
  {
    name: 'Oil Change',
    description: 'Premium oil and filter replacement with basic fluid checks.',
    price: 650,
    duration: '45 min',
  },
  {
    name: 'AI Diagnostics',
    description: 'OBD scanner analysis with health score, confidence, and recommended fix.',
    price: 300,
    duration: '30 min',
  },
  {
    name: 'Emergency Roadside Assistance',
    description: 'Urgent help for breakdowns, lockouts, jump starts, and safety issues.',
    price: 750,
    duration: 'Priority',
  },
  {
    name: 'Towing Service',
    description: 'Tow your vehicle to the nearest approved workshop when it cannot be driven.',
    price: 950,
    duration: 'On demand',
  },
  {
    name: 'Electrical Diagnostics',
    description: 'Inspect fuses, wiring, sensors, warning lights, and electrical faults.',
    price: 550,
    duration: '45 min',
  },
  {
    name: 'Battery Service',
    description: 'Battery test, terminal cleaning, charging-system check, and replacement support.',
    price: 450,
    duration: '30 min',
  },
  {
    name: 'Brake Service',
    description: 'Brake pad inspection, replacement, and road-safety testing.',
    price: 900,
    duration: '1-2 hrs',
  },
  {
    name: 'Tire Rotation',
    description: 'Rotate, balance, pressure-check, and inspect all four tires.',
    price: 500,
    duration: '1 hr',
  },
  {
    name: 'Suspension Inspection',
    description: 'Check shocks, control arms, bushings, wheel bearings, and underbody parts.',
    price: 650,
    duration: '1 hr',
  },
  {
    name: 'Full Mechanical Repair',
    description: 'Engine, cooling, steering, drivetrain, and underbody repair work.',
    price: 1200,
    duration: 'Quote required',
  },
  {
    name: 'Fuel Delivery',
    description: 'On-road fuel delivery when your tank runs dry.',
    price: 300,
    duration: '30-60 min',
  },
];

const serviceAliases = {
  'repair service': 'Full Mechanical Repair',
  'towing': 'Towing Service',
  'emergency assistance': 'Emergency Roadside Assistance',
  'ai/obd diagnostics': 'AI Diagnostics',
  'tire service': 'Tire Rotation',
};

const serviceImageByName = {
  'brake service': '/images/brake-service.jpg',
  'full mechanical repair': '/images/mechanical-repair.jpg',
};

const serviceImages = [
  '/images/oil-service.jpg',
  '/images/ai-diagnostic.jpg',
  '/images/service-trust.jpg',
  '/images/garage-bay.jpg',
  '/images/electrical-diagnostics.jpg',
  '/images/inspection.jpg',
  '/images/performance-repair.jpg',
  '/images/lift-inspection.jpg',
  '/images/suspension-service.jpg',
  '/images/workshop-lift.jpg',
  '/images/about-workshop.jpg',
];
