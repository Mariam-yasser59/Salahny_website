import { db, findById, nextId } from '../data/mockData.js';
import { notifyWorkshopNewBooking } from '../services/emailNotifications.js';
import { consumeWorkshopSlot, createMockBooking, findService, findWorkshopById, insertBooking, listServices as listStoredServices, listWorkshops as listStoredWorkshops } from '../services/persistentData.js';

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

export const listServices = async (_req, res) => res.json((await listStoredServices()).filter((service) => service.enabled !== false));
export const listWorkshops = async (_req, res) => res.json(await listStoredWorkshops());
export const getWorkshop = async (req, res) => {
  const workshop = await findWorkshopById(req.params.id);
  if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
  const specialties = workshop.specialties || workshop.services || [];
  res.json({ ...workshop, reviews: db.reviews.filter((review) => review.workshopId === workshop.id), services: db.services.filter((service) => specialties.some((specialty) => service.name.includes(specialty) || service.category.includes(specialty))) });
};

export const listBookings = (req, res) => res.json(db.bookings.filter((booking) => booking.driverId === req.user.id).map(enrichBooking));
export const getBooking = (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.id && item.driverId === req.user.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json(enrichBooking(booking));
};

export const createBooking = async (req, res) => {
  const service = await findService(req.body.serviceId);
  const workshop = await findWorkshopById(req.body.workshopId || req.body.workshop);
  const slot = req.body.slot || (req.body.date && req.body.time ? `${req.body.date}T${req.body.time}:00.000Z` : null);
  if (slot && workshop) {
    const consumed = await consumeWorkshopSlot(workshop, slot);
    if (!consumed.ok) return res.status(409).json({ message: consumed.message });
    req.body.slot = consumed.slot;
  }
  const booking = createMockBooking({
    driverId: req.user.id,
    workshopId: workshop?.id || req.body.workshopId || req.body.workshop,
    serviceId: service?.id || req.body.serviceId,
    status: 'pending',
    price: service?.price || req.body.total || 0,
    progress: 10,
    issue: req.body.issue || req.body.locationNotes || 'Service request created',
    timeline: ['Requested'],
    slot: req.body.slot || slot,
    date: (req.body.slot || slot || req.body.date || '').slice(0, 10),
    time: (req.body.slot || slot || req.body.time || '').slice(11, 16),
    ...req.body
  });
  const savedBooking = await insertBooking(booking);
  db.activityLogs.unshift({ id: nextId('a', 'activityLogs'), type: 'booking_created', actor: req.user.email, message: `Booking ${booking.id} created`, date: new Date().toLocaleString() });
  const driver = db.users.find((user) => user.id === req.user.id);
  notifyWorkshopNewBooking(workshop || {}, { ...savedBooking, serviceName: service?.name }, driver);
  res.status(201).json(enrichBooking(savedBooking));
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
