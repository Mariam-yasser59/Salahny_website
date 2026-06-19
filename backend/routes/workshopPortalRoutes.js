import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as workshop from '../controllers/workshopController.js';

const router = Router();
router.use(requireAuth(['workshop']));

router.get('/dashboard', workshop.portalDashboard);
router.get('/bookings', workshop.bookings);
router.patch('/bookings/:id/status', workshop.updateRequestStatus);
router.get('/services', workshop.services);
router.put('/services', workshop.services);
router.post('/services', workshop.addService);
router.delete('/services/:serviceId', workshop.deleteService);
router.get('/slots', workshop.slots);
router.put('/slots', workshop.updateSlots);
router.get('/earnings', workshop.earnings);
router.get('/profile', workshop.profile);
router.get('/admin/messages', workshop.adminMessages);
router.post('/admin/messages', workshop.sendAdminMessage);

export default router;
