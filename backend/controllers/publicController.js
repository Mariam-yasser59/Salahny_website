import { db } from '../data/mockData.js';
import { listBookings, listEmergencyRequests, listServices, listWorkshops } from '../services/persistentData.js';

export const getLandingData = async (_req, res) => {
  const [services, workshops, bookings, emergencyRequests] = await Promise.all([
    listServices(),
    listWorkshops(),
    listBookings(),
    listEmergencyRequests()
  ]);
  const completedBookings = bookings.filter((booking) => booking.status === 'completed');

  res.json({
    services: services.filter((service) => service.enabled !== false),
    packages: db.packages.filter((pkg) => pkg.enabled),
    testimonials: db.reviews,
    workshops,
    completedServices: completedBookings.length,
    happyCustomers: new Set(completedBookings.map((booking) => booking.driverId || booking.driver || booking.userId).filter(Boolean)).size,
    emergencyHandled: emergencyRequests.filter((request) => ['completed', 'arrived', 'accepted_by_workshop'].includes(request.status)).length
  });
};

export const publicWorkshops = async (_req, res) => {
  const workshops = (await listWorkshops()).filter((workshop) => {
    const status = String(workshop.accountStatus || workshop.status || '').toLowerCase();
    return workshop.verified === true || workshop.isVerified === true || ['active', 'approved', 'verified'].includes(status);
  });
  res.json({ success: true, data: workshops });
};
