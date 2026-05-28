import { body } from 'express-validator';

export const analyzeScamRules = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 5000 })
    .withMessage('Message too long (max 5000 characters)'),
];
