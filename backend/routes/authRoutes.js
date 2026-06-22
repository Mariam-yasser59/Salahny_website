import { Router } from 'express';
import { adminLogin, driverLogin, forgotPassword, googleLogin, login, logout, registerDriver, registerWorkshop, resetPassword, workshopLogin } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/driver/login', driverLogin);
router.post('/workshop/login', workshopLogin);
router.post('/admin/login', adminLogin);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/register/driver', registerDriver);
router.post('/register/workshop', registerWorkshop);
router.post('/logout', requireAuth(), logout);

export default router;
