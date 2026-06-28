import { egyptServiceCatalog } from './egyptServiceCatalog.js';

export const db = {
  users: [
    { id: 'u1', role: 'driver', name: 'Mariam Yasser', email: 'driver@salahny.com', password: 'driver123', phone: '+20 100 112 3344', status: 'active', city: 'Cairo', joinedAt: '2026-01-12', profileImage: '' },
    { id: 'u2', role: 'driver', name: 'Omar Khaled', email: 'omar@example.com', password: 'driver123', phone: '+20 111 555 8222', status: 'pending', city: 'Giza', joinedAt: '2026-03-02' },
    { id: 'u3', role: 'workshop', name: 'TurboFix Garage', email: 'workshop@salahny.com', password: 'workshop123', phone: '+20 122 661 9090', status: 'verified', city: 'Nasr City', joinedAt: '2025-12-06' },
    { id: 'u4', role: 'workshop', name: 'Prime Auto Care', email: 'prime@example.com', password: 'workshop123', phone: '+20 109 330 1900', status: 'pending', city: 'New Cairo', joinedAt: '2026-02-20' },
    { id: 'admin1', role: 'admin', name: 'Salahny Super Admin', email: 'admin@salahny.com', password: 'admin123', phone: '+20 100 000 0000', status: 'active', city: 'Cairo', joinedAt: '2025-10-01' }
  ],
  vehicles: [
    { id: 'v1', driverId: 'u1', make: 'Toyota', model: 'Corolla', year: 2021, plate: 'ABC-2145', vin: 'JTDBR32E720123456', health: 87, obdStatus: 'Connected', mileage: 62400, lastService: '2026-03-18' },
    { id: 'v2', driverId: 'u1', make: 'Hyundai', model: 'Elantra', year: 2019, plate: 'MNO-8812', vin: 'KMHD84LF1KU654321', health: 73, obdStatus: 'Disconnected', mileage: 93820, lastService: '2026-02-11' }
  ],
  workshops: [
    { id: 'w1', userId: 'u3', name: 'TurboFix Garage', address: '19 Abbas El Akkad, Nasr City', latitude: 30.061, longitude: 31.338, distance: '2.4 km', rating: 4.8, reviews: 184, open: true, verified: true, accountStatus: 'active', verificationStatus: 'admin_approved', revenue: 68400, phone: '+20 122 661 9090', profileImage: '', specialties: ['Diagnostics', 'Engine & Mechanical', 'Electrical System', 'Tires & Wheels'], availableSlots: ['2026-06-22T08:00:00.000Z', '2026-06-22T10:00:00.000Z'], serviceDetails: [{ id: 'engine-oil-change', name: 'Engine Oil Change', emoji: 'Service', durationMins: 45, price: 350 }, { id: 'ai-diagnosis-report', name: 'AI Diagnosis Report', emoji: 'Service', durationMins: 30, price: 225 }] },
    { id: 'w2', userId: 'u4', name: 'Prime Auto Care', address: '90 Street, New Cairo', latitude: 30.02, longitude: 31.49, distance: '6.1 km', rating: 4.6, reviews: 98, open: true, verified: false, accountStatus: 'pending', verificationStatus: 'pending_upload', revenue: 31200, phone: '+20 109 330 1900', specialties: ['Repair', 'Car Wash', 'Towing'], availableSlots: [], serviceDetails: [] },
    { id: 'w3', userId: 'u5', name: 'RedLine Service Hub', address: 'Sphinx Square, Mohandessin', latitude: 30.06, longitude: 31.2, distance: '4.8 km', rating: 4.9, reviews: 221, open: false, verified: true, accountStatus: 'active', verificationStatus: 'admin_approved', revenue: 92300, phone: '+20 101 221 5555', specialties: ['Engine', 'Brakes', 'Diagnostics'], availableSlots: [], serviceDetails: [] }
  ],
  services: egyptServiceCatalog,
  packages: [
    { id: 'p1', name: 'Basic', price: 499, period: 'month', enabled: true, features: ['1 AI diagnostic/month', 'Booking tracking', 'Workshop ratings', 'Support chat'] },
    { id: 'p2', name: 'Premium', price: 1299, period: 'month', enabled: true, popular: true, features: ['5 AI diagnostics/month', 'Priority workshops', 'Emergency dispatch discount', 'Maintenance reminders'] },
    { id: 'p3', name: 'Fleet', price: 5999, period: 'month', enabled: true, features: ['Unlimited diagnostics', '24/7 emergency priority', 'Fleet vehicle monitoring', 'Dedicated support advisor'] }
  ],
  bookings: [
    { id: 'b1', driverId: 'u1', vehicleId: 'v1', workshopId: 'w1', serviceId: 'engine-oil-change', status: 'in_progress', date: '2026-04-28', time: '10:30', slot: '2026-04-28T08:30:00.000Z', subtotal: 350, appServiceFee: 35, price: 385, total: 385, progress: 55, issue: 'Oil change due soon', timeline: ['Booked', 'Accepted', 'Vehicle received', 'Service in progress'] },
    { id: 'b2', driverId: 'u1', vehicleId: 'v2', workshopId: 'w3', serviceId: 'ai-diagnosis-report', status: 'completed', date: '2026-04-12', time: '14:00', subtotal: 225, appServiceFee: 22.5, price: 247.5, total: 247.5, progress: 100, issue: 'Battery voltage fluctuating', timeline: ['Booked', 'Accepted', 'Diagnostic completed', 'Report sent'] },
    { id: 'b3', driverId: 'u2', vehicleId: 'v3', workshopId: 'w1', serviceId: 'tow-truck-city', status: 'pending', date: '2026-04-27', time: '08:45', subtotal: 500, appServiceFee: 50, price: 550, total: 550, progress: 15, issue: 'Vehicle will not start', timeline: ['Requested'] }
  ],
  diagnostics: [
    { id: 'd1', driverId: 'u1', vehicleId: 'v1', date: '2026-04-20', coolantTemp: 91, rpm: 790, speed: 0, battery: 12.5, brake: 'Good', engineLoad: 28, healthScore: 87, possibleFault: 'Oil change due soon', probability: 68, recommendation: 'Book oil service within 2 weeks.' },
    { id: 'd2', driverId: 'u1', vehicleId: 'v2', date: '2026-04-09', coolantTemp: 96, rpm: 920, speed: 35, battery: 11.8, brake: 'Fair', engineLoad: 42, healthScore: 73, possibleFault: 'Battery degradation', probability: 74, recommendation: 'Run battery service before the next long trip.' }
  ],
  reviews: [
    { id: 'r1', workshopId: 'w1', author: 'Mariam Yasser', rating: 5, comment: 'Clean service bay, transparent quote, and real-time updates.' },
    { id: 'r2', workshopId: 'w3', author: 'Ahmed Sami', rating: 5, comment: 'The diagnostics report helped me fix the issue on the first visit.' },
    { id: 'r3', workshopId: 'w2', author: 'Nour Adel', rating: 4, comment: 'Friendly team and good wash quality.' }
  ],
  ratings: [],
  activityLogs: [
    { id: 'a1', type: 'user_registered', actor: 'Omar Khaled', message: 'Driver registered and awaits approval', date: '2026-04-24 09:30' },
    { id: 'a2', type: 'workshop_approved', actor: 'Admin', message: 'TurboFix Garage was verified', date: '2026-04-23 12:15' },
    { id: 'a3', type: 'booking_created', actor: 'Mariam Yasser', message: 'Created oil change booking B-1001', date: '2026-04-22 18:10' },
    { id: 'a4', type: 'price_changed', actor: 'Admin', message: 'Battery service price changed to 450 EGP', date: '2026-04-21 11:45' },
    { id: 'a5', type: 'account_suspended', actor: 'Admin', message: 'Inactive driver account suspended', date: '2026-04-19 16:00' }
  ],
  supportMessages: [
    { id: 'm1', role: 'assistant', text: 'Your coolant temperature is normal. The oil service reminder is the highest-priority item.' },
    { id: 'm2', role: 'user', text: 'Can I drive for another week?' },
    { id: 'm3', role: 'assistant', text: 'Yes, but avoid long high-load trips and schedule oil service within 2 weeks.' }
  ],
  emergencyRequests: [
    { id: 'er1', workshopId: 'w1', driverId: 'u1', emergencyType: 'Battery jump start', issueDescription: 'Vehicle will not start near Nasr City.', address: 'Makram Ebeid, Nasr City', latitude: 30.06, longitude: 31.34, locationNotes: 'Near the main entrance', status: 'assigned', createdAt: '2026-06-19T09:15:00.000Z' }
  ],
  adminWorkshopMessages: [
    { id: 'am1', workshopId: 'w1', senderRole: 'admin', senderId: 'admin1', text: 'Your verification documents are approved. Keep availability updated for driver bookings.', createdAt: '2026-06-18T10:00:00.000Z', readByWorkshop: false, readByAdmin: true }
  ],
  bookingMessages: [
    { id: 'bm1', bookingId: 'b1', senderRole: 'driver', senderId: 'u1', text: 'I will arrive on time for the oil change.', createdAt: '2026-06-19T08:00:00.000Z' }
  ],
  notifications: [
    { id: 'n1', userId: 'u3', title: 'New assigned request', message: 'A roadside emergency request was assigned to your workshop.', type: 'emergency', createdAt: '2026-06-19T09:15:00.000Z' }
  ],
  earnings: [
    { id: 'e1', workshopId: 'w1', bookingId: 'b2', driverId: 'u1', amount: 247.5, status: 'available', createdAt: '2026-04-12T14:00:00.000Z' }
  ],
  trackingUpdates: [],
  verificationDocuments: []
};

export const findById = (collection, id) => db[collection].find((item) => item.id === id);
export const nextId = (prefix, collection) => `${prefix}${db[collection].length + 1}`;
