import { Router } from 'express';
import { adminLogin, driverLogin, login, logout, registerDriver, registerWorkshop, workshopLogin } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/driver/login', driverLogin);
router.post('/workshop/login', workshopLogin);
router.post('/admin/login', adminLogin);
router.post('/register/driver', registerDriver);
router.post('/register/workshop', registerWorkshop);
router.post('/logout', requireAuth(), logout);

export default router;
