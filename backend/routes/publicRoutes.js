import { Router } from 'express';
import { getLandingData, publicWorkshops } from '../controllers/publicController.js';

const router = Router();

router.get('/landing', getLandingData);
router.get('/workshops', publicWorkshops);

export default router;
