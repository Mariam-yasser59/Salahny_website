import { db, findById, nextId } from '../data/mockData.js';

const currentWorkshop = (userId) => db.workshops.find((workshop) => workshop.userId === userId) || db.workshops[0];
const jobView = (booking) => ({
  ...booking,
  driver: findById('users', booking.driverId),
  vehicle: findById('vehicles', booking.vehicleId),
  service: findById('services', booking.serviceId)
});

export const dashboard = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  const jobs = db.bookings.filter((booking) => booking.workshopId === workshop.id).map(jobView);
  res.json({
    workshop,
    todayJobs: jobs.filter((job) => job.date >= '2026-04-25').length,
    pendingRequests: jobs.filter((job) => job.status === 'pending'),
    activeJobs: jobs.filter((job) => ['accepted', 'in_progress'].includes(job.status)),
    completedJobs: jobs.filter((job) => job.status === 'completed'),
    revenue: workshop.revenue,
    rating: workshop.rating,
    recentRequests: jobs.slice(0, 5)
  });
};

export const requests = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  res.json(db.bookings.filter((booking) => booking.workshopId === workshop.id && booking.status === 'pending').map(jobView));
};

export const requestDetails = (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.id);
  if (!booking) return res.status(404).json({ message: 'Request not found' });
  const diagnostic = db.diagnostics.find((item) => item.driverId === booking.driverId);
  res.json({ ...jobView(booking), diagnostic });
};

export const updateRequestStatus = (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.id);
  if (!booking) return res.status(404).json({ message: 'Request not found' });
  booking.status = req.body.status || booking.status;
  booking.progress = booking.status === 'completed' ? 100 : booking.status === 'in_progress' ? 55 : booking.progress;
  booking.timeline = [...new Set([...booking.timeline, req.body.label || booking.status])];
  res.json(jobView(booking));
};

export const activeJobs = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  res.json(db.bookings.filter((booking) => booking.workshopId === workshop.id && ['accepted', 'in_progress'].includes(booking.status)).map(jobView));
};

export const services = (_req, res) => res.json(db.services);

export const addService = (req, res) => {
  const service = { id: nextId('s', 'services'), enabled: true, ...req.body };
  db.services.push(service);
  res.status(201).json(service);
};

export const updateService = (req, res) => {
  const service = findById('services', req.params.id);
  if (!service) return res.status(404).json({ message: 'Service not found' });
  Object.assign(service, req.body);
  res.json(service);
};

export const deleteService = (req, res) => {
  const index = db.services.findIndex((service) => service.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: 'Service not found' });
  res.json(db.services.splice(index, 1)[0]);
};

export const earnings = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  const completed = db.bookings.filter((booking) => booking.workshopId === workshop.id && booking.status === 'completed');
  res.json({
    daily: 2400,
    weekly: 14600,
    monthly: workshop.revenue,
    completedJobs: completed.length,
    series: [3200, 5100, 4200, 7300, 6400, 8200, 9100]
  });
};

export const profile = (req, res) => res.json(currentWorkshop(req.user.id));
export const updateProfile = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  Object.assign(workshop, req.body);
  res.json(workshop);
};
