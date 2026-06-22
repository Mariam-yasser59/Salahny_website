import { db } from '../data/mockData.js';
import { listServices, listWorkshops } from '../services/persistentData.js';

export const getLandingData = async (_req, res) => {
  res.json({
    services: (await listServices()).filter((service) => service.enabled !== false),
    packages: db.packages.filter((pkg) => pkg.enabled),
    testimonials: db.reviews,
    workshops: await listWorkshops(),
    completedServices: db.bookings.filter((booking) => booking.status === 'completed').length,
    happyCustomers: new Set(db.bookings.filter((booking) => booking.status === 'completed').map((booking) => booking.driverId)).size,
    emergencyHandled: db.emergencyRequests.filter((request) => ['completed', 'arrived', 'accepted_by_workshop'].includes(request.status)).length
  });
};

export const publicWorkshops = async (_req, res) => {
  const workshops = (await listWorkshops()).filter((workshop) => {
    const status = String(workshop.accountStatus || workshop.status || '').toLowerCase();
    return workshop.verified === true || workshop.isVerified === true || ['active', 'approved', 'verified'].includes(status);
  });
  res.json({ success: true, data: workshops });
};
