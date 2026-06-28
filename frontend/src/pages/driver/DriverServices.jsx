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
        <article className="compact-card media-card" key={service.id || service._id || service.name}>
          <img src={resolveServiceImage(service)} alt={`${service.name} service`} />
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

const resolveServiceImage = (service) => {
  const name = String(service?.name || service?.title || '').toLowerCase();
  const category = String(service?.category || '').toLowerCase();
  const haystack = `${name} ${category}`;

  const exact = serviceImageByName[name];
  if (exact) return exact;

  const categoryImage = serviceImageByCategory[category];
  if (categoryImage) return categoryImage;

  const matched = serviceImageKeywords.find(([keyword]) => haystack.includes(keyword));
  if (matched) return matched[1];

  const seed = name || category || 'service';
  const index = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % serviceImages.length;
  return serviceImages[index];
};

const serviceImageByName = {
  'oil change': '/images/oil-service.jpg',
  'engine oil change': '/images/oil-service.jpg',
  'ai diagnostics': '/images/ai-diagnostic.jpg',
  'ai diagnosis report': '/images/ai-diagnostic.jpg',
  'electrical diagnostics': '/images/electrical-diagnostics.jpg',
  'brake service': '/images/service-brake-system.png',
  'battery service': '/images/service-battery-check.png',
  'battery check': '/images/service-battery-check.png',
  'battery replacement': '/images/service-battery-replacement.png',
  'towing service': '/images/lift-inspection.jpg',
  'tire rotation': '/images/service-tires-wheels.png',
  'suspension inspection': '/images/suspension-service.jpg',
  'full mechanical repair': '/images/service-mechanical-repair.png',
  'emergency roadside assistance': '/images/service-battery-roadside.png',
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
  ['electrical', '/images/service-electrical-system.png'],
  ['alternator', '/images/service-electrical-system.png'],
  ['starter', '/images/service-electrical-system.png'],
  ['wiring', '/images/service-electrical-system.png'],
  ['sensor', '/images/service-electrical-system.png'],
  ['ecu', '/images/service-electrical-system.png'],
  ['ac ', '/images/service-ac-system.png'],
  ['air conditioning', '/images/service-ac-system.png'],
  ['compressor', '/images/service-ac-system.png'],
  ['cleaning', '/images/service-car-care-cleaning.png'],
  ['detailing', '/images/service-car-care-cleaning.png'],
  ['wash', '/images/service-car-care-cleaning.png'],
  ['tire', '/images/service-tires-wheels.png'],
  ['wheel', '/images/service-tires-wheels.png'],
  ['suspension', '/images/suspension-service.jpg'],
  ['steering', '/images/suspension-service.jpg'],
  ['transmission', '/images/service-mechanical-repair.png'],
  ['gear', '/images/service-mechanical-repair.png'],
  ['diagnostic', '/images/ai-diagnostic.jpg'],
  ['obd', '/images/ai-diagnostic.jpg'],
  ['engine', '/images/service-engine-repair.png'],
  ['oil', '/images/oil-service.jpg'],
  ['maintenance', '/images/service-maintenance-tools.png'],
  ['inspection', '/images/inspection.jpg'],
  ['tow', '/images/lift-inspection.jpg'],
  ['fuel delivery', '/images/service-battery-roadside.png'],
  ['emergency', '/images/service-battery-roadside.png'],
  ['paint', '/images/service-maintenance-tools.png'],
  ['dent', '/images/service-mechanical-repair.png'],
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
  '/images/service-mechanical-repair.png',
  '/images/service-battery-roadside.png',
  '/images/service-car-care-cleaning.png',
  '/images/service-maintenance-tools.png',
  '/images/service-battery-replacement.png',
];
