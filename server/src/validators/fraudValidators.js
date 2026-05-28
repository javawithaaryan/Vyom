import { body } from 'express-validator';

export const analyzeTransactionRules = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number')
    .toFloat(),
  body('location').trim().notEmpty().withMessage('Location is required').escape(),
  body('device').trim().notEmpty().withMessage('Device type is required').escape(),
  body('merchantCategory').optional().trim().escape(),
];
