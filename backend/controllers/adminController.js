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
