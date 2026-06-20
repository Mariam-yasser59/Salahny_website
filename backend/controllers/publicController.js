import { db } from '../data/mockData.js';
import { listServices, listWorkshops } from '../services/persistentData.js';

export const getLandingData = async (_req, res) => {
  res.json({
    services: (await listServices()).filter((service) => service.enabled !== false),
    packages: db.packages.filter((pkg) => pkg.enabled),
    testimonials: db.reviews,
    workshops: await listWorkshops()
  });
};
