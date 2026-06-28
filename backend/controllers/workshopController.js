import { db, findById, nextId } from '../data/mockData.js';
import { notifyBookingStatus, notifyChatMessage, notifyDiagnosticReady, notifyEmergencyStatus } from '../services/emailNotifications.js';
import { availableSlotValues, createEarningForBooking, findBookingForWorkshop, findWorkshopByUser, listBookings, listEarnings, saveBookingPatch, saveWorkshopSlots, toPublicSlot } from '../services/persistentData.js';

const activeStatuses = ['accepted', 'in_progress', 'diagnostics_ready', 'repair_in_progress'];
const guardedStatuses = ['diagnostics_ready', 'repair_in_progress', 'completed'];

const currentWorkshopSync = (userId) =>
  db.workshops.find((workshop) => workshop.userId === userId) || db.workshops[0];

const currentWorkshop = (userId) => findWorkshopByUser(userId);

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

const bookingDate = (booking) => new Date(booking.slot || (booking.date ? `${booking.date}T${booking.time || '00:00'}:00.000Z` : booking.createdAt || 0));

const isToday = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
};

const averageResponseMins = (bookings) => {
  const responseTimes = bookings
    .map((booking) => {
      const start = new Date(booking.createdAt || booking.requestedAt || 0).getTime();
      const accepted = new Date(booking.acceptedAt || booking.respondedAt || 0).getTime();
      return start && accepted && accepted >= start ? Math.round((accepted - start) / 60000) : null;
    })
    .filter((value) => Number.isFinite(value));

  if (!responseTimes.length) return null;
  return Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length);
};

const repeatClientCount = (bookings) => {
  const completedByDriver = bookings
    .filter((booking) => booking.status === 'completed')
    .reduce((counts, booking) => {
      if (booking.driverId) counts.set(booking.driverId, (counts.get(booking.driverId) || 0) + 1);
      return counts;
    }, new Map());
  return [...completedByDriver.values()].filter((count) => count > 1).length;
};

const dailyEarningSeries = (items) => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - index));
    const key = day.toISOString().slice(0, 10);
    return items
      .filter((item) => String(item.createdAt || '').slice(0, 10) === key)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  });
};

const workshopBookings = async (workshop) => listBookings({ workshopId: workshop.id || workshop._id });

const dashboardPayload = async (workshop) => {
  const bookings = (await workshopBookings(workshop)).map(jobView);
  const earnings = await listEarnings(workshop.id || workshop._id);
  const revenue = earnings.reduce((sum, item) => sum + Number(item.amount || 0), 0) || workshop.revenue || 0;
  const completedBookings = bookings.filter((item) => item.status === 'completed').length;
  const completionRate = bookings.length ? Math.round((completedBookings / bookings.length) * 100) : 0;
  const avgResponseMins = averageResponseMins(bookings);
  const performance = {
    completionRate,
    repeatClients: repeatClientCount(bookings),
    averageResponseMins: avgResponseMins ?? 0,
    averageResponseTime: avgResponseMins === null ? 'N/A' : `${avgResponseMins}m`
  };
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
      payoutMethod: workshop.payoutMethod || 'Not configured',
      completionRate: performance.completionRate,
      repeatClients: performance.repeatClients,
      averageResponseMins: performance.averageResponseMins,
      averageResponseTime: performance.averageResponseTime
    },
    bookings: bookings.map(portalBooking),
    performance,
    stats: {
      jobsToday: bookings.filter((booking) => isToday(bookingDate(booking))).length,
      totalBookings: bookings.length,
      pending: bookings.filter((item) => item.status === 'pending').length,
      active: bookings.filter((item) => activeStatuses.includes(item.status)).length,
      completed: completedBookings,
      rejected: bookings.filter((item) => item.status === 'rejected').length,
      cancelled: bookings.filter((item) => item.status === 'cancelled').length,
      revenue,
      availableSlots: availableSlotValues(workshop, bookings).length
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

export const dashboard = async (req, res) => {
  const workshop = await currentWorkshop(req.user.id);
  const payload = await dashboardPayload(workshop);
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

export const portalDashboard = async (req, res) => res.json({ success: true, data: await dashboardPayload(await currentWorkshop(req.user.id)) });

export const bookings = async (req, res) => {
  const workshop = await currentWorkshop(req.user.id);
  const list = (await workshopBookings(workshop)).map(portalBooking);
  res.json(req.query.grouped === 'true' ? groupedBookings(list) : { success: true, data: list });
};

export const requests = async (req, res) => {
  const workshop = await currentWorkshop(req.user.id);
  res.json((await workshopBookings(workshop)).filter((booking) => booking.status === 'pending').map(jobView));
};

export const requestDetails = (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.id);
  if (!booking) return res.status(404).json({ message: 'Request not found' });
  const diagnostic = db.diagnostics.find((item) => item.bookingId === booking.id || item.driverId === booking.driverId);
  res.json({ ...jobView(booking), diagnostic });
};

export const updateRequestStatus = async (req, res) => {
  const workshop = await currentWorkshop(req.user.id);
  const booking = await findBookingForWorkshop(req.params.id, workshop);
  if (!booking) return res.status(404).json({ message: 'Request not found' });

  const nextStatus = req.body.status || booking.status;
  if (guardedStatuses.includes(nextStatus) && !hasDiagnostic(booking.id)) {
    return res.status(409).json({ message: 'Run or attach a workshop diagnostic before moving this booking beyond in-progress' });
  }

  const patch = {
    status: nextStatus,
    progress: nextStatus === 'completed' ? 100 : nextStatus === 'repair_in_progress' ? 80 : nextStatus === 'diagnostics_ready' ? 65 : nextStatus === 'in_progress' ? 55 : nextStatus === 'accepted' ? 35 : booking.progress,
    timeline: [...new Set([...(booking.timeline || []), req.body.label || nextStatus])]
  };
  const savedBooking = await saveBookingPatch(booking.id || booking._id, patch);

  if (nextStatus === 'completed') await createEarningForBooking(savedBooking);
  addNotification(booking.driverId, 'Workshop updated your booking', `${workshop.name} marked your booking as ${nextStatus}.`, 'booking');

  const updated = jobView(savedBooking);
  notifyBookingStatus(updated, nextStatus);
  res.json(req.originalUrl.includes('/workshop-portal/') ? { success: true, data: portalBooking(savedBooking) } : updated);
};

export const activeJobs = async (req, res) => {
  const workshop = await currentWorkshop(req.user.id);
  res.json((await workshopBookings(workshop)).filter((booking) => activeStatuses.includes(booking.status)).map(jobView));
};

export const services = (req, res) => {
  const workshop = currentWorkshopSync(req.user?.id);
  const data = workshop ? serviceDetails(workshop) : db.services;
  res.json(req.originalUrl.includes('/workshop-portal/') ? { success: true, data } : data);
};

export const addService = (req, res) => {
  const workshop = currentWorkshopSync(req.user.id);
  const service = { id: nextId('ws', 'services'), name: req.body.name, emoji: req.body.emoji || req.body.label || 'Service', durationMins: Number(req.body.durationMins) || 60, price: Number(req.body.price) || 0 };
  workshop.serviceDetails = [...(workshop.serviceDetails || []), service];
  workshop.specialties = workshop.serviceDetails.map((item) => item.name);
  res.status(201).json(req.originalUrl.includes('/workshop-portal/') ? { success: true, data: service } : service);
};

export const updateService = (req, res) => {
  const workshop = currentWorkshopSync(req.user.id);
  const service = (workshop.serviceDetails || []).find((item) => item.id === req.params.id || item.id === req.params.serviceId || item.name === req.params.id);
  if (!service) return res.status(404).json({ message: 'Service not found' });
  Object.assign(service, req.body);
  workshop.specialties = workshop.serviceDetails.map((item) => item.name);
  res.json(req.originalUrl.includes('/workshop-portal/') ? { success: true, data: service } : service);
};

export const deleteService = (req, res) => {
  const workshop = currentWorkshopSync(req.user.id);
  const serviceId = req.params.id || req.params.serviceId;
  const before = workshop.serviceDetails?.length || 0;
  workshop.serviceDetails = (workshop.serviceDetails || []).filter((service) => service.id !== serviceId && service.name !== serviceId);
  workshop.specialties = workshop.serviceDetails.map((item) => item.name);
  if (before === workshop.serviceDetails.length) return res.status(404).json({ message: 'Service not found' });
  res.json({ success: true, message: 'Service deleted' });
};

export const slots = async (req, res) => {
  const workshop = await currentWorkshop(req.user.id);
  const data = availableSlotValues(workshop, await workshopBookings(workshop));
  res.json(req.originalUrl.includes('/workshop-portal/') ? { success: true, data } : data.map((slot) => toPublicSlot(slot)).filter(Boolean));
};

export const updateSlots = async (req, res) => {
  const workshop = await currentWorkshop(req.user.id);
  if (!Array.isArray(req.body.slots)) return res.status(400).json({ message: 'slots must be an array' });
  const booked = new Set((await workshopBookings(workshop)).filter((booking) => !['cancelled', 'rejected'].includes(booking.status)).map((booking) => booking.slot).filter(Boolean));
  const slots = req.body.slots.filter((slot) => !booked.has(typeof slot === 'string' ? slot : `${slot.date}T${slot.time}:00.000Z`));
  const savedSlots = await saveWorkshopSlots(workshop, slots);
  const data = availableSlotValues({ ...workshop, availableSlots: savedSlots }, await workshopBookings(workshop));
  res.json(req.originalUrl.includes('/workshop-portal/') ? { success: true, data } : data.map((slot) => toPublicSlot(slot)).filter(Boolean));
};

export const earnings = async (req, res) => {
  const workshop = await currentWorkshop(req.user.id);
  const items = await listEarnings(workshop.id || workshop._id);
  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const data = {
    total,
    totalEarnings: total,
    availableBalance: items.filter((item) => item.status !== 'paid').reduce((sum, item) => sum + Number(item.amount || 0), 0),
    paid: items.filter((item) => item.status === 'paid').reduce((sum, item) => sum + Number(item.amount || 0), 0),
    paidAmount: items.filter((item) => item.status === 'paid').reduce((sum, item) => sum + Number(item.amount || 0), 0),
    completedJobs: (await workshopBookings(workshop)).filter((booking) => booking.status === 'completed').length,
    series: dailyEarningSeries(items),
    items: items.map((item) => ({ ...item, serviceName: findById('services', findById('bookings', item.bookingId)?.serviceId)?.name || 'Completed booking' }))
  };
  res.json(req.originalUrl.includes('/workshop-portal/') ? { success: true, data } : data);
};

export const profile = async (req, res) => {
  const workshop = await currentWorkshop(req.user.id);
  const payload = await dashboardPayload(workshop);
  res.json({
    ...workshop,
    ...payload.profile,
    services: serviceDetails(workshop),
    stats: payload.stats,
    performance: payload.performance
  });
};
export const updateProfile = (req, res) => {
  const workshop = currentWorkshopSync(req.user.id);
  Object.assign(workshop, req.body, {
    address: req.body.location || req.body.address || workshop.address,
    latitude: req.body.latitude ?? req.body.location?.lat ?? req.body.lat ?? workshop.latitude,
    longitude: req.body.longitude ?? req.body.location?.lng ?? req.body.lng ?? workshop.longitude
  });
  res.json(workshop);
};

export const emergencyAssigned = (req, res) => {
  const workshop = currentWorkshopSync(req.user.id);
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
  const workshop = currentWorkshopSync(req.user.id);
  res.json({ success: true, data: { workshop: { id: workshop.id, name: workshop.name }, messages: db.adminWorkshopMessages.filter((message) => message.workshopId === workshop.id) } });
};

export const sendAdminMessage = (req, res) => {
  const workshop = currentWorkshopSync(req.user.id);
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
export const sendChatMessage = async (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.bookingId);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  const message = { id: nextId('bm', 'bookingMessages'), bookingId: booking.id, senderRole: 'workshop', senderId: req.user.id, text: req.body.text, createdAt: new Date().toISOString() };
  db.bookingMessages.push(message);
  addNotification(booking.driverId, 'New workshop message', message.text, 'chat');
  const driver = findById('users', booking.driverId);
  notifyChatMessage({ to: driver?.email, recipientName: driver?.name, senderName: (await currentWorkshop(req.user.id))?.name, text: message.text, context: 'booking chat' });
  res.status(201).json({ success: true, data: message });
};

const buildPrediction = (vitals, issue, healthScore) => {
  const coolant = Number(vitals.coolantTemp || vitals.COOLANT_TEMPERATURE || 90);
  const engineLoad = Number(vitals.engineLoad || vitals.ENGINE_LOAD || 25);
  const battery = Number(vitals.battery || vitals.CONTROL_MODULE_VOLTAGE || 12.6);
  if (healthScore < 65) {
    return {
      predictedIssue: `${issue} may cause service interruption if the vehicle keeps operating`,
      predictionHorizon: 'Immediate to 7 days',
      predictionReason: `Health score ${healthScore}% with coolant ${coolant} C and engine load ${engineLoad}% indicates high near-term repair risk.`
    };
  }
  if (coolant >= 98 || engineLoad >= 70) {
    return {
      predictedIssue: 'Cooling system stress may develop into overheating',
      predictionHorizon: '7 to 14 days',
      predictionReason: `Coolant temperature ${coolant} C and engine load ${engineLoad}% show thermal stress under repeated trips.`
    };
  }
  if (battery > 0 && battery < 12.6) {
    return {
      predictedIssue: 'Battery or charging-system weakness may appear',
      predictionHorizon: '1 to 3 weeks',
      predictionReason: `Battery voltage ${battery} V is below the normal running range.`
    };
  }
  return {
    predictedIssue: 'No near-term failure predicted',
    predictionHorizon: '30 to 60 days',
    predictionReason: 'Submitted readings are within a normal service range; continue regular maintenance.'
  };
};

export const runDiagnostic = (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.bookingId);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  const vitals = req.body.vitals || req.body;
  const healthScore = Math.max(35, Math.min(98, 100 - Math.round((Number(vitals.engineLoad || 25) + Math.max(0, Number(vitals.coolantTemp || 90) - 90)) / 2)));
  const issue = healthScore < 65 ? 'Engine load or temperature anomaly' : 'Preventive service recommended';
  const prediction = buildPrediction(vitals, issue, healthScore);
  const diagnostic = { id: nextId('d', 'diagnostics'), bookingId: booking.id, driverId: booking.driverId, vehicleId: booking.vehicleId, date: new Date().toISOString(), healthScore, confidence: 84, urgency: healthScore < 65 ? 'high' : 'medium', issue, detectedIssue: issue, ...prediction, technicalNote: 'Predictive diagnostic generated from workshop OBD values.', recommendedFix: healthScore < 65 ? 'Inspect cooling system and load-related sensors.' : 'Continue service workflow and confirm vitals after repair.', faultCodes: healthScore < 65 ? ['P0117', 'P0101'] : [], vitals };
  db.diagnostics.unshift(diagnostic);
  addNotification(booking.driverId, 'Diagnostic report ready', 'The workshop completed a diagnostic report for your booking.', 'diagnostic');
  notifyDiagnosticReady(jobView(booking), diagnostic);
  res.status(201).json({ success: true, data: diagnostic });
};

export const uploadObd = runDiagnostic;
export const shareDiagnostic = (req, res) => {
  const diagnostic = db.diagnostics.find((item) => item.id === req.body.diagnosticId || item.bookingId === req.params.bookingId);
  if (!diagnostic) return res.status(404).json({ message: 'Diagnostic not found' });
  const booking = db.bookings.find((item) => item.id === req.params.bookingId);
  const text = `Diagnostic report: ${diagnostic.detectedIssue || diagnostic.issue}. Prediction: ${diagnostic.predictedIssue} within ${diagnostic.predictionHorizon}. Health score ${diagnostic.healthScore}%. ${diagnostic.recommendedFix}`;
  const message = { id: nextId('bm', 'bookingMessages'), bookingId: req.params.bookingId, senderRole: 'workshop', senderId: req.user.id, text, createdAt: new Date().toISOString() };
  db.bookingMessages.push(message);
  if (booking) {
    addNotification(booking.driverId, 'Diagnostic report shared', text, 'diagnostic');
    notifyDiagnosticReady(jobView(booking), diagnostic);
  }
  res.status(201).json({ success: true, data: message });
};

export const createRepairTask = (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.bookingId);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (!hasDiagnostic(booking.id)) return res.status(409).json({ message: 'Run diagnostics before creating a repair task' });
  booking.status = 'repair_in_progress';
  booking.timeline = [...new Set([...(booking.timeline || []), 'Repair in progress'])];
  addNotification(booking.driverId, 'Repair task started', 'The workshop created a repair task from your diagnostic report.', 'booking');
  notifyBookingStatus(jobView(booking), 'repair_in_progress');
  res.status(200).json({ success: true, data: portalBooking(booking) });
};

export const notifications = (req, res) => res.json({ success: true, data: db.notifications.filter((item) => item.userId === req.user.id) });
export const unreadNotificationCount = (req, res) => res.json({ success: true, data: { count: db.notifications.filter((item) => item.userId === req.user.id && !item.readAt).length } });
export const markNotificationRead = (req, res) => {
  const notification = db.notifications.find((item) => item.id === req.params.id && item.userId === req.user.id);
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  notification.readAt = new Date().toISOString();
  res.json({ success: true, data: notification });
};
export const markAllNotificationsRead = (req, res) => {
  db.notifications.filter((item) => item.userId === req.user.id).forEach((item) => {
    item.readAt = item.readAt || new Date().toISOString();
  });
  res.json({ success: true });
};
export const tracking = (req, res) => {
  const update = { id: nextId('tr', 'trackingUpdates'), bookingId: req.params.bookingId, workshopUserId: req.user.id, ...req.body, createdAt: new Date().toISOString() };
  db.trackingUpdates.push(update);
  res.status(201).json({ success: true, data: update });
};
