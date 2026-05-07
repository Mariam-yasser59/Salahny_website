import { db, findById, nextId } from '../data/mockData.js';

const enrichBooking = (booking) => ({
  ...booking,
  service: findById('services', booking.serviceId),
  workshop: findById('workshops', booking.workshopId),
  vehicle: findById('vehicles', booking.vehicleId)
});

export const dashboard = (req, res) => {
  const driverId = req.user.id;
  const vehicles = db.vehicles.filter((vehicle) => vehicle.driverId === driverId);
  const bookings = db.bookings.filter((booking) => booking.driverId === driverId).map(enrichBooking);
  const diagnostics = db.diagnostics.filter((item) => item.driverId === driverId);
  res.json({
    vehicles,
    activeBooking: bookings.find((booking) => ['pending', 'accepted', 'in_progress'].includes(booking.status)),
    recentBookings: bookings,
    diagnostics,
    nearbyWorkshops: db.workshops,
    activity: db.activityLogs.slice(0, 5)
  });
};

export const getVehicles = (req, res) => res.json(db.vehicles.filter((vehicle) => vehicle.driverId === req.user.id));

export const addVehicle = (req, res) => {
  const vehicle = { id: nextId('v', 'vehicles'), driverId: req.user.id, health: 82, obdStatus: 'Disconnected', mileage: 0, lastService: 'Not serviced yet', ...req.body };
  db.vehicles.push(vehicle);
  res.status(201).json(vehicle);
};

export const updateVehicle = (req, res) => {
  const vehicle = db.vehicles.find((item) => item.id === req.params.id && item.driverId === req.user.id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  Object.assign(vehicle, req.body);
  res.json(vehicle);
};

export const deleteVehicle = (req, res) => {
  const index = db.vehicles.findIndex((item) => item.id === req.params.id && item.driverId === req.user.id);
  if (index < 0) return res.status(404).json({ message: 'Vehicle not found' });
  res.json(db.vehicles.splice(index, 1)[0]);
};

export const listServices = (_req, res) => res.json(db.services.filter((service) => service.enabled));
export const listWorkshops = (_req, res) => res.json(db.workshops);
export const getWorkshop = (req, res) => {
  const workshop = findById('workshops', req.params.id);
  if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
  res.json({ ...workshop, reviews: db.reviews.filter((review) => review.workshopId === workshop.id), services: db.services.filter((service) => workshop.specialties.some((specialty) => service.name.includes(specialty) || service.category.includes(specialty))) });
};

export const listBookings = (req, res) => res.json(db.bookings.filter((booking) => booking.driverId === req.user.id).map(enrichBooking));
export const getBooking = (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.id && item.driverId === req.user.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json(enrichBooking(booking));
};

export const createBooking = (req, res) => {
  const service = findById('services', req.body.serviceId);
  const booking = {
    id: nextId('b', 'bookings'),
    driverId: req.user.id,
    status: 'pending',
    price: service?.price || 0,
    progress: 10,
    issue: req.body.issue || 'Service request created',
    timeline: ['Requested'],
    ...req.body
  };
  db.bookings.unshift(booking);
  db.activityLogs.unshift({ id: nextId('a', 'activityLogs'), type: 'booking_created', actor: req.user.email, message: `Booking ${booking.id} created`, date: new Date().toLocaleString() });
  res.status(201).json(enrichBooking(booking));
};

export const diagnostics = (req, res) => res.json(db.diagnostics.filter((item) => item.driverId === req.user.id));

export const runDiagnostic = (req, res) => {
  const engineLoad = Number(req.body.engineLoad || 30);
  const battery = Number(req.body.battery || 12.4);
  const healthScore = Math.max(45, Math.min(98, Math.round(100 - engineLoad * 0.45 - (battery < 12 ? 12 : 0))));
  const possibleFault = battery < 12 ? 'Battery degradation' : engineLoad > 60 ? 'High engine load pattern' : 'Oil change due soon';
  const diagnostic = {
    id: nextId('d', 'diagnostics'),
    driverId: req.user.id,
    date: new Date().toISOString().slice(0, 10),
    probability: healthScore > 80 ? 42 : 76,
    recommendation: healthScore > 80 ? 'Schedule preventive service within 2 weeks.' : 'Book diagnostics service as soon as possible.',
    possibleFault,
    healthScore,
    ...req.body
  };
  db.diagnostics.unshift(diagnostic);
  res.status(201).json(diagnostic);
};

export const profile = (req, res) => res.json(db.users.find((user) => user.id === req.user.id));
export const updateProfile = (req, res) => {
  const user = db.users.find((item) => item.id === req.user.id);
  Object.assign(user, req.body);
  res.json(user);
};

export const chat = (req, res) => {
  const text = req.body.text || '';
  const response = text.toLowerCase().includes('battery')
    ? 'Battery readings below 12V usually mean you should test charging and battery health. I can help book battery service.'
    : 'Based on your symptoms, I recommend running an AI diagnostic and checking nearby verified workshops.';
  db.supportMessages.push({ id: nextId('m', 'supportMessages'), role: 'user', text });
  db.supportMessages.push({ id: nextId('m', 'supportMessages'), role: 'assistant', text: response });
  res.json({ messages: db.supportMessages, response });
};

export const chatHistory = (_req, res) => res.json(db.supportMessages);
