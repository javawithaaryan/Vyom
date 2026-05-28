import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { analysisLimiter } from '../middleware/rateLimiter.js';
import { validateRequest } from '../middleware/validate.js';
import { analyzeTransactionRules } from '../validators/fraudValidators.js';
import * as fraudController from '../controllers/fraudController.js';

const router = Router();

router.use(protect);

router.post(
  '/analyze',
  analysisLimiter,
  analyzeTransactionRules,
  validateRequest,
  fraudController.analyze
);

router.get('/history', fraudController.history);

export default router;
