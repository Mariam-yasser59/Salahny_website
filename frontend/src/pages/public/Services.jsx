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
    image: resolveServiceImage(service, index),
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
  'oil change': '/images/oil-service.jpg',
  'brake service': '/images/service-brake-system.png',
  'brake inspection': '/images/service-brake-system.png',
  'brake pads replacement': '/images/service-brake-system.png',
  'brake disc replacement': '/images/service-brake-system.png',
  'brake oil change': '/images/service-brake-system.png',
  'abs diagnosis': '/images/service-brake-system.png',
  'brake caliper repair': '/images/service-brake-system.png',
  'full mechanical repair': '/images/service-mechanical-repair.png',
  'engine inspection': '/images/service-engine-repair.png',
  'engine overhaul': '/images/service-engine-repair.png',
  'engine oil change': '/images/service-maintenance-tools.png',
  'engine tune-up': '/images/service-engine-repair.png',
  'spark plug replacement': '/images/service-engine-repair.png',
  'timing belt replacement': '/images/service-engine-repair.png',
  'water pump replacement': '/images/service-engine-repair.png',
  'engine mount replacement': '/images/service-engine-repair.png',
  'fuel pump replacement': '/images/service-engine-repair.png',
  'electrical diagnostics': '/images/electrical-diagnostics.jpg',
  'battery service': '/images/service-battery-check.png',
  'battery check': '/images/service-battery-check.png',
  'battery replacement': '/images/service-battery-replacement.png',
  'battery jump start': '/images/service-battery-roadside.png',
  'alternator repair': '/images/service-electrical-system.png',
  'starter motor repair': '/images/service-electrical-system.png',
  'wiring repair': '/images/service-electrical-system.png',
  'fuse replacement': '/images/service-electrical-system.png',
  'sensor replacement': '/images/service-electrical-system.png',
  'ecu diagnostics': '/images/service-electrical-system.png',
  'ecu programming': '/images/service-electrical-system.png',
  'ac inspection': '/images/service-ac-system.png',
  'ac gas recharge': '/images/service-ac-system.png',
  'compressor repair': '/images/service-ac-system.png',
  'cabin filter replacement': '/images/service-car-care-cleaning.png',
  'ac cleaning': '/images/service-car-care-cleaning.png',
  'ac leak detection': '/images/service-ac-system.png',
  'tire rotation': '/images/service-tires-wheels.png',
  'tire replacement': '/images/service-tires-wheels.png',
  'wheel balancing': '/images/service-tires-wheels.png',
  'wheel alignment': '/images/service-tires-wheels.png',
  'tire repair': '/images/service-tires-wheels.png',
  'nitrogen filling': '/images/service-tires-wheels.png',
  'suspension inspection': '/images/suspension-service.jpg',
  'transmission inspection': '/images/service-mechanical-repair.png',
  'gear oil change': '/images/service-maintenance-tools.png',
  'automatic transmission service': '/images/service-mechanical-repair.png',
  'clutch replacement': '/images/service-mechanical-repair.png',
  'gearbox repair': '/images/service-mechanical-repair.png',
  'ai diagnostics': '/images/ai-diagnostic.jpg',
  'ai diagnosis report': '/images/ai-diagnostic.jpg',
  'obd-ii scan': '/images/ai-diagnostic.jpg',
  'full computer diagnostics': '/images/ai-diagnostic.jpg',
  'engine fault diagnosis': '/images/ai-diagnostic.jpg',
  'check engine reset': '/images/ai-diagnostic.jpg',
  'emergency roadside assistance': '/images/service-battery-roadside.png',
  'towing service': '/images/lift-inspection.jpg',
  'tow truck داخل المدينة': '/images/workshop-lift.jpg',
  'tow truck خارج المدينة': '/images/workshop-lift.jpg',
  'flat tire assistance': '/images/service-tires-wheels.png',
  'fuel delivery': '/images/service-battery-roadside.png',
  'emergency lockout': '/images/service-battery-roadside.png',
  'exterior wash': '/images/service-car-care-cleaning.png',
  'interior cleaning': '/images/service-car-care-cleaning.png',
  'full detailing': '/images/service-car-care-cleaning.png',
  'polish': '/images/service-car-care-cleaning.png',
  'ceramic coating': '/images/service-car-care-cleaning.png',
  'engine cleaning': '/images/service-car-care-cleaning.png',
  'dent repair': '/images/service-mechanical-repair.png',
  'bumper repair': '/images/service-mechanical-repair.png',
  'painting per part': '/images/service-maintenance-tools.png',
  'full car paint': '/images/service-maintenance-tools.png',
  'scratch repair': '/images/service-maintenance-tools.png',
  'windshield replacement': '/images/service-maintenance-tools.png',
  'periodic maintenance (5,000 km)': '/images/service-maintenance-tools.png',
  'periodic maintenance (10,000 km)': '/images/service-maintenance-tools.png',
  'fluid check': '/images/service-maintenance-tools.png',
  'coolant replacement': '/images/service-maintenance-tools.png',
  'belt inspection': '/images/service-engine-repair.png',
  'multi-point inspection': '/images/service-maintenance-tools.png',
};

const serviceImageByCategory = {
  'engine & mechanical': '/images/service-engine-repair.png',
  'electrical system': '/images/service-electrical-system.png',
  'air conditioning': '/images/service-ac-system.png',
  'tires & wheels': '/images/service-tires-wheels.png',
  'brake system': '/images/service-brake-system.png',
  'suspension & steering': '/images/suspension-service.jpg',
  transmission: '/images/service-mechanical-repair.png',
  diagnostics: '/images/ai-diagnostic.jpg',
  'emergency services': '/images/service-battery-roadside.png',
  'car care': '/images/service-car-care-cleaning.png',
  'body & paint': '/images/service-maintenance-tools.png',
  maintenance: '/images/service-maintenance-tools.png',
};

const serviceImageKeywords = [
  ['brake', '/images/service-brake-system.png'],
  ['battery jump', '/images/service-battery-roadside.png'],
  ['battery', '/images/service-battery-check.png'],
  ['alternator', '/images/service-electrical-system.png'],
  ['starter', '/images/service-electrical-system.png'],
  ['wiring', '/images/service-electrical-system.png'],
  ['sensor', '/images/service-electrical-system.png'],
  ['electrical', '/images/service-electrical-system.png'],
  ['ecu', '/images/service-electrical-system.png'],
  ['ac ', '/images/service-ac-system.png'],
  ['air conditioning', '/images/service-ac-system.png'],
  ['compressor', '/images/service-ac-system.png'],
  ['cabin filter', '/images/service-car-care-cleaning.png'],
  ['cleaning', '/images/service-car-care-cleaning.png'],
  ['detailing', '/images/service-car-care-cleaning.png'],
  ['wash', '/images/service-car-care-cleaning.png'],
  ['tire', '/images/service-tires-wheels.png'],
  ['wheel', '/images/service-tires-wheels.png'],
  ['suspension', '/images/suspension-service.jpg'],
  ['steering', '/images/suspension-service.jpg'],
  ['transmission', '/images/service-mechanical-repair.png'],
  ['gear', '/images/service-mechanical-repair.png'],
  ['clutch', '/images/service-mechanical-repair.png'],
  ['diagnostic', '/images/ai-diagnostic.jpg'],
  ['obd', '/images/ai-diagnostic.jpg'],
  ['engine', '/images/service-engine-repair.png'],
  ['oil', '/images/service-maintenance-tools.png'],
  ['maintenance', '/images/service-maintenance-tools.png'],
  ['inspection', '/images/service-maintenance-tools.png'],
  ['tow', '/images/workshop-lift.jpg'],
  ['fuel delivery', '/images/service-battery-roadside.png'],
  ['emergency', '/images/service-battery-roadside.png'],
  ['paint', '/images/service-maintenance-tools.png'],
  ['dent', '/images/service-mechanical-repair.png'],
  ['bumper', '/images/service-mechanical-repair.png'],
];

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
  '/images/service-engine-repair.png',
  '/images/service-electrical-system.png',
  '/images/service-ac-system.png',
  '/images/service-tires-wheels.png',
  '/images/service-brake-system.png',
  '/images/suspension-service.jpg',
  '/images/service-mechanical-repair.png',
  '/images/ai-diagnostic.jpg',
  '/images/service-battery-roadside.png',
  '/images/service-car-care-cleaning.png',
  '/images/service-maintenance-tools.png',
  '/images/service-battery-replacement.png',
];

const resolveServiceImage = (service, index) => {
  const key = service.key || '';
  const category = String(service.category || '').toLowerCase();
  const haystack = `${key} ${category}`;

  if (serviceImageByName[key]) return serviceImageByName[key];
  if (serviceImageByCategory[category]) return serviceImageByCategory[category];

  const matched = serviceImageKeywords.find(([keyword]) => haystack.includes(keyword));
  if (matched) return matched[1];

  return serviceImages[index % serviceImages.length];
};
