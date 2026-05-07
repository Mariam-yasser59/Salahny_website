import { db } from '../data/mockData.js';

export const getLandingData = (_req, res) => {
  res.json({
    services: db.services.filter((service) => service.enabled),
    packages: db.packages.filter((pkg) => pkg.enabled),
    testimonials: db.reviews,
    workshops: db.workshops
  });
};
