import { db, findById, nextId } from '../data/mockData.js';
import { notifyAccountStatus } from '../services/emailNotifications.js';

export const dashboard = (_req, res) => {
  res.json({
    totalDrivers: db.users.filter((user) => user.role === 'driver').length,
    totalWorkshops: db.workshops.length,
    totalBookings: db.bookings.length,
    revenue: db.workshops.reduce((sum, workshop) => sum + workshop.revenue, 0),
    pendingApprovals: db.users.filter((user) => user.status === 'pending').length,
    recentActivity: db.activityLogs.slice(0, 7)
  });
};

export const approvals = (_req, res) => res.json(db.users.filter((user) => user.status === 'pending'));

export const approveReject = (req, res) => {
  const user = findById('users', req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.status = req.body.action === 'reject' ? 'rejected' : user.role === 'workshop' ? 'verified' : 'active';
  if (user.role === 'workshop') {
    const workshop = db.workshops.find((item) => item.userId === user.id);
    if (workshop) {
      workshop.verified = user.status === 'verified';
      workshop.accountStatus = user.status === 'verified' ? 'active' : 'rejected';
      workshop.verificationStatus = user.status === 'verified' ? 'admin_approved' : 'admin_rejected';
    }
  }
  notifyAccountStatus(user, user.status, req.body.notes);
  db.activityLogs.unshift({ id: nextId('a', 'activityLogs'), type: `${user.role}_${req.body.action}`, actor: 'Admin', message: `${user.name} ${req.body.action}ed`, date: new Date().toLocaleString() });
  res.json(user);
};

export const drivers = (_req, res) => res.json(db.users.filter((user) => user.role === 'driver'));
export const workshops = (_req, res) => res.json(db.workshops.map((workshop) => ({ ...workshop, owner: findById('users', workshop.userId) })));
export const bookings = (_req, res) => res.json(db.bookings.map((booking) => ({ ...booking, driver: findById('users', booking.driverId), workshop: findById('workshops', booking.workshopId), service: findById('services', booking.serviceId) })));

export const updateUserStatus = (req, res) => {
  const user = findById('users', req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.status = req.body.status;
  notifyAccountStatus(user, user.status, req.body.notes);
  db.activityLogs.unshift({ id: nextId('a', 'activityLogs'), type: 'account_updated', actor: 'Admin', message: `${user.name} status changed to ${user.status}`, date: new Date().toLocaleString() });
  res.json(user);
};

export const updateBooking = (req, res) => {
  const booking = findById('bookings', req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  Object.assign(booking, req.body);
  res.json(booking);
};

export const services = (_req, res) => res.json(db.services);
export const upsertService = (req, res) => {
  if (req.params.id) {
    const service = findById('services', req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    Object.assign(service, req.body);
    return res.json(service);
  }
  const service = { id: nextId('s', 'services'), enabled: true, ...req.body };
  db.services.push(service);
  res.status(201).json(service);
};

export const deleteService = (req, res) => {
  const index = db.services.findIndex((service) => service.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: 'Service not found' });
  res.json(db.services.splice(index, 1)[0]);
};

export const packages = (_req, res) => res.json(db.packages);
export const upsertPackage = (req, res) => {
  if (req.params.id) {
    const pkg = findById('packages', req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    Object.assign(pkg, req.body);
    return res.json(pkg);
  }
  const pkg = { id: nextId('p', 'packages'), enabled: true, ...req.body };
  db.packages.push(pkg);
  res.status(201).json(pkg);
};

export const deletePackage = (req, res) => {
  const index = db.packages.findIndex((pkg) => pkg.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: 'Package not found' });
  res.json(db.packages.splice(index, 1)[0]);
};

export const logs = (_req, res) => res.json(db.activityLogs);
export const settings = (req, res) => res.json(db.users.find((user) => user.id === req.user.id));

// ─── Emergency Management ────────────────────────────────────────────────────

export const emergency = (_req, res) => {
  const requests = db.emergencyRequests.map((item) => ({
    ...item,
    driver: findById('users', item.driverId),
    workshop: item.workshopId ? findById('workshops', item.workshopId) : null
  }));
  res.json({ success: true, data: requests });
};

export const assignEmergencyWorkshop = (req, res) => {
  const request = db.emergencyRequests.find((item) => item.id === req.params.id);
  if (!request) return res.status(404).json({ message: 'Emergency request not found' });
  const workshop = findById('workshops', req.body.workshopId);
  if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
  request.workshopId = workshop.id;
  request.status = 'assigned';
  request.assignedBy = req.user.id;
  db.notifications.unshift({ id: nextId('n', 'notifications'), userId: workshop.userId, title: 'Emergency request assigned', message: 'Admin assigned an emergency request to your workshop.', type: 'emergency', createdAt: new Date().toISOString() });
  db.activityLogs.unshift({ id: nextId('a', 'activityLogs'), type: 'emergency_assigned', actor: 'Admin', message: `Emergency ${request.id} assigned to ${workshop.name}`, date: new Date().toLocaleString() });
  res.json({ success: true, data: { ...request, workshop } });
};

// ─── Admin Chat Monitoring ───────────────────────────────────────────────────

export const adminWorkshopChats = (_req, res) => {
  const threads = db.workshops.map((workshop) => ({
    workshopId: workshop.id,
    workshopName: workshop.name,
    messages: db.adminWorkshopMessages.filter((m) => m.workshopId === workshop.id)
  })).filter((thread) => thread.messages.length > 0);
  res.json({ success: true, data: threads });
};

export const adminDriverChats = (_req, res) => {
  const drivers = db.users.filter((user) => user.role === 'driver');
  const threads = drivers.map((driver) => {
    const threadKey = [driver.id, 'admin1'].sort().join(':');
    return {
      driverId: driver.id,
      driverName: driver.name,
      messages: db.directMessages.filter((m) => m.threadKey === threadKey)
    };
  }).filter((thread) => thread.messages.length > 0);
  res.json({ success: true, data: threads });
};

export const sendAdminWorkshopMessage = (req, res) => {
  const workshop = findById('workshops', req.params.workshopId);
  if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
  const message = { id: nextId('am', 'adminWorkshopMessages'), workshopId: workshop.id, senderRole: 'admin', senderId: req.user.id, text: req.body.text, createdAt: new Date().toISOString(), readByWorkshop: false, readByAdmin: true };
  db.adminWorkshopMessages.push(message);
  db.notifications.unshift({ id: nextId('n', 'notifications'), userId: workshop.userId, title: 'Admin message', message: req.body.text, type: 'chat', createdAt: new Date().toISOString() });
  res.status(201).json({ success: true, data: message });
};

export const sendAdminDriverMessage = (req, res) => {
  const driver = findById('users', req.params.driverId);
  if (!driver || driver.role !== 'driver') return res.status(404).json({ message: 'Driver not found' });
  const threadKey = [driver.id, 'admin1'].sort().join(':');
  const message = { id: nextId('dm', 'directMessages'), threadKey, senderRole: 'admin', senderId: req.user.id, senderName: 'Salahny Admin', text: req.body.text, createdAt: new Date().toISOString() };
  db.directMessages.push(message);
  db.notifications.unshift({ id: nextId('n', 'notifications'), userId: driver.id, title: 'Admin message', message: req.body.text, type: 'chat', createdAt: new Date().toISOString() });
  res.status(201).json({ success: true, data: message });
};


export const allDiagnostics = (req, res) => {
  const diagnostics = db.diagnostics.map((d) => {
    const driver = db.users.find((u) => u.id === d.driverId);
    return { ...d, driverName: driver?.name || 'Unknown driver', driverEmail: driver?.email || '' };
  });
  res.json(diagnostics);
};

export const deleteDiagnostic = (req, res) => {
  const idx = db.diagnostics.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Diagnostic not found' });
  db.diagnostics.splice(idx, 1);
  res.json({ success: true });
};
