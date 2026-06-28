import { db, findById, nextId } from '../data/mockData.js';
import { notifyWorkshopNewBooking } from '../services/emailNotifications.js';
import { consumeWorkshopSlot, createMockBooking, findService, findWorkshopById, insertBooking, listServices as listStoredServices, listWorkshops as listStoredWorkshops } from '../services/persistentData.js';
import { calculateCheckoutTotal } from '../data/egyptServiceCatalog.js';

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
  const checkout = calculateCheckoutTotal(service?.price || req.body.subtotal || req.body.total || 0);
  const slot = req.body.slot || (req.body.date && req.body.time ? `${req.body.date}T${req.body.time}:00.000Z` : null);
  if (slot && workshop) {
    const consumed = await consumeWorkshopSlot(workshop, slot);
    if (!consumed.ok) return res.status(409).json({ message: consumed.message });
    req.body.slot = consumed.slot;
  }
  const booking = createMockBooking({
    ...req.body,
    driverId: req.user.id,
    workshopId: workshop?.id || req.body.workshopId || req.body.workshop,
    serviceId: service?.id || req.body.serviceId,
    status: 'pending',
    subtotal: checkout.subtotal,
    appServiceFee: checkout.appServiceFee,
    price: checkout.total,
    total: checkout.total,
    progress: 10,
    issue: req.body.issue || req.body.locationNotes || 'Service request created',
    timeline: ['Requested'],
    slot: req.body.slot || slot,
    date: (req.body.slot || slot || req.body.date || '').slice(0, 10),
    time: (req.body.slot || slot || req.body.time || '').slice(11, 16)
  });
  const savedBooking = await insertBooking(booking);
  db.activityLogs.unshift({ id: nextId('a', 'activityLogs'), type: 'booking_created', actor: req.user.email, message: `Booking ${booking.id} created`, date: new Date().toLocaleString() });
  const driver = db.users.find((user) => user.id === req.user.id);
  notifyWorkshopNewBooking(workshop || {}, { ...savedBooking, serviceName: service?.name }, driver);
  res.status(201).json(enrichBooking(savedBooking));
};

export const diagnostics = (req, res) => res.json(db.diagnostics.filter((item) => item.driverId === req.user.id));

export const runDiagnostic = (req, res) => {
  const sensors = req.body.sensorReadings || req.body.vitals || req.body;
  const engineLoad = Number(sensors.ENGINE_LOAD ?? sensors.engineLoad ?? 30);
  const battery = Number(sensors.CONTROL_MODULE_VOLTAGE ?? sensors.battery ?? 12.4);
  const coolant = Number(sensors.COOLANT_TEMPERATURE ?? sensors.coolantTemp ?? 90);
  const rpm = Number(sensors.ENGINE_RPM ?? sensors.rpm ?? 800);
  const fuelTrimShort = Number(sensors.SHORT_TERM_FUEL_TRIM_BANK_1 ?? 0);
  const fuelTrimLong = Number(sensors.LONG_TERM_FUEL_TRIM_BANK_1 ?? 0);
  const catTemp1 = Number(sensors.CATALYST_TEMPERATURE_BANK1_SENSOR1 ?? 500);

  let penalty = 0;
  if (battery < 12) penalty += 15;
  if (engineLoad > 70) penalty += 12;
  if (coolant > 105) penalty += 15;
  if (rpm > 4500) penalty += 8;
  if (Math.abs(fuelTrimShort) > 10 || Math.abs(fuelTrimLong) > 10) penalty += 10;
  if (catTemp1 > 800) penalty += 10;
  const faultCodes = req.body.faultCodes || [];
  if (faultCodes.length > 0) penalty += Math.min(faultCodes.length * 8, 24);

  const healthScore = Math.max(30, Math.min(98, Math.round(100 - penalty)));

  let possibleFault = 'System nominal';
  if (battery < 12) possibleFault = 'Battery / charging system degradation';
  else if (coolant > 105) possibleFault = 'Engine overheating – coolant system';
  else if (Math.abs(fuelTrimShort) > 10) possibleFault = 'Fuel trim out of range – fuel system';
  else if (engineLoad > 70) possibleFault = 'High engine load pattern';
  else if (catTemp1 > 800) possibleFault = 'Catalyst overtemperature';
  else if (faultCodes.length > 0) possibleFault = `DTC detected: ${faultCodes.slice(0, 2).join(', ')}`;
  else if (healthScore < 75) possibleFault = 'Oil change or preventive service due';
  const diagnostic = {
    id: nextId('d', 'diagnostics'),
    driverId: req.user.id,
    date: new Date().toISOString(),
    probability: healthScore > 80 ? 42 : 76,
    recommendation: healthScore > 80 ? 'Schedule preventive service within 2 weeks.' : 'Book diagnostics service as soon as possible.',
    possibleFault,
    healthScore,
    faultCodes,
    sensorReadings: sensors,
    vitals: sensors,
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

// ─── Emergency ───────────────────────────────────────────────────────────────

export const createEmergency = (req, res) => {
  const { address, issueDescription, type, emergencyType, locationNotes = '', latitude, longitude, phone = '', vehicleInfo = '', vehicleLabel = '' } = req.body;
  if (!address || !issueDescription) return res.status(400).json({ message: 'address and issueDescription are required' });
  const nearest = db.workshops.find((w) => w.verified && w.accountStatus === 'active') || db.workshops[0];
  const request = {
    id: nextId('er', 'emergencyRequests'),
    driverId: req.user.id,
    workshopId: nearest?.id || null,
    emergencyType: emergencyType || type || 'other',
    issueDescription,
    address,
    latitude: latitude ? Number(latitude) : null,
    longitude: longitude ? Number(longitude) : null,
    locationNotes,
    phone,
    vehicleInfo,
    vehicleLabel,
    status: nearest ? 'assigned' : 'pending_admin_assignment',
    createdAt: new Date().toISOString()
  };
  db.emergencyRequests.push(request);
  if (nearest) {
    db.notifications.unshift({ id: nextId('n', 'notifications'), userId: nearest.userId, title: 'Emergency request assigned', message: `${req.user.email} needs ${request.emergencyType} assistance.`, type: 'emergency', createdAt: new Date().toISOString() });
  }
  res.status(201).json({ success: true, data: request });
};

export const getMyEmergencies = (req, res) => {
  const requests = db.emergencyRequests.filter((item) => item.driverId === req.user.id).map((item) => ({
    ...item,
    workshop: item.workshopId ? findById('workshops', item.workshopId) : null
  }));
  res.json({ success: true, data: requests });
};

export const cancelEmergency = (req, res) => {
  const request = db.emergencyRequests.find((item) => item.id === req.params.id && item.driverId === req.user.id);
  if (!request) return res.status(404).json({ message: 'Emergency request not found' });
  if (['completed', 'cancelled', 'rejected'].includes(request.status)) return res.status(409).json({ message: 'This request can no longer be cancelled' });
  request.status = 'cancelled';
  request.cancelledReason = req.body.reason || 'Cancelled by driver';
  res.json({ success: true, data: request });
};

// ─── Direct Messages (Driver ↔ Admin) ────────────────────────────────────────

export const getDirectMessages = (req, res) => {
  const threadKey = [req.user.id, 'admin1'].sort().join(':');
  res.json({ success: true, data: db.directMessages.filter((m) => m.threadKey === threadKey) });
};

export const sendDirectMessage = (req, res) => {
  const { text = '' } = req.body;
  if (!text.trim()) return res.status(400).json({ message: 'Message text is required' });
  const threadKey = [req.user.id, 'admin1'].sort().join(':');
  const message = {
    id: nextId('dm', 'directMessages'),
    threadKey,
    senderRole: 'driver',
    senderId: req.user.id,
    senderName: req.user.name || req.user.email,
    text: text.trim(),
    createdAt: new Date().toISOString()
  };
  db.directMessages.push(message);
  db.notifications.unshift({ id: nextId('n', 'notifications'), userId: 'admin1', title: 'Driver message', message: text.trim(), type: 'chat', createdAt: new Date().toISOString() });
  res.status(201).json({ success: true, data: message });
};

// ─── Package Checkout (Demo) ──────────────────────────────────────────────────

export const packageCheckout = (req, res) => {
  const { packageId, cardLast4 } = req.body;
  if (!packageId) return res.status(400).json({ message: 'packageId is required' });
  if (cardLast4 && !/^\d{4}$/.test(String(cardLast4))) return res.status(400).json({ message: 'cardLast4 must be exactly 4 digits' });
  const pkg = db.packages.find((p) => p.id === packageId && p.enabled !== false);
  if (!pkg) return res.status(404).json({ message: 'Package not found' });
  const subscription = {
    id: nextId('sub', 'subscriptions'),
    driverId: req.user.id,
    packageId: pkg.id,
    packageName: pkg.name,
    amount: pkg.price,
    currency: 'EGP',
    method: cardLast4 ? 'demo_online_card' : 'demo',
    cardLast4: cardLast4 || null,
    status: 'success',
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    transactionId: `DEMO-TXN-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  db.subscriptions.push(subscription);
  db.notifications.unshift({ id: nextId('n', 'notifications'), userId: req.user.id, title: `${pkg.name} subscription activated`, message: `Your ${pkg.name} plan is now active.`, type: 'payment', createdAt: new Date().toISOString() });
  res.status(201).json({ success: true, data: subscription });
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
