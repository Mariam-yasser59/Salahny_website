import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as admin from '../controllers/adminController.js';

const router = Router();
router.use(requireAuth(['admin']));

router.get('/dashboard', admin.dashboard);
router.get('/approvals', admin.approvals);
router.patch('/approvals/:id', admin.approveReject);
router.get('/drivers', admin.drivers);
router.patch('/drivers/:id/status', admin.updateUserStatus);
router.get('/workshops', admin.workshops);
router.patch('/workshops/:id/status', admin.updateUserStatus);
router.get('/bookings', admin.bookings);
router.patch('/bookings/:id', admin.updateBooking);
router.get('/services', admin.services);
router.post('/services', admin.upsertService);
router.put('/services/:id', admin.upsertService);
router.delete('/services/:id', admin.deleteService);
router.get('/packages', admin.packages);
router.post('/packages', admin.upsertPackage);
router.put('/packages/:id', admin.upsertPackage);
router.delete('/packages/:id', admin.deletePackage);
router.get('/logs', admin.logs);
router.get('/settings', admin.settings);

export default router;
