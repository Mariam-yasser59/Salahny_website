import crypto from 'crypto';
import { db, nextId } from '../data/mockData.js';
import { signToken } from '../middleware/auth.js';
import { notifyWorkshopRegistration, sendEmailNotification } from '../services/emailNotifications.js';

const hashToken = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
};
const verifyPassword = (password, stored) => {
  if (!stored) return false;
  if (!String(stored).startsWith('scrypt:')) return stored === password;
  const [, salt, expected] = String(stored).split(':');
  const actual = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
};

const publicUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

const loginWithRole = (role) => (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find((item) => item.email === email && item.role === role && verifyPassword(password, item.password));

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: signToken(user), user: publicUser(user) });
};

export const login = (req, res) => {
  const { email, password, role } = req.body;
  const user = db.users.find((item) => item.email === email && (!role || item.role === role) && verifyPassword(password, item.password));

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: signToken(user), user: publicUser(user) });
};

export const driverLogin = loginWithRole('driver');
export const workshopLogin = loginWithRole('workshop');
export const adminLogin = loginWithRole('admin');

export const googleLogin = (req, res) => {
  const { email, name, role = 'driver' } = req.body;
  if (!email) return res.status(400).json({ message: 'Google email is required' });
  let user = db.users.find((item) => item.email === email);
  if (!user) {
    user = { id: nextId('u', 'users'), role, name: name || email.split('@')[0], email, password: '', phone: '', status: role === 'admin' ? 'active' : 'pending', joinedAt: new Date().toISOString().slice(0, 10), provider: 'google' };
    db.users.push(user);
  }
  res.json({ token: signToken(user), user: publicUser(user) });
};

export const forgotPassword = (req, res) => {
  const user = db.users.find((item) => item.email === req.body.email);
  if (user) {
    const resetToken = crypto.randomBytes(24).toString('hex');
    user.resetTokenHash = hashToken(resetToken);
    user.resetTokenExpiresAt = Date.now() + 1000 * 60 * 30;
    sendEmailNotification({
      to: user.email,
      subject: 'Reset your Salahny password',
      text: `Use this reset token to update your password: ${resetToken}`,
      html: `<p>Use this reset token to update your Salahny password:</p><p><strong>${resetToken}</strong></p>`
    }).catch((error) => console.warn(error.message));
  }
  res.json({ message: 'If the email exists, password reset instructions were sent.' });
};

export const resetPassword = (req, res) => {
  const tokenHash = hashToken(req.body.token || '');
  const user = db.users.find((item) => item.email === req.body.email && item.resetTokenHash === tokenHash && item.resetTokenExpiresAt > Date.now());
  if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });
  user.password = hashPassword(req.body.password);
  delete user.resetTokenHash;
  delete user.resetTokenExpiresAt;
  res.json({ message: 'Password updated successfully' });
};

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
