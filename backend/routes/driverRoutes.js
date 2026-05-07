import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as driver from '../controllers/driverController.js';

const router = Router();
router.use(requireAuth(['driver']));

router.get('/dashboard', driver.dashboard);
router.get('/vehicles', driver.getVehicles);
router.post('/vehicles', driver.addVehicle);
router.put('/vehicles/:id', driver.updateVehicle);
router.delete('/vehicles/:id', driver.deleteVehicle);
router.get('/services', driver.listServices);
router.get('/workshops', driver.listWorkshops);
router.get('/workshops/:id', driver.getWorkshop);
router.get('/bookings', driver.listBookings);
router.post('/bookings', driver.createBooking);
router.get('/bookings/:id', driver.getBooking);
router.get('/diagnostics', driver.diagnostics);
router.post('/diagnostics', driver.runDiagnostic);
router.get('/profile', driver.profile);
router.put('/profile', driver.updateProfile);
router.get('/chat', driver.chatHistory);
router.post('/chat', driver.chat);

export default router;
