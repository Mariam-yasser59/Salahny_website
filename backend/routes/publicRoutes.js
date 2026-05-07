import { Router } from 'express';
import { getLandingData } from '../controllers/publicController.js';

const router = Router();

router.get('/landing', getLandingData);

export default router;
