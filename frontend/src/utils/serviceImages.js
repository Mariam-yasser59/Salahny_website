const oldImages = [
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
  '/images/about-brake-service.jpg',
  '/images/mechanical-repair.jpg',
  '/images/brake-service.jpg',
];

const newImages = [
  '/images/service-engine-repair.png',
  '/images/service-electrical-system.png',
  '/images/service-ac-system.png',
  '/images/service-ac-odor.png',
  '/images/service-tires-wheels.png',
  '/images/service-brake-system.png',
  '/images/service-mechanical-repair.png',
  '/images/service-battery-roadside.png',
  '/images/service-car-care-cleaning.png',
  '/images/service-maintenance-tools.png',
  '/images/service-battery-replacement.png',
  '/images/service-battery-check.png',
];

const allImages = [...oldImages, ...newImages];

const categoryPools = {
  'engine & mechanical': [
    '/images/service-engine-repair.png',
    '/images/mechanical-repair.jpg',
    '/images/performance-repair.jpg',
    '/images/service-maintenance-tools.png',
    '/images/inspection.jpg',
    '/images/service-mechanical-repair.png',
  ],
  'electrical system': [
    '/images/electrical-diagnostics.jpg',
    '/images/service-electrical-system.png',
    '/images/service-battery-check.png',
    '/images/service-battery-replacement.png',
    '/images/service-battery-roadside.png',
    '/images/inspection.jpg',
  ],
  'air conditioning': [
    '/images/service-ac-system.png',
    '/images/service-ac-odor.png',
    '/images/service-car-care-cleaning.png',
    '/images/inspection.jpg',
    '/images/garage-bay.jpg',
  ],
  'tires & wheels': [
    '/images/service-tires-wheels.png',
    '/images/lift-inspection.jpg',
    '/images/workshop-lift.jpg',
    '/images/garage-bay.jpg',
    '/images/inspection.jpg',
  ],
  'brake system': [
    '/images/service-brake-system.png',
    '/images/brake-service.jpg',
    '/images/about-brake-service.jpg',
    '/images/lift-inspection.jpg',
    '/images/inspection.jpg',
  ],
  'suspension & steering': [
    '/images/suspension-service.jpg',
    '/images/lift-inspection.jpg',
    '/images/workshop-lift.jpg',
    '/images/service-mechanical-repair.png',
    '/images/inspection.jpg',
  ],
  transmission: [
    '/images/service-mechanical-repair.png',
    '/images/mechanical-repair.jpg',
    '/images/performance-repair.jpg',
    '/images/service-maintenance-tools.png',
  ],
  diagnostics: [
    '/images/ai-diagnostic.jpg',
    '/images/electrical-diagnostics.jpg',
    '/images/inspection.jpg',
    '/images/service-battery-check.png',
  ],
  'emergency services': [
    '/images/service-battery-roadside.png',
    '/images/lift-inspection.jpg',
    '/images/workshop-lift.jpg',
    '/images/service-tires-wheels.png',
    '/images/service-battery-replacement.png',
  ],
  'car care': [
    '/images/service-car-care-cleaning.png',
    '/images/service-trust.jpg',
    '/images/garage-bay.jpg',
    '/images/about-workshop.jpg',
    '/images/service-ac-odor.png',
  ],
  'body & paint': [
    '/images/service-maintenance-tools.png',
    '/images/service-mechanical-repair.png',
    '/images/performance-repair.jpg',
    '/images/garage-bay.jpg',
  ],
  maintenance: [
    '/images/service-maintenance-tools.png',
    '/images/oil-service.jpg',
    '/images/inspection.jpg',
    '/images/garage-bay.jpg',
    '/images/service-engine-repair.png',
  ],
};

const namePools = {
  'oil change': ['/images/oil-service.jpg', '/images/service-maintenance-tools.png'],
  'engine oil change': ['/images/oil-service.jpg', '/images/service-maintenance-tools.png'],
  'ai diagnostics': ['/images/ai-diagnostic.jpg', '/images/electrical-diagnostics.jpg'],
  'ai diagnosis report': ['/images/ai-diagnostic.jpg', '/images/electrical-diagnostics.jpg'],
  'electrical diagnostics': ['/images/electrical-diagnostics.jpg', '/images/service-electrical-system.png'],
  'brake service': ['/images/service-brake-system.png', '/images/brake-service.jpg', '/images/about-brake-service.jpg'],
  'battery service': ['/images/service-battery-check.png', '/images/service-battery-replacement.png'],
  'battery check': ['/images/service-battery-check.png', '/images/electrical-diagnostics.jpg'],
  'battery replacement': ['/images/service-battery-replacement.png', '/images/service-battery-roadside.png'],
  'towing service': ['/images/lift-inspection.jpg', '/images/workshop-lift.jpg'],
  'tire rotation': ['/images/service-tires-wheels.png', '/images/lift-inspection.jpg'],
  'suspension inspection': ['/images/suspension-service.jpg', '/images/lift-inspection.jpg'],
  'full mechanical repair': ['/images/service-mechanical-repair.png', '/images/mechanical-repair.jpg'],
  'emergency roadside assistance': ['/images/service-battery-roadside.png', '/images/workshop-lift.jpg'],
};

const keywordPools = [
  ['brake', categoryPools['brake system']],
  ['battery jump', ['/images/service-battery-roadside.png', '/images/service-battery-replacement.png']],
  ['battery', ['/images/service-battery-check.png', '/images/service-battery-replacement.png', '/images/service-battery-roadside.png']],
  ['electrical', categoryPools['electrical system']],
  ['alternator', categoryPools['electrical system']],
  ['starter', categoryPools['electrical system']],
  ['wiring', categoryPools['electrical system']],
  ['sensor', categoryPools['electrical system']],
  ['ecu', categoryPools['electrical system']],
  ['ac ', categoryPools['air conditioning']],
  ['air conditioning', categoryPools['air conditioning']],
  ['compressor', categoryPools['air conditioning']],
  ['cleaning', categoryPools['car care']],
  ['detailing', categoryPools['car care']],
  ['wash', categoryPools['car care']],
  ['tire', categoryPools['tires & wheels']],
  ['wheel', categoryPools['tires & wheels']],
  ['suspension', categoryPools['suspension & steering']],
  ['steering', categoryPools['suspension & steering']],
  ['transmission', categoryPools.transmission],
  ['gear', categoryPools.transmission],
  ['diagnostic', categoryPools.diagnostics],
  ['obd', categoryPools.diagnostics],
  ['engine', categoryPools['engine & mechanical']],
  ['oil', namePools['oil change']],
  ['maintenance', categoryPools.maintenance],
  ['inspection', categoryPools.maintenance],
  ['tow', categoryPools['emergency services']],
  ['fuel delivery', categoryPools['emergency services']],
  ['emergency', categoryPools['emergency services']],
  ['paint', categoryPools['body & paint']],
  ['dent', categoryPools['body & paint']],
];

const unique = (items) => [...new Set(items.filter(Boolean))];

const imageCandidatesFor = (service) => {
  const name = String(service?.name || service?.title || '').toLowerCase();
  const category = String(service?.category || '').toLowerCase();
  const haystack = `${name} ${category}`;
  const keywordPool = keywordPools.find(([keyword]) => haystack.includes(keyword))?.[1] || [];

  return unique([
    ...(namePools[name] || []),
    ...(categoryPools[category] || []),
    ...keywordPool,
    ...allImages,
  ]);
};

export const assignServiceImages = (services = []) => {
  const usedByCategory = new Map();

  return services.map((service, index) => {
    const category = String(service?.category || 'services').toLowerCase();
    const used = usedByCategory.get(category) || new Set();
    const candidates = imageCandidatesFor(service);
    const image =
      candidates.find((candidate) => !used.has(candidate)) ||
      candidates[index % candidates.length] ||
      allImages[index % allImages.length];

    used.add(image);
    usedByCategory.set(category, used);

    return { ...service, image };
  });
};
