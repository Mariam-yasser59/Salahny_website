import { db, nextId } from '../data/mockData.js';
import { signToken } from '../middleware/auth.js';
import { notifyWorkshopRegistration } from '../services/emailNotifications.js';

const publicUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

const loginWithRole = (role) => (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find((item) => item.email === email && item.password === password && item.role === role);

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: signToken(user), user: publicUser(user) });
};

export const login = (req, res) => {
  const { email, password, role } = req.body;
  const user = db.users.find((item) => item.email === email && item.password === password && (!role || item.role === role));

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: signToken(user), user: publicUser(user) });
};

export const driverLogin = loginWithRole('driver');
export const workshopLogin = loginWithRole('workshop');
export const adminLogin = loginWithRole('admin');

export const registerDriver = (req, res) => {
  const { name, email, password, phone, city } = req.body;
  if (db.users.some((user) => user.email === email)) return res.status(409).json({ message: 'Email already registered' });

  const user = { id: nextId('u', 'users'), role: 'driver', name, email, password, phone, city, status: 'pending', joinedAt: new Date().toISOString().slice(0, 10) };
  db.users.push(user);
  db.activityLogs.unshift({ id: nextId('a', 'activityLogs'), type: 'user_registered', actor: name, message: 'Driver registered and awaits approval', date: new Date().toLocaleString() });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
};

export const registerWorkshop = (req, res) => {
  const body = req.body || {};
  const { email, password, phone, city } = body;
  const name = body.workshopName || body.name || body.ownerName;
  const address = body.workshopAddress || body.address;
  if (!name || !email || !password) return res.status(400).json({ message: 'Workshop name, email, and password are required' });
  if (db.users.some((user) => user.email === email)) return res.status(409).json({ message: 'Email already registered' });

  const user = { id: nextId('u', 'users'), role: 'workshop', name, email, password, phone, city, status: 'pending', joinedAt: new Date().toISOString().slice(0, 10) };
  const workshop = { id: nextId('w', 'workshops'), userId: user.id, name, address, distance: 'New', rating: 0, reviews: 0, open: false, verified: false, accountStatus: 'pending', verificationStatus: 'pending_upload', revenue: 0, phone, specialties: ['Diagnostics'], serviceDetails: [], availableSlots: [], verificationDocumentName: body.verificationDocumentName };
  db.users.push(user);
  db.workshops.push(workshop);
  db.activityLogs.unshift({ id: nextId('a', 'activityLogs'), type: 'user_registered', actor: name, message: 'Workshop registered and awaits verification', date: new Date().toLocaleString() });
  notifyWorkshopRegistration(workshop, user);
  res.status(201).json({ token: signToken(user), user: publicUser(user), workshop });
};

export const logout = (_req, res) => res.json({ message: 'Logged out' });
