import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import workshopRoutes from './routes/workshopRoutes.js';
import workshopPortalRoutes from './routes/workshopPortalRoutes.js';
import { chatRoutes, diagnosticRoutes, emergencyRoutes, notificationRoutes, trackingRoutes } from './routes/workshopIntegrationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import { requireAuth } from './middleware/auth.js';
import { db, nextId } from './data/mockData.js';
import { connectDatabase, databaseStatus } from './services/database.js';
import { listServices, listWorkshops } from './services/persistentData.js';
import { emailConfigurationStatus } from './services/emailNotifications.js';
import * as driverController from './controllers/driverController.js';
import * as workshopController from './controllers/workshopController.js';
import * as adminController from './controllers/adminController.js';

const app = express();
const PORT = process.env.PORT || 5050;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, '../frontend/dist');

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : '',
  'http://localhost:5050',
  'http://127.0.0.1:5050',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    let hostname = '';
    try {
      hostname = origin ? new URL(origin).hostname : '';
    } catch {
      hostname = '';
    }
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      ['localhost', '127.0.0.1'].includes(hostname) ||
      /\.up\.railway\.app$/.test(hostname) ||
      /\.railway\.internal$/.test(hostname)
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  }
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Salahny API', version: '1.0.0', database: databaseStatus(), email: emailConfigurationStatus() });
});

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/workshop', workshopRoutes);
app.use('/api/workshop-portal', workshopPortalRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/diagnostics', diagnosticRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/notifications', notificationRoutes);
app.get('/api/services', async (_req, res) => res.json((await listServices()).filter((service) => service.enabled !== false)));
app.get('/api/packages', (_req, res) => res.json(db.packages.filter((pkg) => pkg.enabled !== false)));
app.get('/api/workshops', async (_req, res) => res.json(await listWorkshops()));
app.get('/api/workshops/:id', driverController.getWorkshop);
app.get('/api/users/me', requireAuth(), (req, res) => {
  const user = db.users.find((item) => item.id === req.user.id || item.email === req.user.email);
  res.json({ user: user ? Object.fromEntries(Object.entries(user).filter(([key]) => key !== 'password')) : req.user });
});
app.get('/api/vehicles', requireAuth(['driver']), driverController.getVehicles);
app.post('/api/vehicles', requireAuth(['driver']), driverController.addVehicle);
app.patch('/api/vehicles/:id', requireAuth(['driver']), driverController.updateVehicle);
app.put('/api/vehicles/:id', requireAuth(['driver']), driverController.updateVehicle);
app.delete('/api/vehicles/:id', requireAuth(['driver']), driverController.deleteVehicle);
app.get('/api/bookings', requireAuth(), (req, res) => {
  if (req.user.role === 'admin') return adminController.bookings(req, res);
  if (req.user.role === 'workshop') return workshopController.bookings(req, res);
  return driverController.listBookings(req, res);
});
app.post('/api/bookings', requireAuth(['driver']), driverController.createBooking);
app.get('/api/bookings/:id', requireAuth(['driver']), driverController.getBooking);
app.patch('/api/bookings/:id/status', requireAuth(['admin', 'workshop']), (req, res) => {
  if (req.user.role === 'workshop') return workshopController.updateRequestStatus(req, res);
  req.params.id = req.params.id;
  req.body.status = req.body.status || req.body.action;
  return adminController.updateBooking(req, res);
});
app.get('/api/ratings', requireAuth(), (req, res) => {
  const { bookingId, workshopId, ratingType } = req.query;
  const data = (db.ratings || []).filter((rating) =>
    (!bookingId || rating.bookingId === bookingId) &&
    (!workshopId || rating.workshopId === workshopId) &&
    (!ratingType || rating.ratingType === ratingType)
  );
  res.json({ success: true, data });
});
app.post('/api/ratings', requireAuth(), (req, res) => {
  const { bookingId, ratingType, comment = '' } = req.body;
  const stars = Number(req.body.stars);
  const booking = db.bookings.find((item) => item.id === bookingId || item._id === bookingId);

  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (booking.status !== 'completed') return res.status(409).json({ message: 'Ratings are available after service completion only' });
  if (!['workshop_by_customer', 'customer_by_workshop', 'platform_by_customer'].includes(ratingType)) return res.status(400).json({ message: 'Invalid rating type' });
  if (!Number.isFinite(stars) || stars < 1 || stars > 5) return res.status(400).json({ message: 'Stars must be from 1 to 5' });

  const raterId = req.user.id;
  const duplicate = (db.ratings || []).some((rating) => rating.bookingId === bookingId && rating.ratingType === ratingType && rating.raterId === raterId);
  if (duplicate) return res.status(409).json({ message: 'You already rated this booking' });

  const rating = {
    id: nextId('rt', 'ratings'),
    bookingId,
    customerId: booking.driverId,
    workshopId: booking.workshopId,
    ratingType,
    stars,
    comment,
    raterId,
    createdAt: new Date().toISOString()
  };
  db.ratings.unshift(rating);

  if (ratingType === 'workshop_by_customer') {
    db.reviews.unshift({ id: nextId('r', 'reviews'), workshopId: booking.workshopId, author: req.user.email, rating: stars, comment });
    const workshop = db.workshops.find((item) => item.id === booking.workshopId);
    const workshopRatings = db.ratings.filter((item) => item.workshopId === booking.workshopId && item.ratingType === 'workshop_by_customer');
    if (workshop && workshopRatings.length) {
      workshop.rating = Math.round((workshopRatings.reduce((sum, item) => sum + item.stars, 0) / workshopRatings.length) * 10) / 10;
      workshop.reviews = workshopRatings.length;
    }
  }

  res.status(201).json({ success: true, data: rating });
});
app.get('/api/documents', requireAuth(['workshop']), (req, res) => {
  const workshop = db.workshops.find((item) => item.userId === req.user.id);
  res.json({
    success: true,
    data: db.verificationDocuments.filter((document) => document.userId === req.user.id || document.workshopId === workshop?.id)
  });
});
app.post('/api/documents', requireAuth(['workshop']), (req, res) => {
  const workshop = db.workshops.find((item) => item.userId === req.user.id);
  if (!workshop) return res.status(404).json({ message: 'Workshop profile not found' });

  const document = {
    id: nextId('vd', 'verificationDocuments'),
    userId: req.user.id,
    workshopId: workshop.id,
    kind: req.body.kind || req.body.documentType || 'commercial_registration',
    fileName: req.body.fileName || req.body.name || 'verification-document',
    mimeType: req.body.mimeType || 'application/octet-stream',
    size: Number(req.body.size) || 0,
    status: 'pending_admin_review',
    cvStatus: 'submitted',
    uploadedAt: new Date().toISOString()
  };

  db.verificationDocuments.unshift(document);
  workshop.verificationDocumentName = document.fileName;
  workshop.verificationStatus = 'pending_admin_review';
  workshop.accountStatus = workshop.accountStatus === 'active' ? 'active' : 'pending';
  res.status(201).json({ success: true, data: document });
});
app.use('/api/admin', adminRoutes);

app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

await connectDatabase();

app.listen(PORT, () => {
  console.log(`Salahny API running on http://localhost:${PORT}`);
});
