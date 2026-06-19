import { db, findById, nextId } from '../data/mockData.js';
import { notifyBookingStatus, notifyChatMessage, notifyDiagnosticReady, notifyEmergencyStatus } from '../services/emailNotifications.js';

const activeStatuses = ['accepted', 'in_progress', 'diagnostics_ready', 'repair_in_progress'];
const guardedStatuses = ['diagnostics_ready', 'repair_in_progress', 'completed'];

const currentWorkshop = (userId) =>
  db.workshops.find((workshop) => workshop.userId === userId) || db.workshops[0];

const serviceDetails = (workshop) =>
  workshop.serviceDetails?.length
    ? workshop.serviceDetails
    : workshop.specialties.map((name, index) => ({
        id: `${workshop.id}-svc-${index + 1}`,
        name,
        emoji: 'Service',
        durationMins: 60,
        price: 0
      }));

const jobView = (booking) => {
  const driver = findById('users', booking.driverId);
  const vehicle = findById('vehicles', booking.vehicleId) || {};
  const service = findById('services', booking.serviceId) || { name: booking.serviceName || 'Workshop service' };
  return {
    ...booking,
    driver,
    customerName: driver?.name || 'Unknown driver',
    customerPhone: driver?.phone || '',
    service,
    serviceName: service.name,
    vehicle,
    vehicleInfo: [vehicle.make, vehicle.model, vehicle.plate].filter(Boolean).join(' ') || 'Vehicle details unavailable',
    total: booking.price,
    progress: booking.progress ?? (booking.status === 'completed' ? 100 : activeStatuses.includes(booking.status) ? 55 : 15)
  };
};

const portalBooking = (booking) => {
  const view = jobView(booking);
  return {
    id: view.id,
    serviceName: view.serviceName,
    customerName: view.customerName,
    customerPhone: view.customerPhone,
    vehicleInfo: view.vehicleInfo,
    date: view.slot || `${view.date}T${view.time}:00.000Z`,
    time: view.slot || `${view.date}T${view.time}:00.000Z`,
    status: view.status === 'rejected' ? 'cancelled' : view.status,
    price: view.price || 0,
    progress: Math.min(1, (view.progress || 0) / 100),
    notes: view.issue,
    timeline: view.timeline || []
  };
};

const dashboardPayload = (workshop) => {
  const bookings = db.bookings.filter((booking) => booking.workshopId === workshop.id).map(jobView);
  const earnings = db.earnings.filter((earning) => earning.workshopId === workshop.id);
  const revenue = earnings.reduce((sum, item) => sum + Number(item.amount || 0), 0) || workshop.revenue || 0;
  return {
    profile: {
      id: workshop.id,
      name: workshop.name,
      initials: workshop.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('') || 'WS',
      specialty: serviceDetails(workshop)[0]?.name || 'Full Service',
      rating: workshop.rating || 0,
      isOpen: workshop.open === true,
      isVerified: workshop.verified === true,
      accountStatus: workshop.accountStatus || (workshop.verified ? 'active' : 'pending'),
      verificationStatus: workshop.verificationStatus || (workshop.verified ? 'admin_approved' : 'pending_upload'),
      address: workshop.address,
      latitude: workshop.latitude,
      longitude: workshop.longitude,
      monthlyRevenue: revenue,
      revenuePeriod: 'Current period',
      payoutMethod: 'Bank Transfer'
    },
    bookings: bookings.map(portalBooking),
    stats: {
      jobsToday: bookings.length,
      totalBookings: bookings.length,
      pending: bookings.filter((item) => item.status === 'pending').length,
      active: bookings.filter((item) => activeStatuses.includes(item.status)).length,
      completed: bookings.filter((item) => item.status === 'completed').length,
      rejected: bookings.filter((item) => item.status === 'rejected').length,
      cancelled: bookings.filter((item) => item.status === 'cancelled').length,
      revenue,
      availableSlots: (workshop.availableSlots || []).filter((slot) => new Date(slot).getTime() > Date.now()).length
    }
  };
};

const groupedBookings = (bookings) => ({
  pending: bookings.filter((booking) => booking.status === 'pending'),
  current: bookings.filter((booking) => activeStatuses.includes(booking.status)),
  completed: bookings.filter((booking) => booking.status === 'completed'),
  closed: bookings.filter((booking) => ['cancelled', 'rejected'].includes(booking.status))
});

const hasDiagnostic = (bookingId) => db.diagnostics.some((diagnostic) => diagnostic.bookingId === bookingId);

const addNotification = (userId, title, message, type = 'workshop') => {
  const notification = { id: nextId('n', 'notifications'), userId, title, message, type, createdAt: new Date().toISOString() };
  db.notifications.unshift(notification);
  return notification;
};

export const dashboard = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  const payload = dashboardPayload(workshop);
  res.json({
    workshop,
    todayJobs: payload.stats.jobsToday,
    pendingRequests: payload.bookings.filter((job) => job.status === 'pending'),
    activeJobs: payload.bookings.filter((job) => activeStatuses.includes(job.status)),
    completedJobs: payload.bookings.filter((job) => job.status === 'completed'),
    revenue: payload.stats.revenue,
    rating: workshop.rating,
    recentRequests: payload.bookings.slice(0, 5),
    pendingRequestCount: payload.stats.pending,
    activeJobCount: payload.stats.active,
    verificationStatus: payload.profile.verificationStatus
  });
};

export const portalDashboard = (req, res) => res.json({ success: true, data: dashboardPayload(currentWorkshop(req.user.id)) });

export const bookings = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  const list = db.bookings.filter((booking) => booking.workshopId === workshop.id).map(portalBooking);
  res.json(req.query.grouped === 'true' ? groupedBookings(list) : { success: true, data: list });
};

export const requests = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  res.json(db.bookings.filter((booking) => booking.workshopId === workshop.id && booking.status === 'pending').map(jobView));
};

export const requestDetails = (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.id);
  if (!booking) return res.status(404).json({ message: 'Request not found' });
  const diagnostic = db.diagnostics.find((item) => item.bookingId === booking.id || item.driverId === booking.driverId);
  res.json({ ...jobView(booking), diagnostic });
};

export const updateRequestStatus = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  const booking = db.bookings.find((item) => item.id === req.params.id && item.workshopId === workshop.id);
  if (!booking) return res.status(404).json({ message: 'Request not found' });

  const nextStatus = req.body.status || booking.status;
  if (guardedStatuses.includes(nextStatus) && !hasDiagnostic(booking.id)) {
    return res.status(409).json({ message: 'Run or attach a workshop diagnostic before moving this booking beyond in-progress' });
  }

  booking.status = nextStatus;
  booking.progress = nextStatus === 'completed' ? 100 : nextStatus === 'repair_in_progress' ? 80 : nextStatus === 'diagnostics_ready' ? 65 : nextStatus === 'in_progress' ? 55 : nextStatus === 'accepted' ? 35 : booking.progress;
  booking.timeline = [...new Set([...(booking.timeline || []), req.body.label || nextStatus])];

  if (nextStatus === 'completed' && !db.earnings.some((earning) => earning.bookingId === booking.id)) {
    db.earnings.unshift({ id: nextId('e', 'earnings'), workshopId: booking.workshopId, bookingId: booking.id, driverId: booking.driverId, amount: booking.price || 0, status: 'available', createdAt: new Date().toISOString() });
  }
  addNotification(booking.driverId, 'Workshop updated your booking', `${workshop.name} marked your booking as ${nextStatus}.`, 'booking');

  const updated = jobView(booking);
  notifyBookingStatus(updated, nextStatus);
  res.json(req.originalUrl.includes('/workshop-portal/') ? { success: true, data: portalBooking(booking) } : updated);
};

export const activeJobs = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  res.json(db.bookings.filter((booking) => booking.workshopId === workshop.id && activeStatuses.includes(booking.status)).map(jobView));
};

export const services = (req, res) => {
  const workshop = currentWorkshop(req.user?.id);
  const data = workshop ? serviceDetails(workshop) : db.services;
  res.json(req.originalUrl.includes('/workshop-portal/') ? { success: true, data } : data);
};

export const addService = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  const service = { id: nextId('ws', 'services'), name: req.body.name, emoji: req.body.emoji || req.body.label || 'Service', durationMins: Number(req.body.durationMins) || 60, price: Number(req.body.price) || 0 };
  workshop.serviceDetails = [...(workshop.serviceDetails || []), service];
  workshop.specialties = workshop.serviceDetails.map((item) => item.name);
  res.status(201).json(req.originalUrl.includes('/workshop-portal/') ? { success: true, data: service } : service);
};

export const updateService = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  const service = (workshop.serviceDetails || []).find((item) => item.id === req.params.id || item.id === req.params.serviceId || item.name === req.params.id);
  if (!service) return res.status(404).json({ message: 'Service not found' });
  Object.assign(service, req.body);
  workshop.specialties = workshop.serviceDetails.map((item) => item.name);
  res.json(req.originalUrl.includes('/workshop-portal/') ? { success: true, data: service } : service);
};

export const deleteService = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  const serviceId = req.params.id || req.params.serviceId;
  const before = workshop.serviceDetails?.length || 0;
  workshop.serviceDetails = (workshop.serviceDetails || []).filter((service) => service.id !== serviceId && service.name !== serviceId);
  workshop.specialties = workshop.serviceDetails.map((item) => item.name);
  if (before === workshop.serviceDetails.length) return res.status(404).json({ message: 'Service not found' });
  res.json({ success: true, message: 'Service deleted' });
};

export const slots = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  const bookedSlots = new Set(db.bookings.filter((booking) => booking.workshopId === workshop.id && !['cancelled', 'rejected'].includes(booking.status)).map((booking) => booking.slot).filter(Boolean));
  const data = (workshop.availableSlots || []).filter((slot) => new Date(slot).getTime() > Date.now() && !bookedSlots.has(slot)).sort();
  res.json(req.originalUrl.includes('/workshop-portal/') ? { success: true, data } : data.map((slot) => ({ id: slot, date: slot.slice(0, 10), time: slot.slice(11, 16), booked: false })));
};

export const updateSlots = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  if (!Array.isArray(req.body.slots)) return res.status(400).json({ message: 'slots must be an array' });
  const bookedSlots = new Set(db.bookings.filter((booking) => booking.workshopId === workshop.id && !['cancelled', 'rejected'].includes(booking.status)).map((booking) => booking.slot).filter(Boolean));
  workshop.availableSlots = [...new Set(req.body.slots.map((slot) => (typeof slot === 'string' ? slot : `${slot.date}T${slot.time}:00.000Z`)).filter((slot) => !Number.isNaN(new Date(slot).getTime()) && new Date(slot).getTime() > Date.now() && !bookedSlots.has(slot)))].sort();
  res.json(req.originalUrl.includes('/workshop-portal/') ? { success: true, data: workshop.availableSlots } : workshop.availableSlots.map((slot) => ({ id: slot, date: slot.slice(0, 10), time: slot.slice(11, 16), booked: false })));
};

export const earnings = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  const items = db.earnings.filter((earning) => earning.workshopId === workshop.id);
  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const data = {
    total,
    totalEarnings: total,
    availableBalance: items.filter((item) => item.status !== 'paid').reduce((sum, item) => sum + Number(item.amount || 0), 0),
    paid: items.filter((item) => item.status === 'paid').reduce((sum, item) => sum + Number(item.amount || 0), 0),
    paidAmount: items.filter((item) => item.status === 'paid').reduce((sum, item) => sum + Number(item.amount || 0), 0),
    completedJobs: db.bookings.filter((booking) => booking.workshopId === workshop.id && booking.status === 'completed').length,
    series: [20, 45, 30, 55, 80, 64, 92],
    items: items.map((item) => ({ ...item, serviceName: findById('services', findById('bookings', item.bookingId)?.serviceId)?.name || 'Completed booking' }))
  };
  res.json(req.originalUrl.includes('/workshop-portal/') ? { success: true, data } : data);
};

export const profile = (req, res) => res.json(currentWorkshop(req.user.id));
export const updateProfile = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  Object.assign(workshop, req.body, {
    address: req.body.location || req.body.address || workshop.address,
    latitude: req.body.latitude ?? req.body.location?.lat ?? req.body.lat ?? workshop.latitude,
    longitude: req.body.longitude ?? req.body.location?.lng ?? req.body.lng ?? workshop.longitude
  });
  res.json(workshop);
};

export const emergencyAssigned = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  res.json({ success: true, data: db.emergencyRequests.filter((item) => item.workshopId === workshop.id) });
};

export const updateEmergency = (req, res) => {
  const request = db.emergencyRequests.find((item) => item.id === req.params.id);
  if (!request) return res.status(404).json({ message: 'Emergency request not found' });
  request.status = req.path.endsWith('/accept') ? 'accepted_by_workshop' : req.path.endsWith('/reject') ? 'rejected' : req.body.status || request.status;
  addNotification(request.driverId, 'Emergency request updated', `Workshop updated emergency request to ${request.status}.`, 'emergency');
  notifyEmergencyStatus(findById('users', request.driverId), request);
  res.json({ success: true, data: request });
};

export const adminMessages = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  res.json({ success: true, data: { workshop: { id: workshop.id, name: workshop.name }, messages: db.adminWorkshopMessages.filter((message) => message.workshopId === workshop.id) } });
};

export const sendAdminMessage = (req, res) => {
  const workshop = currentWorkshop(req.user.id);
  const message = { id: nextId('am', 'adminWorkshopMessages'), workshopId: workshop.id, senderRole: 'workshop', senderId: req.user.id, text: req.body.text, createdAt: new Date().toISOString(), readByWorkshop: true, readByAdmin: false };
  db.adminWorkshopMessages.push(message);
  addNotification('admin1', 'Workshop message', `${workshop.name}: ${message.text}`, 'chat');
  notifyChatMessage({ to: process.env.ADMIN_EMAIL || process.env.WORKSHOP_NOTIFICATION_EMAIL || process.env.RESEND_TO_EMAIL, recipientName: 'Salahny admin', senderName: workshop.name, text: message.text, context: 'workshop admin chat' });
  res.status(201).json({ success: true, data: message });
};

export const chatContext = (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.bookingId);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json({ success: true, data: { bookingId: booking.id, driver: findById('users', booking.driverId), booking: portalBooking(booking) } });
};

export const chatMessages = (req, res) => res.json({ success: true, data: db.bookingMessages.filter((message) => message.bookingId === req.params.bookingId) });
export const sendChatMessage = (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.bookingId);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  const message = { id: nextId('bm', 'bookingMessages'), bookingId: booking.id, senderRole: 'workshop', senderId: req.user.id, text: req.body.text, createdAt: new Date().toISOString() };
  db.bookingMessages.push(message);
  addNotification(booking.driverId, 'New workshop message', message.text, 'chat');
  const driver = findById('users', booking.driverId);
  notifyChatMessage({ to: driver?.email, recipientName: driver?.name, senderName: currentWorkshop(req.user.id).name, text: message.text, context: 'booking chat' });
  res.status(201).json({ success: true, data: message });
};

export const runDiagnostic = (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.bookingId);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  const vitals = req.body.vitals || req.body;
  const healthScore = Math.max(35, Math.min(98, 100 - Math.round((Number(vitals.engineLoad || 25) + Math.max(0, Number(vitals.coolantTemp || 90) - 90)) / 2)));
  const diagnostic = { id: nextId('d', 'diagnostics'), bookingId: booking.id, driverId: booking.driverId, vehicleId: booking.vehicleId, date: new Date().toISOString(), healthScore, confidence: 84, urgency: healthScore < 65 ? 'high' : 'medium', issue: healthScore < 65 ? 'Engine load or temperature anomaly' : 'Preventive service recommended', technicalNote: 'Rule-based fallback diagnostic generated from workshop OBD values.', recommendedFix: healthScore < 65 ? 'Inspect cooling system and load-related sensors.' : 'Continue service workflow and confirm vitals after repair.', faultCodes: healthScore < 65 ? ['P0117', 'P0101'] : [], vitals };
  db.diagnostics.unshift(diagnostic);
  addNotification(booking.driverId, 'Diagnostic report ready', 'The workshop completed a diagnostic report for your booking.', 'diagnostic');
  notifyDiagnosticReady(jobView(booking), diagnostic);
  res.status(201).json({ success: true, data: diagnostic });
};

export const uploadObd = runDiagnostic;
export const shareDiagnostic = (req, res) => {
  const diagnostic = db.diagnostics.find((item) => item.id === req.body.diagnosticId || item.bookingId === req.params.bookingId);
  if (!diagnostic) return res.status(404).json({ message: 'Diagnostic not found' });
  const message = { id: nextId('bm', 'bookingMessages'), bookingId: req.params.bookingId, senderRole: 'workshop', senderId: req.user.id, text: `Diagnostic report: ${diagnostic.issue}. Health score ${diagnostic.healthScore}%. ${diagnostic.recommendedFix}`, createdAt: new Date().toISOString() };
  db.bookingMessages.push(message);
  res.status(201).json({ success: true, data: message });
};

export const notifications = (req, res) => res.json({ success: true, data: db.notifications.filter((item) => item.userId === req.user.id) });
export const tracking = (req, res) => {
  const update = { id: nextId('tr', 'trackingUpdates'), bookingId: req.params.bookingId, workshopUserId: req.user.id, ...req.body, createdAt: new Date().toISOString() };
  db.trackingUpdates.push(update);
  res.status(201).json({ success: true, data: update });
};
