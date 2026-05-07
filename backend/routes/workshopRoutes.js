import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as workshop from '../controllers/workshopController.js';

const router = Router();
router.use(requireAuth(['workshop']));

router.get('/dashboard', workshop.dashboard);
router.get('/requests', workshop.requests);
router.get('/requests/:id', workshop.requestDetails);
router.patch('/requests/:id/status', workshop.updateRequestStatus);
router.get('/active-jobs', workshop.activeJobs);
router.get('/services', workshop.services);
router.post('/services', workshop.addService);
router.patch('/services/:id', workshop.updateService);
router.put('/services/:id', workshop.updateService);
router.delete('/services/:id', workshop.deleteService);
router.get('/earnings', workshop.earnings);
router.get('/profile', workshop.profile);
router.put('/profile', workshop.updateProfile);

export default router;
