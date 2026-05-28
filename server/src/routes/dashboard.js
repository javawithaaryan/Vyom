import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router();

router.use(protect);

router.get('/stats', dashboardController.stats);
router.get('/risk-events', dashboardController.riskEvents);
router.get('/alerts', dashboardController.alerts);

export default router;
