import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as workshop from '../controllers/workshopController.js';

export const emergencyRoutes = Router();
emergencyRoutes.use(requireAuth(['workshop']));
emergencyRoutes.get('/workshop/assigned', workshop.emergencyAssigned);
emergencyRoutes.patch('/:id/accept', workshop.updateEmergency);
emergencyRoutes.patch('/:id/reject', workshop.updateEmergency);
emergencyRoutes.patch('/:id/status', workshop.updateEmergency);

export const chatRoutes = Router();
chatRoutes.use(requireAuth(['workshop']));
chatRoutes.get('/bookings/:bookingId/context', workshop.chatContext);
chatRoutes.get('/bookings/:bookingId/messages', workshop.chatMessages);
chatRoutes.post('/bookings/:bookingId/messages', workshop.sendChatMessage);
chatRoutes.post('/bookings/:bookingId/share-diagnostic', workshop.shareDiagnostic);

export const diagnosticRoutes = Router();
diagnosticRoutes.use(requireAuth(['workshop']));
diagnosticRoutes.post('/workshop/:bookingId/run', workshop.runDiagnostic);
diagnosticRoutes.post('/workshop/:bookingId/upload-obd', workshop.uploadObd);
diagnosticRoutes.post('/workshop/:bookingId/create-repair-task', workshop.createRepairTask);

export const trackingRoutes = Router();
trackingRoutes.use(requireAuth(['workshop']));
trackingRoutes.post('/:bookingId', workshop.tracking);

export const notificationRoutes = Router();
notificationRoutes.use(requireAuth());
notificationRoutes.get('/', workshop.notifications);
notificationRoutes.get('/unread-count', workshop.unreadNotificationCount);
notificationRoutes.patch('/:id/read', workshop.markNotificationRead);
notificationRoutes.post('/read-all', workshop.markAllNotificationsRead);
