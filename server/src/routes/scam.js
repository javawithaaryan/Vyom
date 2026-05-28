import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { analysisLimiter } from '../middleware/rateLimiter.js';
import { validateRequest } from '../middleware/validate.js';
import { analyzeScamRules } from '../validators/scamValidators.js';
import * as scamController from '../controllers/scamController.js';

const router = Router();

router.use(protect);

router.post(
  '/analyze',
  analysisLimiter,
  analyzeScamRules,
  validateRequest,
  scamController.analyze
);

router.get('/history', scamController.history);

export default router;
