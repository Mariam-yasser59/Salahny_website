export const fallbackServices = [
  { id: 'svc-oil', name: 'Oil Change', category: 'Routine', price: 650, duration: '45 min', description: 'Premium oil and filter service with full fluid check.', enabled: true },
  { id: 'svc-repair', name: 'Repair Service', category: 'Maintenance', price: 850, duration: '2-4 hrs', description: 'Mechanical inspection and repair for engine, brakes, and suspension.', enabled: true },
  { id: 'svc-battery', name: 'Battery Service', category: 'Electrical', price: 450, duration: '30 min', description: 'Battery health check, charging test, and replacement support.', enabled: true },
  { id: 'svc-tire', name: 'Tire Service', category: 'Safety', price: 500, duration: '1 hr', description: 'Tire rotation, balancing, pressure checks, and puncture repair.', enabled: true },
  { id: 'svc-diagnostic', name: 'AI/OBD Diagnostics', category: 'Smart Care', price: 180, duration: 'Instant', description: 'Fault prediction using OBD readings and AI scoring.', enabled: true }
];

export const fallbackWorkshops = [
  { id: 'wrk-turbo', name: 'TurboFix Garage', address: 'Nasr City, Cairo', rating: 4.8, distance: '2.4 km', open: true, verified: true, specialties: ['Diagnostics', 'Oil Change', 'Battery'] },
  { id: 'wrk-prime', name: 'Prime Auto Care', address: 'New Cairo', rating: 4.6, distance: '6.1 km', open: true, verified: true, specialties: ['Repair', 'Car Wash', 'Towing'] },
  { id: 'wrk-redline', name: 'RedLine Service Hub', address: 'Mohandessin', rating: 4.9, distance: '4.8 km', open: false, verified: true, specialties: ['Engine', 'Brakes', 'Diagnostics'] }
];

export const fallbackPackages = [
  { id: 'pkg-basic', name: 'Basic', price: 199, period: 'month', enabled: true, features: ['1 AI diagnostic/month', 'Booking tracking', 'Support chat'] },
  { id: 'pkg-plus', name: 'Plus', price: 399, period: 'month', enabled: true, popular: true, features: ['5 AI diagnostics/month', 'Priority workshops', 'Emergency discount'] },
  { id: 'pkg-premium', name: 'Premium', price: 799, period: 'month', enabled: true, features: ['Unlimited diagnostics', '24/7 emergency priority', 'Annual inspection'] }
];

export const fallbackBookings = [
  { id: 'bk-1001', service: fallbackServices[0], workshop: fallbackWorkshops[0], status: 'in_progress', date: '2026-05-02', price: 650, progress: 55, timeline: ['Requested', 'Accepted', 'In progress'] },
  { id: 'bk-1002', service: fallbackServices[4], workshop: fallbackWorkshops[2], status: 'completed', date: '2026-04-21', price: 180, progress: 100, timeline: ['Requested', 'Diagnosed', 'Report sent'] }
];
